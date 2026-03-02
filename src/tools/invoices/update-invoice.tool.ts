import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiPut } from "../../client/api-client.js";

const lineItemSchema = z.object({
  product_key: z.string().optional().describe("Product name/key"),
  notes: z.string().optional().describe("Line item description"),
  cost: z.number().describe("Unit price"),
  quantity: z.number().describe("Quantity"),
  tax_name1: z.string().optional().describe("Tax name"),
  tax_rate1: z.number().optional().describe("Tax rate percentage"),
  discount: z.number().optional().describe("Line discount"),
});

const UpdateInvoiceTool = createTool(
  "update-invoice",
  "Update an existing invoice in Invoice Ninja. Only provide fields you want to change. To update line items, provide the complete line_items array (it replaces, not merges).",
  {
    id: z.string().describe("The hashed invoice ID"),
    client_id: z.string().optional().describe("New client hashed ID"),
    line_items: z.array(lineItemSchema).optional().describe("Complete replacement line items array"),
    date: z.string().optional().describe("Invoice date YYYY-MM-DD"),
    due_date: z.string().optional().describe("Due date YYYY-MM-DD"),
    number: z.string().optional().describe("Invoice number"),
    po_number: z.string().optional().describe("Purchase order number"),
    discount: z.number().optional().describe("Overall discount"),
    is_amount_discount: z.boolean().optional().describe("true = fixed amount, false = percentage"),
    partial: z.number().optional().describe("Partial/deposit amount"),
    terms: z.string().optional().describe("Invoice terms"),
    footer: z.string().optional().describe("Invoice footer text"),
    public_notes: z.string().optional().describe("Notes visible to client"),
    private_notes: z.string().optional().describe("Internal notes"),
    tax_name1: z.string().optional().describe("Invoice-level tax name"),
    tax_rate1: z.number().optional().describe("Invoice-level tax rate"),
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
