import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiGet } from "../../client/api-client.js";
import { hashedId } from "../../helpers/validation.js";

const GetPaymentTool = createTool(
  "get-payment",
  "Get a single payment by ID from Invoice Ninja.",
  {
    id: hashedId.describe("The hashed payment ID"),
  },
  async ({ id }) => {
    const response = await apiGet<{ data: Record<string, unknown> }>(`/payments/${id}`, {
      include: "client",
    });

    if (response.isError) {
      return {
        content: [{ type: "text" as const, text: `Error getting payment: ${response.error}` }],
        isError: true,
      };
    }

    const p = response.result.data;
    const client = p.client as Record<string, unknown> | undefined;
    const invoices = p.invoices as Array<Record<string, unknown>> | undefined;

    const lines = [
      `ID: ${p.id}`,
      `Amount: ${p.amount}`,
      `Date: ${p.date}`,
      `Client: ${client?.display_name || p.client_id}`,
      `Type ID: ${p.type_id || "N/A"}`,
      `Transaction Reference: ${p.transaction_reference || "N/A"}`,
      `Status ID: ${p.status_id}`,
      `Private Notes: ${p.private_notes || "N/A"}`,
    ];

    if (invoices && invoices.length > 0) {
      lines.push("", "Applied to Invoices:");
      invoices.forEach((inv) => {
        lines.push(`  Invoice ID: ${inv.invoice_id} | Amount: ${inv.amount}`);
      });
    }

    return {
      content: [{ type: "text" as const, text: lines.join("\n") }],
    };
  },
);

export default GetPaymentTool;
