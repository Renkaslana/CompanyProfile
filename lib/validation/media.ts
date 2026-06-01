/**
 * Zod schemas for the Media Library (Phase 4 M4).
 *
 * Shared between the Server Actions in `app/admin/(auth)/media` and the
 * `/api/v1/admin/media/sign` route. Built on `lib/validation/common.ts`
 * primitives — keep field rules consistent across modules.
 */
import { z } from "zod";
import { optionalText, cuid } from "./common";

/** Folders mirror `MediaService.ALLOWED_FOLDERS`. Keep in sync if extended. */
export const MEDIA_FOLDERS = ["gallery", "fleet", "news", "about", "brand"] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

export const mediaFolderSchema = z.enum(MEDIA_FOLDERS);

/** Editable metadata on a MediaAsset row. Tags are comma/newline-separated in
 *  the UI; the action splits before validation. */
const tagsList = z
  .array(z.string().trim().min(1).max(40))
  .max(20, "Maksimum 20 tag per media.");

export const mediaUpdateSchema = z.object({
  alt: optionalText, // ≤500
  title: z.string().trim().max(120).optional().or(z.literal("")),
  tags: tagsList,
});
export type MediaUpdateInput = z.infer<typeof mediaUpdateSchema>;

/** Cloudinary upload-result payload posted back to `persistUploadAction`
 *  after the browser direct-uploads to Cloudinary. Validated server-side
 *  before persisting — never trust the client. */
export const mediaPersistSchema = z.object({
  publicId: z.string().trim().min(1).max(300),
  url: z.string().trim().url(),
  width: z.number().int().positive().max(20_000).nullable().optional(),
  height: z.number().int().positive().max(20_000).nullable().optional(),
  mimeType: z
    .string()
    .trim()
    // Accept both canonical MIME subtypes (`jpeg`, `svg+xml`) AND Cloudinary's
    // extension form (`jpg`, `svg`) so this validates even if the upstream
    // normalization in upload-form.tsx is ever bypassed.
    .regex(
      /^image\/(jpe?g|png|webp|avif|gif|svg(\+xml)?)$/i,
      "Only image MIME types are allowed (jpg, jpeg, png, webp, avif, gif, svg).",
    ),
  folder: mediaFolderSchema,
  alt: optionalText,
  title: z.string().trim().max(120).optional().or(z.literal("")),
  tags: tagsList.optional(),
});
export type MediaPersistInput = z.infer<typeof mediaPersistSchema>;

/** Cuid passed via formData (delete + update). */
export const mediaIdSchema = z.object({ id: cuid });

/** Parses the comma/newline-separated tag input field into a clean array. */
export function parseTagInput(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[\n,]/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}
