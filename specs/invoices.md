# Invoices

## Motivation

When I need to bill a client, I want to create, send, and manage invoices through my AI assistant so I can handle invoicing without switching to the Invoice Ninja web UI.

This is the **primary reason** the MCP server exists.

## Success Criteria

- Can list invoices with filters (status, client, search, pagination)
- Can get full invoice details including line items, client info, and portal links
- Can create draft invoices with line items, taxes, discounts, terms, and notes
- Can update any invoice field (line items replace entirely, not merge)
- Can soft-delete invoices (recoverable from Invoice Ninja UI)
- Can email invoices to clients (marks as sent)
- Can perform bulk actions: mark_sent, mark_paid, archive, restore, delete, cancel, clone_to_quote
- Created invoices return: ID, number, amount, client portal link, admin panel link

## Core Concepts

### Draft-First Workflow
`create-invoice` always creates a **draft** invoice. To send it, use `send-invoice-email` (sends + marks as sent) or `bulk-invoice-action` with `mark_sent` (marks sent without emailing). This prevents accidental sends.

### Line Item Structure
Each line item has: `product_key` (optional name), `notes` (description), `cost` (unit price), `quantity`, and optional tax/discount fields. Tax is per-line (`tax_name1`/`tax_rate1`) or per-invoice.

### Status IDs
Invoice Ninja uses numeric status IDs:
- 1 = Draft
- 2 = Sent
- 3 = Partial (partially paid)
- 4 = Paid
- 5 = Cancelled
- 6 = Overdue (computed, not stored)

### Links
Every invoice response includes:
- **Client Portal link** -- from `invitations[0].link` (shareable URL for client)
- **Admin Panel link** -- constructed from base URL + `/invoices/{id}/edit`

## Data Model

### Create Invoice Payload
| Field | Type | Required | Description |
|---|---|---|---|
| client_id | string | Yes | Hashed client ID |
| line_items | array | Yes (min 1) | Line items with cost + quantity |
| date | string | No | YYYY-MM-DD, defaults to today |
| due_date | string | No | YYYY-MM-DD |
| number | string | No | Auto-generated if omitted |
| po_number | string | No | Purchase order number |
| discount | number | No | Overall discount |
| is_amount_discount | boolean | No | true=fixed, false=percentage |
| partial | number | No | Deposit amount |
| partial_due_date | string | No | Deposit due date |
| terms | string | No | Invoice terms |
| footer | string | No | Footer text |
| public_notes | string | No | Client-visible notes |
| private_notes | string | No | Internal notes |
| tax_name1 | string | No | Invoice-level tax name |
| tax_rate1 | number | No | Invoice-level tax rate % |

### Line Item Schema
| Field | Type | Required | Description |
|---|---|---|---|
| product_key | string | No | Product name from list-products |
| notes | string | No | Line description |
| cost | number | Yes | Unit price |
| quantity | number | Yes | Quantity |
| tax_name1 | string | No | Tax name (e.g., GST) |
| tax_rate1 | number | No | Tax rate % (e.g., 10) |
| discount | number | No | Line discount |

## Tools

| Tool | API | Description |
|---|---|---|
| `list-invoices` | GET /invoices | List with pagination, status/client/search filters |
| `get-invoice` | GET /invoices/:id?include=client | Full details with line items and links |
| `create-invoice` | POST /invoices | Create draft with line items |
| `update-invoice` | PUT /invoices/:id | Update fields (line_items replaces) |
| `delete-invoice` | DELETE /invoices/:id | Soft-delete |
| `send-invoice-email` | POST /emails | Email to client, marks as sent |
| `bulk-invoice-action` | POST /invoices/bulk | mark_sent, mark_paid, archive, restore, delete, cancel, clone_to_quote |

## Current State

All 7 tools fully implemented and functional.

## Out of Scope

- Recurring invoices (separate API entity -- potential future spec)
- Invoice PDF download/attachment
- Custom invoice designs/templates
- Multi-currency conversion
