import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiPut } from "../../client/api-client.js";

const lineItemSchema = z.object({
  product_key: z.string().optional(),
  notes: z.string().optional(),
  cost: z.number(),
  quantity: z.number(),
  tax_name1: z.string().optional(),
  tax_rate1: z.number().optional(),
  discount: z.number().optional(),
});

const UpdateQuoteTool = createTool(
  "update-quote",
  "Update an existing quote in Invoice Ninja. Only provide fields you want to change. Line items array replaces existing items entirely.",
  {
    id: z.string().describe("The hashed quote ID"),
    client_id: z.string().optional().describe("New client hashed ID"),
    line_items: z.array(lineItemSchema).optional().describe("Complete replacement line items"),
    date: z.string().optional().describe("Quote date YYYY-MM-DD"),
    due_date: z.string().optional().describe("Valid until date YYYY-MM-DD"),
    number: z.string().optional().describe("Quote number"),
    po_number: z.string().optional().describe("Purchase order number"),
    discount: z.number().optional().describe("Overall discount"),
    is_amount_discount: z.boolean().optional().describe("true = fixed amount, false = percentage"),
    terms: z.string().optional().describe("Quote terms"),
    footer: z.string().optional().describe("Quote footer"),
    public_notes: z.string().optional().describe("Notes visible to client"),
    private_notes: z.string().optional().describe("Internal notes"),
    tax_name1: z.string().optional().describe("Quote-level tax name"),
    tax_rate1: z.number().optional().describe("Quote-level tax rate"),
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
