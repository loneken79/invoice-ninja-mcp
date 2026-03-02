import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiPost } from "../../client/api-client.js";

const CreateExpenseTool = createTool(
  "create-expense",
  "Create a new expense in Invoice Ninja.",
  {
    amount: z.number().describe("Expense amount"),
    client_id: z.string().optional().describe("Link to client hashed ID"),
    vendor_id: z.string().optional().describe("Link to vendor hashed ID"),
    category_id: z.string().optional().describe("Expense category ID"),
    date: z.string().optional().describe("Expense date YYYY-MM-DD"),
    public_notes: z.string().optional().describe("Public notes"),
    private_notes: z.string().optional().describe("Internal notes"),
    currency_id: z.string().optional().describe("Currency ID"),
    invoice_id: z.string().optional().describe("Link to invoice for billable expenses"),
  },
  async (params) => {
    const response = await apiPost<{ data: Record<string, unknown> }>("/expenses", params);

    if (response.isError) {
      return {
        content: [{ type: "text" as const, text: `Error creating expense: ${response.error}` }],
        isError: true,
      };
    }

    const e = response.result.data;
    return {
      content: [
        {
          type: "text" as const,
          text: [
            "Expense created successfully:",
            `ID: ${e.id}`,
            `Amount: ${e.amount}`,
            `Date: ${e.date}`,
          ].join("\n"),
        },
      ],
    };
  },
);

export default CreateExpenseTool;
