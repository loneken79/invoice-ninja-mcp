# Quotes

## Motivation

When I want to send a price estimate before committing to an invoice, I want to create and manage quotes that can later be converted to invoices.

## Success Criteria

- Can list/search/filter quotes by client
- Can get full quote details with line items and portal links
- Can create quotes with same line item structure as invoices
- Can update quotes
- Can perform bulk actions: approve, convert_to_invoice, mark_sent, archive, restore, delete

## Core Concepts

### Quote-to-Invoice Conversion
The `convert_to_invoice` bulk action creates an invoice from a quote, carrying over all line items and client info. This is the primary workflow for quotes.

### Shared Structure with Invoices
Quotes use the identical line item schema as invoices. The only difference is the entity type and available bulk actions.

## Tools

| Tool | API | Description |
|---|---|---|
| `list-quotes` | GET /quotes?include=client | Paginated with client filter |
| `get-quote` | GET /quotes/:id?include=client | Full details with line items and links |
| `create-quote` | POST /quotes | Create with line items |
| `update-quote` | PUT /quotes/:id | Update fields (line_items replaces) |
| `bulk-quote-action` | POST /quotes/bulk | approve, convert_to_invoice, mark_sent, archive, restore, delete |

## Current State

All 5 tools fully implemented.

## Out of Scope

- Quote approval workflows
- Quote PDF download
- Quote-specific templates
