import { ApiResponse } from "../helpers/types.js";
import { formatError } from "../helpers/format-error.js";

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
  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    apiToken,
  };
}

async function apiRequest<T>(
  method: string,
  path: string,
  params?: Record<string, string>,
  body?: unknown,
): Promise<ApiResponse<T>> {
  try {
    const config = getConfig();
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
    return {
      result: null,
      isError: true,
      error: `Failed to connect to Invoice Ninja: ${error instanceof Error ? error.message : String(error)}`,
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
