# `server/auth` — Phase 3 home

**Intentionally empty in Phase 1.** This directory is reserved for the Phase 3
build-out and exists now only so its location matches the documented architecture.

## What will live here (Phase 3)

- **Auth.js v5 configuration** — Credentials provider, Prisma adapter,
  database sessions, session callbacks enriching `session.user` with `role` and
  `permissions` (ADR 0004, DOCS/SECURITY.md §"Authentication").
- **Password hashing** — `argon2id` helpers for set / verify, with timing-safe
  comparisons.
- **Permission constants** — the typed list of permission strings used by the
  RBAC matrix (SECURITY.md §"Authorization").
- **Guards** — `requirePermission(perm)` and `requireRole(...)` used by every
  service-layer method and by `middleware.ts` for coarse route gating.
- **Session helpers** — `getSession()` server-side, session rotation on role /
  password change.

## What does NOT live here

- The Prisma client → `lib/db.ts`.
- Audit logging → `server/audit/`.
- Business rules → `server/services/*`.
- DB access → `server/repositories/*`.
- Middleware routing (the file `middleware.ts` lives at the project root — the
  guard *logic* it calls is what lives here).

## Do not import from this directory until Phase 3.

Premature stubs would force later rework; the empty-directory marker is the
correct artefact for Phase 1.
