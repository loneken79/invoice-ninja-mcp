# Invoice Ninja MCP Server

An MCP (Model Context Protocol) server for [Invoice Ninja](https://invoiceninja.com) v5. Create invoices, manage clients, record payments, and more through Claude.

## Features

25 tools across 6 categories:

**Invoices** (primary)
- `list-invoices` - List/filter/search invoices
- `get-invoice` - Get full invoice details with line items
- `create-invoice` - Create draft invoices
- `update-invoice` - Update invoice fields and line items
- `delete-invoice` - Soft-delete invoices
- `send-invoice-email` - Email invoices to clients
- `bulk-invoice-action` - Mark sent/paid, archive, cancel, clone to quote

**Clients**
- `list-clients` - List/search clients
- `get-client` - Get client details with contacts
- `create-client` - Create clients with contacts
- `update-client` - Update client details
- `delete-client` - Soft-delete clients

**Products**
- `list-products` - List products for line item reference
- `get-product` - Get product details and pricing

**Payments**
- `list-payments` - List payment records
- `get-payment` - Get payment details
- `create-payment` - Record payments against invoices

**Quotes**
- `list-quotes` - List quotes
- `get-quote` - Get quote details
- `create-quote` - Create quotes (same structure as invoices)
- `update-quote` - Update quotes
- `bulk-quote-action` - Approve, convert to invoice, mark sent

**Expenses**
- `list-expenses` - List expenses
- `get-expense` - Get expense details
- `create-expense` - Create expense records

## Configuration

You need two things:

1. **Invoice Ninja URL** - Your Invoice Ninja instance URL (e.g., `https://invoicing.co` or your self-hosted URL)
2. **API Token** - Generate from Invoice Ninja: Settings > Account Management > API Tokens

## Installation

### Claude Desktop

Add to your Claude Desktop config file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "invoice-ninja": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/invoice-ninja-mcp/dist/index.js"],
      "env": {
        "INVOICE_NINJA_URL": "https://your-instance.invoicing.co",
        "INVOICE_NINJA_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

Then restart Claude Desktop.

### Claude Code

```bash
claude mcp add invoice-ninja \
  -e INVOICE_NINJA_URL=https://your-instance.invoicing.co \
  -e INVOICE_NINJA_API_TOKEN=your_api_token_here \
  -- node /ABSOLUTE/PATH/TO/invoice-ninja-mcp/dist/index.js
```

## Development

### Prerequisites

- Node.js >= 18
- pnpm

### Setup

```bash
pnpm install
pnpm run build
```

### Watch mode

```bash
pnpm run watch
```

### Testing locally

Create a `.env` file with your credentials (already in `.gitignore`):

```
INVOICE_NINJA_URL=https://your-instance.invoicing.co
INVOICE_NINJA_API_TOKEN=your_api_token_here
```

Then point your MCP config to the local build:

```json
{
  "mcpServers": {
    "invoice-ninja": {
      "command": "node",
      "args": ["/path/to/invoice-ninja-mcp/dist/index.js"],
      "env": {
        "INVOICE_NINJA_URL": "https://your-instance.invoicing.co",
        "INVOICE_NINJA_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

## Example Workflow

1. "List my clients" → `list-clients`
2. "Create an invoice for Acme Corp with 10 hours of consulting at $150/hr" → `list-clients` (find ID) → `create-invoice`
3. "Send that invoice" → `send-invoice-email`
4. "Mark it as paid" → `bulk-invoice-action` with `mark_paid`

## License

MIT
