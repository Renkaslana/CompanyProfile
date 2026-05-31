# Support Center Workflow

A professional, **human** support center — **no AI chatbot**. Public self-service FAQ with a clear
path to escalate to a person.

## Public experience (`/bantuan`)

```
/bantuan
  ├─ Search bar (live FAQ search)
  ├─ Popular questions (top by viewCount)
  ├─ Quick help cards (shortcuts: pelacakan, penawaran, armada, kontak)
  ├─ FAQ categories  → /bantuan/[category]
  └─ "Masih butuh bantuan?"  → Human Support (escalation) + contact info + Request Quotation
```

- **Search**: queries published `FaqItem`s; a miss logs to `FaqSearchLog` (drives content backlog).
- **Article**: increments `viewCount`; shows "Apakah ini membantu? 👍/👎" → `helpfulYes/No`.
- **Escalation**: structured form → `POST /api/v1/support/tickets` → `SupportTicket(OPEN)`
  (rate-limited + Turnstile). The "Request Quotation" CTA reuses the existing lead form.
- Contact info (phone/WhatsApp/email) is always visible as the human fallback.

### Public flow

```
Visitor → search/browse FAQ
  ├─ found → read article → (optional) helpful vote
  └─ not found → "Hubungi Tim Support"
                   ├─ Support ticket (name, email, subject, message)
                   └─ or Request Quotation (lead form) / direct contact
```

## Admin experience (`/admin/support`, `/admin/faq`)

**FAQ management** (`faq:write` / `faq:publish`):
- CRUD FAQ items (rich-text answer, sanitized) and categories
- Draft / publish / reorder
- **Analytics**: view counts, helpful ratio per item, and the **search-miss report** from
  `FaqSearchLog` → tells the team which FAQs to write next

**Ticket management** (`support:manage`):
- List/filter tickets, advance `OPEN → IN_PROGRESS → RESOLVED → CLOSED`
- **Assign** a ticket to an agent (`assignedToUserId`, optional) for multi-admin workflows
- Respond out-of-band (email) — no automated replies this phase

## Data (see [DATABASE.md](DATABASE.md))

`FaqCategory`, `FaqItem` (status, viewCount, helpfulYes/No), `FaqSearchLog` (query, resultsCount),
`SupportTicket` (status workflow).

## Why no chatbot

Logistics buyers want accurate, accountable answers and a real person for anything non-trivial. A
curated FAQ + fast human escalation is more trustworthy and far cheaper to operate than an AI bot
that can hallucinate commitments. The search-miss log keeps the FAQ improving over time.

## Frontend notes

New public route group entry `/bantuan` (+ `[category]`), added to navbar/footer. Reuses existing
primitives: `accordion` (FAQ), `input` (search), `SectionHeading`, `lead-form` (quotation),
`PageHeader`. Admin screens reuse the CMS shell.
