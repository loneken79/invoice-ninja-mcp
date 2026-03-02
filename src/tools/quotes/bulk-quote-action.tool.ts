import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiPost } from "../../client/api-client.js";

const BulkQuoteActionTool = createTool(
  "bulk-quote-action",
  "Perform a bulk action on one or more quotes. Actions: approve, convert_to_invoice (creates an invoice from the quote), mark_sent, archive, restore, delete.",
  {
    ids: z.array(z.string()).min(1).describe("Array of hashed quote IDs"),
    action: z
      .enum(["approve", "convert_to_invoice", "mark_sent", "archive", "restore", "delete"])
      .describe("The action to perform"),
  },
  async ({ ids, action }) => {
    const response = await apiPost<Record<string, unknown>>("/quotes/bulk", {
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
          text: `Bulk action '${action}' performed successfully on ${ids.length} quote(s).`,
        },
      ],
    };
  },
);

export default BulkQuoteActionTool;
