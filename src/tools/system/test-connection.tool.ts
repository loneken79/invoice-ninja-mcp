import { createTool } from "../../helpers/create-tool.js";
import { apiGet } from "../../client/api-client.js";

const TestConnectionTool = createTool(
  "test-connection",
  "Test the connection to your Invoice Ninja instance. Verifies that the URL is reachable and the API token is valid. Use this first if other tools return connection or authentication errors.",
  {},
  async () => {
    const url = process.env.INVOICE_NINJA_URL || "not set";

    const response = await apiGet<{ data: Array<Record<string, unknown>> }>(
      "/invoices",
      { per_page: "1" },
    );

    if (response.isError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Connection failed.\nURL: ${url}\nError: ${response.error}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Connection successful.\nURL: ${url}\nAPI token is valid.`,
        },
      ],
    };
  },
);

export default TestConnectionTool;
