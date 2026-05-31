# ADR 0004 — Authentication: Auth.js v5 + RBAC

- **Status:** Accepted
- **Date:** 2026-05-29

## Context

The CMS needs secure, session-based admin authentication with role-based authorization, and a path
to employee SSO/OAuth when the future HR module arrives.

## Decision

Use **Auth.js v5 (NextAuth)** with the **Credentials** provider (admin email + argon2id-hashed
password) and the **Prisma adapter** with **database sessions**. Authorization is **RBAC** driven
by the `Role` model (`permissions` JSON), enforced in `middleware.ts` *and* in the service layer
(defense in depth).

## Alternatives considered

- **Lucia** — ⚠️ being deprecated by its maintainer (becoming a learning resource, not a
  maintained library). Avoid adopting now.
- **Custom JWT** — maximum control but reimplements session rotation, CSRF, revocation, and
  lockout; unnecessary security surface.

## Consequences

- ✅ Maintained, App-Router-native, secure cookies + CSRF handled, OAuth/SSO can be added later
  without re-architecting.
- ✅ RBAC centralized and testable; guards run at the edge (middleware) and in services.
- ⚠️ Credentials provider requires careful password hashing (argon2id), failed-login backoff, and
  optional MFA for `SUPER_ADMIN` (see SECURITY.md).
