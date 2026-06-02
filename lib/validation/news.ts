/**
 * Zod schemas for the News CMS (Phase 4 M6).
 *
 * Built on `lib/validation/common.ts` primitives with Indonesian messages
 * so banner + inline-field errors read naturally. Mirrors the M5 service
 * schema structure exactly.
 *
 * Sanitization of the `body` field is performed by the Server Action BEFORE
 * Zod validates length — that way an editor whose HTML is stripped down to
 * nothing (e.g. only `<script>` tags) sees "Deskripsi minimal ...", not a
 * false-positive pass.
 */
import { z } from "zod";
import { entityId, mediaAssetId } from "./common";

/* ─── Field rules with Indonesian error messages ────────────────────── */

const title = z
  .string()
  .trim()
  .min(2, "Judul minimal 2 karakter.")
  .max(200, "Judul maksimal 200 karakter.");

const slug = z
  .string()
  .trim()
  .min(2, "Slug minimal 2 karakter.")
  .max(80, "Slug maksimal 80 karakter.")
  .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung.");

const excerpt = z
  .string()
  .trim()
  .min(2, "Excerpt minimal 2 karakter.")
  .max(500, "Excerpt maksimal 500 karakter.");

const body = z
  .string()
  .trim()
  .min(2, "Isi berita minimal 2 karakter.")
  .max(50_000, "Isi berita terlalu panjang.");

const category = z
  .string()
  .trim()
  .min(2, "Kategori minimal 2 karakter.")
  .max(60, "Kategori maksimal 60 karakter.");

const displayAuthor = z
  .string()
  .trim()
  .max(120, "Nama penulis maksimal 120 karakter.")
  .optional()
  .or(z.literal(""));

/* ─── Status enum ───────────────────────────────────────────────────── */

export const NEWS_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type NewsStatus = (typeof NEWS_STATUSES)[number];
export const newsStatusSchema = z.enum(NEWS_STATUSES, {
  message: "Status tidak valid.",
});

export const STATUS_LABEL: Record<NewsStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Diarsipkan",
};

/* ─── Create + Update schemas ───────────────────────────────────────── */

const baseFields = {
  title,
  slug,
  excerpt,
  body,
  category,
  displayAuthor,
  coverId: mediaAssetId.nullable().optional().or(z.literal("")),
};

export const newsCreateSchema = z.object({
  ...baseFields,
  publishImmediately: z.boolean().default(false),
});
export type NewsCreateInput = z.infer<typeof newsCreateSchema>;

export const newsUpdateSchema = z.object({ id: entityId, ...baseFields });
export type NewsUpdateInput = z.infer<typeof newsUpdateSchema>;

export const newsIdSchema = z.object({ id: entityId });

/* ─── Form state (for useActionState) ───────────────────────────────── */

export type NewsFormState = {
  ok: false;
  fieldErrors: Partial<Record<
    | "title"
    | "slug"
    | "excerpt"
    | "body"
    | "category"
    | "displayAuthor"
    | "coverId"
    | "publishImmediately",
    string[]
  >>;
  message: string;
  values: {
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    category: string;
    displayAuthor: string;
    coverId: string | null;
    publishImmediately: boolean;
  };
};
