/**
 * Zod schemas for the Stats CMS (Phase 4 M9).
 *
 * Stats are a fixed-size 4-row table — keys (`fleet_units`, `shipments`,
 * `availability`, `clients`) are immutable; only label/value/suffix/source
 * are editable. `source = DERIVED` freezes value+label as read-only
 * (door open for future operational-system integration; no integration
 * code today).
 */
import { z } from "zod";

const label = z
  .string()
  .trim()
  .min(2, "Label minimal 2 karakter.")
  .max(60, "Label maksimal 60 karakter.");

const value = z
  .number({ message: "Nilai harus angka." })
  .int("Nilai harus bilangan bulat.")
  .min(0, "Nilai tidak boleh negatif.")
  .max(9_999_999, "Nilai terlalu besar.");

const suffix = z
  .string()
  .trim()
  .max(8, "Suffix maksimal 8 karakter.")
  .optional()
  .or(z.literal(""));

const key = z
  .string()
  .trim()
  .min(2)
  .max(40)
  .regex(/^[a-z0-9_]+$/, "Key hanya boleh huruf kecil, angka, dan underscore.");

const source = z.enum(["MANUAL", "DERIVED"], {
  message: "Source tidak valid.",
});

export const statUpdateSchema = z.object({
  key,
  label,
  value,
  suffix,
  source,
});
export type StatUpdateInput = z.infer<typeof statUpdateSchema>;

export const statReorderSchema = z.object({
  key,
  direction: z.enum(["up", "down"]),
});

export type StatFormState = {
  ok: false;
  fieldErrors: Partial<Record<"label" | "value" | "suffix" | "source", string[]>>;
  message: string;
  /** Which stat key the failure was for (used to re-paint inline error on the right row). */
  key: string;
  values: {
    label: string;
    value: string;
    suffix: string;
    source: "MANUAL" | "DERIVED";
  };
};
