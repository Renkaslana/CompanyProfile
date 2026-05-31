# Development Guide

## Prerequisites

- Node 20+, npm, Git. Windows (PowerShell) or any OS.
- A Neon database (or local Postgres) once Phase 1 lands.

## Setup

```bash
npm install
cp .env.example .env        # fill values (see DEPLOYMENT.md)
# Phase 1+:
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev                 # http://localhost:3000
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | dev server (Turbopack) |
| `npm run build` / `npm start` | production build / serve |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | type check |
| `npx prisma studio` | DB browser (Phase 1+) |

## Where things live

- Pages/routing → `app/` · UI → `components/` · domain → `features/`
- Data reads → `lib/data` (the swap seam) · server logic → `server/` (Phase 1+)
- DB → `prisma/` · docs → `DOCS/`
- See [FRONTEND_STRUCTURE](FRONTEND_STRUCTURE.md) and [BACKEND_STRUCTURE](BACKEND_STRUCTURE.md).

## Conventions

- **TypeScript strict**; avoid `any`.
- **Naming**: components `PascalCase`; files `kebab-case.tsx`; vars/functions `camelCase`;
  constants `UPPER_SNAKE_CASE`; types/interfaces `PascalCase`; folders `kebab-case`; domains under
  `features/<domain>`.
- **Components** stay presentational; business logic lives in services/hooks.
- **Data access** only through `lib/data` (reads) and Server Actions/services (writes) — never query
  the DB from a component.
- **Validation** with Zod at every input boundary.

## ⚠️ UI library gotcha (read before touching `components/ui`)

shadcn here runs on **Base UI**, not Radix. Use the **`render` prop**, not `asChild`:
`<Button render={<Link href="/x" />}>label</Button>`. Sheet/Dialog are Base UI (`Popup`/`Backdrop`,
`open`/`onOpenChange`). `lucide-react` has no brand/social icons. Details in
[FRONTEND_STRUCTURE.md](FRONTEND_STRUCTURE.md).

## Design tokens

Edit brand colors/utilities in `app/globals.css` `@theme` (Tailwind v4). Fonts in `lib/fonts.ts`.

## Onboarding in 10 minutes

1. Read [ARCHITECTURE.md](ARCHITECTURE.md) (layering + seams).
2. Skim the [ADRs](ADR/) for the "why".
3. Trace one feature: `app/(marketing)/layanan/page.tsx` → `lib/data.getServices()` →
   (Phase 1+) `ContentRepository`.
4. Run `npm run dev` and click through the site.
