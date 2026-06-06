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
import { mediaAssetId } from "./common";

/* ─── Customer Support guided panel topics ─────────────────────────── */

/**
 * Fixed taxonomy of topics surfaced as chips inside the guided Customer
 * Support panel. Adding a new topic = append here + add a label in
 * `SUPPORT_TOPIC_LABEL` below. Removing or renaming is a breaking change for
 * existing FAQ rows (Zod will reject persisted JSON with an unknown topic).
 */
export const SUPPORT_TOPICS = [
  "CARA_MEMESAN",
  "LAYANAN",
  "WILAYAH_OPERASIONAL",
  "HARGA_PENAWARAN",
  "ARMADA_TRANSPORTASI",
  "RENTAL_KENDARAAN",
  "KERJA_SAMA_BISNIS",
  "KARIR",
  "KONTAK_PERUSAHAAN",
] as const;

export type SupportTopic = (typeof SUPPORT_TOPICS)[number];

/**
 * **Admin-facing** label — shown in the Settings form topic dropdown when an
 * editor assigns an FAQ entry to a category. Kept in noun-phrase form so it
 * reads as a *category*, not a question.
 */
export const SUPPORT_TOPIC_LABEL: Record<SupportTopic, string> = {
  CARA_MEMESAN: "Cara Memesan",
  LAYANAN: "Layanan yang Tersedia",
  WILAYAH_OPERASIONAL: "Wilayah Operasional",
  HARGA_PENAWARAN: "Harga & Penawaran",
  ARMADA_TRANSPORTASI: "Armada & Transportasi",
  RENTAL_KENDARAAN: "Rental Kendaraan",
  KERJA_SAMA_BISNIS: "Kerja Sama Bisnis",
  KARIR: "Karir",
  KONTAK_PERUSAHAAN: "Kontak Perusahaan",
};

/**
 * **Visitor-facing** label — shown in the Tanya BMI panel as topic chips
 * and as the user-bubble text after selection. In conversational question
 * form so the panel feels like a chat, not a category list.
 */
export const SUPPORT_TOPIC_QUESTION: Record<SupportTopic, string> = {
  CARA_MEMESAN: "Bagaimana cara memesan layanan?",
  LAYANAN: "Layanan apa saja yang tersedia?",
  WILAYAH_OPERASIONAL: "Wilayah operasional BMI di mana?",
  HARGA_PENAWARAN: "Bagaimana cara meminta penawaran?",
  ARMADA_TRANSPORTASI: "Armada apa saja yang tersedia?",
  RENTAL_KENDARAAN: "Apakah ada layanan rental kendaraan?",
  KERJA_SAMA_BISNIS: "Bagaimana model kerja sama bisnis?",
  KARIR: "Bagaimana cara melamar pekerjaan?",
  KONTAK_PERUSAHAAN: "Bagaimana cara menghubungi BMI?",
};

/**
 * After an answer is shown, render these 2–3 topics as "related question"
 * chips so visitors can explore without bouncing back to the main grid.
 * Curated by topical adjacency — not algorithmic.
 */
export const SUPPORT_TOPIC_RELATED: Record<SupportTopic, SupportTopic[]> = {
  CARA_MEMESAN: ["HARGA_PENAWARAN", "LAYANAN", "KONTAK_PERUSAHAAN"],
  LAYANAN: ["ARMADA_TRANSPORTASI", "RENTAL_KENDARAAN", "HARGA_PENAWARAN"],
  WILAYAH_OPERASIONAL: ["ARMADA_TRANSPORTASI", "HARGA_PENAWARAN", "CARA_MEMESAN"],
  HARGA_PENAWARAN: ["CARA_MEMESAN", "LAYANAN", "KONTAK_PERUSAHAAN"],
  ARMADA_TRANSPORTASI: ["WILAYAH_OPERASIONAL", "RENTAL_KENDARAAN", "HARGA_PENAWARAN"],
  RENTAL_KENDARAAN: ["ARMADA_TRANSPORTASI", "HARGA_PENAWARAN", "KERJA_SAMA_BISNIS"],
  KERJA_SAMA_BISNIS: ["LAYANAN", "HARGA_PENAWARAN", "KONTAK_PERUSAHAAN"],
  KARIR: ["KONTAK_PERUSAHAAN", "LAYANAN"],
  KONTAK_PERUSAHAAN: ["CARA_MEMESAN", "HARGA_PENAWARAN"],
};

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

  // ─ Phase 4 M10: testimonials + legal pages ─────────────────────────
  /**
   * Up to 6 client testimonials shown in a homepage band between the
   * Clients/Partners section and Certifications.
   */
  testimonials: z
    .array(
      z.object({
        quote: shortString(10, 500, "Kutipan"),
        name: shortString(2, 80, "Nama"),
        role: shortString(2, 100, "Jabatan"),
        company: z.string().trim().max(100).optional().or(z.literal("")),
        avatarMediaId: mediaAssetId.nullable().optional().or(z.literal("")),
      }),
    )
    .max(6, "Maksimum 6 testimoni.")
    .optional()
    .default([]),

  /** Privacy policy body (sanitized HTML). Optional — `/privasi` shows a
   *  placeholder if empty. */
  privacyPolicy: z
    .string()
    .trim()
    .max(50_000, "Kebijakan privasi terlalu panjang.")
    .optional()
    .or(z.literal("")),

  /** Terms & conditions body (sanitized HTML). Optional — `/syarat-ketentuan`
   *  shows a placeholder if empty. */
  termsAndConditions: z
    .string()
    .trim()
    .max(50_000, "Syarat & ketentuan terlalu panjang.")
    .optional()
    .or(z.literal("")),

  // ─ Support cleanup follow-up: FAQ + support hours ───────────────────
  /**
   * Lightweight FAQ — max 15 question/answer pairs powering the guided
   * Customer Support panel (triggered from the header). Items are grouped by
   * `topic` at render time. Answers are plain text (no HTML).
   */
  faq: z
    .array(
      z.object({
        topic: z.enum(SUPPORT_TOPICS).default("KONTAK_PERUSAHAAN"),
        question: shortString(5, 200, "Pertanyaan"),
        answer: z
          .string()
          .trim()
          .min(10, "Jawaban minimal 10 karakter.")
          .max(2000, "Jawaban terlalu panjang."),
      }),
    )
    .max(15, "Maksimum 15 pertanyaan.")
    .optional()
    .default([]),

  /**
   * Custom support availability text shown in the Support Widget header
   * (e.g. "Senin–Sabtu 08.00–17.00 WIB"). Falls back to `operationalHours`
   * when empty.
   */
  supportHours: z
    .string()
    .trim()
    .max(160, "Teks jam support maksimum 160 karakter.")
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
