# API Integration

## Motivation

When I want to interact with Invoice Ninja through an AI assistant, I need a reliable API client that handles authentication, error formatting, pagination, and connection management so that each tool can focus on its business logic rather than HTTP plumbing.

## Success Criteria

- API client authenticates via `X-API-Token` header with token from environment
- Base URL supports both self-hosted instances and hosted (invoicing.co)
- All HTTP methods supported: GET, POST, PUT, DELETE
- Errors are formatted into human-readable messages (not raw JSON dumps)
- Validation errors (422) extract per-field messages
- Common HTTP errors (401, 403, 404, 429) return actionable guidance
- Connection failures return clear messages (not stack traces)
- Missing env vars produce a clear config error

## Core Concepts

### Environment-Based Configuration
The server reads `INVOICE_NINJA_URL` and `INVOICE_NINJA_API_TOKEN` from environment variables. These are passed via the MCP server config (not hardcoded). The URL is the Invoice Ninja instance root (e.g., `https://invoicing.co` or `https://ninja.mycompany.com`). The client appends `/api/v1` to all paths.

### Required Headers
Every request includes:
- `X-API-Token: <token>` -- Invoice Ninja v5 API auth
- `X-Requested-With: XMLHttpRequest` -- Required by Invoice Ninja's CORS/CSRF protection
- `Content-Type: application/json`

### Result Type Pattern
Every API call returns `ApiResponse<T>` -- a discriminated union that's either `{ result: T, isError: false }` or `{ result: null, isError: true, error: string }`. This keeps error handling consistent across all tools without exceptions.

### Error Formatting
- 401 -> "Check your INVOICE_NINJA_API_TOKEN"
- 403 -> "Your API token lacks access"
- 404 -> "Entity does not exist or has been deleted"
- 422 -> Extracts per-field validation errors from response body
- 429 -> "Rate limited, try again"
- Network errors -> "Failed to connect to Invoice Ninja: <message>"

## Current State

Fully implemented in:
- `src/client/api-client.ts` -- HTTP client with `apiGet`, `apiPost`, `apiPut`, `apiDelete`
- `src/helpers/types.ts` -- `ApiResponse<T>` and `ToolDefinition` types
- `src/helpers/format-error.ts` -- Error message formatting
- `src/helpers/create-tool.ts` -- Tool factory with lazy evaluation

Uses native `fetch` (no HTTP library dependencies).

## Out of Scope

- OAuth/session-based auth (Invoice Ninja v5 uses static API tokens)
- Request retries or circuit breakers
- Response caching
- Webhook/event subscriptions
