# Existing Invoice Ninja MCP Servers - Competitive Analysis

## Summary

There are **4 known implementations** of Invoice Ninja MCP servers. Most are hosted/managed services with limited tool sets. Only one is an open-source, self-hostable server -- and it's written in Python with significantly fewer tools than our implementation.

---

## 1. a-wiseguy/invoiceninja-mcp (Open Source - Python)

**The only open-source, self-hostable implementation.**

| Attribute | Detail |
|---|---|
| Language | Python (FastMCP) |
| Target API | Invoice Ninja v5.11.62 |
| Auth | `API_URL` + `API_KEY` env vars in `.env` |
| Run command | `poetry run python -m invoiceninja_mcp` |
| Listed on | [LobeHub](https://lobehub.com/mcp/a-wiseguy-invoiceninja-mcp), Evanth MCP Marketplace |

### Tools (confirmed via registry listings)
- `test_connection` - Test API connection and authentication
- Fetch/list invoices (list all, filter by month, unpaid, etc.)
- Fetch expenses (by date range)
- Fetch products
- Tax report generation

### Strengths
- Has a `test_connection` tool (useful for debugging)
- Tax report aggregation (value-add beyond raw API)
- Pydantic models for type safety

### Weaknesses
- **Python-only** (requires poetry, Python runtime -- heavier install)
- **Very limited tool set** -- appears to be read-only (no create/update/delete)
- No invoice creation (the most important use case)
- No client management
- No payment recording
- No quote management
- Cannot be installed via `npx` one-liner

---

## 2. Pipedream MCP (Hosted Service)

| Attribute | Detail |
|---|---|
| Type | Hosted/managed |
| URL | `https://mcp.pipedream.net/v2` |
| Auth | OAuth through Pipedream account |
| Setup | Connect Invoice Ninja account through Pipedream UI |

### Tools
Dynamically loaded after authentication -- not publicly enumerable. Part of Pipedream's 3,000+ API integrations with 10,000+ prebuilt tools.

### Strengths
- No self-hosting required
- Part of larger integration ecosystem

### Weaknesses
- **Requires Pipedream account** (vendor lock-in)
- Cannot be self-hosted
- Tool list not transparent
- Likely rate-limited by Pipedream's plans
- Not open source

---

## 3. Zapier MCP (Hosted Service)

| Attribute | Detail |
|---|---|
| Type | Hosted/managed |
| Setup | Through Zapier MCP AI interface |

### Triggers (events)
- New client added
- New invoice added
- New project added
- Invoice sent
- Client updated
- Payment updated

### Actions (tools)
- Create invoice
- Create credit
- Create payment
- Create project
- Create recurring invoice
- Find invoice by number (search)

### Strengths
- Has both triggers and actions
- Includes recurring invoices and credits
- Project support

### Weaknesses
- **Requires Zapier account** (paid plans for MCP)
- Not open source / not self-hostable
- Limited action set (no update/delete, no quotes, no expenses)
- No client creation

---

## 4. viaSocket MCP (Hosted Service)

| Attribute | Detail |
|---|---|
| Type | Hosted/managed |
| Listed at | [viaSocket](https://viasocket.com/mcp/invoice-ninja) |

Connects Invoice Ninja actions with AI tools like ChatGPT, Claude, and Cursor. Limited public documentation on available tools.

---

## Competitive Matrix

| Feature | a-wiseguy (Python) | Pipedream | Zapier | viaSocket | **Ours (TS)** |
|---|---|---|---|---|---|
| Open source | Yes | No | No | No | **Yes** |
| Self-hostable | Yes | No | No | No | **Yes** |
| npx install | No | N/A | N/A | N/A | **Yes** |
| Language | Python | N/A | N/A | N/A | **TypeScript** |
| **Invoices** | | | | | |
| List/search | Yes | ? | Via search | ? | **Yes** |
| Get by ID | Likely | ? | ? | ? | **Yes** |
| Create | No | ? | Yes | ? | **Yes** |
| Update | No | ? | No | ? | **Yes** |
| Delete | No | ? | No | ? | **Yes** |
| Send email | No | ? | No | ? | **Yes** |
| Bulk actions | No | ? | No | ? | **Yes** |
| **Clients** | | | | | |
| List/search | No | ? | No | ? | **Yes** |
| Get by ID | No | ? | No | ? | **Yes** |
| CRUD | No | ? | No | ? | **Yes** |
| **Products** | | | | | |
| List | Yes | ? | No | ? | **Yes** |
| Get | No | ? | No | ? | **Yes** |
| **Payments** | | | | | |
| List | No | ? | No | ? | **Yes** |
| Create | No | ? | Yes | ? | **Yes** |
| **Quotes** | | | | | |
| Full CRUD | No | ? | No | ? | **Yes** |
| Convert to invoice | No | ? | No | ? | **Yes** |
| **Expenses** | | | | | |
| List | Yes | ? | No | ? | **Yes** |
| Create | No | ? | No | ? | **Yes** |
| **Other** | | | | | |
| Test connection | Yes | N/A | N/A | N/A | No |
| Tax reports | Yes | ? | No | ? | No |
| Credits | No | ? | Yes | ? | No |
| Recurring invoices | No | ? | Yes | ? | No |
| Projects | No | ? | Yes | ? | No |

## Key Takeaways

1. **Our server is by far the most comprehensive** with 25 tools vs ~5 for the nearest competitor
2. **We're the only TypeScript implementation** -- enables `npx` one-liner install
3. **No existing open-source server supports invoice creation** (our primary use case)
4. **Gaps to consider adding**: test_connection tool, tax reports, credits, recurring invoices, projects

## Features Worth Adding (from competitive analysis)

### High Value
- `test-connection` tool -- validates API credentials (a-wiseguy has this; useful for debugging)
- **Recurring invoices** -- Zapier supports this; very common need

### Medium Value
- **Credits** -- Zapier supports create credit
- **Tax report** -- a-wiseguy provides aggregated tax data

### Lower Priority
- **Projects** -- Zapier supports these
- **Tasks** -- Time tracking tasks
- **Vendors** -- For expense management
