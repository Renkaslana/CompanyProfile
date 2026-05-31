# ADR 0002 — Database: PostgreSQL

- **Status:** Accepted
- **Date:** 2026-05-29

## Context

The platform stores relational CMS content (services, fleet, news, gallery, team, clients, FAQ),
leads, users/roles, and audit logs now — and should remain able to support **future analytics and
other operational extensions** without a migration. Hosting target is Neon (serverless Postgres) per
ADR 0007.

## Decision

Use **PostgreSQL** (managed via **Neon**).

## Alternatives considered

| | PostgreSQL | MySQL | MongoDB |
|---|---|---|---|
| Relational CMS + RBAC | ✅ | ✅ | ❌ awkward joins |
| Future analytics / BI | ✅ (window fns, +TimescaleDB) | partial | ❌ |
| Future extensions (e.g. vector/similarity search) | ✅ `pgvector` available | ❌ | ❌ |
| Flexible fields | ✅ JSONB | partial | ✅ |
| Prisma support | ✅ first-class | ✅ | partial |

## Consequences

- ✅ One database serves the CMS today and can support future analytics/extensions later
  (e.g. vector search via `pgvector`) — without changing engines.
- ✅ JSONB covers flexible fields (e.g. `Role.permissions`, `SiteSettings`).
- ⚠️ Serverless connection limits → use the Neon **pooled** connection string (PgBouncer) for the
  app runtime and the direct string for migrations.
