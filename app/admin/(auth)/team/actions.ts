"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/server/auth/guards";
import {
  TeamCmsService,
  TeamNotFoundError,
} from "@/server/services/team-cms.service";
import {
  teamCreateSchema,
  teamUpdateSchema,
  teamIdSchema,
  type TeamFormState,
} from "@/lib/validation/team";

function isNextRedirect(e: unknown): boolean {
  return Boolean((e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT"));
}
function mapErrorCode(err: unknown): string {
  if (err instanceof TeamNotFoundError) return "not_found";
  return "unknown";
}
function revalidatePublic() {
  revalidatePath("/admin/team");
  revalidatePath("/");
  revalidatePath("/tentang");
}
function readForm(formData: FormData) {
  return {
    name: (formData.get("name") as string | null)?.trim() ?? "",
    role: (formData.get("role") as string | null)?.trim() ?? "",
    photoIdRaw: ((formData.get("photoId") as string | null) ?? "").trim(),
    orderRaw: (formData.get("order") as string | null) ?? "",
  };
}
function buildSummary(fe: TeamFormState["fieldErrors"]): string {
  const entries = Object.entries(fe);
  if (entries.length === 0) return "Form tidak valid.";
  const labels: Record<string, string> = {
    name: "Nama",
    role: "Jabatan",
    photoId: "Foto",
    order: "Urutan",
  };
  const list = entries.map(([k]) => labels[k] ?? k).slice(0, 3).join(", ");
  const more = entries.length > 3 ? `, dan ${entries.length - 3} lainnya` : "";
  return `Form tidak valid. Periksa kembali: ${list}${more}.`;
}

export async function createTeamAction(
  _prev: TeamFormState | null,
  formData: FormData,
): Promise<TeamFormState | null> {
  const session = await requirePermission("content:write");
  const v = readForm(formData);
  const echo: TeamFormState["values"] = {
    name: v.name,
    role: v.role,
    photoId: v.photoIdRaw || null,
    order: v.orderRaw,
  };
  const parsed = teamCreateSchema.safeParse({
    name: v.name,
    role: v.role,
    photoId: v.photoIdRaw || null,
    order: Number(v.orderRaw || 0) || 0,
  });
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as TeamFormState["fieldErrors"];
    console.error("[createTeamAction] validation failed", fieldErrors);
    return { ok: false, fieldErrors, message: buildSummary(fieldErrors), values: echo };
  }
  try {
    await TeamCmsService.create(
      { ...parsed.data, photoId: parsed.data.photoId ? parsed.data.photoId : null },
      session,
    );
    revalidatePublic();
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    return { ok: false, fieldErrors: {}, message: e instanceof Error ? e.message : "Terjadi kesalahan.", values: echo };
  }
  redirect("/admin/team?updated=created");
}

export async function updateTeamAction(
  _prev: TeamFormState | null,
  formData: FormData,
): Promise<TeamFormState | null> {
  const session = await requirePermission("content:write");
  const id = (formData.get("id") as string | null)?.trim() ?? "";
  if (!id) redirect("/admin/team?error=missing");
  const v = readForm(formData);
  const echo: TeamFormState["values"] = {
    name: v.name,
    role: v.role,
    photoId: v.photoIdRaw || null,
    order: v.orderRaw,
  };
  const parsed = teamUpdateSchema.safeParse({
    id,
    name: v.name,
    role: v.role,
    photoId: v.photoIdRaw || null,
    order: Number(v.orderRaw || 0) || 0,
  });
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as TeamFormState["fieldErrors"];
    console.error("[updateTeamAction] validation failed", fieldErrors);
    return { ok: false, fieldErrors, message: buildSummary(fieldErrors), values: echo };
  }
  try {
    await TeamCmsService.update(
      id,
      {
        name: parsed.data.name,
        role: parsed.data.role,
        photoId: parsed.data.photoId ? parsed.data.photoId : null,
        order: parsed.data.order,
      },
      session,
    );
    revalidatePublic();
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    if (e instanceof TeamNotFoundError) redirect("/admin/team?error=not_found");
    return { ok: false, fieldErrors: {}, message: e instanceof Error ? e.message : "Terjadi kesalahan.", values: echo };
  }
  redirect("/admin/team?updated=edited");
}

export async function deleteTeamAction(formData: FormData) {
  const session = await requirePermission("content:write");
  const parsed = teamIdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) redirect("/admin/team?error=missing");
  const id = parsed.success ? parsed.data.id : "";
  try {
    await TeamCmsService.delete(id, session);
    revalidatePublic();
    redirect("/admin/team?updated=deleted");
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    redirect(`/admin/team?error=${mapErrorCode(e)}`);
  }
}

export async function reorderTeamAction(formData: FormData) {
  const session = await requirePermission("content:write");
  const parsed = teamIdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) redirect("/admin/team?error=missing");
  const id = parsed.success ? parsed.data.id : "";
  const direction = formData.get("direction") === "up" ? "up" : "down";
  try {
    await TeamCmsService.reorder(id, direction, session);
    revalidatePublic();
    redirect("/admin/team?updated=reordered");
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    redirect(`/admin/team?error=${mapErrorCode(e)}`);
  }
}
