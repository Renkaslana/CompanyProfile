/**
 * Media mapping helpers — shared by every service that resolves
 * `coverId` / `photoIds` / `mediaId` / `logoId` references into frontend
 * `MediaRef` values.
 *
 * Layer note (BACKEND_STRUCTURE.md): mappers are server-only helpers used by
 * the service layer. The pure transforms (`toMediaRef*`, `indexById`) have no
 * I/O; `fetchMediaForIds` is the one async helper here because it's the same
 * batched lookup every service needs (single `findMany ... WHERE id IN (...)`).
 */
import "server-only";
import type { MediaAsset } from "@prisma/client";
import type { MediaRef } from "@/features/content/types";
import { MediaRepository } from "@/server/repositories/media.repository";

/**
 * Sentinel returned when a content row references a media id that's missing.
 * This is a *defensive* path: today every seeded reference resolves; the
 * sentinel only fires if Phase-4 CMS workflows ever produce a dangling id
 * (the MediaService delete-guard prevents that in normal operation).
 */
const MEDIA_SENTINEL: MediaRef = { src: "/brand/logo.png", alt: "" };

/**
 * Map a `MediaAsset` row to the frontend `MediaRef`. Returns the sentinel
 * (and emits a dev-only warning) when the asset is missing — never throws.
 *
 * `width` / `height` are only included when non-null so the serialized shape
 * matches the historical mock shape exactly (mock objects didn't carry these).
 */
export function toMediaRef(asset: MediaAsset | null | undefined): MediaRef {
  if (!asset) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[media.mapper] missing MediaAsset — returning sentinel; expected during dev only",
      );
    }
    return { ...MEDIA_SENTINEL };
  }
  const ref: MediaRef = { src: asset.url, alt: asset.alt ?? "" };
  if (asset.width !== null) ref.width = asset.width;
  if (asset.height !== null) ref.height = asset.height;
  return ref;
}

/**
 * Same as `toMediaRef` but for *optional* MediaRef fields
 * (`TeamMember.photo`, `ClientLogo.logo`). Returns `undefined` when the
 * id is absent or the asset is missing — caller should omit the property.
 */
export function toMediaRefOrUndefined(
  asset: MediaAsset | null | undefined,
): MediaRef | undefined {
  if (!asset) return undefined;
  const ref: MediaRef = { src: asset.url, alt: asset.alt ?? "" };
  if (asset.width !== null) ref.width = asset.width;
  if (asset.height !== null) ref.height = asset.height;
  return ref;
}

/** Index `MediaAsset[]` by id for O(1) lookup. */
export function indexById(assets: MediaAsset[]): Map<string, MediaAsset> {
  return new Map(assets.map((a) => [a.id, a]));
}

/**
 * Fetch every referenced `MediaAsset` in one batched query and return them as
 * a `Map<id, asset>`. Deduplicates input ids and filters out null/undefined.
 * Empty input → no query, empty map.
 *
 * Pattern: a service first calls its repository to get content rows, then
 * calls `fetchMediaForIds(rows.map(r => r.coverId))` once, then maps each row.
 * Total round-trips: 2 (content rows + batched media), regardless of list size.
 */
export async function fetchMediaForIds(
  ids: (string | null | undefined)[],
): Promise<Map<string, MediaAsset>> {
  const unique = [
    ...new Set(ids.filter((id): id is string => typeof id === "string" && id.length > 0)),
  ];
  if (unique.length === 0) return new Map();
  const assets = await MediaRepository.findManyById(unique);
  return indexById(assets);
}
