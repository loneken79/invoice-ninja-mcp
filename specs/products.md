# Products

## Motivation

When creating invoices, I want to reference existing products with preset prices and tax settings so I don't have to remember exact costs and tax rates for every line item.

## Success Criteria

- Can list products with search and pagination
- Can get full product details including pricing and tax settings
- Product keys from list-products can be used as `product_key` in invoice/quote line items

## Core Concepts

### Products as Line Item Templates
Products are reusable templates for invoice line items. When you set `product_key` on a line item, it references a product name. The `cost`, `quantity`, and tax fields on the line item override the product defaults.

## Tools

| Tool | API | Description |
|---|---|---|
| `list-products` | GET /products | Search by name/notes, paginated |
| `get-product` | GET /products/:id | Full details with pricing and tax settings |

## Current State

Both tools fully implemented. Read-only (no create/update/delete for products).

## Out of Scope

- Product CRUD (create/update/delete) -- could be added later
- Product categories
- Inventory tracking
