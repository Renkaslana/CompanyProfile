# Architecture

System overview for the BMI Digital Platform. Companion docs: [FRONTEND_STRUCTURE](FRONTEND_STRUCTURE.md),
[BACKEND_STRUCTURE](BACKEND_STRUCTURE.md), [DATABASE](DATABASE.md), [API](API.md), [SECURITY](SECURITY.md).
Decisions are recorded in [ADR/](ADR/).

## 1. What this is

A premium company-profile website that doubles as the foundation for an internal operational
platform. Phase 2 (frontend, mock-driven) is complete. Phases ahead add persistence, auth, a CMS,
lead/fleet/gallery/news management, and a Support Center — without rewriting the frontend.

## 2. Stack

| Layer | Choice | ADR |
|---|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript strict | 0001 |
| UI | Tailwind v4, shadcn/ui (on **Base UI**), Framer Motion | — |
| Backend | Next.js fullstack (Server Actions + Route Handlers) | 0001 |
| Database | PostgreSQL (Neon) | 0002 |
| ORM | Prisma | 0003 |
| Auth | Auth.js v5 + RBAC | 0004 |
| Media | Cloudinary | 0006 |
| Hosting | Vercel + Neon + Cloudinary | 0007 |

## 3. Layering (request → data)

```
Browser (Client Components: UI, Framer Motion, forms)
  │
Next.js App Router
  ├─ Server Components            → read data for pages
  ├─ Server Actions               → internal mutations (CMS, forms)
  └─ Route Handlers (app/api/v1)  → public reads, webhooks, signed uploads
  │
lib/data (adaptor seam)           → stable read accessors (ADR 0008)
  │
server/services/*                 → business logic + Zod validation + authz
  │
server/repositories/*             → Prisma data access
  │
Prisma → PostgreSQL (Neon)
```

**Rule:** Components never query the DB. All mutations pass through services (validation + RBAC +
audit). All reads go through `lib/data` → repositories.

## 4. Zones

- **`app/(marketing)`** — public site (finalized). SSG/ISR where possible.
- **`app/(admin)`** — protected CMS at `/admin`, `noindex`, middleware-gated, RBAC (ADR 0005).
- **`app/api/v1`** — versioned REST for public reads/webhooks/signed uploads.

## 5. Data flow seam (why the frontend won't change)

Every page reads through `lib/data` accessors that currently return mock data. Backend integration
replaces those bodies with repository calls of **identical signatures** (ADR 0008). The frontend is
insulated by the shared domain types in `features/*/types.ts`, which already mirror the DB schema.

## 6. Future seams (designed for optionality, NOT planned scope)

The architecture leaves room to grow **without rewriting the platform**. These are capabilities the
foundation *can* support later — none are committed scope:

- **Future Operational Modules** — a separate operational service (e.g. NestJS) sharing the same
  Neon Postgres, for workloads that don't fit serverless (long-running jobs, queues, real-time).
- **Future Analytics Services & Business Intelligence** — reporting/aggregation over the same data
  (Postgres window functions, or a dedicated analytics store if ever needed).
- **Future Platform Extensions** — additional domains layered behind the existing `lib/data` seam
  and service/repository layers.
- **Monorepo promotion** (Turborepo) only when a second runtime actually exists.
- **Admin subdomain** — `(admin)` + `server/` isolation makes this a config move, not a rewrite.

> *Illustrative only:* such modules **could** one day include things like an HR/attendance module
> (e.g. face-recognition check-in). These are examples of what the seams enable — **not** current or
> planned implementation targets. The point is optionality: anything above stays additive when the
> business decides to pursue it.

## 7. Cross-cutting concerns

- **Validation:** Zod at every trust boundary (Server Actions, Route Handlers).
- **AuthZ:** RBAC in `middleware.ts` + service layer (defense in depth).
- **Audit:** every mutation writes an `AuditLog` row.
- **Observability:** Sentry + structured logging (production readiness).
- **SEO:** metadata, `sitemap.ts`, `robots.ts`, Organization JSON-LD already in place.
