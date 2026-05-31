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

### Planned (next phases)
- Phase 2: swap `lib/data` mock → repositories.
- Phase 3: Auth.js v5 + RBAC + `(admin)` shell.
- Phase 4–7: CMS core, Fleet, Support Center, Lead management.
- Phase 8–10: security hardening, testing, production readiness.

---

### Earlier (pre-changelog)
- Phase 2 frontend prototype: premium landing page (12 sections) + multi-pages (tentang, layanan
  +detail, galeri, karir, berita +detail, kontak), mock-driven via `lib/data`, SEO + sitemap/robots
  + Organization JSON-LD. Stack: Next.js 16, React 19, Tailwind v4, shadcn/ui (Base UI), Framer
  Motion.
