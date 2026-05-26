import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiPost } from "../../client/api-client.js";
import { hashedIdArray } from "../../helpers/validation.js";

const BulkInvoiceActionTool = createTool(
  "bulk-invoice-action",
  "Perform a bulk action on one or more invoices. Actions: mark_sent (mark as sent without emailing), mark_paid, archive, restore, delete, cancel, clone_to_quote.",
  {
    ids: hashedIdArray.describe("Array of hashed invoice IDs (max 100)"),
    action: z
      .enum(["mark_sent", "mark_paid", "archive", "restore", "delete", "cancel", "clone_to_quote"])
      .describe("The action to perform"),
  },
  async ({ ids, action }) => {
    const response = await apiPost<Record<string, unknown>>("/invoices/bulk", {
      ids,
      action,
    });

    if (response.isError) {
      return {
        content: [{ type: "text" as const, text: `Error performing bulk action: ${response.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Bulk action '${action}' performed successfully on ${ids.length} invoice(s).`,
        },
      ],
    };
  },
);

export default BulkInvoiceActionTool;
