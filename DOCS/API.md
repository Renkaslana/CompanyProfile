# API

Two surfaces (PRD §11, ADR 0001):

1. **Server Actions** — all internal mutations (CMS CRUD, public form submits). Type-safe, no
   manual fetch, colocated with their feature. **Preferred** for everything the app itself calls.
2. **Route Handlers** (`app/api/v1/*`) — versioned REST for public reads, webhooks, and signed
   uploads, i.e. anything an external consumer or the browser fetches directly.

## Conventions

- **Versioning:** `/api/v1/*`. Breaking changes → `/api/v2`.
- **Validation:** Zod at every boundary (shared schemas in `lib/validation`).
- **Success envelope:** `{ "data": …, "meta": { "page", "pageSize", "total" } }` (meta only when paginated).
- **Error envelope:** `{ "error": "Human message", "code": "MACHINE_CODE", "details": { … } }`.
- **Auth:** public endpoints are open (+ rate limit / Turnstile on writes); `admin` endpoints require
  a valid session and the relevant RBAC permission (checked in middleware **and** service).
- **Caching:** public GETs use ISR/`revalidate`; mutations call `revalidatePath`/`revalidateTag`.

## Public read endpoints (Route Handlers)

| Method | Path | Purpose | Auth |
|---|---|---|---|
| GET | `/api/v1/services` | published services | public |
| GET | `/api/v1/services/:slug` | service detail | public |
| GET | `/api/v1/fleet` | active fleet | public |
| GET | `/api/v1/gallery` | gallery items (filter `?category=`) | public |
| GET | `/api/v1/news` | published news (paginated) | public |
| GET | `/api/v1/news/:slug` | article | public |
| GET | `/api/v1/faq` | published FAQ (filter `?category=`, `?q=`) | public |
| GET | `/api/v1/coverage` · `/clients` · `/certifications` · `/jobs` | marketing content | public |

> Pages themselves read via `lib/data` (Server Components) — these REST endpoints exist for
> external/3rd-party consumption and client-side fetches (e.g. FAQ live search).

## Public write endpoints

| Method | Path | Purpose | Protection |
|---|---|---|---|
| POST | `/api/v1/leads` | create lead from quote/contact form | rate limit + **Turnstile** + Zod |
| POST | `/api/v1/support/tickets` | escalate to human support | rate limit + Turnstile + Zod |
| POST | `/api/v1/faq/:id/helpful` | 👍/👎 vote | rate limit (debounced) |
| POST | `/api/v1/faq/search-log` | log a search miss | rate limit |

## Admin endpoints (RBAC)

Most admin actions are **Server Actions**, not REST. REST admin handlers exist only where needed:

| Method | Path | Purpose | Permission |
|---|---|---|---|
| GET | `/api/v1/admin/leads` | list/filter leads | `lead:read` |
| PATCH | `/api/v1/admin/leads/:id` | update lead status | `lead:update` |
| POST | `/api/v1/admin/media/sign` | get a **signed** Cloudinary upload payload | `media:create` |
| POST | `/api/v1/admin/media` | persist `MediaAsset` after upload | `media:create` |

## Server Action surface (internal mutations)

Grouped per feature, e.g. `app/(admin)/news/actions.ts`:

```
createNews / updateNews / publishNews / archiveNews / deleteNews
createService / updateService / reorderServices / toggleServicePublished
createFleet / updateFleet / setFleetStatus
createGalleryItem / deleteGalleryItem
createFaqItem / updateFaqItem / publishFaqItem / createFaqCategory
updateLeadStatus / addLeadActivity
updateSupportTicketStatus / assignSupportTicket
upsertSiteSettings / upsertStat / reorderStats
createUser / updateUserRole / createRole
```

Each: `requirePermission()` → Zod parse → service call → `writeAudit()` → `revalidatePath()`.

## Documentation generation

Once the backend stabilizes (Phase 9+), generate **OpenAPI** for the REST surface from the Zod
schemas (e.g. `zod-to-openapi`). Until then, the Zod schemas in `lib/validation` + this file are the
contract source of truth.
