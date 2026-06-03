/**
 * Zod schemas for the Team CMS (Phase 4 M8).
 *
 * TeamMember has: id, name, role, photoId? (optional MediaPicker), order.
 * No slug, no publish workflow, no rich text.
 */
import { z } from "zod";
import { entityId, mediaAssetId } from "./common";

const name = z
  .string()
  .trim()
  .min(2, "Nama minimal 2 karakter.")
  .max(120, "Nama maksimal 120 karakter.");

const role = z
  .string()
  .trim()
  .min(2, "Jabatan minimal 2 karakter.")
  .max(120, "Jabatan maksimal 120 karakter.");

const bio = z
  .string()
  .trim()
  .max(500, "Bio maksimal 500 karakter.")
  .optional()
  .or(z.literal(""));

const order = z
  .number({ message: "Urutan harus berupa angka." })
  .int("Urutan harus bilangan bulat.")
  .min(0, "Urutan tidak boleh negatif.")
  .max(10_000, "Urutan terlalu besar.");

const baseFields = {
  name,
  role,
  bio,
  /** Optional — fallback is initials avatar on the public page. */
  photoId: mediaAssetId.nullable().optional().or(z.literal("")),
  order: order.default(0),
};

export const teamCreateSchema = z.object({ ...baseFields });
export type TeamCreateInput = z.infer<typeof teamCreateSchema>;

export const teamUpdateSchema = z.object({ id: entityId, ...baseFields });
export type TeamUpdateInput = z.infer<typeof teamUpdateSchema>;

export const teamIdSchema = z.object({ id: entityId });

export type TeamFormState = {
  ok: false;
  fieldErrors: Partial<Record<"name" | "role" | "bio" | "photoId" | "order", string[]>>;
  message: string;
  values: {
    name: string;
    role: string;
    bio: string;
    photoId: string | null;
    order: string;
  };
};
