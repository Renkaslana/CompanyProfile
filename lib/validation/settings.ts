/**
 * Zod schemas for the Site Settings CMS (Phase 4 M9).
 *
 * The `SiteSettings` table has two JSON columns: `company` (entity info,
 * contact, story, visi/misi, socials) and `values` (the 4 core values).
 *
 * Public consumers read via `getSiteSettings()` (server/services/content
 * via lib/data) which overlays the JSON onto the static `COMPANY` /
 * `VALUES` constants for backward-compat.
 */
import { z } from "zod";

/* ─── Reusable field rules with Indonesian messages ────────────────── */

const shortString = (min: number, max: number, label: string) =>
  z.string().trim().min(min, `${label} minimal ${min} karakter.`).max(max, `${label} maksimal ${max} karakter.`);

const optionalUrl = z
  .string()
  .trim()
  .url("URL tidak valid.")
  .max(500)
  .optional()
  .or(z.literal(""));

/* ─── company.story ──────────────────────────────────────────────── */

export const storySchema = z.object({
  headline: shortString(2, 200, "Judul cerita"),
  paragraphs: z
    .array(shortString(2, 1000, "Paragraf"))
    .min(1, "Minimal 1 paragraf.")
    .max(4, "Maksimum 4 paragraf."),
});
export type Story = z.infer<typeof storySchema>;

/* ─── company.values (Core Values) ───────────────────────────────── */

export const valueItemSchema = z.object({
  title: shortString(2, 40, "Judul nilai"),
  description: shortString(2, 300, "Deskripsi nilai"),
  iconKey: z.string().trim().max(60).optional().or(z.literal("")),
});
export type ValueItem = z.infer<typeof valueItemSchema>;

export const valuesArraySchema = z
  .array(valueItemSchema)
  .min(2, "Minimal 2 nilai.")
  .max(6, "Maksimum 6 nilai.");

/* ─── company JSON (identitas + alamat + kontak + jam + visi/misi + story + legal + socials) ─── */

export const companyJsonSchema = z.object({
  // Identitas
  legalName: shortString(2, 200, "Nama legal"),
  shortName: shortString(2, 60, "Nama pendek"),
  tagline: shortString(2, 300, "Tagline"),
  foundedYear: z
    .number({ message: "Tahun harus angka." })
    .int()
    .min(1900, "Tahun terlalu kecil.")
    .max(new Date().getFullYear() + 1, "Tahun terlalu besar."),

  // Story
  story: storySchema,

  // Vision
  visi: shortString(2, 500, "Visi"),

  // Mission
  misi: z
    .array(shortString(2, 200, "Misi"))
    .min(1, "Minimal 1 misi.")
    .max(6, "Maksimum 6 misi."),

  // Address
  address: shortString(2, 300, "Alamat"),
  city: shortString(2, 100, "Kota"),
  province: shortString(2, 100, "Provinsi"),
  postalCode: z.string().trim().min(2).max(20, "Kode pos maksimal 20 karakter."),
  country: shortString(2, 100, "Negara"),

  // Contact
  phone: shortString(2, 40, "Telepon"),
  whatsapp: shortString(2, 40, "WhatsApp"),
  email: z.string().trim().email("Email tidak valid.").max(254),

  // Business hours
  operationalHours: shortString(2, 200, "Jam operasional"),

  /**
   * Google Maps embed URL (Phase 4 M9.5). Optional. Paste from Google Maps →
   * Share → "Embed a map" → copy the URL from the iframe `src` attribute.
   * Expected host: `https://www.google.com/maps/embed?...`.
   * When set, `/kontak` renders an embedded iframe; when empty, the page
   * shows the styled placeholder + Google Maps search link as before.
   */
  mapEmbedUrl: z
    .string()
    .trim()
    .url("URL Google Maps tidak valid.")
    .max(2000)
    .refine(
      (url) => url === "" || url.includes("google.com/maps/embed"),
      "URL harus dari Google Maps embed (mulai dengan https://www.google.com/maps/embed).",
    )
    .optional()
    .or(z.literal("")),

  // Legal
  legal: z.object({
    entity: shortString(2, 100, "Bentuk badan"),
    nib: shortString(2, 60, "NIB"),
    npwp: shortString(2, 60, "NPWP"),
  }),

  // Socials — all URLs optional
  socials: z.object({
    instagram: optionalUrl,
    linkedin: optionalUrl,
    facebook: optionalUrl,
    youtube: optionalUrl,
    tiktok: optionalUrl,
  }),
});
export type CompanyJson = z.infer<typeof companyJsonSchema>;

/* ─── Form state ─────────────────────────────────────────────────── */

/** All field error keys flattened by dot-path for inline error display. */
type FieldErrorMap = Record<string, string[]>;

export type SettingsFormState = {
  ok: false;
  fieldErrors: FieldErrorMap;
  message: string;
  values: {
    /** Stringified JSON of company so the form can rehydrate after error. */
    companyJson: string;
    /** Stringified JSON of values array. */
    valuesJson: string;
  };
};

// Re-export schema names used by the action
export const settingsSaveSchema = z.object({
  company: companyJsonSchema,
  values: valuesArraySchema,
});
export type SettingsSaveInput = z.infer<typeof settingsSaveSchema>;
