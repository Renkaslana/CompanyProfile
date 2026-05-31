# Implementation Handoff

**Purpose:** the single "resume from here" document. Phase 0 (planning & documentation) is complete
and **approved**. This captures the approved plan and the exact next steps so implementation can begin
later without re-deriving context. Deep detail lives in the linked docs; this is the authoritative
summary + Phase 1 work order.

> **Status: documentation finalized. No backend code written yet.** Begin at "Phase 1 task
> breakdown" when ready.

---

## 1. Project status summary

| Track | State |
|---|---|
| **Frontend (Phase 2 prototype)** | ✅ Complete & refined by owner (own branded images in place). Treat as finalized. |
| **Architecture & docs (Phase 0)** | ✅ Complete & approved — full `DOCS/` set + ADR 0001–0011. |
| **Backend** | ⛔ Not started — begins at Phase 1 (this handoff). |
| Stack | Next.js 16 · React 19 · TS strict · Tailwind v4 · shadcn/ui (Base UI) · Framer Motion · all data via `lib/data` (mock). |

**Current scope:** Company Profile · CMS · Fleet Management · News · Gallery · Support Center ·
Lead/Inquiry Management · Admin Panel. *(No attendance/face-recognition — those are illustrative
future examples only; see "Approved future scope".)*

---

## 2. Approved architecture decisions (ADRs)

| Decision | Choice | ADR |
|---|---|---|
| Backend shape | Next.js fullstack (Server Actions + Route Handlers + service/repo layers) | 0001 |
| Database | PostgreSQL on **Neon** | 0002 |
| ORM | **Prisma** | 0003 |
| Auth | **Auth.js v5** + RBAC | 0004 |
| Admin location | **`/admin`** route group, `noindex`, middleware-gated, **subdomain-ready** | 0005 |
| Media | **Cloudinary** (server-signed uploads) | 0006 |
| Hosting | **Vercel + Neon + Cloudinary**, GitHub Actions CI/CD | 0007 |
| Data seam | `lib/data` is the single mock→DB swap point | 0008 |
| Marketing stats | `Stat` table, `source` MANUAL→DERIVED (hybrid) | 0009 |
| Lead history | `LeadActivity` timeline (not a notes blob) | 0010 |
| Site settings | Validated JSON singleton + selective table promotion | 0011 |

No top-level `frontend/`/`backend/` split (anti-pattern for Next fullstack) — add `server/` +
`prisma/` instead; promote to a Turborepo monorepo only if a second runtime ever appears.

## 3. Approved database design

Full schema in **[DATABASE.md](DATABASE.md)**. Models: `SiteSettings`, `Stat`, `MediaAsset`
(+`title`,`tags`), `Service`, `FleetVehicle`, `NewsPost`, `GalleryItem`, `TeamMember`, `ClientLogo`,
`CoverageRegion`, `Achievement`, `Certification`, `JobOpening`, `Lead` + `LeadActivity`,
`FaqCategory`, `FaqItem`, `FaqSearchLog`, `SupportTicket` (+assignment), `User`, `Role`, `AuditLog`.
Media referenced by **id** (reusable library; integrity guarded in `MediaService`). Enums:
`ServiceCategory`, `FleetStatus`, `PostStatus`, `LeadStatus`, `LeadActivityType`, `TicketStatus`,
`StatSource`.

## 4. Approved security model

See **[SECURITY.md](SECURITY.md)**. Auth.js v5 (argon2id, DB sessions, lockout, MFA+backup codes for
SUPER_ADMIN) · RBAC in middleware **and** services · Zod at every boundary · rich-text sanitized ·
public-form pipeline + field rules · rate limiting + Turnstile + honeypot · signed uploads with
MIME/size/EXIF handling · security headers/CSP · append-only audit with IP/UA · env Zod-validated at
boot, secrets server-only · CORS lock + `pageSize` caps + gitleaks/Dependabot.

## 5. Approved deployment strategy

See **[DEPLOYMENT.md](DEPLOYMENT.md)**. Vercel (web) + Neon (DB, pooled runtime / direct migrations)
+ Cloudinary (media). GitHub Actions: `lint → typecheck → test → build` + `prisma migrate deploy`.
Preview deploys + Neon branch per PR. Sentry + Vercel Analytics + uptime. Neon PITR + scheduled
`pg_dump` backups with a restore runbook.

## 6. Approved CMS workflow

See **[CMS_WORKFLOW.md](CMS_WORKFLOW.md)**. Modules: Dashboard, Services, Fleet, Gallery, News, FAQ,
Support (+assignment), Leads (+activity timeline), Team, Clients, Media Library (+tags/search),
Statistics (`Stat`), Settings, Users & Roles. Standard flow: UI → Server Action → `requirePermission`
→ Zod → sanitize → service → repository → `writeAudit` → `revalidatePath`. Draft→Publish→Archive for
News/FAQ. Leads are status + activity (no auto-forward).

## 7. Approved Support Center workflow

See **[SUPPORT_CENTER_WORKFLOW.md](SUPPORT_CENTER_WORKFLOW.md)**. **No AI chatbot.** Public `/bantuan`:
FAQ categories, search (misses logged), popular, quick help, helpful votes, human escalation
(`SupportTicket`) + contact + quotation. Admin: FAQ CRUD + analytics; ticket status workflow +
**assignment** to agents.

## 8. Approved future scope (optionality, NOT planned)

Future **Operational Modules / Analytics Services / Business Intelligence / Platform Extensions** can
attach behind the existing seams (separate runtime sharing Neon; monorepo promotion; admin subdomain).
Any specific module (e.g. an HR/attendance module with face-recognition check-in) is an **illustrative
example only — not current or planned scope** (see ARCHITECTURE.md §6).

---

## 9. Final implementation roadmap

| Phase | Scope | Gate |
|---|---|---|
| **0. Docs & ADRs** | ✅ Done (this handoff) | approved |
| **1. Infrastructure** | Prisma schema, Neon, env+Zod config, `lib/db`, `server/` skeleton, seed from mock | migrate + seed clean |
| **2. Data-layer swap** | repositories + flip `lib/data` mock→Prisma | frontend identical, DB-backed |
| **3. Auth & RBAC** | Auth.js v5, roles/permissions, middleware + service guards, `(admin)` shell | role matrix enforced |
| **4. CMS core** | Services/News/Gallery/Team/Clients + Media Library + Stats + Settings + audit | non-dev can edit content |
| **5. Fleet management** | Fleet CRUD + status + photos | — |
| **6. Support Center** | FAQ + categories + search + analytics + escalation + assignment | end-to-end FAQ + ticket |
| **7. Lead management** | lead persistence + Turnstile + rate limit + status + **activity timeline** | form→DB→admin timeline |
| **8. Security hardening** | headers/CSP, rate limits, upload + EXIF, MFA, sanitization, append-only audit | SECURITY checklist green |
| **9. Testing & stabilization** | unit/integration/E2E/a11y + CI gate | CI green |
| **10. Production readiness** | Sentry, backups, runbooks, staging→prod, **root README** | deployable & documented |

---

## 10. Phase 1 — objectives, milestones, task breakdown

### Objectives
Stand up the **data + server foundation** with **zero frontend change**: a migrated Postgres schema
on Neon, validated env, a Prisma client, the `server/` skeleton, and the database **seeded from the
current `mock/*` data**. Phase 1 does **not** swap `lib/data` (Phase 2) and does **not** build auth UI
or CMS screens (Phases 3–4).

### Implementation order (do in sequence)
1. **Dependencies** — add `prisma` (dev) + `@prisma/client`; init `prisma/`. (Cloudinary/Auth deferred to their phases.)
2. **Schema** — author `prisma/schema.prisma` exactly per [DATABASE.md](DATABASE.md) (all approved models/enums, indexes incl. GIN on `MediaAsset.tags`).
3. **Env & config** — create `.env` + `.env.example`; add `lib/config/env.ts` that **Zod-validates** `DATABASE_URL` (pooled) + `DIRECT_DATABASE_URL` (direct) at boot.
4. **Neon** — create project/branch; set both connection strings; configure Prisma `datasource` with `url` + `directUrl`.
5. **Prisma client** — `lib/db.ts` singleton using the pooled URL (guard against hot-reload connection leaks).
6. **`server/` skeleton** — create `server/{services,repositories,auth,audit}` with `audit/write-audit.ts` stub and one reference pair (e.g. `content.repository.ts` + `content.service.ts`) to establish the pattern.
7. **Migration** — `prisma migrate dev --name init` → first migration committed.
8. **Seed** — `prisma/seed.ts` populating from `mock/*`: services, fleet, news, gallery, team, clients, jobs, coverage, achievements, certifications; `Stat` (from `stats.mock`); `SiteSettings` (from `COMPANY`+`VALUES`); seed Roles (SUPER_ADMIN/EDITOR/SUPPORT_AGENT/VIEWER) + one admin `User`; optional starter FAQ. Make it **idempotent** (upsert by stable key/slug).
9. **Verify** — run migrate + seed; open `prisma studio`; `npx tsc --noEmit`, `npm run lint`, `npm run build` green.

### Milestones
- **M1** Schema authored & reviewed against DATABASE.md
- **M2** Neon connected; env validated at boot (fails fast when unset)
- **M3** Initial migration applied
- **M4** Seed populates all tables from mock; verified in Prisma Studio
- **M5** `server/` skeleton + `lib/db` singleton in place; typecheck/lint/build green

### Phase 1 "definition of done"
Database schema live on Neon, seeded with realistic content matching the current site, server layer
scaffolded, env validated — and the **frontend still renders unchanged** (still reading mock via
`lib/data`; the swap is Phase 2).

---

## 11. Known risks (and mitigations)

| Risk | Mitigation |
|---|---|
| Prisma connections on serverless | Use Neon **pooled** URL at runtime; **direct** URL for migrations; client singleton |
| Bleeding-edge stack (Next 16 / React 19 / Tailwind v4) | Pin versions; verify Prisma + Turbopack compatibility on first migrate |
| Mock ↔ seed drift until Phase 2 | Treat `prisma/seed.ts` as the migration of `mock/*`; swap `lib/data` promptly in Phase 2 |
| Seed idempotency | Upsert by slug/key; safe re-runs |
| Media id-refs lack DB FK | `MediaService` delete-guard (Phase 4) |
| Rich-text XSS | Sanitize on write + render (Phases 4/6) |
| Secrets exposure | Server-only env, Zod validation, gitleaks/Dependabot in CI |

---

## 12. Next actions

1. **Provision Neon** — create the project and supply `DATABASE_URL` (pooled) + `DIRECT_DATABASE_URL`
   (direct). *(Decide who provisions: owner or me with credentials.)*
2. **Approve Phase 1 start** — on your go, I execute the Phase 1 order above (schema → env → client →
   skeleton → migration → seed → verify), frontend untouched.
3. After Phase 1 verification, proceed to **Phase 2** (swap `lib/data` to repositories).

> Resume point: open this file + [DATABASE.md](DATABASE.md) and start at §10 "Implementation order".
