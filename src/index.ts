#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./tools/tool-factory.js";

const server = new McpServer({
  name: "invoice-ninja",
  version: "1.0.0",
});

registerAllTools(server);

const transport = new StdioServerTransport();
server.connect(transport).catch((error) => {
  console.error("Failed to start Invoice Ninja MCP server:", error);
  process.exit(1);
});
