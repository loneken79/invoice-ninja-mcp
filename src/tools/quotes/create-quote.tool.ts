import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiPost } from "../../client/api-client.js";
import { hashedId, dateString, optionalBoundedText, MAX_LINE_ITEMS } from "../../helpers/validation.js";

const lineItemSchema = z.object({
  product_key: z.string().max(200).optional().describe("Product name/key"),
  notes: z.string().max(5000).optional().describe("Line item description"),
  cost: z.number().describe("Unit price"),
  quantity: z.number().min(0).describe("Quantity"),
  tax_name1: z.string().max(200).optional().describe("Tax name"),
  tax_rate1: z.number().min(0).max(100).optional().describe("Tax rate percentage"),
  discount: z.number().min(0).optional().describe("Line discount"),
});

const CreateQuoteTool = createTool(
  "create-quote",
  "Create a new quote in Invoice Ninja. Quotes have the same line item structure as invoices and can be converted to invoices later.",
  {
    client_id: hashedId.describe("The client's hashed ID. Use list-clients to find it."),
    line_items: z.array(lineItemSchema).min(1).max(MAX_LINE_ITEMS).describe("Quote line items"),
    date: dateString.optional().describe("Quote date YYYY-MM-DD (default: today)"),
    due_date: dateString.optional().describe("Valid until date YYYY-MM-DD"),
    number: z.string().max(200).optional().describe("Custom quote number"),
    po_number: z.string().max(200).optional().describe("Purchase order number"),
    discount: z.number().min(0).optional().describe("Overall quote discount"),
    is_amount_discount: z.boolean().optional().describe("true = fixed amount, false = percentage"),
    partial: z.number().min(0).optional().describe("Deposit amount"),
    terms: optionalBoundedText(10000).describe("Quote terms"),
    footer: optionalBoundedText(10000).describe("Quote footer text"),
    public_notes: optionalBoundedText(10000).describe("Notes visible to client"),
    private_notes: optionalBoundedText(10000).describe("Internal notes"),
    tax_name1: z.string().max(200).optional().describe("Quote-level tax name"),
    tax_rate1: z.number().min(0).max(100).optional().describe("Quote-level tax rate"),
  },
  async (params) => {
    const response = await apiPost<{ data: Record<string, unknown> }>("/quotes", params);

    if (response.isError) {
      return {
        content: [{ type: "text" as const, text: `Error creating quote: ${response.error}` }],
        isError: true,
      };
    }

    const q = response.result.data;
    const invitations = q.invitations as Array<Record<string, unknown>> | undefined;
    const clientLink = invitations?.[0]?.link as string | undefined;
    const adminLink = `${process.env.INVOICE_NINJA_URL?.replace(/\/+$/, "")}/quotes/${q.id}/edit`;

    return {
      content: [
        {
          type: "text" as const,
          text: [
            "Quote created successfully:",
            `ID: ${q.id}`,
            `Number: ${q.number}`,
            `Client ID: ${q.client_id}`,
            `Amount: ${q.amount}`,
            `Date: ${q.date}`,
            clientLink ? `Client Portal: ${clientLink}` : null,
            `Admin Panel: ${adminLink}`,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
    };
  },
);

export default CreateQuoteTool;
