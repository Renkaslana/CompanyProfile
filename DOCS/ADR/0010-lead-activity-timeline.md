# ADR 0010 — Lead activity timeline over a single notes field

- **Status:** Accepted
- **Date:** 2026-05-29

## Context

"Lead Management" is explicit scope. Admins need to record follow-up actions, communication history,
and business-development notes — potentially with multiple admins on the same lead.

## Decision

Add a **`LeadActivity`** table (timeline) rather than a single `internalNotes` field:

```prisma
enum LeadActivityType { NOTE CALL EMAIL MEETING STATUS_CHANGE }
model LeadActivity { id, leadId→Lead(onDelete: Cascade), authorId→User, type, body, createdAt }
```

Every lead status change auto-creates a `STATUS_CHANGE` activity so the history is complete.

## Alternatives considered

- **`internalNotes String?`** — trivial, but a single blob with no authorship/timestamps; multiple
  admins overwrite each other; no real follow-up history.

## Consequences

- ✅ Full, attributed follow-up history; matches a real lead-management workflow.
- ✅ Extensible (add types/fields later) without reworking leads.
- ⚠️ One extra table + a timeline UI (add-note form + list) — accepted for the CRM value.
