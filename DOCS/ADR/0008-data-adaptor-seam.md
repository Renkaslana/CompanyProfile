# ADR 0008 — Single data-adaptor seam (`lib/data`)

- **Status:** Accepted
- **Date:** 2026-05-29

## Context

The frontend reads all content through async accessors in `lib/data/index.ts`
(`getServices`, `getFleet`, `getNews`, `getNewsBySlug`, `getGallery`, `getTeam`, `getClients`,
`getStats`, `getAchievements`, `getCoverage`, `getCertifications`, `getJobs`). In Phase 2 these
return mock arrays from `mock/*.mock.ts`.

## Decision

Preserve this adaptor as the **single source-swap point**. In Phase 2→3 migration, replace each
accessor body with a call into `server/repositories/*` (Prisma). **Signatures stay identical**, so
no page or component changes. New domains (FAQ, Support, Jobs, Settings) expose their reads the
same way.

## Consequences

- ✅ Backend integration touches one layer, not the whole UI; frontend stays "finalized".
- ✅ Enables incremental migration (swap one accessor at a time, table by table).
- ⚠️ Accessors must keep returning the same shapes the components expect; covered by the shared
  domain types in `features/*/types.ts`.
