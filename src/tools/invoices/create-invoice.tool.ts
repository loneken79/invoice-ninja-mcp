import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiPost } from "../../client/api-client.js";
import { hashedId, dateString, optionalBoundedText, MAX_LINE_ITEMS } from "../../helpers/validation.js";

const lineItemSchema = z.object({
  product_key: z.string().max(200).optional().describe("Product name/key from list-products"),
  notes: z.string().max(5000).optional().describe("Line item description"),
  cost: z.number().describe("Unit price"),
  quantity: z.number().min(0).describe("Quantity"),
  tax_name1: z.string().max(200).optional().describe("Tax name e.g. GST"),
  tax_rate1: z.number().min(0).max(100).optional().describe("Tax rate percentage e.g. 10"),
  discount: z.number().min(0).optional().describe("Line discount"),
});

const CreateInvoiceTool = createTool(
  "create-invoice",
  "Create a new draft invoice in Invoice Ninja. Requires a client_id (use list-clients to find it) and at least one line item with cost and quantity.",
  {
    client_id: hashedId.describe("The client's hashed ID. Use list-clients to find it."),
    line_items: z.array(lineItemSchema).min(1).max(MAX_LINE_ITEMS).describe("Invoice line items"),
    date: dateString.optional().describe("Invoice date YYYY-MM-DD (default: today)"),
    due_date: dateString.optional().describe("Due date YYYY-MM-DD"),
    number: z.string().max(200).optional().describe("Custom invoice number (auto-generated if omitted)"),
    po_number: z.string().max(200).optional().describe("Purchase order number"),
    discount: z.number().min(0).optional().describe("Overall invoice discount"),
    is_amount_discount: z.boolean().optional().describe("true = fixed amount discount, false = percentage"),
    partial: z.number().min(0).optional().describe("Partial/deposit amount"),
    partial_due_date: dateString.optional().describe("Deposit due date YYYY-MM-DD"),
    terms: optionalBoundedText(10000).describe("Invoice terms"),
    footer: optionalBoundedText(10000).describe("Invoice footer text"),
    public_notes: optionalBoundedText(10000).describe("Notes visible to client"),
    private_notes: optionalBoundedText(10000).describe("Internal notes"),
    tax_name1: z.string().max(200).optional().describe("Invoice-level tax name"),
    tax_rate1: z.number().min(0).max(100).optional().describe("Invoice-level tax rate percentage"),
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
