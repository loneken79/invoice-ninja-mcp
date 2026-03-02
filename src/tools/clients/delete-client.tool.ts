import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiDelete } from "../../client/api-client.js";

const DeleteClientTool = createTool(
  "delete-client",
  "Delete a client from Invoice Ninja. This soft-deletes the client.",
  {
    id: z.string().describe("The hashed client ID"),
  },
  async ({ id }) => {
    const response = await apiDelete<Record<string, unknown>>(`/clients/${id}`);

    if (response.isError) {
      return {
        content: [{ type: "text" as const, text: `Error deleting client: ${response.error}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text" as const, text: `Client ${id} deleted successfully.` }],
    };
  },
);

export default DeleteClientTool;
