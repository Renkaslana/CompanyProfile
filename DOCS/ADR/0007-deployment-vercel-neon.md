# ADR 0007 — Deployment: Vercel + Neon + Cloudinary

- **Status:** Accepted
- **Date:** 2026-05-29

## Context

We want a professional, scalable, low-ops deployment with CI/CD, preview environments, monitoring,
and backups — without standing up and maintaining servers.

## Decision

Deploy the Next.js app on **Vercel**, the database on **Neon** (serverless Postgres), and media on
**Cloudinary**. CI/CD via **GitHub Actions** (`lint → typecheck → test → build` + `prisma migrate
deploy`). **Staging** uses Vercel preview deployments paired with **Neon branch** databases per PR.
Error tracking with **Sentry**; backups via **Neon PITR + scheduled `pg_dump`**.

## Alternatives considered

- **VPS + Postgres** / **Docker + VPS** — full control & predictable cost, but you own TLS,
  scaling, backups, and monitoring (high ops).

## Consequences

- ✅ Built-in CI/CD, preview deploys, DB-branch-per-PR, automatic scaling, minimal ops.
- ✅ Clean path to a future hybrid if ever needed: web on Vercel, with any **future operational or
  analytics service on Fly.io/Railway/Cloud Run** sharing Neon (Vercel isn't suited to long-running
  services). Not part of current scope.
- ⚠️ Vendor coupling; mitigated by the repository layer and standard Postgres.
- ⚠️ Configure Neon pooled connection for the app and direct connection for migrations.
