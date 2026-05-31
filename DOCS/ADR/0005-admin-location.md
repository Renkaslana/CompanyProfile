# ADR 0005 — Admin location: `/admin` route group (subdomain-ready)

- **Status:** Accepted
- **Date:** 2026-05-29

## Context

The CMS needs a home. Options: an in-app `/admin` path, an obscure "hidden" path, or a dedicated
`admin.bmi.*` subdomain. The product will grow, so the choice must not block a future split.

## Decision

Implement the admin under an **`(admin)` route group at `/admin`** in the same app now. Protect it
with `middleware.ts` + Auth.js + RBAC, mark all admin routes **`noindex`**, and never link them
publicly. Keep **all** admin code inside `app/(admin)/` and the shared logic inside `server/` so the
whole surface can be promoted to a dedicated **subdomain** (or a separate monorepo app) later
**without a rewrite**.

## Alternatives considered

- **"Hidden"/obscure route** — security-by-obscurity; rejected as a *strategy* (real auth + noindex
  instead).
- **Subdomain now** — cleaner isolation but adds separate deploy, cookie-domain, and CORS setup
  earlier than warranted.

## Consequences

- ✅ Simplest secure option now; shares session and types with the app.
- ✅ Migration-ready: isolation in `(admin)` + `server/` makes a future subdomain move mechanical.
- ⚠️ Must enforce `noindex`, middleware gating, and audit logging from day one.
