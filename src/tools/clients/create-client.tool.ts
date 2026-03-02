import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiPost } from "../../client/api-client.js";

const contactSchema = z.object({
  first_name: z.string().optional().describe("Contact first name"),
  last_name: z.string().optional().describe("Contact last name"),
  email: z.string().optional().describe("Contact email"),
  phone: z.string().optional().describe("Contact phone"),
  send_email: z.boolean().optional().describe("Whether this contact receives emails (default: true)"),
});

const CreateClientTool = createTool(
  "create-client",
  "Create a new client in Invoice Ninja. At minimum provide a name. Contacts with email addresses are needed to send invoices.",
  {
    name: z.string().describe("Company/client name"),
    contacts: z.array(contactSchema).optional().describe("Array of contacts"),
    id_number: z.string().optional().describe("Client reference number"),
    vat_number: z.string().optional().describe("VAT/tax number"),
    phone: z.string().optional().describe("Company phone"),
    website: z.string().optional().describe("Client website"),
    address1: z.string().optional().describe("Street address line 1"),
    address2: z.string().optional().describe("Street address line 2"),
    city: z.string().optional().describe("City"),
    state: z.string().optional().describe("State/province"),
    postal_code: z.string().optional().describe("Postal/zip code"),
    country_id: z.string().optional().describe("Country ID"),
    private_notes: z.string().optional().describe("Internal notes"),
    public_notes: z.string().optional().describe("Public notes"),
    currency_id: z.string().optional().describe("Currency ID (e.g. 1 for USD)"),
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
