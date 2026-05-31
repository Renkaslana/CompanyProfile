# ADR 0003 — ORM: Prisma

- **Status:** Accepted
- **Date:** 2026-05-29

## Context

We need a type-safe data layer with first-class migrations, approachable for future developers.
The PRD §10 already sketches the schema in Prisma, and the frontend domain types
(`features/*/types.ts`) were intentionally shaped to match it.

## Decision

Use **Prisma** as the ORM and migration tool. All access is wrapped in `server/repositories/*`;
a singleton client lives in `lib/db.ts`.

## Alternatives considered

- **Drizzle** — leaner, SQL-first, excellent on edge runtimes; but its migration workflow and
  ecosystem are less turnkey for a content-heavy CMS maintained by a small team.

## Consequences

- ✅ Mature migrations, strong DX, generated types, easy onboarding; matches existing type shapes.
- ✅ Prisma v6+ dropped the Rust engine → smaller cold starts.
- ⚠️ Use Neon pooled connection on serverless; run `prisma migrate deploy` in CI against the
  direct connection.
- ⚠️ Slightly larger client than Drizzle — acceptable for the DX/migration gains.
