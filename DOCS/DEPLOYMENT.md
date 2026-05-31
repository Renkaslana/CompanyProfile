# Deployment

Target: **Vercel + Neon + Cloudinary** (ADR 0007). Low-ops, CI/CD, preview environments, automatic
scaling.

## Environments

| Env | Web | Database | Purpose |
|---|---|---|---|
| Development | local `next dev` | Neon dev branch (or local Postgres) | day-to-day |
| Staging/Preview | Vercel preview (per PR) | **Neon branch per PR** | review before merge |
| Production | Vercel production | Neon primary | live |

## Environment variables (`.env.example`)

```
# Database (Neon)
DATABASE_URL=            # pooled (app runtime)
DIRECT_DATABASE_URL=     # direct (migrations)
# Auth.js
AUTH_SECRET=
AUTH_URL=
# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
# Abuse protection
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
# Monitoring
SENTRY_DSN=
```

Validate all of these at boot with Zod in `lib/config` — fail fast if any are missing/invalid.

## CI/CD (GitHub Actions)

```
on: [pull_request, push to main]
jobs:
  verify:   lint → typecheck → test → build
  migrate:  (production deploy) prisma migrate deploy   # uses DIRECT_DATABASE_URL
```

- PR → Vercel **preview** deploy + **Neon branch** seeded for review.
- Merge to `main` → production deploy; migrations run **before** the new build goes live.
- Never run `prisma migrate dev`/`reset` in CI; only `migrate deploy`.

## Database migrations

- Author locally with `prisma migrate dev`; commit the migration.
- CI applies with `prisma migrate deploy` against the direct connection.
- Expand → migrate → contract for destructive changes (no data loss).

## Monitoring & error tracking

- **Sentry** (client + server) for errors/traces.
- **Vercel Analytics** for Web Vitals; uptime monitor (e.g. BetterStack/UptimeRobot) on `/`.
- Structured server logs; alert on error-rate spikes.

## Backup & recovery

- **Neon PITR** (point-in-time restore) + a scheduled `pg_dump` to object storage.
- **Restore runbook:** create a Neon branch from a timestamp → verify → repoint `DATABASE_URL`.
- Quarterly restore drill to validate backups.

## Future hybrid (only if a future operational/analytics service is ever added)

If the business later adds a long-running operational or analytics service (not in current scope),
it can't run on Vercel — deploy it to **Fly.io / Railway / Cloud Run**, sharing the same Neon
database. The web app stays on Vercel. This is an optionality note, not a planned step.

## Go-live checklist

- [ ] Env vars set in Vercel (prod + preview) and validated at boot
- [ ] `prisma migrate deploy` green · seed run for first deploy
- [ ] Security checklist (SECURITY.md) complete
- [ ] Sentry receiving events · uptime monitor active
- [ ] Backup + restore drill done · [ ] Custom domain + HTTPS + `/admin` noindex verified
