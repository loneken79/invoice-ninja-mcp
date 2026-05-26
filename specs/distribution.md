# Distribution & Installation

## Motivation

When I want to use this MCP server with Claude, I want a simple one-liner install that doesn't require cloning repos or building from source.

## Success Criteria

- Installable via `npx -y github:loneken79/invoice-ninja-mcp` one-liner in MCP config
- Works with Claude Desktop, Claude Code, and Cursor
- API credentials passed via environment variables in MCP config (not hardcoded)
- README includes copy-pasteable config for all three clients
- No runtime dependencies beyond Node.js >= 18

## Core Concepts

### npx Distribution
The package is published to npm with a `bin` field pointing to `dist/index.js`. The shebang (`#!/usr/bin/env node`) makes it directly executable. Users configure it as:

```json
{
  "mcpServers": {
    "invoice-ninja": {
      "command": "npx",
      "args": ["-y", "github:loneken79/invoice-ninja-mcp"],
      "env": {
        "INVOICE_NINJA_URL": "https://your-instance.invoicing.co",
        "INVOICE_NINJA_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

### Environment Variables
| Variable | Required | Description |
|---|---|---|
| `INVOICE_NINJA_URL` | Yes | Base URL (e.g., `https://invoicing.co` or self-hosted) |
| `INVOICE_NINJA_API_TOKEN` | Yes | API token from Settings > Account Management > API Tokens |

### Client Config Locations
- **Claude Desktop (macOS)**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Claude Desktop (Windows)**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Claude Code**: `claude mcp add` CLI command
- **Cursor**: `.cursor/mcp.json` in project root or `~/.cursor/mcp.json` global

## Current State

- Installable directly from GitHub repository `loneken79/invoice-ninja-mcp`
- `package.json` has `bin` field pointing to `dist/index.js`
- `#!/usr/bin/env node` shebang in `src/index.ts`
- Build produces executable `dist/index.js`
- README uses `npx -y github:loneken79/invoice-ninja-mcp` with configs for Claude Desktop, Claude Code, and Cursor
- Local development instructions in separate section


## Out of Scope

- Docker distribution
- Remote/HTTP MCP transport (local stdio only for now)
- Auto-update mechanism
