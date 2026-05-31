# ADR 0011 — SiteSettings as validated JSON, with selective promotion to tables

- **Status:** Accepted
- **Date:** 2026-05-29

## Context

Global site configuration (company info, core values, marketing stats) needs a home. The question is
which fields should be JSON in a settings singleton vs explicit columns/tables.

## Decision

Keep **`SiteSettings`** as a **singleton row** holding **`company`** and **`values`** as
**Zod-validated JSON**. **Promote `stats` out into the `Stat` table** (ADR 0009).

Guiding rule: a field earns explicit columns/a table only when it needs **DB-level validation,
indexing/joins, or per-row CRUD/ordering**. `company` and `values` are read **wholesale**, never
queried/filtered, and rarely change → JSON (with Zod) is the right tool. `stats` needs ordering,
per-row CRUD, and a `source` flag → a table.

## Alternatives considered

- **All explicit columns** — strong DB validation but heavy migration churn for fields that are only
  ever read as a blob.
- **All JSON (incl. stats)** — flexible but makes stats hard to order/CRUD and offers no per-row flag.

## Consequences

- ✅ Minimal migrations for company/values; validation enforced via Zod in `lib/validation`.
- ✅ Stats get clean CRUD/ordering and integration-readiness (ADR 0009).
- ⚠️ JSON has no DB-level constraints — mitigated by mandatory Zod validation on write.
