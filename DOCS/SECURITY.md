# Security

Production-ready security architecture. Principle: **security-first, defense in depth** — never
trust the client, validate at every boundary, and enforce authorization in more than one place.

## Authentication (ADR 0004)

- **Auth.js v5**, Credentials provider, **argon2id** password hashing (per-user salt).
- **Database sessions**; cookies `httpOnly`, `Secure`, `SameSite=Lax`, short TTL + rotation.
- **Failed-login backoff / lockout** (exponential, per email + IP).
- **MFA (TOTP)** required for `SUPER_ADMIN`, optional for others.
- No secrets in the client bundle; session enriched with `role` + `permissions` server-side.

## Authorization — RBAC (defense in depth)

Enforced in **two** layers:
1. `middleware.ts` — gate `/admin/*` and `/api/v1/admin/*`: require session, then coarse role check.
2. **Service layer** — `requirePermission('news:publish')` before every sensitive operation (the
   authoritative check; middleware is the first line, not the only line).

### Roles → permissions (RBAC matrix)

| Permission | SUPER_ADMIN | EDITOR | SUPPORT_AGENT | VIEWER |
|---|:--:|:--:|:--:|:--:|
| dashboard:read | ✅ | ✅ | ✅ | ✅ |
| content:read | ✅ | ✅ | ✅ | ✅ |
| content:write / publish | ✅ | ✅ | — | — |
| fleet:write | ✅ | ✅ | — | — |
| media:create | ✅ | ✅ | ✅ | — |
| faq:write / publish | ✅ | ✅ | ✅ | — |
| support:manage | ✅ | — | ✅ | — |
| lead:read | ✅ | ✅ | ✅ | — |
| lead:update | ✅ | ✅ | ✅ | — |
| settings:write | ✅ | — | — | — |
| users:manage | ✅ | — | — | — |
| audit:read | ✅ | — | — | — |

Permissions live in `Role.permissions` (JSON) so roles are editable without code changes.

## Input & output safety

- **Zod** validation on every Server Action and Route Handler input.
- **Rich-text sanitization**: CMS bodies (news, FAQ answers) sanitized with `sanitize-html`/DOMPurify
  on **write** and again on render; allowlist tags only.
- **XSS**: rely on React escaping; never `dangerouslySetInnerHTML` with unsanitized content
  (the Organization JSON-LD is the only sanctioned use, with static data).
- **SQL injection**: Prisma parameterizes; no raw string SQL without `Prisma.sql` tagged templates.

## Forms & abuse protection

Applies to all public forms — **Contact, Request Quotation, Lead, Support Escalation**.

**Pipeline:** client Zod (UX) → **server Zod (authoritative)** → normalize & sanitize → rate limit
(per-IP **and** per-email) → **Turnstile** verified server-side → honeypot + min-submit-time (>2s) →
dedupe (same email+message within 10 min) → persist.

- **Rate limiting** (Upstash Redis `@upstash/ratelimit`) on: login, `/leads`, `/support/tickets`,
  FAQ search/vote.
- **Cloudflare Turnstile** on all public write forms.
- Honeypot field + timing check as a cheap secondary filter.
- Fields stored as **plain text** (no rich text); React escapes on render; never
  `dangerouslySetInnerHTML` user input.

### Field validation rules

| Field | Rules |
|---|---|
| **name** | required; 2–80; Unicode letters/space/`.'-`; trim + collapse spaces; reject HTML/URLs |
| **email** | required; valid format; ≤254; lowercased; optional disposable-domain block |
| **phone** | optional; 8–20 chars; allow `+ ( ) - space digits`; normalize to digits; ID-friendly (`+62`/`0…`) |
| **company** | optional; 2–100; printable; strip HTML; reject URLs |
| **message** | required; 10–2000; strip HTML/control chars; collapse whitespace; ≤2 URLs (spam heuristic) |

These rules live in `lib/validation` and are shared by client and server.

## Uploads (ADR 0006)

- Server issues **signed** Cloudinary params; the browser uploads directly to Cloudinary.
- Validate **MIME by content sniffing** (not just extension), enforce **size caps**, image-only
  allowlist; reject on mismatch. Persist `MediaAsset` only after a verified upload callback.

## HTTP headers (middleware / `next.config`)

`Strict-Transport-Security` (HSTS), `Content-Security-Policy` (script/style/img/connect allowlist
incl. Cloudinary + Vercel + Sentry), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (disable camera, microphone,
geolocation, etc. — none are required by the current scope).

## Admin hardening (ADR 0005)

`/admin` is `noindex` (meta + `X-Robots-Tag`), excluded from `sitemap.ts`, never linked publicly,
middleware-gated, and audit-logged. Designed to relocate to an `admin.` subdomain later.

## Audit logging

Every create/update/delete writes `AuditLog { actorId, action, entity, entityId, meta }`. Login
success/failure and permission denials are logged. Audit views are `SUPER_ADMIN`-only.

## Secrets & environment

- `.env` per environment (dev/staging/prod); `.env.example` lists every key.
- **Validate env at boot with Zod** (`lib/config`) — fail fast on missing/invalid values.
- Secrets are server-only; never `NEXT_PUBLIC_*`. Rotate Cloudinary/DB/Auth secrets on staff change.
- **Dependabot** + `npm audit` in CI for dependency vulnerabilities.

## Hardening refinements (adopted from final review)

- **Auth/sessions:** generic errors on login & password-reset (prevent account enumeration);
  **invalidate sessions on role/password change** (session version or revocation); separate admin
  login rate-limit bucket; distinct admin cookie name.
- **MFA:** TOTP for `SUPER_ADMIN` **+ backup codes**; WebAuthn a later option.
- **Audit log:** **append-only** (no update/delete; restricted via DB privileges); store actor
  **IP + user-agent**; log auth events and permission denials.
- **Admin:** optional **IP allowlist** for `/admin` in early production (in addition to auth).
- **Uploads:** **strip EXIF/GPS** from images; guard against decompression bombs (dimension caps);
  optional Cloudinary moderation.
- **API:** per-route rate limits; **lock CORS** to own origin for write endpoints; **cap `pageSize`**;
  never leak internal errors (generic 500).
- **CI/secrets:** secret scanning (gitleaks) + Dependabot; documented `AUTH_SECRET`/key rotation.

## Checklist (production gate)

- [ ] HTTPS + HSTS + CSP live · [ ] RBAC enforced in middleware **and** services
- [ ] Rate limits + Turnstile on public writes · [ ] Upload MIME/size validation
- [ ] Rich-text sanitized · [ ] Audit logging on all mutations
- [ ] MFA (+backup codes) for SUPER_ADMIN · [ ] Env validated at boot · [ ] Secrets server-only
- [ ] Dependabot + secret scanning · [ ] `/admin` noindex + not in sitemap
- [ ] Sessions invalidated on role/password change · [ ] Audit append-only + IP/UA captured
- [ ] EXIF stripped on upload · [ ] CORS locked + `pageSize` capped on write/list APIs
- [ ] Public-form field rules enforced (client + server Zod)
