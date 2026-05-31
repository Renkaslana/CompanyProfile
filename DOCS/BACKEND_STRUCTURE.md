# Backend Structure

Server-only code. Introduced in Phase 1+; the frontend consumes it only through `lib/data` and
Server Actions. See [ARCHITECTURE](ARCHITECTURE.md) for the layering and ADR 0001 for the rationale.

## Target layout

```
server/
├── services/            # business logic + validation + authz + audit
│   ├── content.service.ts     # services, news, gallery, team, clients
│   ├── fleet.service.ts
│   ├── lead.service.ts
│   ├── faq.service.ts
│   ├── support.service.ts
│   ├── media.service.ts       # Cloudinary signed uploads + MediaAsset
│   ├── user.service.ts        # users, roles
│   └── settings.service.ts    # SiteSettings (company info, stats)
├── repositories/        # Prisma data access only (no business rules)
│   ├── content.repository.ts · fleet.repository.ts · lead.repository.ts
│   ├── faq.repository.ts · support.repository.ts · media.repository.ts
│   └── user.repository.ts · settings.repository.ts
├── auth/                # Auth.js config, callbacks, RBAC guards, permission map
└── audit/               # writeAudit() helper + entity constants

lib/
├── db.ts                # Prisma client singleton (Neon pooled URL)
├── validation/          # Zod schemas (shared by actions, handlers, forms)
└── config/              # env loader (Zod-validated at boot)

prisma/
├── schema.prisma · migrations/ · seed.ts
```

## Responsibilities

- **Service layer** — the only place business rules live. Each public method: (1) checks RBAC,
  (2) validates input with Zod, (3) calls repositories, (4) writes an audit entry on mutation.
  Example: `LeadService.create(input)`, `FaqService.publish(id, actor)`.
- **Repository layer** — thin Prisma wrappers (`findMany`, `create`, …). No authz, no validation.
  Swappable/testable; the only code that imports Prisma.
- **Auth** — Auth.js v5 config, session/jwt callbacks enriching the session with role+permissions,
  `requirePermission(perm)` guard used by services and middleware (ADR 0004).
- **Audit** — `writeAudit({ actorId, action, entity, entityId, meta })` on every mutation.

## How the frontend reaches it

- **Reads:** `lib/data/*` accessors call repositories (or services for permission-scoped reads).
  Signatures unchanged from the mock era (ADR 0008).
- **Mutations (CMS/forms):** **Server Actions** in `app/(admin)/.../actions.ts` (or
  `features/*/actions.ts`) call services. Type-safe, no manual fetch.
- **Public/webhook/uploads:** **Route Handlers** under `app/api/v1/*` call services.

## Mutation flow (example: publish a news post)

```
(admin) Server Action publishNews(id)
  → ContentService.publishNews(id, session)
      → requirePermission('news:publish')
      → Zod-validate
      → ContentRepository.update(id, { status: 'PUBLISHED', publishedAt })
      → writeAudit({ action: 'UPDATE news.publish', entity: 'NewsPost', entityId: id })
  → revalidatePath('/berita')
```

## Connection management (serverless)

`lib/db.ts` uses the Neon **pooled** connection string at runtime; migrations
(`prisma migrate deploy`) use the **direct** string in CI. Prisma client is a module singleton to
avoid exhausting connections on hot reload.
