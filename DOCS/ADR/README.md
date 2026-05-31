# Architecture Decision Records (ADR)

Each ADR captures one significant decision: the context, the choice, the alternatives
considered, and the consequences/tradeoffs. ADRs are immutable once `Accepted` — to change a
decision, add a new ADR that supersedes the old one.

| # | Title | Status |
|---|---|---|
| [0001](0001-stack-and-backend-shape.md) | Stack & backend shape (Next.js fullstack) | Accepted |
| [0002](0002-database-postgresql.md) | Database — PostgreSQL | Accepted |
| [0003](0003-orm-prisma.md) | ORM — Prisma | Accepted |
| [0004](0004-auth-authjs-rbac.md) | Authentication — Auth.js v5 + RBAC | Accepted |
| [0005](0005-admin-location.md) | Admin location — `/admin` route group (subdomain-ready) | Accepted |
| [0006](0006-media-cloudinary.md) | Media storage — Cloudinary | Accepted |
| [0007](0007-deployment-vercel-neon.md) | Deployment — Vercel + Neon + Cloudinary | Accepted |
| [0008](0008-data-adaptor-seam.md) | Single data-adaptor seam (`lib/data`) | Accepted |
| [0009](0009-marketing-stats-hybrid.md) | Marketing statistics — manual now, integration-ready (`Stat.source`) | Accepted |
| [0010](0010-lead-activity-timeline.md) | Lead activity timeline over a single notes field | Accepted |
| [0011](0011-sitesettings-json-strategy.md) | SiteSettings validated JSON + selective promotion | Accepted |

## Format

```
# ADR NNNN — Title
Status: Proposed | Accepted | Superseded by ADR-XXXX
Date: YYYY-MM-DD
## Context
## Decision
## Alternatives considered
## Consequences (tradeoffs, risks, follow-ups)
```
