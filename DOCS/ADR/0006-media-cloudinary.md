# ADR 0006 — Media storage: Cloudinary

- **Status:** Accepted
- **Date:** 2026-05-29

## Context

This is a photo-heavy premium site (hero, fleet, gallery, news). We need storage + CDN + image
optimization/transforms + a manageable media library, integrating with `next/image`.

## Decision

Use **Cloudinary**. Uploads are performed from the server via **signed** upload params (never raw
client uploads). Store the resulting metadata in the `MediaAsset` table (publicId, url, alt,
width, height, mime). Serve via `next/image` with Cloudinary as the source.

## Alternatives considered

- **Supabase Storage** — natural if the DB were Supabase; weaker transforms. (We chose Neon, so
  Cloudinary is the better pairing.)
- **UploadThing** — easiest DX but a thin wrapper with less control and scaling cost.

## Consequences

- ✅ Best-in-class transforms (can normalize the warm grade), global CDN, good free tier, media UI.
- ✅ Server-signed uploads + MIME/size validation keep uploads safe.
- ⚠️ Separate vendor + API keys (server-only env). Track transformation usage to control cost.
