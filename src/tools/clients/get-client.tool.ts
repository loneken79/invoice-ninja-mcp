import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiGet } from "../../client/api-client.js";
import { hashedId } from "../../helpers/validation.js";

const GetClientTool = createTool(
  "get-client",
  "Get a single client by ID from Invoice Ninja. Returns full client details including contacts, addresses, and settings.",
  {
    id: hashedId.describe("The hashed client ID"),
  },
  async ({ id }) => {
    const response = await apiGet<{ data: Record<string, unknown> }>(`/clients/${id}`);

    if (response.isError) {
      return {
        content: [{ type: "text" as const, text: `Error getting client: ${response.error}` }],
        isError: true,
      };
    }

    const c = response.result.data;
    const contacts = c.contacts as Array<Record<string, unknown>> | undefined;

    const lines = [
      `ID: ${c.id}`,
      `Name: ${c.display_name || c.name || "N/A"}`,
      `ID Number: ${c.id_number || "N/A"}`,
      `VAT Number: ${c.vat_number || "N/A"}`,
      `Phone: ${c.phone || "N/A"}`,
      `Website: ${c.website || "N/A"}`,
      `Address: ${[c.address1, c.address2, c.city, c.state, c.postal_code].filter(Boolean).join(", ") || "N/A"}`,
      `Balance: ${c.balance}`,
      `Paid to Date: ${c.paid_to_date}`,
      `Public Notes: ${c.public_notes || "N/A"}`,
      `Private Notes: ${c.private_notes || "N/A"}`,
    ];

    if (contacts && contacts.length > 0) {
      lines.push("", "Contacts:");
      contacts.forEach((contact, i) => {
        lines.push(
          `  ${i + 1}. ${contact.first_name || ""} ${contact.last_name || ""} | Email: ${contact.email || "N/A"} | Phone: ${contact.phone || "N/A"}`,
        );
      });
    }

    return {
      content: [{ type: "text" as const, text: lines.join("\n") }],
    };
  },
);

export default GetClientTool;
