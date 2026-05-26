import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiPut } from "../../client/api-client.js";
import { hashedId, dateString, optionalBoundedText, MAX_LINE_ITEMS } from "../../helpers/validation.js";

const lineItemSchema = z.object({
  product_key: z.string().max(200).optional(),
  notes: z.string().max(5000).optional(),
  cost: z.number(),
  quantity: z.number().min(0),
  tax_name1: z.string().max(200).optional(),
  tax_rate1: z.number().min(0).max(100).optional(),
  discount: z.number().min(0).optional(),
});

const UpdateQuoteTool = createTool(
  "update-quote",
  "Update an existing quote in Invoice Ninja. Only provide fields you want to change. Line items array replaces existing items entirely.",
  {
    id: hashedId.describe("The hashed quote ID"),
    client_id: hashedId.optional().describe("New client hashed ID"),
    line_items: z.array(lineItemSchema).max(MAX_LINE_ITEMS).optional().describe("Complete replacement line items"),
    date: dateString.optional().describe("Quote date YYYY-MM-DD"),
    due_date: dateString.optional().describe("Valid until date YYYY-MM-DD"),
    number: z.string().max(200).optional().describe("Quote number"),
    po_number: z.string().max(200).optional().describe("Purchase order number"),
    discount: z.number().min(0).optional().describe("Overall discount"),
    is_amount_discount: z.boolean().optional().describe("true = fixed amount, false = percentage"),
    terms: optionalBoundedText(10000).describe("Quote terms"),
    footer: optionalBoundedText(10000).describe("Quote footer"),
    public_notes: optionalBoundedText(10000).describe("Notes visible to client"),
    private_notes: optionalBoundedText(10000).describe("Internal notes"),
    tax_name1: z.string().max(200).optional().describe("Quote-level tax name"),
    tax_rate1: z.number().min(0).max(100).optional().describe("Quote-level tax rate"),
  },
  async ({ id, ...updates }) => {
    const response = await apiPut<{ data: Record<string, unknown> }>(`/quotes/${id}`, updates);

    if (response.isError) {
      return {
        content: [{ type: "text" as const, text: `Error updating quote: ${response.error}` }],
        isError: true,
      };
    }

    const q = response.result.data;
    return {
      content: [
        {
          type: "text" as const,
          text: [
            "Quote updated successfully:",
            `ID: ${q.id}`,
            `Number: ${q.number}`,
            `Amount: ${q.amount}`,
            `Status ID: ${q.status_id}`,
          ].join("\n"),
        },
      ],
    };
  },
);

export default UpdateQuoteTool;
