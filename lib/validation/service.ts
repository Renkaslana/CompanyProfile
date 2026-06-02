/**
 * Zod schemas for the Services CMS (Phase 4 M5).
 *
 * Built on `lib/validation/common.ts` primitives. Used by Server Actions in
 * `app/admin/(auth)/services` and by `server/services/service-cms.service.ts`.
 *
 * Field rules mirror the public-domain `Service` shape in `features/content/types.ts`
 * and the Prisma `Service` model. Cover image is optional at the schema level —
 * services without covers will render placeholders on the marketing site.
 */
import { z } from "zod";
import { entityId, mediaAssetId } from "./common";

/* ─── Field rules with Indonesian error messages (M5 — overrides the
 *     generic English-default rules from `common.ts` so the form banner
 *     reads naturally to admins). ─────────────────────────────────────── */

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

const summary = z
  .string()
  .trim()
  .min(2, "Ringkasan minimal 2 karakter.")
  .max(500, "Ringkasan maksimal 500 karakter.");

const longBody = z
  .string()
  .trim()
  .min(2, "Deskripsi minimal 2 karakter.")
  .max(50_000, "Deskripsi terlalu panjang.");

const iconKey = z
  .string()
  .trim()
  .min(1, "Icon wajib diisi (mis. Truck, Building2, Boxes).")
  .max(60, "Nama icon terlalu panjang.");

const order = z
  .number({ message: "Urutan harus berupa angka." })
  .int("Urutan harus bilangan bulat.")
  .min(0, "Urutan tidak boleh negatif.")
  .max(10_000, "Urutan terlalu besar.");

export const SERVICE_CATEGORIES = [
  "LOGISTICS",
  "TRANSPORTATION",
  "CAR_RENTAL",
  "GENERAL_TRADING",
] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const serviceCategorySchema = z.enum(SERVICE_CATEGORIES, {
  message: "Pilih salah satu kategori yang tersedia.",
});

/** Highlights: editors enter comma/newline-separated bullets; the action splits
 *  before validation. Each ≤120 chars, max 12 bullets per service. */
const highlightsList = z
  .array(
    z
      .string()
      .trim()
      .min(1, "Highlight tidak boleh kosong.")
      .max(120, "Setiap highlight maksimum 120 karakter."),
  )
  .max(12, "Maksimum 12 highlight per layanan.");

/** Shared base — used by create and update with `id` added for update. */
const baseFields = {
  title,
  slug,
  category: serviceCategorySchema,
  summary,
  body: longBody,
  iconKey,
  coverId: mediaAssetId.nullable().optional().or(z.literal("")),
  highlights: highlightsList.optional().default([]),
  order: order.default(0),
  published: z.boolean().default(false),
};

export const serviceCreateSchema = z.object({ ...baseFields });
export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;

export const serviceUpdateSchema = z.object({ id: entityId, ...baseFields });
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;

export const serviceIdSchema = z.object({ id: entityId });

/** Splits the highlight textarea input (comma OR newline separated). */
export function parseHighlights(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Friendly Indonesian labels for the category enum (used in selects). */
export const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  LOGISTICS: "Jasa Logistik",
  TRANSPORTATION: "Transportasi",
  CAR_RENTAL: "Rental Mobil",
  GENERAL_TRADING: "Perdagangan Umum",
};

/**
 * Form-state returned by the create / update Server Actions when validation
 * (or a business rule like slug-clash) fails. Consumed by the client form
 * via React 19's `useActionState`. Success path redirects, so success state
 * is never observed by the hook.
 */
export type ServiceFormState = {
  ok: false;
  /** Zod's flat per-field error map. Empty object when error is non-field. */
  fieldErrors: Partial<Record<
    | "title"
    | "slug"
    | "category"
    | "summary"
    | "body"
    | "iconKey"
    | "coverId"
    | "highlights"
    | "order"
    | "published",
    string[]
  >>;
  /** Top-of-form message — overall summary of the failure. */
  message: string;
  /** Echo of what the user submitted, so the form can re-populate after the
   *  re-render rather than reverting to defaults. */
  values: {
    title: string;
    slug: string;
    category: string;
    summary: string;
    body: string;
    iconKey: string;
    coverId: string | null;
    highlights: string;
    order: string;
    published: boolean;
  };
};

/** Zero-state object, used to seed `useActionState`. */
export const EMPTY_SERVICE_FORM_STATE: ServiceFormState | null = null;

