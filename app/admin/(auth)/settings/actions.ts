"use server";

/**
 * Settings CMS Server Actions (Phase 4 M9).
 *
 * The form posts the entire `company` JSON + `values` array as encoded
 * strings (because nested arrays/objects don't survive FormData natively).
 * Action parses, validates via Zod, then writes the singleton row.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/server/auth/guards";
import { SettingsCmsService } from "@/server/services/settings-cms.service";
import {
  settingsSaveSchema,
  type SettingsFormState,
} from "@/lib/validation/settings";

function isNextRedirect(e: unknown): boolean {
  return Boolean((e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT"));
}

function revalidatePublic() {
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/tentang");
  revalidatePath("/kontak");
  revalidatePath("/karir");
  revalidatePath("/bantuan");
  revalidatePath("/privasi");
  revalidatePath("/syarat-ketentuan");
}

function buildSummaryMessage(fieldErrors: Record<string, string[]>): string {
  const entries = Object.entries(fieldErrors);
  if (entries.length === 0) return "Form tidak valid.";
  // Pretty top-level labels for the common paths.
  const labels: Record<string, string> = {
    "company.legalName": "Nama legal",
    "company.shortName": "Nama pendek",
    "company.tagline": "Tagline",
    "company.foundedYear": "Tahun berdiri",
    "company.story.headline": "Judul cerita",
    "company.story.paragraphs": "Paragraf cerita",
    "company.visi": "Visi",
    "company.misi": "Misi",
    "company.address": "Alamat",
    "company.email": "Email",
    "company.phone": "Telepon",
    "company.whatsapp": "WhatsApp",
    "company.operationalHours": "Jam operasional",
    "values": "Core Values",
  };
  const list = entries.map(([k]) => labels[k] ?? k).slice(0, 3).join(", ");
  const more = entries.length > 3 ? `, dan ${entries.length - 3} lainnya` : "";
  return `Form tidak valid. Periksa kembali: ${list}${more}.`;
}

export async function updateSettingsAction(
  _prev: SettingsFormState | null,
  formData: FormData,
): Promise<SettingsFormState | null> {
  const session = await requirePermission("settings:write");

  const companyJson = (formData.get("companyJson") as string | null) ?? "";
  const valuesJson = (formData.get("valuesJson") as string | null) ?? "";

  let company: unknown;
  let values: unknown;
  try {
    company = JSON.parse(companyJson);
  } catch {
    return {
      ok: false,
      fieldErrors: { "companyJson": ["Format JSON identitas perusahaan tidak valid."] },
      message: "JSON identitas perusahaan rusak.",
      values: { companyJson, valuesJson },
    };
  }
  try {
    values = JSON.parse(valuesJson);
  } catch {
    return {
      ok: false,
      fieldErrors: { "valuesJson": ["Format JSON nilai inti tidak valid."] },
      message: "JSON nilai inti rusak.",
      values: { companyJson, valuesJson },
    };
  }

  const parsed = settingsSaveSchema.safeParse({ company, values });
  if (!parsed.success) {
    // Flatten with full dotted paths so per-field UI can resolve them.
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.map(String).join(".");
      (fieldErrors[path] ??= []).push(issue.message);
    }
    console.error("[updateSettingsAction] validation failed", fieldErrors);
    return {
      ok: false,
      fieldErrors,
      message: buildSummaryMessage(fieldErrors),
      values: { companyJson, valuesJson },
    };
  }

  try {
    await SettingsCmsService.update(parsed.data, session);
    revalidatePublic();
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    return {
      ok: false,
      fieldErrors: {},
      message: e instanceof Error ? e.message : "Terjadi kesalahan tak terduga.",
      values: { companyJson, valuesJson },
    };
  }
  redirect("/admin/settings?updated=edited");
}
