# BMI Digital Platform — Documentation

Technical documentation for the BMI Digital Platform. The **root `README.md` is intentionally
deferred** until the project stabilizes (Phase 10). Product spec: `../PRD_BMI_Platform.md`.

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
| [SUPPORT_CENTER_WORKFLOW](SUPPORT_CENTER_WORKFLOW.md) | FAQ + human escalation (no AI) |
| [DEPLOYMENT](DEPLOYMENT.md) | Vercel + Neon + Cloudinary, CI/CD, backups |
| [TESTING](TESTING.md) | Test layers, roadmap, CI gate |
| [DEVELOPMENT_GUIDE](DEVELOPMENT_GUIDE.md) | Setup, conventions, onboarding |
| [CONTRIBUTING](CONTRIBUTING.md) | Branching, commits, PR checklist |
| [IMPLEMENTATION_HANDOFF](IMPLEMENTATION_HANDOFF.md) | **Start here for build** — approved plan, roadmap, Phase 1 breakdown |
| [CHANGELOG](CHANGELOG.md) | Notable changes |
| [ADR/](ADR/) | Architecture Decision Records 0001–0011 (the "why") |

## Locked decisions (see ADRs)

Next.js fullstack · PostgreSQL (Neon) · Prisma · Auth.js v5 + RBAC · `/admin` route group
(subdomain-ready) · Cloudinary · Vercel + Neon + Cloudinary · `lib/data` swap seam.

## Phased roadmap (gated — frontend stays finalized)

| Phase | Scope |
|---|---|
| 0 | Docs & ADRs *(this deliverable)* |
| 1 | Infrastructure: Prisma schema, Neon, env+Zod, `server/` skeleton, seed |
| 2 | Swap `lib/data` mock → repositories |
| 3 | Auth.js + RBAC + `(admin)` shell |
| 4 | CMS core (content + media library + audit) |
| 5 | Fleet management |
| 6 | Support Center (FAQ + escalation) |
| 7 | Lead management |
| 8 | Security hardening |
| 9 | Testing & stabilization |
| 10 | Production readiness (+ root README) |

> **Rule:** no backend implementation begins until this documentation is reviewed and approved.
