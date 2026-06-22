"use server";

/**
 * Public Server Action — accepts a lead-form submission from /kontak or
 * anywhere else the form is mounted, validates it server-side (Zod + honeypot),
 * persists via LeadService, and returns a form-state response shaped so the
 * client form can render either success or per-field errors.
 *
 * No authentication required — visitors are anonymous. Anti-abuse berlapis:
 * honeypot field `website` (bot naif) · rate-limit per-IP via Upstash
 * (fail-open) · Cloudflare Turnstile captcha (opsional, aktif bila key di-set).
 */
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { LeadService } from "@/server/services/lead.service";
import { checkPublicFormRateLimit } from "@/server/services/public-rate-limit";
import { verifyTurnstile } from "@/server/services/turnstile";
import {
  leadSubmitSchema,
  type LeadFormState,
  type LeadSubmitInput,
} from "@/lib/validation/lead";
import type { Prisma } from "@prisma/client";

function readString(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

export async function submitLeadAction(
  _prev: LeadFormState | null,
  formData: FormData,
): Promise<LeadFormState> {
  const raw = {
    name: readString(formData, "name"),
    company: readString(formData, "company"),
    email: readString(formData, "email"),
    phone: readString(formData, "phone"),
    service: readString(formData, "service"),
    message: readString(formData, "message"),
    website: readString(formData, "website"), // honeypot
  };

  /** Snapshot of the user-entered values for echo-on-error. Loosely typed
   *  (Partial<LeadSubmitInput>) so we can echo whatever the visitor typed even
   *  if it's not the enum shape. */
  const echoValues: Partial<LeadSubmitInput> = {
    name: raw.name,
    company: raw.company,
    email: raw.email,
    phone: raw.phone,
    message: raw.message,
  };

  // Rate-limit per IP (fail-open bila Upstash tak dikonfigurasi).
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";
  const rl = await checkPublicFormRateLimit(ip);
  if (!rl.allowed) {
    return {
      ok: false,
      fieldErrors: {},
      message:
        "Terlalu banyak pengajuan dalam waktu singkat. Mohon coba lagi beberapa menit lagi, atau hubungi kami via WhatsApp.",
      values: echoValues,
    };
  }

  // Captcha Turnstile (dilewati bila tak dikonfigurasi — lihat verifyTurnstile).
  const captchaOk = await verifyTurnstile(
    readString(formData, "cf-turnstile-response"),
    ip,
  );
  if (!captchaOk) {
    return {
      ok: false,
      fieldErrors: {},
      message:
        "Verifikasi keamanan gagal. Mohon muat ulang halaman lalu coba lagi, atau hubungi kami via WhatsApp.",
      values: echoValues,
    };
  }

  const parsed = leadSubmitSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof LeadSubmitInput, string[]>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string") {
        const k = key as keyof LeadSubmitInput;
        (fieldErrors[k] ??= []).push(issue.message);
      }
    }
    return {
      ok: false,
      fieldErrors,
      message: "Mohon periksa kembali isian formulir.",
      values: echoValues,
    };
  }

  const data = parsed.data;

  try {
    // Optional source tag — caller may add `<input type="hidden" name="source">`
    const source = readString(formData, "source") || "kontak";
    const lead = await LeadService.submit({
      name: data.name,
      company: data.company ? data.company : null,
      email: data.email,
      phone: data.phone ? data.phone : null,
      service: (data.service || null) as Prisma.LeadCreateInput["service"],
      message: data.message,
      source,
    });

    // Revalidate the admin list so an admin who happens to be looking at
    // /admin/leads sees the new row on next render.
    revalidatePath("/admin/leads");
    revalidatePath("/admin");

    return { ok: true, leadId: lead.id };
  } catch (e) {
    console.error("[submitLeadAction] persist failed", e);
    return {
      ok: false,
      fieldErrors: {},
      message:
        "Terjadi kesalahan saat menyimpan permintaan Anda. Mohon coba lagi atau hubungi kami via WhatsApp.",
      values: echoValues,
    };
  }
}
