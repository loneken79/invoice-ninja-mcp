import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiGet } from "../../client/api-client.js";
import { hashedId } from "../../helpers/validation.js";

const GetInvoiceTool = createTool(
  "get-invoice",
  "Get a single invoice by ID from Invoice Ninja. Returns full invoice details including line items, payments, and client information.",
  {
    id: hashedId.describe("The hashed invoice ID"),
  },
  async ({ id }) => {
    const response = await apiGet<{ data: Record<string, unknown> }>(
      `/invoices/${id}`,
      { include: "client" },
    );

    if (response.isError) {
      return {
        content: [{ type: "text" as const, text: `Error getting invoice: ${response.error}` }],
        isError: true,
      };
    }

    const inv = response.result.data;
    const client = inv.client as Record<string, unknown> | undefined;
    const lineItems = inv.line_items as Array<Record<string, unknown>> | undefined;

    const lines = [
      `ID: ${inv.id}`,
      `Number: ${inv.number || "N/A"}`,
      `Client: ${client?.display_name || inv.client_id}`,
      `Status ID: ${inv.status_id}`,
      `Date: ${inv.date}`,
      `Due Date: ${inv.due_date || "N/A"}`,
      `Amount: ${inv.amount}`,
      `Balance: ${inv.balance}`,
      `Discount: ${inv.discount || 0}`,
      `PO Number: ${inv.po_number || "N/A"}`,
      `Public Notes: ${inv.public_notes || "N/A"}`,
      `Private Notes: ${inv.private_notes || "N/A"}`,
      `Terms: ${inv.terms || "N/A"}`,
      `Footer: ${inv.footer || "N/A"}`,
    ];

    if (lineItems && lineItems.length > 0) {
      lines.push("", "Line Items:");
      lineItems.forEach((item, i) => {
        lines.push(
          `  ${i + 1}. ${item.product_key || "Item"} - ${item.notes || ""} | Qty: ${item.quantity} x ${item.cost} = ${item.line_total}`,
        );
      });
    }

    const invitations = inv.invitations as Array<Record<string, unknown>> | undefined;
    const clientLink = invitations?.[0]?.link as string | undefined;
    const adminLink = `${process.env.INVOICE_NINJA_URL?.replace(/\/+$/, "")}/invoices/${inv.id}/edit`;
    lines.push("");
    if (clientLink) lines.push(`Client Portal: ${clientLink}`);
    lines.push(`Admin Panel: ${adminLink}`);

    return {
      content: [{ type: "text" as const, text: lines.join("\n") }],
    };
  },
);

export default GetInvoiceTool;
