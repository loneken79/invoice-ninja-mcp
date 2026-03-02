# Clients

## Motivation

When I need to create an invoice, I first need to find or create the client it's for. Client management through the AI assistant enables the full invoicing workflow without leaving the conversation.

## Success Criteria

- Can list/search clients by name, email, or ID number
- Can get full client details including contacts, addresses, balance, and notes
- Can create clients with contacts (needed for emailing invoices)
- Can update any client field
- Can soft-delete clients

## Core Concepts

### Contacts
A client can have multiple contacts (people at the company). Each contact has: first_name, last_name, email, phone, send_email flag. **At least one contact with an email is required to send invoices** to the client.

### Client vs Contact
The "client" is the company/entity. "Contacts" are people associated with that client. The `list-clients` tool shows the primary contact's email for quick reference.

## Tools

| Tool | API | Description |
|---|---|---|
| `list-clients` | GET /clients | Search by name/email/id_number, paginated |
| `get-client` | GET /clients/:id | Full details with contacts and addresses |
| `create-client` | POST /clients | Create with name + optional contacts/address/notes |
| `update-client` | PUT /clients/:id | Update fields (contacts array replaces) |
| `delete-client` | DELETE /clients/:id | Soft-delete |

## Current State

All 5 tools fully implemented.

## Out of Scope

- Client portal access management
- Client document uploads
- Client-level settings (payment terms defaults, etc.)
