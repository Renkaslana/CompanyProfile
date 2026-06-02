/**
 * Zod schemas for the Gallery CMS (Phase 4 M7).
 *
 * Mirrors the M5/M6 structure. Simpler: no slug, no status workflow,
 * no rich text. Required cover via MediaPicker.
 */
import { z } from "zod";
import { entityId, mediaAssetId } from "./common";

/* ─── Indonesian field rules ────────────────────────────────────────── */

const title = z
  .string()
  .trim()
  .min(2, "Judul minimal 2 karakter.")
  .max(200, "Judul maksimal 200 karakter.");

const category = z
  .string()
  .trim()
  .min(2, "Kategori minimal 2 karakter.")
  .max(60, "Kategori maksimal 60 karakter.");

const order = z
  .number({ message: "Urutan harus berupa angka." })
  .int("Urutan harus bilangan bulat.")
  .min(0, "Urutan tidak boleh negatif.")
  .max(10_000, "Urutan terlalu besar.");

/** Canonical category suggestions (rendered as a datalist hint; not enforced). */
export const GALLERY_CATEGORIES = [
  "Briefing",
  "Loading",
  "Pengiriman",
  "Warehouse",
  "Fleet",
] as const;

/* ─── Schemas ──────────────────────────────────────────────────────── */

const baseFields = {
  title,
  category,
  /** Required: every gallery item must reference a MediaAsset. */
  mediaId: mediaAssetId,
  order: order.default(0),
};

export const galleryCreateSchema = z.object({ ...baseFields });
export type GalleryCreateInput = z.infer<typeof galleryCreateSchema>;

export const galleryUpdateSchema = z.object({ id: entityId, ...baseFields });
export type GalleryUpdateInput = z.infer<typeof galleryUpdateSchema>;

export const galleryIdSchema = z.object({ id: entityId });

/* ─── Form state for useActionState ───────────────────────────────── */

export type GalleryFormState = {
  ok: false;
  fieldErrors: Partial<Record<"title" | "category" | "mediaId" | "order", string[]>>;
  message: string;
  values: {
    title: string;
    category: string;
    mediaId: string | null;
    order: string;
  };
};
