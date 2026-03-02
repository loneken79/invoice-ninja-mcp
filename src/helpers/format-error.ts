export function formatError(status: number, body: unknown): string {
  switch (status) {
    case 401:
      return "Authentication failed. Check your INVOICE_NINJA_API_TOKEN.";
    case 403:
      return "Permission denied. Your API token lacks access to this resource.";
    case 404:
      return "Not found. The requested entity does not exist or has been deleted.";
    case 422:
      return extractValidationErrors(body);
    case 429:
      return "Rate limited. Please wait a moment and try again.";
    default:
      return extractMessage(body) || `API error (HTTP ${status})`;
  }
}

function extractValidationErrors(body: unknown): string {
  if (typeof body === "object" && body !== null && "errors" in body) {
    const errors = (body as { errors: Record<string, string[]> }).errors;
    const messages = Object.entries(errors)
      .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
      .join("; ");
    if (messages) return `Validation error: ${messages}`;
  }
  return extractMessage(body) || "Validation error (HTTP 422)";
}

function extractMessage(body: unknown): string | null {
  if (typeof body === "object" && body !== null && "message" in body) {
    return String((body as { message: string }).message);
  }
  return null;
}
