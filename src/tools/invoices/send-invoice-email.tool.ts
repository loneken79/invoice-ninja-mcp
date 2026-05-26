import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiPost } from "../../client/api-client.js";
import { hashedId } from "../../helpers/validation.js";

const ALLOWED_TEMPLATES = [
  "email_template_invoice",
  "email_template_reminder1",
  "email_template_reminder2",
  "email_template_reminder3",
  "email_template_custom1",
  "email_template_custom2",
  "email_template_custom3",
] as const;

const SendInvoiceEmailTool = createTool(
  "send-invoice-email",
  "Email an invoice to the client. This sends the invoice via Invoice Ninja's email system and marks the invoice as sent.",
  {
    id: hashedId.describe("The hashed invoice ID"),
    template: z.enum(ALLOWED_TEMPLATES).optional().describe("Email template to use (default: email_template_invoice)"),
  },
  async ({ id, template }) => {
    const response = await apiPost<Record<string, unknown>>("/emails", {
      entity: "invoice",
      entity_id: id,
      template: template || "email_template_invoice",
    });

    if (response.isError) {
      return {
        content: [{ type: "text" as const, text: `Error sending invoice email: ${response.error}` }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text" as const, text: `Invoice ${id} emailed successfully.` }],
    };
  },
);

export default SendInvoiceEmailTool;
