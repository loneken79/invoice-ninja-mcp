import { ZodRawShape } from "zod";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";

export type ApiResponse<T> =
  | { result: T; isError: false; error: null }
  | { result: null; isError: true; error: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ToolDefinition<Args extends ZodRawShape = any> {
  name: string;
  description: string;
  schema: Args;
  handler: ToolCallback<Args>;
}
