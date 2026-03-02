# Payments

## Motivation

When a client pays an invoice, I want to record the payment through my AI assistant so the invoice balance updates and the payment history is tracked.

## Success Criteria

- Can list payments with client filter and search
- Can get payment details including which invoices it's applied to
- Can create payments applied to specific invoices (full or partial)
- Payment creation updates invoice balance automatically

## Core Concepts

### Payment-to-Invoice Mapping
A single payment can be applied to multiple invoices. The `invoices` array on create-payment specifies `{ invoice_id, amount }` pairs. The total `amount` should equal the sum of individual invoice amounts.

### Payment Types
Payment type IDs (e.g., 1=bank transfer, 2=cash) are configured in Invoice Ninja settings.

## Tools

| Tool | API | Description |
|---|---|---|
| `list-payments` | GET /payments?include=client | Paginated with client filter |
| `get-payment` | GET /payments/:id?include=client | Details with applied invoices |
| `create-payment` | POST /payments | Record payment against invoices |

## Current State

All 3 tools fully implemented.

## Out of Scope

- Payment refunds/voids
- Payment method management
- Online payment gateway integration
