# Expenses

## Motivation

When I incur a business expense, I want to record it through my AI assistant so it's tracked alongside my invoicing data and can be linked to clients or invoices for billable expenses.

## Success Criteria

- Can list expenses with client/vendor filter and search
- Can get full expense details
- Can create expenses linked to clients, vendors, invoices, and categories

## Tools

| Tool | API | Description |
|---|---|---|
| `list-expenses` | GET /expenses | Paginated with client/vendor filters |
| `get-expense` | GET /expenses/:id | Full details |
| `create-expense` | POST /expenses | Create with amount, client/vendor/category links |

## Current State

All 3 tools fully implemented.

## Out of Scope

- Expense categories CRUD
- Receipt upload/attachment
- Expense approval workflows
- Expense-to-invoice conversion
