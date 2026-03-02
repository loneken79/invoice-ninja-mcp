import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiPost } from "../../client/api-client.js";

const lineItemSchema = z.object({
  product_key: z.string().optional().describe("Product name/key from list-products"),
  notes: z.string().optional().describe("Line item description"),
  cost: z.number().describe("Unit price"),
  quantity: z.number().describe("Quantity"),
  tax_name1: z.string().optional().describe("Tax name e.g. GST"),
  tax_rate1: z.number().optional().describe("Tax rate percentage e.g. 10"),
  discount: z.number().optional().describe("Line discount"),
});

const CreateInvoiceTool = createTool(
  "create-invoice",
  "Create a new draft invoice in Invoice Ninja. Requires a client_id (use list-clients to find it) and at least one line item with cost and quantity.",
  {
    client_id: z.string().describe("The client's hashed ID. Use list-clients to find it."),
    line_items: z.array(lineItemSchema).min(1).describe("Invoice line items"),
    date: z.string().optional().describe("Invoice date YYYY-MM-DD (default: today)"),
    due_date: z.string().optional().describe("Due date YYYY-MM-DD"),
    number: z.string().optional().describe("Custom invoice number (auto-generated if omitted)"),
    po_number: z.string().optional().describe("Purchase order number"),
    discount: z.number().optional().describe("Overall invoice discount"),
    is_amount_discount: z.boolean().optional().describe("true = fixed amount discount, false = percentage"),
    partial: z.number().optional().describe("Partial/deposit amount"),
    partial_due_date: z.string().optional().describe("Deposit due date YYYY-MM-DD"),
    terms: z.string().optional().describe("Invoice terms"),
    footer: z.string().optional().describe("Invoice footer text"),
    public_notes: z.string().optional().describe("Notes visible to client"),
    private_notes: z.string().optional().describe("Internal notes"),
    tax_name1: z.string().optional().describe("Invoice-level tax name"),
    tax_rate1: z.number().optional().describe("Invoice-level tax rate percentage"),
  },
  async (params) => {
    const response = await apiPost<{ data: Record<string, unknown> }>("/invoices", params);

    if (response.isError) {
      return {
        content: [{ type: "text" as const, text: `Error creating invoice: ${response.error}` }],
        isError: true,
      };
    }

    const inv = response.result.data;
    const invitations = inv.invitations as Array<Record<string, unknown>> | undefined;
    const clientLink = invitations?.[0]?.link as string | undefined;
    const adminLink = `${process.env.INVOICE_NINJA_URL?.replace(/\/+$/, "")}/invoices/${inv.id}/edit`;

    return {
      content: [
        {
          type: "text" as const,
          text: [
            "Invoice created successfully:",
            `ID: ${inv.id}`,
            `Number: ${inv.number}`,
            `Client ID: ${inv.client_id}`,
            `Amount: ${inv.amount}`,
            `Status: Draft`,
            `Date: ${inv.date}`,
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

export default CreateInvoiceTool;
