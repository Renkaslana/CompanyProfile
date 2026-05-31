# ADR 0009 — Marketing statistics: manual now, integration-ready

- **Status:** Accepted
- **Date:** 2026-05-29

## Context

The public site shows marketing stats (fleet units, shipments, clients, operational availability).
The BMI website is a company-profile platform, **not** the company's operational/tracking system, so
the authoritative numbers for shipments/clients live elsewhere and don't yet have an API.

## Decision

Model stats in a dedicated **`Stat` table** with a `source` flag:

```prisma
enum StatSource { MANUAL DERIVED }
model Stat { id, key @unique, label, value, suffix?, source @default(MANUAL), order }
```

All four metrics start **MANUAL** (edited in the CMS). The schema supports flipping any metric to
**DERIVED** later — computed from our own DB (e.g. active fleet count) or synced from an external
operational API — **without a schema change**.

## Alternatives considered

- **A. Manual only (CMS/JSON)** — simplest, but no upgrade path and can go stale.
- **B. Auto API sync only** — needs an operational source of truth that doesn't exist; over-engineered;
  risks showing raw/fluctuating numbers on a marketing site.
- **C. Hybrid (chosen)** — manual now, integration-ready via `source`.

## Consequences

- ✅ Accurate and realistic now (humans own the rounded marketing numbers like "50+").
- ✅ Clean, migration-free path to DERIVED/integration when/if the business wants it.
- ✅ Replaces the earlier `SiteSettings.stats` JSON with a CRUD-able, orderable table.
- ⚠️ Manual numbers require an owner to keep them current.
