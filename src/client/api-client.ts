import { ApiResponse } from "../helpers/types.js";
import { formatError } from "../helpers/format-error.js";
import { validateBaseUrl } from "../helpers/validation.js";

/** Request timeout in milliseconds (30 seconds) */
const REQUEST_TIMEOUT_MS = 30_000;

interface ApiClientConfig {
  baseUrl: string;
  apiToken: string;
}

function getConfig(): ApiClientConfig {
  const baseUrl = process.env.INVOICE_NINJA_URL;
  const apiToken = process.env.INVOICE_NINJA_API_TOKEN;
  if (!baseUrl || !apiToken) {
    throw new Error(
      "INVOICE_NINJA_URL and INVOICE_NINJA_API_TOKEN environment variables must be set. Check your MCP configuration.",
    );
  }

  const sanitizedUrl = baseUrl.replace(/\/+$/, "");
  validateBaseUrl(sanitizedUrl);

  return {
    baseUrl: sanitizedUrl,
    apiToken,
  };
}

/**
 * Validates that all dynamic segments in a path are safe (alphanumeric, hyphens, underscores).
 * Prevents path traversal attacks (e.g., ../../admin).
 * Static API segments (letters only) are allowed; dynamic IDs must be alphanumeric.
 */
function validatePath(path: string): void {
  const segments = path.split("/").filter(Boolean);
  for (const segment of segments) {
    // Reject any segment containing traversal patterns
    if (segment === "." || segment === ".." || segment.includes("/") || segment.includes("\\")) {
      throw new Error("Invalid path segment. Path traversal is not allowed.");
    }
    // Each segment must only contain safe characters (alphanumeric, hyphens, underscores)
    if (!/^[a-zA-Z0-9_\-]+$/.test(segment)) {
      throw new Error(
        "Invalid path segment. Only alphanumeric characters, hyphens, and underscores are allowed.",
      );
    }
  }
}

async function apiRequest<T>(
  method: string,
  path: string,
  params?: Record<string, string>,
  body?: unknown,
): Promise<ApiResponse<T>> {
  try {
    const config = getConfig();

    // Validate path to prevent traversal attacks
    validatePath(path);

    let url = `${config.baseUrl}/api/v1${path}`;

    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
          searchParams.set(key, value);
        }
      }
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    const response = await fetch(url, {
      method,
      headers: {
        "X-API-Token": config.apiToken,
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }
      return {
        result: null,
        isError: true,
        error: formatError(response.status, errorBody),
      };
    }

    const data = (await response.json()) as T;
    return { result: data, isError: false, error: null };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("environment variables must be set")
    ) {
      return { result: null, isError: true, error: error.message };
    }
    if (error instanceof Error && error.name === "TimeoutError") {
      return {
        result: null,
        isError: true,
        error: "Request timed out. The Invoice Ninja server did not respond in time.",
      };
    }
    if (
      error instanceof Error &&
      (error.message.includes("Invalid path segment") || error.message.includes("must use HTTPS"))
    ) {
      return { result: null, isError: true, error: error.message };
    }
    return {
      result: null,
      isError: true,
      error: "Failed to connect to Invoice Ninja. Please check your configuration and network.",
    };
  }
}

export function apiGet<T>(
  path: string,
  params?: Record<string, string>,
): Promise<ApiResponse<T>> {
  return apiRequest<T>("GET", path, params);
}

export function apiPost<T>(
  path: string,
  body: unknown,
): Promise<ApiResponse<T>> {
  return apiRequest<T>("POST", path, undefined, body);
}

export function apiPut<T>(
  path: string,
  body: unknown,
): Promise<ApiResponse<T>> {
  return apiRequest<T>("PUT", path, undefined, body);
}

export function apiDelete<T>(path: string): Promise<ApiResponse<T>> {
  return apiRequest<T>("DELETE", path);
}
