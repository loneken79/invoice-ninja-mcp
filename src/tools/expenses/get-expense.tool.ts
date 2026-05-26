import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiGet } from "../../client/api-client.js";
import { hashedId } from "../../helpers/validation.js";

const GetExpenseTool = createTool(
  "get-expense",
  "Get a single expense by ID from Invoice Ninja. Returns full details including linked client, vendor, invoice, and notes.",
  {
    id: hashedId.describe("The hashed expense ID"),
  },
  async ({ id }) => {
    const response = await apiGet<{ data: Record<string, unknown> }>(`/expenses/${id}`);

    if (response.isError) {
      return {
        content: [{ type: "text" as const, text: `Error getting expense: ${response.error}` }],
        isError: true,
      };
    }

    const e = response.result.data;
    return {
      content: [
        {
          type: "text" as const,
          text: [
            `ID: ${e.id}`,
            `Amount: ${e.amount}`,
            `Date: ${e.date || "N/A"}`,
            `Category ID: ${e.category_id || "N/A"}`,
            `Client ID: ${e.client_id || "N/A"}`,
            `Vendor ID: ${e.vendor_id || "N/A"}`,
            `Invoice ID: ${e.invoice_id || "N/A"}`,
            `Currency ID: ${e.currency_id || "N/A"}`,
            `Public Notes: ${e.public_notes || "N/A"}`,
            `Private Notes: ${e.private_notes || "N/A"}`,
          ].join("\n"),
        },
      ],
    };
  },
);

export default GetExpenseTool;
