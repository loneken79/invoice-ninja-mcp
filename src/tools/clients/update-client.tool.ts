import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiPut } from "../../client/api-client.js";
import { hashedId, optionalBoundedText, MAX_CONTACTS } from "../../helpers/validation.js";

const contactSchema = z.object({
  first_name: z.string().max(200).optional(),
  last_name: z.string().max(200).optional(),
  email: z.string().email("Invalid email format").max(300).or(z.literal("")).optional(),
  phone: z.string().max(100).optional(),
  send_email: z.boolean().optional(),
});

const UpdateClientTool = createTool(
  "update-client",
  "Update an existing client in Invoice Ninja. Only provide the fields you want to change.",
  {
    id: hashedId.describe("The hashed client ID"),
    name: z.string().max(500).optional().describe("Company/client name"),
    contacts: z.array(contactSchema).max(MAX_CONTACTS).optional().describe("Contacts array (replaces existing)"),
    id_number: z.string().max(200).optional().describe("Client reference number"),
    vat_number: z.string().max(200).optional().describe("VAT/tax number"),
    phone: z.string().max(100).optional().describe("Company phone"),
    website: z.string().url("Invalid URL format").max(500).or(z.literal("")).optional().describe("Client website"),
    address1: z.string().max(500).optional().describe("Street address line 1"),
    address2: z.string().max(500).optional().describe("Street address line 2"),
    city: z.string().max(200).optional().describe("City"),
    state: z.string().max(200).optional().describe("State/province"),
    postal_code: z.string().max(50).optional().describe("Postal/zip code"),
    country_id: hashedId.optional().describe("Country ID"),
    private_notes: optionalBoundedText(10000).describe("Internal notes"),
    public_notes: optionalBoundedText(10000).describe("Public notes"),
    currency_id: hashedId.optional().describe("Currency ID"),
  },
  async ({ id, ...updates }) => {
    const response = await apiPut<{ data: Record<string, unknown> }>(`/clients/${id}`, updates);

    if (response.isError) {
      return {
        content: [{ type: "text" as const, text: `Error updating client: ${response.error}` }],
        isError: true,
      };
    }

    const c = response.result.data;
    return {
      content: [
        {
          type: "text" as const,
          text: [
            "Client updated successfully:",
            `ID: ${c.id}`,
            `Name: ${c.display_name || c.name}`,
          ].join("\n"),
        },
      ],
    };
  },
);

export default UpdateClientTool;
