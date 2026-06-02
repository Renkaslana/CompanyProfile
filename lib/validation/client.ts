/**
 * Zod schemas for the Clients CMS (Phase 4 M8).
 *
 * ClientLogo has: id, name, sector?, logoId? (optional MediaPicker),
 * url?, order. No publish workflow.
 */
import { z } from "zod";
import { entityId, mediaAssetId } from "./common";

const name = z
  .string()
  .trim()
  .min(2, "Nama minimal 2 karakter.")
  .max(120, "Nama maksimal 120 karakter.");

const sector = z
  .string()
  .trim()
  .max(60, "Sektor maksimal 60 karakter.")
  .optional()
  .or(z.literal(""));

const url = z
  .string()
  .trim()
  .url("URL tidak valid.")
  .max(500)
  .optional()
  .or(z.literal(""));

const order = z
  .number({ message: "Urutan harus berupa angka." })
  .int("Urutan harus bilangan bulat.")
  .min(0, "Urutan tidak boleh negatif.")
  .max(10_000, "Urutan terlalu besar.");

const baseFields = {
  name,
  sector,
  url,
  /** Optional — fallback is monochrome wordmark on the public page. */
  logoId: mediaAssetId.nullable().optional().or(z.literal("")),
  order: order.default(0),
};

export const clientCreateSchema = z.object({ ...baseFields });
export type ClientCreateInput = z.infer<typeof clientCreateSchema>;

export const clientUpdateSchema = z.object({ id: entityId, ...baseFields });
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;

export const clientIdSchema = z.object({ id: entityId });

export type ClientFormState = {
  ok: false;
  fieldErrors: Partial<Record<
    "name" | "sector" | "url" | "logoId" | "order",
    string[]
  >>;
  message: string;
  values: {
    name: string;
    sector: string;
    url: string;
    logoId: string | null;
    order: string;
  };
};
