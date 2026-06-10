# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: SemVer once released.

## [Unreleased]

### Added
- Architecture review & decision records (`DOCS/`, `DOCS/ADR/0001–0011`).
- Documentation set: ARCHITECTURE, FRONTEND_STRUCTURE, BACKEND_STRUCTURE, DATABASE, API, SECURITY,
  CMS_WORKFLOW, SUPPORT_CENTER_WORKFLOW, DEPLOYMENT, TESTING, DEVELOPMENT_GUIDE, CONTRIBUTING.
- `IMPLEMENTATION_HANDOFF.md` — approved plan, full roadmap, detailed Phase 1 breakdown, risks, next actions.
- ADR 0009 (marketing stats hybrid), 0010 (lead activity timeline), 0011 (SiteSettings JSON strategy).
- Schema refinements (approved): `LeadActivity` timeline, `SupportTicket` assignment,
  `MediaAsset.title`+`tags` (GIN), `Stat` table with `source` flag.
- SECURITY: public-form field-validation rules + hardening refinements (session invalidation,
  append-only audit + IP/UA, EXIF strip, CORS/pageSize caps, gitleaks).

### Changed
- Future scope generalized to **Future Operational Modules / Analytics / BI / Platform Extensions**;
  attendance/face-recognition/pgvector demoted to illustrative examples (not planned scope) across
  ARCHITECTURE, ADR 0001/0002/0007, DATABASE, SECURITY, DEPLOYMENT.
- `SiteSettings` no longer holds `stats` JSON — marketing stats moved to the `Stat` table.

### Added (Phase 1 — implementation)
- M1: Prisma 6.x toolchain + `prisma/schema.prisma` mirroring DATABASE.md.
- M2: `.env.example` + `lib/config/env.ts` (Zod, server-only, fail-fast at boot).
- M3: Initial migration `20260530124527_init` applied to Neon (Singapore).
- M4: schema refinements (`NewsPost.displayAuthor`, `MediaAsset.publicId @unique`)
  + migration `20260530130000_news_display_author_and_media_publicid_unique`;
  idempotent `prisma/seed.ts` populating 95 rows from `mock/*` + `lib/constants`;
  `tsx` devDep + `prisma.seed` package.json config.
- M5: `lib/db.ts` Prisma client singleton (server-only, HMR-safe);
  `server/{services,repositories,audit,auth}` skeleton with one reference pair
  (`ContentService.getPublishedServices()` → `ContentRepository.findPublishedServices()`)
  and `server/audit/write-audit.ts` stub; `server/auth/README.md` placeholder.

### Added (Phase 3 — Auth & RBAC)
- Schema: `User.sessionVersion`, `User.mustChangePassword`, `User.mfaEnabled`,
  `User.mfaSecret`, `User.lastLoginAt`, `AuthToken` (PASSWORD_SETUP / PASSWORD_RESET),
  `MfaBackupCode`. Migration `20260601100000_phase3_auth_rbac`.
- Auth.js v5 (Credentials provider + JWT session, 24h sliding TTL, 7-day absolute cap,
  `sessionVersion` invalidation): `auth.config.ts` (Edge-safe) + `auth.ts` (Node).
- Server-only auth core: `server/auth/{permissions,password,tokens,mfa,rate-limit,guards}.ts`.
- Argon2id password hashing (OWASP-recommended params). Rate limit fail-OPEN with
  audit per approved decision. AES-256-GCM helpers for future MFA secrets at rest.
- `proxy.ts` (Next 16 replaces `middleware.ts`) — coarse role gates + admin
  security headers (X-Robots-Tag, X-Frame-Options, Referrer-Policy, Cache-Control,
  Permissions-Policy).
- Admin routes under `app/admin/`: `(public)/{login,setup-password,forgot-password,reset-password}`
  + `(auth)/{page,users,users/new,audit}`. Server actions per page.
- Audit log integration: LOGIN_SUCCESS / LOGIN_FAIL / LOGIN_LOCKOUT / PASSWORD_SET /
  PASSWORD_RESET / PASSWORD_RESET_REQUEST / ROLE_CHANGE / USER_CREATE / ACCESS_DENIED
  / RATE_LIMIT_UNAVAILABLE.
- Bootstrap CLI `npm run admin:setup-link -- --email=…` generates a 1-hour
  single-use password setup URL. Phase 3 has no email service yet; forgot-password
  links log to server console.
- Two new permissions: `dashboard:read` (all roles) and `audit:read` (SUPER_ADMIN).
- Env additions: `AUTH_SECRET`, `AUTH_URL`, `MFA_ENCRYPTION_KEY`,
  `UPSTASH_REDIS_REST_URL` (optional), `UPSTASH_REDIS_REST_TOKEN` (optional).

### Deferred to Phase 8
- MFA user-facing flows (enrollment UI + login challenge + backup-code redemption).
  Schema + encryption helpers in place; otplib v13 wiring + UI is Phase 8 work.

### Added (Phase 2 — data layer)
- `lib/data` swapped from mock arrays to DB-backed repositories/services;
  frontend behaviour preserved (ADR 0008 seam).

### Added (Phase 4 — CMS core)
- M1: foundation primitives (`admin-form`, `status-badge`, `confirm-dialog`,
  `media-picker`, `sanitized-html`), Cloudinary signed-upload stub, additive schema.
- M2: User-management completion + Audit Log UX.
- M4: Media Library UI (Cloudinary signed direct upload, folder/tag filter,
  reference-guarded delete).
- M5: Services CMS (CRUD + publish toggle + reorder).
- M6: News CMS (rich-text body, sanitize-on-write+render, DRAFT→PUBLISHED→ARCHIVED).
- M7: Gallery CMS. M8: Team + Clients CMS. M9: Stats + Settings CMS.
- M9.5: Settings consumer migration (Footer/Hero/Kontak/Karir/metadata/JSON-LD now
  read `getSiteSettings()`); Google Maps `mapEmbedUrl`.
- M10: dashboard expansion (content/system metrics, recent activity, "Perlu
  Perhatian"), public UX polish band, testimonials, legal pages (`/privasi`,
  `/syarat-ketentuan`), corporate silhouette avatar.
- M10.1–M10.4: Settings form testimonials/privacy/terms; shared `<ListToolbar>`
  search + `<Pagination>` across all admin lists; audit-log filter strip.
- CMS UX usability pass: mobile admin nav drawer, Indonesian terminology
  (Slug→URL Halaman, Audit Log→Riwayat Aktivitas), dashboard role description +
  "Aktivitas Saya" + "Konten Menunggu Publikasi" widgets, `<EmptyState>` primitive,
  Settings tabbed UI, list-action consolidation, audit-log humanization.
- Support cleanup: **Lead persistence** (public `/kontak` submit → `Lead` table via
  `submitLeadAction`, honeypot anti-spam, `LEAD_CREATE` audit with `actorId:"anonymous"`),
  `/admin/leads` inbox + detail + status workflow, `/bantuan` retired (301 → `/kontak`),
  Settings tab "Layanan Pelanggan" (FAQ + supportHours).
- Tanya BMI guided panel: header-triggered click-only Q&A reading `settings.faq[]`
  grouped by `topic` (9 fixed topics), typing indicator, related questions,
  contextual CTAs per topic. Floating widget retired.
- M3 **skipped** (advanced audit UX → Phase 8).
- M11 verification: tsc/lint/build green; RBAC matrix sweep (all entry points
  guarded; UserService relies on page+action `users:manage` guards); audit-write
  coverage confirmed 100% across all 11 services. Tagged `v0.4.0`.

### Known deviations / cleanup candidates (recorded at Phase 4 close)
- `UserService` does not self-guard with `requirePermission`; it relies on
  page + Server Action `requirePermission("users:manage")`. All entry points
  verified guarded — no exposure — but this deviates from the "service layer is
  authoritative for RBAC" invariant. Low-risk hardening candidate (Phase 8).
- Granted-but-inert permissions: `fleet:write` (Phase 5 pending), `faq:write` /
  `faq:publish` / `support:manage` (Phase 6 ticket system retired). Harmless;
  candidates for removal from `ROLE_PERMISSIONS` when those phases are finalized.

### Planned (next phases)
- Phase 5: Fleet CMS.
- Phase 8: security hardening (CSP, MFA UI, Turnstile + rate-limit on public forms,
  append-only audit, EXIF strip, audit CSV export).
- Phase 9: testing (Vitest + Playwright + axe).
- Phase 10: production readiness (Vercel deploy, custom domain, Sentry, CI/CD, backups).

---

### Earlier (pre-changelog)
- Phase 2 frontend prototype: premium landing page (12 sections) + multi-pages (tentang, layanan
  +detail, galeri, karir, berita +detail, kontak), mock-driven via `lib/data`, SEO + sitemap/robots
  + Organization JSON-LD. Stack: Next.js 16, React 19, Tailwind v4, shadcn/ui (Base UI), Framer
  Motion.
