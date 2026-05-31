# Testing Strategy

Layered testing, gated in CI (`lint → typecheck → test → build`).

## Layers & tools

| Layer | Tool | Covers |
|---|---|---|
| Unit | **Vitest** | services, Zod schemas, RBAC permission resolver, utils |
| Integration | Vitest + **Neon branch / Testcontainers** | repositories, Server Actions, Route Handlers against real Postgres |
| Component | **React Testing Library** | forms, gallery filter, FAQ search, validation states |
| E2E | **Playwright** | full user + admin journeys |
| Accessibility | **axe-core** (in Playwright) | WCAG AA checks on key pages |

## What to test (roadmap)

- **Authentication**: login success/failure, lockout/backoff, session expiry, MFA for SUPER_ADMIN.
- **Authorization (RBAC matrix)**: each role sees/does only what SECURITY.md allows; admin routes
  reject unauthenticated and under-privileged users (middleware **and** service).
- **CRUD / CMS**: create→edit→publish→archive for News/FAQ; reorder; media attach; audit row written.
- **Support Center**: FAQ search (hit + miss logged), helpful vote, ticket escalation.
- **Leads**: public submit → persisted `NEW` → admin status transitions.
- **API**: response/error envelopes, pagination, validation rejects.
- **Uploads**: signed flow, MIME/size rejection, delete-guard on referenced media.
- **Security**: rate limits, Turnstile required, sanitized rich text renders safely.
- **Responsive**: Playwright at mobile/tablet/desktop for key pages.
- **Production readiness**: build, env validation failure path, migration apply on a fresh DB.

## Conventions

- Co-locate unit tests as `*.test.ts(x)` next to source; E2E in `e2e/`.
- Use factories/seed helpers for DB state; reset between integration tests.
- A test must fail before it's trusted — no assertions-free tests.

## CI gate

PRs cannot merge unless lint, typecheck, unit+integration, and build pass. E2E runs on the Vercel
preview (or a dedicated job) against a seeded Neon branch.
