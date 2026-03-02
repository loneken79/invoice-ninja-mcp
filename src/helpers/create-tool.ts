import { ZodRawShape } from "zod";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ToolDefinition } from "./types.js";

export const createTool =
  <Args extends ZodRawShape>(
    name: string,
    description: string,
    schema: Args,
    handler: ToolCallback<Args>,
  ): (() => ToolDefinition<Args>) =>
  () => ({
    name,
    description,
    schema,
    handler,
  });
