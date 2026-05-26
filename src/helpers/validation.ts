import { z } from "zod";

/**
 * Shared validation schemas for security hardening.
 * Centralizes input validation to prevent path traversal, DoS, and injection attacks.
 */

/** Validates a hashed ID (alphanumeric only, prevents path traversal) */
export const hashedId = z
  .string()
  .regex(/^[a-zA-Z0-9]+$/, "Invalid ID format: must be alphanumeric");

/** Validates a date string in YYYY-MM-DD format with calendar validity check */
export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format: must be YYYY-MM-DD")
  .refine((val) => {
    const d = new Date(val + "T00:00:00Z");
    return !isNaN(d.getTime()) && d.toISOString().startsWith(val);
  }, "Invalid calendar date");

/** Pagination per_page with upper bound to prevent resource exhaustion */
export const perPage = z
  .number()
  .int()
  .min(1)
  .max(100)
  .optional()
  .describe("Results per page (default: 20, max: 100)");

/** Pagination page number */
export const pageNumber = z
  .number()
  .int()
  .min(1)
  .optional()
  .describe("Page number (default: 1)");

/** Bounded text field for notes, terms, footer, etc. */
export const boundedText = (maxLength = 10000) =>
  z.string().max(maxLength);

/** Bounded optional text field */
export const optionalBoundedText = (maxLength = 10000) =>
  z.string().max(maxLength).optional();

/** Non-negative number (for amounts - zero or greater) */
export const nonNegativeAmount = z.number().min(0, "Amount must be non-negative");

/** Search/filter string with reasonable length */
export const searchString = z.string().max(500).optional();

/** Array of hashed IDs with max size for bulk operations */
export const hashedIdArray = z
  .array(hashedId)
  .min(1)
  .max(100);

/** Maximum items in line_items arrays */
export const MAX_LINE_ITEMS = 1000;

/** Maximum contacts per client */
export const MAX_CONTACTS = 100;

/**
 * Validates that a path segment is safe (no traversal characters).
 * Used as defense-in-depth in the API client.
 */
export function validatePathSegment(segment: string): boolean {
  return /^[a-zA-Z0-9_\-]+$/.test(segment);
}

/**
 * Validates the base URL is using HTTPS (or localhost for development).
 */
export function validateBaseUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      "INVOICE_NINJA_URL must be a valid URL and must use HTTPS (or http://localhost for local development).",
    );
  }

  const isLocalDev =
    parsed.protocol === "http:" &&
    (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1" || parsed.hostname === "::1");

  if (parsed.protocol !== "https:" && !isLocalDev) {
    throw new Error(
      "INVOICE_NINJA_URL must be a valid URL and must use HTTPS (or http://localhost for local development).",
    );
  }
}
