import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiPut } from "../../client/api-client.js";

const contactSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  send_email: z.boolean().optional(),
});

const UpdateClientTool = createTool(
  "update-client",
  "Update an existing client in Invoice Ninja. Only provide the fields you want to change.",
  {
    id: z.string().describe("The hashed client ID"),
    name: z.string().optional().describe("Company/client name"),
    contacts: z.array(contactSchema).optional().describe("Contacts array (replaces existing)"),
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
    currency_id: z.string().optional().describe("Currency ID"),
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
