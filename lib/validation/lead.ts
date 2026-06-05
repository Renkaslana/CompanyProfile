/**
 * Server-side validation for the public lead form (Phase 4 follow-up).
 *
 * Mirrors `features/leads/types.ts` (client-side schema) but tightens limits
 * and adds normalization. Used by the Server Action — never trust client.
 *
 * Honeypot anti-spam: a hidden field `website` (named to attract bots, hidden
 * via CSS) must be empty. Real users never fill it; spam bots auto-complete
 * every field they see.
 */
import { z } from "zod";

export const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CLOSED"] as const;
export type LeadStatusValue = (typeof LEAD_STATUSES)[number];

export const SERVICE_CATEGORIES = [
  "LOGISTICS",
  "TRANSPORTATION",
  "CAR_RENTAL",
  "GENERAL_TRADING",
] as const;

export const leadSubmitSchema = z.object({
  name: z
    .string({ message: "Nama wajib diisi." })
    .trim()
    .min(2, "Nama minimal 2 karakter.")
    .max(120, "Nama terlalu panjang."),
  company: z
    .string()
    .trim()
    .max(160, "Nama perusahaan terlalu panjang.")
    .optional()
    .or(z.literal("")),
  email: z
    .string({ message: "Email wajib diisi." })
    .trim()
    .toLowerCase()
    .email("Format email tidak valid.")
    .max(254),
  phone: z
    .string()
    .trim()
    .min(8, "Nomor telepon tidak valid.")
    .max(40, "Nomor telepon terlalu panjang.")
    .regex(/^[+0-9 ()-]+$/, "Nomor telepon hanya boleh angka, spasi, ( ) - atau +.")
    .optional()
    .or(z.literal("")),
  service: z.enum(SERVICE_CATEGORIES).optional().or(z.literal("")),
  message: z
    .string({ message: "Pesan wajib diisi." })
    .trim()
    .min(10, "Mohon jelaskan kebutuhan Anda (min. 10 karakter).")
    .max(2000, "Pesan terlalu panjang (maks. 2000 karakter)."),
  /** Honeypot — must be empty. Real users never see/fill this field. */
  website: z
    .string()
    .max(0, "Spam terdeteksi.")
    .optional()
    .or(z.literal("")),
});

export type LeadSubmitInput = z.infer<typeof leadSubmitSchema>;

/** Status update validation for the admin action. */
export const leadUpdateStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(LEAD_STATUSES),
});

/** Indonesian labels for the status enum. */
export const LEAD_STATUS_LABEL: Record<LeadStatusValue, string> = {
  NEW: "Baru",
  CONTACTED: "Sudah dihubungi",
  QUALIFIED: "Berpotensi",
  CLOSED: "Selesai",
};

/** Form state for the public Server Action. */
export type LeadFormState =
  | {
      ok: true;
      leadId: string;
    }
  | {
      ok: false;
      fieldErrors: Partial<Record<keyof LeadSubmitInput, string[]>>;
      message: string;
      values: Partial<LeadSubmitInput>;
    };
