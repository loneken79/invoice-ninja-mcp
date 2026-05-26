import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiPost } from "../../client/api-client.js";
import { hashedId, positiveAmount, dateString, optionalBoundedText } from "../../helpers/validation.js";

const CreateExpenseTool = createTool(
  "create-expense",
  "Create a new expense record in Invoice Ninja. Optionally link to a client, vendor, or invoice for billable expense tracking.",
  {
    amount: positiveAmount.describe("Expense amount"),
    client_id: hashedId.optional().describe("Link to client hashed ID"),
    vendor_id: hashedId.optional().describe("Link to vendor hashed ID"),
    category_id: hashedId.optional().describe("Expense category ID"),
    date: dateString.optional().describe("Expense date YYYY-MM-DD"),
    public_notes: optionalBoundedText(10000).describe("Public notes"),
    private_notes: optionalBoundedText(10000).describe("Internal notes"),
    currency_id: hashedId.optional().describe("Currency ID"),
    invoice_id: hashedId.optional().describe("Link to invoice for billable expenses"),
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
