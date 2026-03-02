import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiGet } from "../../client/api-client.js";

const GetQuoteTool = createTool(
  "get-quote",
  "Get a single quote by ID from Invoice Ninja. Returns full quote details including line items and client information.",
  {
    id: z.string().describe("The hashed quote ID"),
  },
  async ({ id }) => {
    const response = await apiGet<{ data: Record<string, unknown> }>(`/quotes/${id}`, {
      include: "client",
    });

    if (response.isError) {
      return {
        content: [{ type: "text" as const, text: `Error getting quote: ${response.error}` }],
        isError: true,
      };
    }

    const q = response.result.data;
    const client = q.client as Record<string, unknown> | undefined;
    const lineItems = q.line_items as Array<Record<string, unknown>> | undefined;

    const lines = [
      `ID: ${q.id}`,
      `Number: ${q.number || "N/A"}`,
      `Client: ${client?.display_name || q.client_id}`,
      `Status ID: ${q.status_id}`,
      `Date: ${q.date}`,
      `Valid Until: ${q.due_date || "N/A"}`,
      `Amount: ${q.amount}`,
      `Discount: ${q.discount || 0}`,
      `PO Number: ${q.po_number || "N/A"}`,
      `Public Notes: ${q.public_notes || "N/A"}`,
      `Private Notes: ${q.private_notes || "N/A"}`,
      `Terms: ${q.terms || "N/A"}`,
      `Footer: ${q.footer || "N/A"}`,
    ];

    if (lineItems && lineItems.length > 0) {
      lines.push("", "Line Items:");
      lineItems.forEach((item, i) => {
        lines.push(
          `  ${i + 1}. ${item.product_key || "Item"} - ${item.notes || ""} | Qty: ${item.quantity} x ${item.cost} = ${item.line_total}`,
        );
      });
    }

    const invitations = q.invitations as Array<Record<string, unknown>> | undefined;
    const clientLink = invitations?.[0]?.link as string | undefined;
    const adminLink = `${process.env.INVOICE_NINJA_URL?.replace(/\/+$/, "")}/quotes/${q.id}/edit`;
    lines.push("");
    if (clientLink) lines.push(`Client Portal: ${clientLink}`);
    lines.push(`Admin Panel: ${adminLink}`);

    return {
      content: [{ type: "text" as const, text: lines.join("\n") }],
    };
  },
);

export default GetQuoteTool;
