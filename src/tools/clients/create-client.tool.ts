import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiPost } from "../../client/api-client.js";
import { hashedId, optionalBoundedText, MAX_CONTACTS } from "../../helpers/validation.js";

const contactSchema = z.object({
  first_name: z.string().max(200).optional().describe("Contact first name"),
  last_name: z.string().max(200).optional().describe("Contact last name"),
  email: z.string().email("Invalid email format").max(300).or(z.literal("")).optional().describe("Contact email"),
  phone: z.string().max(100).optional().describe("Contact phone"),
  send_email: z.boolean().optional().describe("Whether this contact receives emails (default: true)"),
});

const CreateClientTool = createTool(
  "create-client",
  "Create a new client in Invoice Ninja. At minimum provide a name. Contacts with email addresses are needed to send invoices.",
  {
    name: z.string().max(500).describe("Company/client name"),
    contacts: z.array(contactSchema).max(MAX_CONTACTS).optional().describe("Array of contacts"),
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
    currency_id: hashedId.optional().describe("Currency ID (e.g. 1 for USD)"),
  },
  async (params) => {
    const response = await apiPost<{ data: Record<string, unknown> }>("/clients", params);

    if (response.isError) {
      return {
        content: [{ type: "text" as const, text: `Error creating client: ${response.error}` }],
        isError: true,
      };
    }

    const c = response.result.data;
    return {
      content: [
        {
          type: "text" as const,
          text: [
            "Client created successfully:",
            `ID: ${c.id}`,
            `Name: ${c.display_name || c.name}`,
            `Balance: ${c.balance}`,
          ].join("\n"),
        },
      ],
    };
  },
);

export default CreateClientTool;
