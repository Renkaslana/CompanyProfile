# BMI Digital Platform — Master Handoff

**Authoritative project continuation guide.** This document is intended to be
read **standalone** — no prior conversation, no transcript, no other documents
required to understand where the project stands and what to do next. All other
docs in `DOCS/*` are referenced where deeper detail is needed.

Last update: end of Support cleanup band — Lead persistence (Phase 7
brought forward to Phase 4), admin `/admin/leads` module, `/bantuan`
retired with 301 to `/kontak`, SupportWidget (multi-channel floating
popover) replaces the single WhatsApp button, FAQ accordion on `/kontak`
with `#faq` anchor, Settings CMS tab "Layanan Pelanggan" (FAQ +
supportHours).
Repository root: `C:\Project\Company-Profile-BMI`.

---

## 1. Executive Summary

### Purpose

PT. Bintang Mulia Investama (BMI) is a real Indonesian logistics company.
The BMI Digital Platform is its **premium company-profile website + internal
CMS** — a single Next.js application that:

- Presents the brand to B2B logistics customers (`/`, `/tentang`, `/layanan`,
  `/galeri`, `/karir`, `/berita`, `/kontak`).
- Lets non-developer admins edit every piece of content via a protected
  `/admin` zone.
- Was intentionally designed so future modules (support center, lead pipeline,
  HR, etc.) can attach **without rewriting the platform**.

### Business goals

1. **Credible B2B presence** — every visual signal proves operational reality
   (golden-hour photos, real fleet, real legal entity).
2. **Quote/contact lead capture** — the contact form is the primary
   conversion (Phase 7 wires real persistence).
3. **Self-serve content management** — admins update services, news,
   gallery, fleet, stats without engineering help (Phase 4–5).
4. **Foundation, not throwaway** — same codebase grows into auth, CMS,
   support, leads, analytics over time.

### Current development status

| Track | State |
|---|---|
| Frontend (marketing) | ✅ Finalized in Phase 2; owner has refined imagery; not to be redesigned. |
| Backend infrastructure (Phase 1) | ✅ Complete: Prisma + Neon + env validation + server skeleton + seed. |
| Data layer swap (Phase 2) | ✅ Complete: `lib/data` is DB-backed; frontend behaviour preserved. |
| Auth + RBAC (Phase 3) | ✅ Complete: Auth.js v5 + JWT, login, password setup/reset, dashboard, users, audit. |
| CMS (Phase 4) | 🟡 In progress: M1, M2, M4–M10 + M10.1–M10.4 + CMS UX usability pass + Support cleanup (Lead persistence, /admin/leads, /bantuan retired, SupportWidget, FAQ on /kontak, Settings tab "Layanan Pelanggan") done. M3 skipped. Remaining: M11 (verification + docs roll-up). |
| Lead persistence (was Phase 7) | ✅ Brought forward — public submit → DB via `submitLeadAction`, honeypot anti-spam, audit `LEAD_CREATE` with `actorId: "anonymous"`, admin list + detail + status workflow. Turnstile + per-IP rate limit still Phase 8. |
| Fleet CMS (Phase 5) | ⏳ Not started. |
| Support Center (Phase 6) | ⏳ Not started. |
| Lead Management (Phase 7) | ⏳ Not started. |
| Security hardening (Phase 8) | ⏳ Not started. *(MFA UI deferred here.)* |
| Testing (Phase 9) | ⏳ Not started. |
| Production readiness + deploy (Phase 10) | ⏳ Not started. |

**Currently deployable?** No — local-only. Phase 10 wires Vercel + CI/CD.

---

## 2. Current Architecture

### Frontend (marketing)

- Next.js 16 App Router under `app/(marketing)/*` (route group strips the
  segment from URL).
- 100% Server Components for content; small Client Components for forms,
  animations, sheets.
- Shared primitives in `components/ui/*` (built on **Base UI**, not Radix;
  see §12), `components/sections/*`, `components/layout/*`,
  `components/motion/*`.
- Data access is ONLY through `lib/data/index.ts` (the seam).
- Marketing is **owner-finalized** — do not redesign without explicit
  approval.

### Backend (CMS + auth)

- Same Next.js app — fullstack, no separate API service.
- Three explicit layers (`DOCS/BACKEND_STRUCTURE.md`):

```
Browser
  ↓
Next.js App Router  (Server Components / Server Actions / Route Handlers)
  ↓
lib/data            (read seam — frontend's only data entry point)
  ↓
server/services/*   (business rules + Zod + RBAC + audit)
  ↓
server/repositories/*   (Prisma access; the only code that imports db directly)
  ↓
lib/db (PrismaClient singleton, server-only, HMR-safe)
  ↓
PostgreSQL on Neon (Singapore)
```

### Database

- PostgreSQL hosted on **Neon** (region `ap-southeast-1` / Singapore).
- Prisma 6.19 schema in `prisma/schema.prisma`. Migrations checked into git
  under `prisma/migrations/`. **5 migrations applied** to date.
- Connection: **pooled URL** at runtime (`DATABASE_URL`); **direct URL** for
  migrations (`DIRECT_DATABASE_URL`).

### Repository / service pattern

- **Repositories** are thin Prisma wrappers. No business logic, no authz, no
  shape translation. Always typed by `@prisma/client` row shapes.
- **Services** do everything else: RBAC guard (`requirePermission`), Zod
  validate, business rules, write audit, return shaped data.
- **Mappers** (`server/mappers/*`) translate Prisma rows → frontend domain
  types from `features/*/types.ts`. Used so `lib/data` swap (Phase 2) was
  zero-frontend-change.

### Authentication

- **Auth.js v5** (`next-auth@5.0.0-beta.31`) with **Credentials provider**.
- **JWT sessions** (Credentials provider doesn't allow DB sessions). Sliding
  TTL = 24h; absolute lifetime cap = 7 days; `User.sessionVersion` bump
  invalidates JWTs on role/password/disable change.
- Password hashing: **argon2id** via `@node-rs/argon2`, OWASP-recommended
  parameters.
- Files: `auth.config.ts` (Edge-safe shared config), `auth.ts` (Node config
  with provider), `proxy.ts` (Next 16's renamed middleware), `server/auth/*`
  (permissions, password, tokens, mfa, rate-limit, guards).

### RBAC (Role-Based Access Control)

- 4 roles seeded: `SUPER_ADMIN`, `EDITOR`, `SUPPORT_AGENT`, `VIEWER`.
- 14 typed permissions in `server/auth/permissions.ts`:
  `dashboard:read`, `content:read`, `content:write`, `content:publish`,
  `fleet:write`, `media:create`, `faq:write`, `faq:publish`,
  `support:manage`, `lead:read`, `lead:update`, `settings:write`,
  `users:manage`, `audit:read`.
- Enforced in **3 layers**:
  1. Edge middleware (`proxy.ts`) — gates `/admin/*` + `/api/v1/admin/*`,
     attaches admin security headers.
  2. JWT (set at login) — permissions array in token.
  3. Service layer (`requirePermission(perm)`) — re-fetches `sessionVersion`
     from DB, throws `Forbidden` if missing. **Authoritative**.

---

## 3. Technology Stack

### Runtime / framework
- **Next.js 16.2.6** (App Router, Turbopack build).
- **React 19.2.4** + React DOM 19.2.4.
- **TypeScript 5.x** (`strict: true`, `noEmit`).
- **Tailwind CSS 4** with `@theme` design tokens in `app/globals.css`
  (note: tokens live in CSS, **not** `tailwind.config.ts`).
- **Framer Motion** (`motion@12.40`) for marketing animations.

### Database / ORM
- **PostgreSQL** (Neon serverless), region `ap-southeast-1` (Singapore).
- **Prisma 6.19.3** + `@prisma/client@6.19.3`.
- **tsx@4.22** for running TypeScript scripts (`db:seed`, `admin:setup-link`).

### Authentication / security
- **next-auth@5.0.0-beta.31** (Auth.js v5).
- **@auth/prisma-adapter@2.11** (installed for User lookups; sessions are JWT).
- **@node-rs/argon2@2.0** — password hashing.
- **otplib@13.4** + `qrcode@1.5` — TOTP helpers (UI deferred to Phase 8;
  schema + AES-GCM helpers ready).
- **@upstash/ratelimit@2.0** + `@upstash/redis@1.38` — login rate limit
  (currently fail-OPEN with audit; see §13).
- **server-only@0.0.1** — Vercel package; throws if a server-only module is
  imported into a client bundle.
- **zod@4.4.3** — env validation + form validation across the app.

### Media / content
- **cloudinary@2.10** — signed upload helpers (env vars optional today; see §11).
- **sanitize-html@2.17** + `@types/sanitize-html` — strict allowlist for
  rich-text fields. Sanitises on write AND render.

### UI
- **shadcn/ui** components OWNED in `components/ui/*` — built on **Base UI**
  (`@base-ui/react@1.5`), NOT Radix. Composition uses **`render` prop**, not
  `asChild`. See §12 (decisions) and `DOCS/FRONTEND_STRUCTURE.md`.
- **lucide-react@1.16** — icons. (Note: brand/social icons like Facebook,
  Instagram, LinkedIn were removed by lucide upstream; do not import them.)
- **class-variance-authority**, **clsx**, **tailwind-merge** — utility CSS.
- **sonner@2.0** — toast notifications.
- **tw-animate-css** — Tailwind animation utilities.

### Dev / build
- ESLint 9 + `eslint-config-next@16.2`.
- Prisma CLI 6.19 (devDep).

---

## 4. Completed Phases

### Phase 0 — Documentation & ADRs

**Objective.** Write down every decision, structure, and contract before any
code, so all later phases reference one source of truth.

**Implemented.** Full `DOCS/` set: ARCHITECTURE, FRONTEND_STRUCTURE,
BACKEND_STRUCTURE, DATABASE, API, SECURITY, CMS_WORKFLOW,
SUPPORT_CENTER_WORKFLOW, DEPLOYMENT, TESTING, DEVELOPMENT_GUIDE,
CONTRIBUTING, CHANGELOG, IMPLEMENTATION_HANDOFF. ADRs 0001–0011 covering
stack, database, ORM, auth, admin location, media, deployment, data-adaptor
seam, marketing-stats hybrid, lead-activity timeline, site-settings strategy.

**Outcome.** Every subsequent phase references stable documents instead of
re-debating decisions.

### Phase 1 — Infrastructure

**Objective.** Stand up the data + server foundation with **zero frontend
change**.

**Implemented.**
- **M1** Prisma 6 schema + dependencies installed.
- **M2** `.env.example` + `lib/config/env.ts` (Zod-validated at boot,
  server-only, fail-fast).
- **M3** Initial migration `20260530124527_init` applied to Neon — 22 tables,
  7 enums, GIN index on `MediaAsset.tags`.
- **M4** Seed populated 95 rows from `mock/*` + `COMPANY`+`VALUES` +
  Roles + admin User with placeholder password. Schema refinements:
  `LeadActivity`, `SupportTicket.assignedToUserId`, `MediaAsset.title+tags`,
  `Stat` table with `source` flag, `SiteSettings` JSON.
- **M5** `lib/db.ts` PrismaClient singleton (server-only, HMR-safe) +
  `server/{services,repositories,auth,audit}` skeleton + reference
  `ContentRepository`/`ContentService` pair + `writeAudit()` stub.

**Outcome.** Database live on Neon, seeded with content matching the
mock-driven site. Frontend continued to read from `mock/` via `lib/data`
unchanged.

### Phase 2 — Data-layer swap

**Objective.** Rewrite `lib/data` accessor bodies to call DB-backed services
instead of returning mock arrays — without changing any component.

**Implemented.**
- Media mapper (`server/mappers/media.mapper.ts`) for shared
  `MediaAsset → MediaRef` translation + batched id lookup.
- Three repositories (`content`, `fleet`, `marketing`) and a shared
  `media` repository.
- Three services (`content`, `fleet`, `marketing`) with private mappers
  that shape Prisma rows into frontend domain types from
  `features/content/types.ts`.
- `lib/data/index.ts` rewritten as a thin delegate layer (every accessor a
  single line).

**Outcome.** 28/28 verification checks passed: every accessor returns
JSON-deep-equal output to the original mock-based behaviour (with the
documented `Stat.id` cuid divergence ignored). Marketing pixels match the
M5 baseline.

### Phase 3 — Auth + RBAC

**Objective.** Auth.js v5 + JWT sessions + RBAC matrix + admin shell, with
real password setup replacing the placeholder.

**Implemented.**
- Schema: `User.sessionVersion`, `User.mustChangePassword`, `User.mfaEnabled`,
  `User.mfaSecret`, `User.lastLoginAt`, `AuthToken` (PASSWORD_SETUP /
  PASSWORD_RESET), `MfaBackupCode`. Migration
  `20260601100000_phase3_auth_rbac`.
- `server/auth/*` modules: `permissions`, `password` (argon2id), `tokens`,
  `mfa` (encryption ready; TOTP UI deferred), `rate-limit` (fail-open with
  audit), `guards` (typed errors + `requirePermission`).
- `auth.config.ts` (Edge-safe) + `auth.ts` (Node with Credentials provider).
- `proxy.ts` (Next 16's middleware rename): coarse role gates + admin
  security headers (`X-Robots-Tag`, `X-Frame-Options`, `Referrer-Policy`,
  `Cache-Control`, `Permissions-Policy`).
- Admin tree under `app/admin/`:
  - `(public)/{login, setup-password, forgot-password, reset-password}`
  - `(auth)/{page (dashboard), users, users/new, audit}`
- Bootstrap CLI: `npm run admin:setup-link -- --email=...` → prints 1-hour
  single-use setup URL.
- Audit log records LOGIN_SUCCESS / LOGIN_FAIL / LOGIN_LOCKOUT /
  PASSWORD_SET / PASSWORD_RESET / ROLE_CHANGE / USER_CREATE /
  ACCESS_DENIED / RATE_LIMIT_UNAVAILABLE.

**Outcome.** Manual testing confirmed: login, logout, password
setup/reset, user management, audit log all work end-to-end. Marketing site
unaffected. Build clean.

### Phase 4 M1 — Foundation primitives + Cloudinary + schema additive

**Objective.** Build the cross-cutting primitives every later CMS milestone
will compose, install Cloudinary + sanitize-html, and add the two small
schema fields the user-management lifecycle needs.

**Implemented.**
- Migration `20260602100000_phase4_m1_foundation`: `User.disabledAt`,
  `NewsPost.archivedAt` (both nullable, additive).
- `server/audit/actions.ts` extended with 21 new action constants
  (MEDIA_*, SERVICE_*, NEWS_*, GALLERY_*, TEAM_*, CLIENT_*, STAT_UPDATE,
  SETTINGS_UPDATE, USER_DISABLE, USER_REACTIVATE).
- `SelfActionError` and `SuperAdminFloorError` added to
  `server/auth/guards.ts`.
- `UserService` hardened with the three approved invariants
  (self-protection + SUPER_ADMIN floor in a Prisma `$transaction`) and
  `disableUser` / `reactivateUser` methods.
- `authenticateUser` rejects soft-deleted users (`reason:
  account_disabled`); no enumeration leak.
- `MediaService` (Cloudinary signed-upload payload + persist + list +
  update + **reference-guarded delete**) with `MediaInUseError` and
  `MediaNotConfiguredError`.
- Env: Cloudinary trio added as optional (server throws helpful
  "not configured" if used while unset).
- `lib/validation/common.ts` — shared Zod field rules.
- 6 admin primitives in `components/admin/`:
  `StatusBadge`, `SanitizedHtml`, `AdminTable`, `AdminForm` (FormSection /
  FormField / FormActions / FormBanner), `ConfirmDialog`, `MediaPicker`.

**Outcome.** Build green; M2 had everything it needed to add real UI.

### Phase 4 M2 — User Management completion + Audit Log UX

**Objective.** Wire the M1 service guards into UI (role-change
confirmation, disable, reactivate), and make the Audit Log readable.

**Implemented.**
- `UserRepository.findManyByIdSafe(ids)` — batched name/email lookup.
- `app/admin/(auth)/users/user-actions-row.tsx` — client component:
  Role select → `ConfirmDialog` → submit; Disable / Reactivate
  `ConfirmDialog`s; self-row hides actions and shows "Anda".
- Users page now displays real status (Aktif / Setup pending /
  Dinonaktifkan) via `StatusBadge`, success/error banners via `FormBanner`.
- New `disableUserAction` + `reactivateUserAction`; existing
  `changeRoleAction` updated to map `SelfActionError` /
  `SuperAdminFloorError` to friendly Indonesian copy.
- Audit Log page batched-joins `AuditLog.actorId → User.name + email`;
  raw cuid preserved as hover title; anonymous / deleted-user fallbacks
  render distinctly.

**Outcome.** All approved user-management invariants enforced in service
AND respected by UI. Audit Log is readable. Build clean.

---

## 5. Current Milestone Status

| Phase | Milestone | Status |
|---|---|---|
| **0** | Documentation + ADRs | ✅ Complete |
| **1** | M1 Prisma schema + deps | ✅ Complete |
| 1 | M2 Env + Zod validation | ✅ Complete |
| 1 | M3 Initial migration + DB verification | ✅ Complete |
| 1 | M4 Seed strategy + 95 rows | ✅ Complete |
| 1 | M5 `lib/db` singleton + `server/` skeleton | ✅ Complete |
| **2** | Data-layer swap (mock → DB) | ✅ Complete |
| **3** | Auth.js v5 + RBAC + admin shell | ✅ Complete |
| **4** | M1 Foundation primitives + Cloudinary + schema additive | ✅ Complete |
| 4 | M2 User mgmt completion + Audit UX | ✅ Complete |
| 4 | M3 Standalone Audit UX | ⏭️ **SKIPPED (approved)** — work was absorbed into M2; advanced audit UX (filter, search, CSV, pagination) deferred to Phase 8. |
| 4 | M4 Media Library UI | ✅ Complete (Cloudinary signed upload, reference-guarded delete, audit lifecycle verified end-to-end) |
| 4 | M5 Services CMS | ✅ Complete (list / create / edit / reorder / publish toggle, MediaPicker cover, useActionState field-level validation, audit + revalidate `/layanan`) |
| 4 | M6 News CMS (rich text, draft→publish→archive) | ✅ Complete (sanitized HTML body + status workflow with publishedAt-preservation semantics + force-dynamic on marketing routes + findNewsBySlug PUBLISHED filter + audit lifecycle CREATE/PUBLISH/UNPUBLISH/PUBLISH/ARCHIVE/RESTORE/DELETE) |
| 4 | M7 Gallery CMS | ✅ Complete (list / create / edit / reorder / delete with required MediaPicker + free-form category with datalist suggestions + force-dynamic on `/galeri`) |
| 4 | M8 Team + Clients CMS | ✅ Complete (two CRUDs sharing the M7 pattern — list/create/edit/reorder/delete, optional MediaPicker for photo/logo, useActionState + Indonesian Zod messages, audit + revalidate `/tentang` and `/`, force-dynamic on `/tentang`) |
| 4 | M9 Stats + Settings CMS | ✅ Complete (4-row Stat editor with MANUAL/DERIVED toggle, full Settings form for identitas/cerita/visi/misi/values/alamat/kontak/jam/legal/sosial, public Team photo + Client logo render, Team bio field + migration, hybrid `getSiteSettings()` overlay, public `/tentang` reads CMS values + new Visi/Misi block) |
| 4 | M9.5 Settings consumer migration | ✅ Complete (`/kontak`, Footer, CtaQuote on `/`, `/karir`, root layout metadata + Organization JSON-LD all read from `getSiteSettings()`; added Google Maps embed URL field — `/kontak` renders real iframe when set, falls back to placeholder + search link when empty; force-dynamic on `/`, `/kontak`, `/karir`; verified 11/11 consumer assertions via marker-string harness against the running dev server) |
| 4 | M10 Dashboard expansion + UX polish band | ✅ Complete (admin dashboard with content metrics + activity feed + needs-attention; public site polish: hero CTA fix, floating WhatsApp button, corporate silhouette avatar, lead form readability + inline success, About page enhanced with years-active + Coverage Map + trust strip + office strip, Testimonials section between Clients & Certifications, Privacy + Terms + Bantuan shell pages, cookies banner, Privacy/Terms admin-editable via Settings) |
| 4 | M11 Verification + docs roll-up | ⏳ Pending — **next** |
| **5** | Fleet management | ⏳ Pending |
| **6** | Support Center (FAQ + escalation, no AI) | ⏳ Pending |
| **7** | Lead management (Turnstile, rate limit, activity timeline) | ⏳ Pending |
| **8** | Security hardening **(MFA UI lands here)** | ⏳ Pending |
| **9** | Testing & stabilization | ⏳ Pending |
| **10** | Production readiness + deploy (Vercel + CI/CD + Sentry + backups + root README) | ⏳ Pending |

---

## 6. Database Status

### Current schema state

Reference: `DOCS/DATABASE.md` (authoritative) and `prisma/schema.prisma`
(canonical).

Tables (24): `SiteSettings`, `Stat`, `MediaAsset`, `Service`, `FleetVehicle`,
`NewsPost`, `GalleryItem`, `TeamMember`, `ClientLogo`, `CoverageRegion`,
`Achievement`, `Certification`, `JobOpening`, `Lead`, `LeadActivity`,
`FaqCategory`, `FaqItem`, `FaqSearchLog`, `SupportTicket`, `User`, `Role`,
`AuditLog`, `AuthToken`, `MfaBackupCode`. *Plus Prisma's
`_prisma_migrations` system table = 24 application tables visible to the app.*

Enums (9): `StatSource`, `ServiceCategory`, `FleetStatus`, `PostStatus`,
`LeadStatus`, `LeadActivityType`, `TicketStatus`, `AuthTokenType`.
*(Some appear in DATABASE.md but are implicitly Postgres types managed by
Prisma; total varies depending on how you count `String[]` columns.)*

### Migrations

5 applied, in `prisma/migrations/`:
1. `20260530124527_init` — Phase 1.
2. `20260530130000_news_display_author_and_media_publicid_unique` —
   Phase 1 M4 refinements (NewsPost.displayAuthor + MediaAsset.publicId
   unique).
3. `20260601100000_phase3_auth_rbac` — User auth fields + AuthToken +
   MfaBackupCode.
4. `20260602100000_phase4_m1_foundation` — User.disabledAt +
   NewsPost.archivedAt.

**Phase 4 M4 and M5 added no schema changes** — both shipped against the
existing `MediaAsset` and `Service` tables. No migrations were authored
between Phase 4 M1 and the current point.

5. `20260603100000_phase4_m9_team_bio` — Phase 4 M9: adds nullable
   `TeamMember.bio` (TEXT, optional ≤500 char). Additive,
   backward-compatible.

`prisma migrate dev` requires interactive TTY which the Bash tool can't
provide — so all migrations are authored as SQL files + applied via
`prisma migrate deploy`. Use the same workflow going forward.

### Seed status

- `prisma/seed.ts` is **idempotent** (every entity upsert-by-key).
- Latest seed run produced **95 rows** across:
  Role(4), User(1 admin), MediaAsset(22), SiteSettings(1), Stat(4),
  CoverageRegion(15), Achievement(4), Certification(4), JobOpening(4),
  ClientLogo(8), TeamMember(6), Service(4), FleetVehicle(6),
  GalleryItem(8), NewsPost(4).
- Empty by design: `Lead`, `LeadActivity`, `SupportTicket`, `FaqCategory`,
  `FaqItem`, `FaqSearchLog`, `AuditLog` (the audit table fills as actions occur).
- Run: `npm run db:seed`.

### Important tables for ongoing work

- **`User`** — has `disabledAt`, `mustChangePassword`, `sessionVersion`,
  `lastLoginAt`. Soft-delete only; never hard-delete.
- **`AuthToken`** — single-use; raw token never persisted, sha256 only.
- **`MediaAsset`** — `publicId` UNIQUE (Cloudinary publicIds); local-prefix
  used for seeded local images.
- **`AuditLog`** — append-only by convention today; Phase 8 enforces at DB
  privilege level.
- **`NewsPost`** — `status` enum + `publishedAt` + `archivedAt`;
  `displayAuthor` preserved separately from `authorId`.

### Production assumptions

- DB lives on **Neon (Singapore)**, currently using a free-tier project owned
  by the developer. Production will use a separate project + larger plan;
  Phase 10 documents the migration.
- Connection string convention: **pooled** for runtime, **direct** for
  `prisma migrate`. `lib/db.ts` uses pooled.

---

## 7. Authentication & Security Status

### Login flow

```
1. User visits /admin → middleware (proxy.ts) sees no JWT cookie → redirects
   to /admin/login.
2. User submits email + password to login action.
3. Action calls Auth.js signIn("credentials", ...).
4. Credentials.authorize() in auth.ts → authenticateUser() in
   server/services/auth.service.ts:
     a. Normalize email; resolve ip from x-forwarded-for header.
     b. checkLoginRateLimit(ip, email) — Upstash (5 / 10min per IP and per
        email). Fail-OPEN with RATE_LIMIT_UNAVAILABLE audit if Upstash
        unreachable/unset.
     c. Always argon2-verify (against DUMMY_PASSWORD_HASH if no user) to
        equalize timing.
     d. Reject if user.disabledAt — LOGIN_FAIL, reason=account_disabled.
     e. Reject if user.mustChangePassword — LOGIN_FAIL,
        reason=password_setup_required.
     f. Reject if bad password — LOGIN_FAIL.
     g. Update lastLoginAt; LOGIN_SUCCESS audit; return enriched user.
5. Auth.js jwt callback writes claims: sub, email, name, role, permissions,
   sessionVersion, mustChangePassword, mfaEnabled, absExp.
6. Browser receives __Host-authjs.session-token (HttpOnly + Secure +
   SameSite=Lax). User redirected to /admin.
```

### Password setup flow

The seeded admin starts with `password = "!pending-phase-3!"` and
`mustChangePassword = true`. To use the system the first time:

```
$ npm run admin:setup-link -- --email=admin@bintangmuliainvestama.co.id
```

This:
1. Generates a 32-byte random token.
2. sha256-hashes it into `AuthToken{type: PASSWORD_SETUP, expiresAt: now+1h}`.
3. Prints `https://<host>/admin/setup-password?token=<raw>` (one-time URL).

The user opens the URL → submits a strong password (≥12 chars, mixed case +
digit + symbol) → server consumes the token, argon2-hashes the password,
sets `mustChangePassword = false`, bumps `sessionVersion`, redirects to
`/admin/login`.

### Password reset flow

`/admin/forgot-password` → enter email → server creates a
`AuthToken{type: PASSWORD_RESET}` + **logs the URL to server console** (no
email service yet; Phase 4+ wires SMTP). Generic response prevents email
enumeration. Reset page consumes the token the same way as setup.

### Session management

- JWT only (Credentials provider requires it).
- Sliding TTL: **24h**, refreshed every hour on activity.
- Absolute lifetime cap: **7 days**, hard reset after.
- `sessionVersion` bumped on role change, password set/reset, disable/reactivate
  → `requireFreshSession` catches stale JWTs on next service call.
- Cookie: `__Host-authjs.session-token`, `HttpOnly`, `Secure`, `SameSite=Lax`.

### Audit logging

Every meaningful action writes an `AuditLog` row via `writeAudit()` in
`server/audit/write-audit.ts`. The constant list is in
`server/audit/actions.ts`. The audit log is **read-only via UI**; Phase 8
adds DB privilege enforcement (no UPDATE/DELETE).

### Security protections in place

- Argon2id (OWASP params).
- DUMMY_PASSWORD_HASH for timing-equalization on unknown email.
- Rate limiting via Upstash (fail-OPEN with audit per approved Phase-3
  decision).
- Session invalidation via `sessionVersion`.
- Tokens stored as sha256 only.
- Open-redirect protection: `callbackUrl` rewritten to `/admin/*` allowlist.
- Generic error messages prevent enumeration.
- Headers on `/admin/*`: `X-Robots-Tag: noindex,nofollow,noarchive`,
  `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Cache-Control:
  no-cache, must-revalidate`, `Permissions-Policy: camera=(), microphone=(),
  geolocation=()`.
- `server-only` enforced on every auth module.
- `(admin)` not in sitemap; no public link from marketing.

---

## 8. User Management Rules (APPROVED INVARIANTS — do not weaken)

Enforced at the **service layer** in
`server/services/user.service.ts`. UI hides destructive actions on self,
but the service is authoritative.

1. **A user cannot change their own role.**
   - Why: prevents privilege-escalation via UI bypass and prevents accidental
     self-demotion that locks SUPER_ADMIN out.
   - Where: `UserService.changeRole` throws `SelfActionError` if
     `userId === actorId`.

2. **A user cannot deactivate (disable) themselves.**
   - Why: would lock the actor out instantly and break audit-trail
     continuity.
   - Where: `UserService.disableUser` throws `SelfActionError` if
     `userId === actorId`.

3. **A user cannot delete themselves.**
   - Why: deletion is **structurally impossible** — there is no hard-delete
     method. Only `disableUser` exists. Same self-guard would apply if it
     were ever added.

4. **The system must always retain at least one active SUPER_ADMIN.**
   - Why: an empty SUPER_ADMIN set means nobody can manage users / roles /
     audit, irrecoverably locking the platform.
   - Where: inside a Prisma `$transaction`, after computing the proposed
     change (role moving away from SUPER_ADMIN, or SUPER_ADMIN being
     disabled), `COUNT(role.name='SUPER_ADMIN' AND disabledAt IS NULL AND
     id != target)` — if `< 1`, throws `SuperAdminFloorError` and the
     transaction rolls back. Concurrent attempts to disable the last two
     SUPER_ADMINs are serialized by Postgres row-level locks.

5. **Disabled users cannot log in.**
   - Why: soft-deletion must be effective immediately.
   - Where: `authenticateUser` rejects `user.disabledAt != null` with
     generic LOGIN_FAIL (no enumeration). `sessionVersion` is bumped on
     disable so any live JWT becomes stale on the next service call.

These rules are tested by Phase 9 RBAC matrix sweeps; they must continue to
hold for all future code paths that touch User mutations.

---

## 9. Audit Log Design

### Current implementation

- Table: `AuditLog { id, actorId, action, entity, entityId?, meta?, createdAt }`.
- Index: `(entity, createdAt)`. Indexes for filter-by-actor TBD if needed.
- Writes: `writeAudit({ actorId, action, entity, entityId?, meta? })` from
  `server/audit/write-audit.ts`. Always awaited so callers can surface
  failures, but most call sites don't try/catch (audit failures are loud and
  surface in the action).
- Reads: `AuditRepository.list({ limit, offset })` +
  `AuditRepository.count()` in `server/repositories/audit.repository.ts`.

### Actor resolution strategy (Phase 4 M2)

When `/admin/audit` renders:
1. Fetch 100 most recent entries.
2. Collect unique `actorId`s (excluding `"anonymous"` and empty).
3. Single batched `UserRepository.findManyByIdSafe(ids)` returns
   `{ id, name, email }[]` (select-only — no password / role / etc).
4. Build `Map<id, user>` for O(1) row rendering.
5. Render cell as 2-line `name / email`; raw cuid preserved as
   `title` attribute (hover).

### Anonymous + deleted-user handling

- `actorId = "anonymous"` is used by `authenticateUser` when the email isn't
  in the DB (no enumeration). Rendered as italic "anonymous".
- If `actorId` is a cuid not in the DB (impossible today since only
  soft-delete exists), rendered as truncated cuid with a tooltip "User no
  longer exists in the database".

### Future improvements (Phase 8 / 10)

- Append-only at DB privileges (separate Postgres role with no UPDATE/DELETE
  on AuditLog).
- Filter UI by actor, entity, action, date range.
- CSV export.
- Pagination (currently 100 latest).
- IP + user-agent capture in `meta` (Phase 8).
- Retention policy / archival.

---

## 10. CMS Status

| Module | Public reads | Admin CRUD | Status |
|---|---|---|---|
| **Media Library** | n/a (referenced by content) | ✅ Phase 4 M4 | `/admin/media` — signed Cloudinary direct upload, edit (alt/title/tags), reference-guarded delete, audit lifecycle. JPG-MIME normalization fix applied. Cloudinary env: `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` (no `NEXT_PUBLIC_` prefix). |
| **Services** | ✅ `lib/data.getServices()` | ✅ Phase 4 M5 | `/admin/services` — list / create / edit / reorder ↑↓ / publish toggle / delete. MediaPicker cover. Slug auto-derive + clash check. `useActionState` field-level validation with Indonesian Zod messages. Revalidates `/`, `/layanan`, `/layanan/[slug]`. **Primary key validated via `entityId`** (c1908ad) so seeded `svc-…` rows can be edited. |
| **News** | ✅ `lib/data.getNews()` / `getLatestNews()` / `getNewsBySlug()` | ✅ Phase 4 M6 | `/admin/news` — list with status filter chips, create / edit / delete, status workflow (publish / unpublish / archive / restore) with publishedAt preservation. Sanitized HTML body (write + render). `findNewsBySlug` filters PUBLISHED. Revalidates `/`, `/berita`, `/berita/[slug]`. **Primary key validated via `entityId`** (c1908ad) so seeded `news-N` rows can be edited. |
| **Gallery** | ✅ `lib/data.getGallery()` | ✅ Phase 4 M7 | `/admin/gallery` — list with thumbnails + per-row reorder/edit/delete; required MediaPicker; free-form category with canonical-suggestions datalist (Briefing, Loading, Pengiriman, Warehouse, Fleet); revalidates `/`, `/galeri`. **Primary key validated via `entityId`** (c1908ad) so seeded `gal-…` rows can be edited. |
| **Team** | ✅ `lib/data.getTeam()` | ✅ Phase 4 M8 + M9 | `/admin/team` — list with circular photo / initials avatar; reorder/edit/delete. Optional MediaPicker photo. M9 added optional `bio` field (≤500 chars). Public `/tentang` TeamGrid now renders the photo when set (initials fallback) and the bio under role. Audit `TEAM_*` + revalidates `/tentang`, `/`. |
| **Clients** | ✅ `lib/data.getClients()` | ✅ Phase 4 M8 + M9 | `/admin/clients` — list with logo thumbnail + sector badge + external URL link; reorder/edit/delete. Optional sector + URL + MediaPicker logo. Public homepage band now renders the logo when set (grayscale→color on hover) with external link to `client.url`. Audit `CLIENT_*` + revalidates `/`. |
| **Stats** | ✅ `lib/data.getStats()` | ✅ Phase 4 M9 | `/admin/stats` — fixed-size 4-row editor; `key` immutable; MANUAL/DERIVED toggle freezes value+label when DERIVED. `STAT_UPDATE` audit on every save. |
| **Settings** | ✅ `lib/data.getSiteSettings()` (hybrid overlay) | ✅ Phase 4 M9 | `/admin/settings` — single tabbed form covering Identitas, Cerita, Visi & Misi, Nilai Inti, Alamat, Kontak & Jam, Legal, Sosial. Writes `SiteSettings.company` + `values` JSON; full Zod validation per field with dotted error paths. `SETTINGS_UPDATE` audit. Public `/tentang` now reads CMS story/visi/misi/values; constants act as fallback floor. |
| **Fleet** | ✅ `lib/data.getFleet()` | ⏳ Phase 5 (its own dedicated module) | Read path live. |
| **FAQ + Support Center** | ⏳ Phase 6 not started | ⏳ Phase 6 not started | Tables empty by design; seed when UI lands. |
| **Leads** | ⏳ Phase 7 not started | ⏳ Phase 7 not started | Public lead form simulates submit today. |
| **Users + Audit** (Phase 3 admin module) | n/a | ✅ Phase 3 + Phase 4 M2 | Working: list, invite, role change with confirm, disable, reactivate, audit log with name/email join. |

---

## 11. External Services

### Neon (PostgreSQL)

- Status: **configured + in use** by the developer.
- Region: Singapore (`ap-southeast-1`).
- Auth: `DATABASE_URL` (pooled) + `DIRECT_DATABASE_URL` (direct) in
  `.env` (gitignored).
- Production assumptions: separate Neon project for production with a
  pro/paid plan; PR-branch databases for CI (Phase 10).

### Cloudinary (media)

- Status: **configured + verified end-to-end.** Owner credentials are in
  `.env`; M4 upload (JPG + PNG), edit, and reference-guarded delete all
  exercised through the UI + Cloudinary Admin API.
- Env vars (in `.env.example`): `CLOUDINARY_CLOUD_NAME`,
  `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. (No `NEXT_PUBLIC_` prefix —
  cloud_name + api_key are returned to the browser at runtime via the
  `/api/v1/admin/media/sign` JSON response, not embedded at build time.)
- `MediaService.getSignedUploadPayload()` throws
  `MediaNotConfiguredError` (with the specific missing key named) if any
  of the three env vars are absent — added to M4 for self-diagnosis.
- Cloudinary's `format` field returns the file *extension* (`jpg`, `svg`),
  not the IANA MIME *subtype* (`jpeg`, `svg+xml`). `upload-form.tsx`
  normalizes via `cloudinaryFormatToMime()`; the Zod regex also accepts
  the un-normalized form as defense in depth. (M4 follow-up fix.)
- Folder layout: `bmi/{gallery,fleet,news,about,brand}`. Cloudinary
  auto-creates folders on first upload.

### Vercel (deploy)

- Status: **NOT configured** — local-only today.
- Phase 10 sets up: Vercel project, CI via GitHub Actions, Neon-branch-per-PR,
  Sentry, uptime monitor, backups, runbooks.

### Upstash Redis (rate limit)

- Status: **NOT configured** — env keys absent.
- Behaviour: fail-OPEN, every fail-open writes `RATE_LIMIT_UNAVAILABLE` to
  AuditLog. Verified on first login during Phase 3 smoke test.
- Production must set both `UPSTASH_REDIS_REST_URL` and
  `UPSTASH_REDIS_REST_TOKEN`.

---

## 12. Architectural Decisions (canonical)

Reference ADRs in `DOCS/ADR/*` for the full rationale. Summary:

### Stack (ADR 0001)
- **Decision:** Next.js fullstack — no separate backend service.
- **Why:** Single deploy, single auth surface, fewer moving parts. Future
  ops/ML services can attach via the same Neon DB.
- **Alternatives:** Next.js + Express, Next.js + NestJS — rejected as
  premature; bring complexity without benefit.

### Database (ADR 0002)
- **Decision:** PostgreSQL on Neon (Singapore).
- **Why:** Serverless-friendly, regional latency, pgvector available for
  future needs.
- **Alternatives:** MySQL/Planetscale (lacks pgvector), Supabase (heavier
  bundle).

### ORM (ADR 0003)
- **Decision:** Prisma 6.
- **Why:** Type safety end-to-end, migration tooling, robust ecosystem.
- **Alternatives:** Drizzle (sharper but less mature migrations), raw SQL
  (more boilerplate).

### Auth (ADR 0004)
- **Decision:** Auth.js v5 + JWT sessions + Credentials provider +
  `sessionVersion` invalidation pattern.
- **Why:** Mature library, fast to integrate. JWT is required by Credentials;
  `sessionVersion` solves revocation.
- **Alternatives:** Lucia (still maturing v3 → v4 transition).

### Admin location (ADR 0005)
- **Decision:** `/admin` route group, NOT subdomain.
- **Why:** Same Next.js app, simpler cookies; security comes from auth
  + RBAC + middleware + headers, not URL obscurity.
- **Alternatives:** Subdomain (more isolated but extra deploy and
  cross-domain auth complexity).

### Media (ADR 0006)
- **Decision:** Cloudinary signed uploads + MediaAsset reference table.
- **Why:** Server-side signing keeps API secret off the client; reference
  guard prevents orphan deletion.
- **Alternatives:** S3 directly (more wiring), Uploadcare (paid).

### Deployment (ADR 0007)
- **Decision:** Vercel + Neon + Cloudinary.
- **Why:** Best fit for Next.js fullstack; serverless that matches our
  shape.
- **Alternatives:** Self-host on VPS (overhead), Fly.io (less Next.js
  affinity).

### Data adaptor seam (ADR 0008)
- **Decision:** `lib/data` is the only path frontend uses for data.
- **Why:** Made the mock → DB swap zero-frontend-change in Phase 2.
- **Alternatives:** Direct service calls from components (loses the seam).

### Marketing stats hybrid (ADR 0009)
- **Decision:** `Stat` table with `source` enum (MANUAL / DERIVED).
- **Why:** Manual today; derived-from-data later without a migration.
- **Alternatives:** Hard-code in JSON (no CMS), full derive-from-data (not
  meaningful for "1,000+ shipments" — that's a brand stat, not a query).

### Lead activity timeline (ADR 0010)
- **Decision:** `LeadActivity` rows record every Lead state change + manual
  notes.
- **Why:** Customer support continuity; auditable.

### SiteSettings JSON strategy (ADR 0011)
- **Decision:** Two JSON columns (`company`, `values`) with Zod schemas; do
  NOT explode into individual columns.
- **Why:** SiteSettings shape evolves; JSON keeps migrations rare.

### Frontend UI library convention (NOT yet an ADR — note for future
documentation)
- **Decision:** shadcn/ui owned in repo, built on Base UI (NOT Radix).
- **Why:** chosen during shadcn init with the base-nova preset.
- **Implication:** Composition uses `render` prop, not `asChild`. Sheet/Dialog
  are Base UI's `Popup`/`Backdrop`. See `DOCS/FRONTEND_STRUCTURE.md`.

### Next 16 `proxy.ts` (not yet an ADR — note)
- Next 16 renamed `middleware.ts` to `proxy.ts`. We followed the
  renaming. Same API.

---

## 13. Deferred Features

### MFA (deferred from Phase 3 → Phase 8)
- Schema and AES-256-GCM encryption helpers are in place. otplib v13
  introduced an API change; UI + enrollment + login challenge are deferred
  to Phase 8 alongside the broader hardening work and the policy decision
  about making MFA mandatory for SUPER_ADMIN.
- `server/auth/mfa.ts` has stubs that throw `notImplemented()` for the
  TOTP path; AES-GCM helpers WORK and are ready for Phase 8 reuse.

### Email delivery
- `/admin/forgot-password` currently logs the reset URL to server console.
- Phase 4+ (no specific milestone) wires SMTP or Resend.

### Rate-limit fail behaviour
- Currently fail-OPEN with audit (approved Phase 3 decision). Phase 8 may
  flip to fail-CLOSED.

### IP formatting / geo-IP lookup
- Phase 8 (security/UX hardening decision point). Currently IPs render
  verbatim in audit meta.

### Dashboard advanced analytics
- Phase 4 M10 adds the basics (counts, recent activity, drafts pending).
- BI-style time-series + charts: future backlog (not committed to any phase).

### Append-only AuditLog at DB privileges
- Phase 8.

### CSV export, filter UI, pagination on audit
- Deferred to **Phase 8** (M3 was skipped — see §5).

### Drag-and-drop reordering on CMS lists
- Phase 8 polish; Phase 4 uses explicit up/down or order-field editing.

### Concurrent-edit optimistic locking
- Phase 8 if needed; Phase 4 ships without (small team usage).

### Marketing-page dynamic rendering (`force-dynamic` on `/layanan`, `/berita`, etc.)
- Phase 4 M11 verification roll-up (or fold into M6 alongside `/berita`).
  M5's `revalidatePath` calls are correct, but `npm run build` artefacts
  can mask new content until `rm -rf .next` + hard refresh. A ~3-line
  `export const dynamic = "force-dynamic"` per marketing route closes the
  gap permanently. Documented in §15 "Known runtime artefact".

---

## 14. Known Risks

### Technical
- **`ConfirmDialog` Base UI Trigger** wraps children in fragments — may emit a
  dev console warning if a child isn't a single element. Build is clean.
  Swap to `<span>` if encountered.
- **`MediaPicker` is fully client-side filtering** today — fine for ~22 seeded
  assets; M4 reworks with server-paginated queries before scale matters.
- **Cloudinary credentials missing** — M4 will fail at upload time until set.
  Existing local-prefixed MediaAssets keep working.
- **Windows file lock on `prisma generate`** — occasional EPERM during dev,
  fixed by killing node processes and retrying.
- **otplib v13 API mismatch** — MFA TOTP is stubbed; Phase 8 must rewrite using
  the new `TOTP` class + functional API.

### Operational
- **Single admin** seeded today (`admin@bintangmuliainvestama.co.id`). The
  SUPER_ADMIN floor invariant means disabling or demoting this account
  before adding a second SUPER_ADMIN will be **rejected by the service**.
- **No email service** — password reset and new-user invite links must be
  copy-pasted by the inviting admin until Phase 4+ wires SMTP.
- **No automated backups** — Neon's PITR (point-in-time recovery) is on by
  default but no scheduled `pg_dump` archive yet.

### Production
- **Cloudinary cost runaway** — Phase 4 should set upload size cap (e.g.
  10 MB per asset) at signed-token time. Phase 8 adds quota monitoring.
- **Upstash rate-limit downtime → login open** — fail-open is the approved
  policy. Operators must monitor `RATE_LIMIT_UNAVAILABLE` audit rows.
- **AUTH_SECRET rotation** invalidates all live sessions. Document the
  rotation runbook in Phase 10.

---

## 15. Testing Status

### What HAS been tested
- **Phase 2:** 28/28 deep-equal verifications passed (every accessor's
  DB-backed output is JSON-equal to the original mock output).
- **Phase 3:** Manual smoke test via preview MCP — bootstrap CLI, password
  setup, login, dashboard, users list, audit log, logout, redirect-on-no-session,
  security headers, marketing site untouched.
- **Phase 4 M1/M2:** `tsc --noEmit`, `npm run lint`, `npm run build` all
  clean; routes still generate; manual UI smoke test through `/admin/users`
  by the owner (M2 approved based on manual testing).
- **Phase 4 M4:** Real Cloudinary signed direct upload (JPG + PNG) through
  the UI; MediaAsset row written with full metadata; reference guard
  verified via harness (refuses delete of `media:brand/jasa-perdagangan.png`
  while referenced by `svc-general-trading`); unreferenced delete clears
  DB + Cloudinary (HTTP 404) + writes `MEDIA_DELETE` audit. Owner
  approved manually.
- **Phase 4 M5:** Full Service lifecycle exercised through real UI +
  harness — create, publish toggle (both directions), reorder
  (atomic `$transaction` swap), update, delete. Six lifecycle audit rows
  observed with stable action constants. `useActionState` field-level
  validation surfaces inline Indonesian Zod messages; happy path still
  green. Owner approved manually.
- **Phase 4 M6:** Full News lifecycle harnessed:
  create(DRAFT) → publish → unpublish → publish → archive → restore →
  delete. All 7 expected `NEWS_*` audit rows in expected order;
  `publishedAt` preserved across unpublish + re-publish; `archivedAt`
  cleared on restore; `<script>` body stripped on write via
  `sanitizeRichText`. Public visibility checks: DRAFT slug returns
  404 (tightened `findNewsBySlug`); newly-PUBLISHED post appears
  immediately on `/berita` thanks to `force-dynamic`. Also fixed a
  React 19 `<Fragment>` warning in `ConfirmDialog` (trigger prop is
  now typed `ReactElement`, no Fragment wrap).
- **Phase 4 M6 follow-up fix:** `coverId` validator was `z.string().cuid()`
  and rejected seeded `media:<path>` IDs. Added `mediaAssetId` Zod helper
  in `lib/validation/common.ts` that accepts BOTH formats; used by both
  M5 (Service.coverId) and M6 (NewsPost.coverId). Regression tested.
- **Phase 4 M7:** Full Gallery lifecycle harnessed: create → update →
  reorder (atomic `$transaction` swap) → delete. Schema accepts the
  seeded `media:` FK format (verified via the same `mediaAssetId`
  helper); 4 audit rows recorded with stable action constants. Live
  preview MCP confirmed `/admin/gallery` renders 8 seeded items with
  thumbnails + category badges + per-row buttons cleanly (no React
  warnings).
- **Phase 4 M7 follow-up (commit c1908ad — entityId helper):** Added
  `entityId` Zod helper to `lib/validation/common.ts` that accepts both
  Prisma cuids AND the slug-style sentinel IDs used by `prisma/seed.ts`
  (`svc-…`, `news-…`, `gal-…`, `team-…`, `cli-…`, `fleet-…`). Closes a
  latent M5/M6/M7 hole where editing any **seeded** row via the CMS failed
  with "Invalid cuid" because the form action's `id` field was validated
  with `z.string().cuid()`. Swapped to `entityId` in the Service / News /
  Gallery update + id schemas. 16/16 schema regression tests pass (accepts
  seed prefixes + cuids; rejects empty / whitespace / HTML / SQL-quote /
  oversize). Live UI smoke confirmed edit succeeds on seeded
  `svc-general-trading`, `news-1`, and `gal-loading`. **Convention going
  forward: use `entityId` (not `cuid`) for all primary-key fields in new
  CMS modules** — already followed by M8.
- **Phase 4 M8:** Full Team + Clients lifecycle harnessed: create →
  update → reorder → delete for both modules. Schema accepts seeded
  `team-1` / `cli-1` IDs (entityId), accepts seeded `media:` photo/logo,
  rejects invalid URL on Client. Audit rows recorded with stable
  action constants (`TEAM_*` + `CLIENT_*`). Live preview MCP confirmed
  `/admin/team` + `/admin/clients` + their `/new` + `[id]/edit` pages
  all return 200 with no React warnings, and edits on `team-1` +
  `cli-1` succeeded end-to-end with banner "Perubahan berhasil
  disimpan."

### Known runtime artefact — stale build cache can hide new content

If you run `npm run build` then start the dev server, the prerendered
`/layanan` (and similar marketing routes) may serve the build-time
snapshot until you `rm -rf .next` or hard-refresh. This is **not** a
wiring bug — `revalidatePath("/layanan")` fires correctly from every
M5 Server Action. It's an operational hazard of switching between
production-build and dev-mode artefacts in the same `.next` directory.

Mitigations (all optional, none required to use the CMS):
- Owner-side: `rm -rf .next && npm run dev`, then hard-refresh (Ctrl+F5).
- Code-side (~3-line follow-up, candidate for M6 or Phase 8 polish):
  `export const dynamic = "force-dynamic"` on each public marketing
  page so revalidation propagates immediately.

### What still requires testing
- **End-to-end RBAC matrix sweep** — programmatic test that every role can
  access only the routes it should. Phase 9.
- **Concurrent SUPER_ADMIN-floor enforcement under contention** — only
  inspected by reasoning; Phase 9 stress test.
- **Cloudinary upload happy path + delete-guard** — depends on M4.
- **Form abuse protections** (Turnstile, rate limit) — Phase 7 wires them
  for real on the public lead form.
- **Accessibility (axe)** — Phase 9.
- **E2E (Playwright)** — Phase 9 CI gate.
- **Performance budgets** — Phase 8 / 10.

---

## 16. Remaining Roadmap

In order. Phase 4 M3 was **skipped** (decision made after M2; advanced audit UX
deferred to Phase 8).

| # | Phase / Milestone | Key deliverable |
|---|---|---|
| 1 | **Phase 4 M10** Dashboard expansion | ✅ Done — recent activity, draft counts, media usage, testimonials band, legal pages. |
| 2 | **Phase 4 M10.1–M10.4 follow-up** | ✅ Done — Settings form testimonials/privacy/terms + admin list search & pagination + audit filter strip. |
| 3 | **Phase 4 M11** Verify + docs roll-up | tsc/lint/build green + RBAC matrix sweep + docs update. (Public-page `force-dynamic` already landed in M6+M7+M8.) |
| 4 | **Phase 5** Fleet management | Fleet CMS, status workflow, multi-photo. |
| 5 | **Phase 6** Support Center | Public `/bantuan` + FAQ + ticket escalation + admin FAQ CMS + ticket assignment. |
| 6 | **Phase 7** Lead management | Real lead persistence + Turnstile + rate limit + status workflow + LeadActivity timeline. |
| 7 | **Phase 8** Security hardening | CSP, **MFA UI**, append-only audit, EXIF strip, CORS lock, gitleaks, **CSV export + per-actor audit scoping** (filter/pagination already landed in M10.4). |
| 8 | **Phase 9** Testing & stabilization | Vitest + RTL + Playwright + axe + CI gate. |
| 9 | **Phase 10** Production readiness | Sentry, Vercel deploy, CI/CD, backups, runbooks, root README. |

### Phase 4 M10 follow-up — what landed

| Sub | Scope | Files touched |
|---|---|---|
| M10.1 | Testimonials repeater (max 6) + Privacy/Terms HTML editors with live sanitized preview + sticky in-page section nav on lg+ | `app/admin/(auth)/settings/{page,settings-form,actions}.tsx`, `components/admin/media-picker.tsx` (added `onSelect` callback) |
| M10.2 | Shared `<ListToolbar>` (client, debounced URL `?q=` sync, `react-hooks/set-state-in-effect`-safe via render-time resync). Wired into Services / News / Gallery / Team / Clients / Users list pages | `components/admin/list-toolbar.tsx`, all 6 list pages, all 6 services + `UserService` (added `count()` + `q`/`skip`/`take` to `list()`) |
| M10.3 | Shared `<Pagination>` (pure-Link, 20 per page) + `paginationFromSearchParam()` helper. All 6 content list pages + audit | `components/admin/pagination.tsx`, `server/utils/list-filter.ts` (`applyListOpts` / `countListOpts`), all list pages |
| M10.4 | Audit log: action `<select>` (from `AUDIT_ACTIONS`) + entity `<select>` (allowlist matching writeAudit strings) + free-text q against entity/entityId. Pagination 25/page. CSV/append-only still Phase 8 | `app/admin/(auth)/audit/page.tsx`, `server/repositories/audit.repository.ts` (added `action`/`entity`/`q` + `count()`) |

Implementation notes:
- **Post-fetch filter pattern.** Each service `.list({ q, skip, take })` and `.count({ q })` fetches the full ordered list via the existing repository call, then runs a small JS filter + slice. At the current row counts (< 200 / module) this is fast; once any module crosses ~200 rows, the same surface can be pushed into Prisma `where` + `take` without changing call sites.
- **Reorder buttons at page edges.** The `isFirst` / `isLast` props now compose page index with row index (`i === 0 && currentPage === 1` and `i === rows.length - 1 && currentPage * PAGE_SIZE >= total`) so the per-row arrows respect the visible position.
- **MediaPicker.** Gained an optional `onSelect?: (id) => void` so parents that don't post the picker's hidden input directly (Settings serializes a parent JSON) still observe selections. Existing callers (News editor) are unchanged.
- **Settings revalidate paths.** `updateSettingsAction` now also revalidates `/karir`, `/bantuan`, `/privasi`, `/syarat-ketentuan` so the new public consumers refresh on save.

---

## 17. Recommended Next Action

**Begin Phase 4 M11 — Verification + docs roll-up** (closes Phase 4).

### Why M11 next
- M10 follow-up landed the Settings R4 gap + admin list search + pagination
  + audit filter strip. Phase 4 is now feature-complete; only verification
  remains before Phase 5 (Fleet CMS).
- A clean Phase 4 close lets Phase 5 inherit the new list-page UX pattern
  from day one (Fleet → FAQ → Leads all reuse `<ListToolbar>` + `<Pagination>`).

### What M11 will deliver
- RBAC matrix sweep: walk every `requirePermission(...)` call against the
  permission map (`server/auth/permissions.ts`) and confirm no over- or
  under-granting.
- Static checks green: `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- Live preview MCP smoke for every admin module touched in Phase 4.
- Docs roll-up: refresh `CHANGELOG.md`, ARCHITECTURE.md, and any ADR
  cross-refs that drifted across M1–M10.

### Out of scope here
- New features. M11 is a verification + docs phase only.

### Historical: Phase 4 M9 (already done, kept for context)

### Why M9 next
- M8 is complete; with Services, News, Gallery, Team, and Clients done,
  the only remaining content-domain CMS surfaces are Stats (the
  homepage counters) and SiteSettings (company info JSON).
- M9 introduces a slightly different shape — Stats is a tiny fixed-size
  table editor (no add/remove, just edit `value`/`label`/`suffix`); Settings
  is a structured-JSON form. Both are quick wins.

### What M9 will deliver
- `/admin/stats` — 4-row editable table; `key` immutable; `source` toggle
  MANUAL/DERIVED (DERIVED stays read-only until a future integration phase).
- `/admin/settings` — typed forms over `SiteSettings.data` JSON (company
  name, addresses, phones, socials, opening hours), validated by Zod.
- Audit `STAT_UPDATE` + `SETTINGS_UPDATE` (constants already declared).
- Revalidate `/` (stats band), `/tentang`, `/kontak` (settings consumers).

### What M9 does NOT include
- Add/remove stats — the homepage layout assumes exactly 4. Adding a
  5th is a layout decision, not a CMS one.
- Operational-system / API integration for DERIVED stats — that's a
  future phase (no commitment yet); M9 just keeps the door open via
  the `source` enum.

---

## 18. Instructions For Future Claude Sessions

### Documents to read first (in order)
1. **This file** (`DOCS/PROJECT_MASTER_HANDOFF.md`) — overview + current state.
2. `DOCS/IMPLEMENTATION_HANDOFF.md` — original Phase 0 → 1 handoff context.
3. `DOCS/ARCHITECTURE.md` — system overview.
4. `DOCS/DATABASE.md` — canonical schema (mirror of `prisma/schema.prisma`).
5. `DOCS/SECURITY.md` — auth + RBAC matrix.
6. `DOCS/BACKEND_STRUCTURE.md` — server/services/repositories layering.
7. `DOCS/FRONTEND_STRUCTURE.md` — **read the Base UI note** (composition uses `render`, NOT `asChild`).
8. ADRs 0001–0011 for the "why" behind each major decision.
9. `DOCS/CHANGELOG.md` — phase-by-phase log of what landed when.

### Assumptions that MUST NOT be changed without owner approval
- **Frontend marketing is finalized.** Do not redesign. The owner has
  refined imagery and copy; new marketing work needs explicit approval.
- **`lib/data` is the only data path the frontend uses.** Never let a
  component import `db`, a repository, or `@prisma/client`.
- **Service layer is authoritative for RBAC.** Middleware is coarse;
  service calls `requirePermission` on EVERY mutation and sensitive read.
- **The 5 User-Management invariants in §8.** Never weaken them. Never
  add a hard-delete method. Never remove the SUPER_ADMIN floor check.
- **Audit-log every state change.** Every mutation calls `writeAudit(...)`.
- **Argon2id parameters and DUMMY_PASSWORD_HASH timing equalization.**
  Don't change the params without a security review.
- **Cookie attributes** (`__Host-` prefix, HttpOnly, Secure, SameSite=Lax)
  and JWT TTL (24h sliding, 7-day absolute) — don't change without ADR.

### Architectural decisions already approved (don't relitigate)
- Next.js fullstack (no separate backend).
- PostgreSQL on Neon Singapore.
- Prisma 6.
- Auth.js v5 + JWT + sessionVersion.
- `/admin` route group (not subdomain).
- Cloudinary signed uploads + reference-guarded delete.
- `lib/data` seam (ADR 0008).
- `Stat` table with `source` enum (ADR 0009).
- `LeadActivity` timeline (ADR 0010).
- SiteSettings as JSON with Zod (ADR 0011).
- shadcn/ui on Base UI (NOT Radix; `render` prop).
- Next 16 `proxy.ts` (renamed from `middleware.ts`).

### Workflow conventions
- **Migrations** are written as SQL files in `prisma/migrations/`, applied
  via `npx prisma migrate deploy` (interactive `migrate dev` doesn't work
  in non-TTY shells).
- **Verify after every milestone**: `npx tsc --noEmit`,
  `npm run lint`, `npm run build`. All three must be green.
- **Smoke test through the preview MCP**: start the dev server via
  `mcp__Claude_Preview__preview_start`, screenshot + DOM-probe.
- **Stop after each milestone** and report; wait for explicit approval
  before starting the next. The owner gates every milestone.
- **Use Server Actions** for mutations; **Route Handlers** under
  `/api/v1/admin/*` only when a non-RSC consumer needs it.
- **Sanitize rich text on write AND render** (sanitize-html allowlist in
  `components/admin/sanitized-html.tsx`).

### What to start next
**Phase 4 M9 — Stats + Settings CMS.** See §17. Stats is a tiny 4-row
table editor; Settings is a Zod-validated JSON form. Both reuse the
M5–M8 useActionState + audit + revalidate patterns. No new schema —
`Stat` and `SiteSettings` tables already shipped in Phase 1.

### Communication style
- Reports should include: summary, files created, files modified, schema
  changes, migration status, verification results, risks discovered,
  decisions requiring approval.
- Stop immediately at the end of each milestone — don't continue
  automatically.
- Surface risks early; don't bury them.
- Never weaken approved invariants — escalate to the owner instead.

---

*End of master handoff. Update this file at the end of each milestone so
the next session starts with the latest state.*
