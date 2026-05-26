import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiDelete } from "../../client/api-client.js";
import { hashedId } from "../../helpers/validation.js";

const DeleteInvoiceTool = createTool(
  "delete-invoice",
  "Delete an invoice from Invoice Ninja. This soft-deletes the invoice (it can be restored from the Invoice Ninja UI).",
  {
    id: hashedId.describe("The hashed invoice ID"),
  },
  async ({ id }) => {
    const response = await apiDelete<Record<string, unknown>>(`/invoices/${id}`);

    if (response.isError) {
      return {
        content: [{ type: "text" as const, text: `Error deleting invoice: ${response.error}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text" as const, text: `Invoice ${id} deleted successfully.` }],
    };
  },
);

export default DeleteInvoiceTool;
