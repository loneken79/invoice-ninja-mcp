import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiGet } from "../../client/api-client.js";
import { hashedId } from "../../helpers/validation.js";

const GetProductTool = createTool(
  "get-product",
  "Get a single product by ID from Invoice Ninja. Returns full product details including price, notes, and tax settings.",
  {
    id: hashedId.describe("The hashed product ID"),
  },
  async ({ id }) => {
    const response = await apiGet<{ data: Record<string, unknown> }>(`/products/${id}`);

    if (response.isError) {
      return {
        content: [{ type: "text" as const, text: `Error getting product: ${response.error}` }],
        isError: true,
      };
    }

    const p = response.result.data;
    return {
      content: [
        {
          type: "text" as const,
          text: [
            `ID: ${p.id}`,
            `Product Key: ${p.product_key || "N/A"}`,
            `Notes: ${p.notes || "N/A"}`,
            `Price: ${p.price}`,
            `Quantity: ${p.quantity}`,
            `Tax Name 1: ${p.tax_name1 || "N/A"}`,
            `Tax Rate 1: ${p.tax_rate1 || "N/A"}`,
            `Tax Name 2: ${p.tax_name2 || "N/A"}`,
            `Tax Rate 2: ${p.tax_rate2 || "N/A"}`,
            `Custom Value 1: ${p.custom_value1 || "N/A"}`,
            `Custom Value 2: ${p.custom_value2 || "N/A"}`,
          ].join("\n"),
        },
      ],
    };
  },
);

export default GetProductTool;
