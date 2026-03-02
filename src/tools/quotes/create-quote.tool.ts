import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiPost } from "../../client/api-client.js";

const lineItemSchema = z.object({
  product_key: z.string().optional().describe("Product name/key"),
  notes: z.string().optional().describe("Line item description"),
  cost: z.number().describe("Unit price"),
  quantity: z.number().describe("Quantity"),
  tax_name1: z.string().optional().describe("Tax name"),
  tax_rate1: z.number().optional().describe("Tax rate percentage"),
  discount: z.number().optional().describe("Line discount"),
});

const CreateQuoteTool = createTool(
  "create-quote",
  "Create a new quote in Invoice Ninja. Quotes have the same line item structure as invoices and can be converted to invoices later.",
  {
    client_id: z.string().describe("The client's hashed ID. Use list-clients to find it."),
    line_items: z.array(lineItemSchema).min(1).describe("Quote line items"),
    date: z.string().optional().describe("Quote date YYYY-MM-DD (default: today)"),
    due_date: z.string().optional().describe("Valid until date YYYY-MM-DD"),
    number: z.string().optional().describe("Custom quote number"),
    po_number: z.string().optional().describe("Purchase order number"),
    discount: z.number().optional().describe("Overall quote discount"),
    is_amount_discount: z.boolean().optional().describe("true = fixed amount, false = percentage"),
    partial: z.number().optional().describe("Deposit amount"),
    terms: z.string().optional().describe("Quote terms"),
    footer: z.string().optional().describe("Quote footer text"),
    public_notes: z.string().optional().describe("Notes visible to client"),
    private_notes: z.string().optional().describe("Internal notes"),
    tax_name1: z.string().optional().describe("Quote-level tax name"),
    tax_rate1: z.number().optional().describe("Quote-level tax rate"),
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
