import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiPut } from "../../client/api-client.js";
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

const UpdateInvoiceTool = createTool(
  "update-invoice",
  "Update an existing invoice in Invoice Ninja. Only provide fields you want to change. To update line items, provide the complete line_items array (it replaces, not merges).",
  {
    id: hashedId.describe("The hashed invoice ID"),
    client_id: hashedId.optional().describe("New client hashed ID"),
    line_items: z.array(lineItemSchema).max(MAX_LINE_ITEMS).optional().describe("Complete replacement line items array"),
    date: dateString.optional().describe("Invoice date YYYY-MM-DD"),
    due_date: dateString.optional().describe("Due date YYYY-MM-DD"),
    number: z.string().max(200).optional().describe("Invoice number"),
    po_number: z.string().max(200).optional().describe("Purchase order number"),
    discount: z.number().min(0).optional().describe("Overall discount"),
    is_amount_discount: z.boolean().optional().describe("true = fixed amount, false = percentage"),
    partial: z.number().min(0).optional().describe("Partial/deposit amount"),
    terms: optionalBoundedText(10000).describe("Invoice terms"),
    footer: optionalBoundedText(10000).describe("Invoice footer text"),
    public_notes: optionalBoundedText(10000).describe("Notes visible to client"),
    private_notes: optionalBoundedText(10000).describe("Internal notes"),
    tax_name1: z.string().max(200).optional().describe("Invoice-level tax name"),
    tax_rate1: z.number().min(0).max(100).optional().describe("Invoice-level tax rate"),
  },
  async ({ id, ...updates }) => {
    const response = await apiPut<{ data: Record<string, unknown> }>(`/invoices/${id}`, updates);

    if (response.isError) {
      return {
        content: [{ type: "text" as const, text: `Error updating invoice: ${response.error}` }],
        isError: true,
      };
    }

    const inv = response.result.data;
    return {
      content: [
        {
          type: "text" as const,
          text: [
            "Invoice updated successfully:",
            `ID: ${inv.id}`,
            `Number: ${inv.number}`,
            `Amount: ${inv.amount}`,
            `Status ID: ${inv.status_id}`,
          ].join("\n"),
        },
      ],
    };
  },
);

export default UpdateInvoiceTool;
