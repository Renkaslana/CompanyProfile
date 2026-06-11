# BMI Digital Platform — Documentation

Technical documentation for the BMI Digital Platform. For project overview,
setup, and scripts, start at the root [`README.md`](../README.md).

## Recommended reading order (new reviewers)

1. [`../README.md`](../README.md) — project overview, features, setup
2. [ARCHITECTURE](ARCHITECTURE.md) — system design & layering
3. [DATABASE](DATABASE.md) — Prisma schema, indexes, migrations
4. [BACKEND_STRUCTURE](BACKEND_STRUCTURE.md) — services + repositories + mutation flow
5. [FRONTEND_STRUCTURE](FRONTEND_STRUCTURE.md) — routing, components, Base UI convention
6. [SECURITY](SECURITY.md) — auth, RBAC matrix, headers, audit
7. [ADR/](ADR/README.md) — Architecture Decision Records (the "why")
8. [CHANGELOG](CHANGELOG.md) — what landed, and when

## Index

| Doc | What it covers |
|---|---|
| [ARCHITECTURE](ARCHITECTURE.md) | System overview, stack, layering, zones, future seams |
| [FRONTEND_STRUCTURE](FRONTEND_STRUCTURE.md) | Routing, components, tokens, **Base UI** convention |
| [BACKEND_STRUCTURE](BACKEND_STRUCTURE.md) | `server/` services + repositories, mutation flow |
| [DATABASE](DATABASE.md) | Full Prisma schema, indexes, migration policy |
| [API](API.md) | Server Actions vs Route Handlers, endpoints, envelopes |
| [SECURITY](SECURITY.md) | AuthN/Z, RBAC matrix, headers, rate limits, uploads, audit |
| [CMS_WORKFLOW](CMS_WORKFLOW.md) | CMS modules, CRUD/publish flows, permissions |
| [DEPLOYMENT](DEPLOYMENT.md) | Vercel + Neon + Cloudinary, CI/CD, backups |
| [TESTING](TESTING.md) | Test layers & roadmap *(planned — no tests yet)* |
| [DEVELOPMENT_GUIDE](DEVELOPMENT_GUIDE.md) | Setup, conventions, onboarding |
| [CONTRIBUTING](CONTRIBUTING.md) | Branching, commits, PR checklist |
| [CHANGELOG](CHANGELOG.md) | Notable changes per phase |
| [ADR/](ADR/README.md) | Architecture Decision Records 0001–0011 (the "why") |
| [archive/](archive/README.md) | Historical planning & handoff artifacts (not current) |

## Locked decisions (see ADRs)

Next.js fullstack · PostgreSQL (Neon) · Prisma · Auth.js v5 + RBAC · `/admin`
route group (subdomain-ready) · Cloudinary · Vercel + Neon + Cloudinary ·
`lib/data` swap seam.

## Roadmap

| Phase | Scope | Status |
|---|---|---|
| 0 | Docs & ADRs | ✅ |
| 1 | Infrastructure: Prisma schema, Neon, env+Zod, `server/` skeleton, seed | ✅ |
| 2 | Swap `lib/data` mock → repositories | ✅ |
| 3 | Auth.js + RBAC + `(admin)` shell | ✅ |
| 4 | CMS core (content + media + leads + settings + audit) | ✅ `v0.4.0` |
| — | Pre-deploy hardening (CSP, rate-limit, Sentry, legal copy) | ⏳ Next |
| 10 | Production deploy (Vercel + Neon + custom domain) | ⏳ Planned |
| 5 | Fleet management | ⏳ Planned |
| 9 | Testing & stabilization | ⏳ Planned |
| 8 | Security hardening (MFA UI, append-only audit, EXIF strip) | ⏳ Planned |

> **Note:** the Support Center ticket system originally planned for Phase 6 was
> **retired** in favour of the click-only **Tanya BMI** guided panel + the Leads
> inbox. See [CHANGELOG](CHANGELOG.md).
