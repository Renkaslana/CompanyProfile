# Frontend Structure

The frontend is built and refined; treat it as mostly finalized. This documents how it is
organized so backend work slots in cleanly.

## Routing (`app/`)

```
app/
├── layout.tsx                 # root: fonts, metadata, Organization JSON-LD, <html lang="id">
├── globals.css                # Tailwind v4 @theme tokens (brand palette) + utilities
├── sitemap.ts · robots.ts · icon.png · not-found.tsx
└── (marketing)/
    ├── layout.tsx             # Navbar + Footer + Toaster
    ├── page.tsx               # landing (composes all sections)
    ├── tentang/ · layanan/ (+[slug]) · galeri/ · karir/ · berita/ (+[slug]) · kontak/
```

`layanan/[slug]` and `berita/[slug]` use `generateStaticParams` (SSG).
**Planned additions:** `(admin)/*` (CMS), `api/v1/*` (REST), `bantuan/*` (Support Center).

## Components

| Folder | Role |
|---|---|
| `components/ui/` | shadcn primitives (Base UI) — dumb, no business logic |
| `components/sections/` | landing sections (hero, services-grid, fleet-showcase, coverage-map, cta-quote, …) |
| `components/layout/` | navbar, footer, logo, page-header |
| `components/motion/` | Framer Motion wrappers: `Reveal`, `Stagger`/`StaggerItem`, `CountUp`, `Parallax` |
| `components/icon.tsx` | maps string `iconKey` → lucide icon |
| `components/image-frame.tsx` | `next/image` (fill) + consistent warm-grade overlay |
| `features/*/components/` | domain components (news-card, gallery-grid, team-grid, lead-form) |

## Domain modules (`features/`)

`features/content` (Service, NewsPost, GalleryItem, TeamMember, ClientLogo + marketing types),
`features/fleet` (FleetVehicle), `features/leads` (Lead + `leadFormSchema` Zod). **Types mirror the
Prisma schema** so the mock→DB swap is seamless.

## Data access (`lib/`)

- `lib/data/index.ts` — the **only** place components get data (ADR 0008).
- `lib/constants.ts` — COMPANY info, NAV_ITEMS, VALUES (COMPANY moves to CMS Settings later).
- `lib/fonts.ts` (Space Grotesk + Inter), `lib/format.ts`, `lib/utils.ts` (`cn`).

## Design tokens

Defined in `app/globals.css` `@theme` (Tailwind v4): `brand-orange #E8842B`, `brand-red #C41E2A`,
`brand-gold #DDA017`, `ink-900/950`, `surface #FAF8F4`, `steel`. Utilities: `.section-ink`,
`.grade-warm`, `.bg-grain`, `.rule-gold`, `.text-gradient-warm`. Fonts via CSS vars
`--font-inter`, `--font-space-grotesk`.

## ⚠️ Base UI, not Radix (critical convention)

shadcn here is built on **Base UI** (`@base-ui/react`), not Radix. Composition uses the **`render`
prop**, not `asChild`:

```tsx
// ✅ correct
<Button render={<Link href="/kontak" />}>Hubungi Kami</Button>
// ❌ wrong (Radix-ism, will not work)
<Button asChild><Link href="/kontak">…</Link></Button>
```

`components/ui/button.tsx` auto-sets `nativeButton={false}` when `render` is present so anchors keep
correct semantics. Sheet/Dialog are Base UI (`Popup`, `Backdrop`, controlled via `open`/`onOpenChange`).
`lucide-react` (current) **removed brand/social icons** (Facebook/Instagram/LinkedIn) — use text or
generic glyphs.

## Animation rules (PRD §4.3)

`transform`/`opacity` only, custom cubic-bezier `[0.22,1,0.36,1]`, 0.4–0.8s, respect
`prefers-reduced-motion` (all wrappers already do). Reveal-on-scroll + stagger; count-up stats;
parallax hero; coverage routes "draw".
