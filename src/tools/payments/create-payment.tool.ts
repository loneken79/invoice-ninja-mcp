import { z } from "zod";
import { createTool } from "../../helpers/create-tool.js";
import { apiPost } from "../../client/api-client.js";
import { hashedId, nonNegativeAmount, dateString, optionalBoundedText } from "../../helpers/validation.js";

const invoicePaymentSchema = z.object({
  invoice_id: hashedId.describe("Hashed invoice ID"),
  amount: nonNegativeAmount.describe("Amount to apply to this invoice"),
});

const CreatePaymentTool = createTool(
  "create-payment",
  "Record a payment against one or more invoices in Invoice Ninja. The payment amount can be the full invoice balance or a partial amount.",
  {
    client_id: hashedId.describe("The client's hashed ID"),
    amount: nonNegativeAmount.describe("Total payment amount"),
    invoices: z.array(invoicePaymentSchema).max(100).optional().describe("Which invoices to apply payment to"),
    date: dateString.optional().describe("Payment date YYYY-MM-DD (default: today)"),
    type_id: hashedId.optional().describe("Payment type (e.g. 1=bank transfer, 2=cash)"),
    transaction_reference: z.string().max(500).optional().describe("Reference number"),
    private_notes: optionalBoundedText(10000).describe("Internal notes"),
  },
  async (params) => {
    const response = await apiPost<{ data: Record<string, unknown> }>("/payments", params);

    if (response.isError) {
      return {
        content: [{ type: "text" as const, text: `Error creating payment: ${response.error}` }],
        isError: true,
      };
    }

    const p = response.result.data;
    return {
      content: [
        {
          type: "text" as const,
          text: [
            "Payment recorded successfully:",
            `ID: ${p.id}`,
            `Amount: ${p.amount}`,
            `Date: ${p.date}`,
            `Status ID: ${p.status_id}`,
          ].join("\n"),
        },
      ],
    };
  },
);

export default CreatePaymentTool;
