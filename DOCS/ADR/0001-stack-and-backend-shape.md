# ADR 0001 — Stack & backend shape (Next.js fullstack)

- **Status:** Accepted
- **Date:** 2026-05-29

## Context

The frontend is built and refined on Next.js 16 (App Router) · React 19 · TypeScript (strict) ·
Tailwind v4 · shadcn/ui (on Base UI) · Framer Motion, with all data flowing through a single
async adaptor (`lib/data`). We now need persistence, auth, a CMS, leads, fleet, gallery/news,
and a Support Center. The PRD (§9) anticipates a later split for heavy/operational + ML work.

Everything currently in scope is CRUD + content management (Company Profile, CMS, Fleet, News,
Gallery, Support Center, Lead/Inquiry management, Admin Panel) — no long-running jobs, queues,
websockets, or heavy compute.

## Decision

Keep a **single Next.js fullstack application**. Use **Server Actions** for internal mutations
(CMS, forms) and **Route Handlers** (`app/api/v1/*`) for public reads/webhooks. Enforce a strict
internal layering: **Server Component / Action → service → repository → Prisma → Postgres**.
Components never touch the DB directly.

Do **not** introduce Express or NestJS now. Keep the option open to add a separate operational or
analytics service (e.g. NestJS) for **future** workloads that don't fit serverless, sharing the same
Postgres database — the "seam" described in PRD §9.1. Any such module (e.g. an HR/attendance module)
is an *illustrative* future possibility, **not** planned scope.

## Alternatives considered

- **Next.js + Express** — second server/deploy, duplicated types & auth, no benefit for CRUD.
- **Next.js + NestJS** — powerful (DI, queues, cron) but heavy and premature; justified only when
  long-running/ML work arrives.

## Consequences

- ✅ One codebase, one deploy, end-to-end types, fast onboarding.
- ✅ Service/repository layers keep business logic portable if a second runtime is added later.
- ⚠️ Serverless functions have cold starts and execution limits — irrelevant for CRUD, but any
  future long-running operational/analytics service must live elsewhere (see ADR 0007).
- ⚠️ Requires pooled DB connections on serverless (see ADR 0002/0003).
