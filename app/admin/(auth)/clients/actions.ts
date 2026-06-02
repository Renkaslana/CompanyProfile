"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/server/auth/guards";
import {
  ClientCmsService,
  ClientNotFoundError,
} from "@/server/services/client-cms.service";
import {
  clientCreateSchema,
  clientUpdateSchema,
  clientIdSchema,
  type ClientFormState,
} from "@/lib/validation/client";

function isNextRedirect(e: unknown): boolean {
  return Boolean((e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT"));
}
function mapErrorCode(err: unknown): string {
  if (err instanceof ClientNotFoundError) return "not_found";
  return "unknown";
}
function revalidatePublic() {
  revalidatePath("/admin/clients");
  revalidatePath("/"); // landing clients/partners band
}
function readForm(formData: FormData) {
  return {
    name: (formData.get("name") as string | null)?.trim() ?? "",
    sector: (formData.get("sector") as string | null)?.trim() ?? "",
    url: (formData.get("url") as string | null)?.trim() ?? "",
    logoIdRaw: ((formData.get("logoId") as string | null) ?? "").trim(),
    orderRaw: (formData.get("order") as string | null) ?? "",
  };
}
function buildSummary(fe: ClientFormState["fieldErrors"]): string {
  const entries = Object.entries(fe);
  if (entries.length === 0) return "Form tidak valid.";
  const labels: Record<string, string> = {
    name: "Nama",
    sector: "Sektor",
    url: "URL",
    logoId: "Logo",
    order: "Urutan",
  };
  const list = entries.map(([k]) => labels[k] ?? k).slice(0, 3).join(", ");
  const more = entries.length > 3 ? `, dan ${entries.length - 3} lainnya` : "";
  return `Form tidak valid. Periksa kembali: ${list}${more}.`;
}

export async function createClientAction(
  _prev: ClientFormState | null,
  formData: FormData,
): Promise<ClientFormState | null> {
  const session = await requirePermission("content:write");
  const v = readForm(formData);
  const echo: ClientFormState["values"] = {
    name: v.name,
    sector: v.sector,
    url: v.url,
    logoId: v.logoIdRaw || null,
    order: v.orderRaw,
  };
  const parsed = clientCreateSchema.safeParse({
    name: v.name,
    sector: v.sector,
    url: v.url,
    logoId: v.logoIdRaw || null,
    order: Number(v.orderRaw || 0) || 0,
  });
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as ClientFormState["fieldErrors"];
    console.error("[createClientAction] validation failed", fieldErrors);
    return { ok: false, fieldErrors, message: buildSummary(fieldErrors), values: echo };
  }
  try {
    await ClientCmsService.create(
      {
        name: parsed.data.name,
        sector: parsed.data.sector ? parsed.data.sector : null,
        url: parsed.data.url ? parsed.data.url : null,
        logoId: parsed.data.logoId ? parsed.data.logoId : null,
        order: parsed.data.order,
      },
      session,
    );
    revalidatePublic();
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    return { ok: false, fieldErrors: {}, message: e instanceof Error ? e.message : "Terjadi kesalahan.", values: echo };
  }
  redirect("/admin/clients?updated=created");
}

export async function updateClientAction(
  _prev: ClientFormState | null,
  formData: FormData,
): Promise<ClientFormState | null> {
  const session = await requirePermission("content:write");
  const id = (formData.get("id") as string | null)?.trim() ?? "";
  if (!id) redirect("/admin/clients?error=missing");
  const v = readForm(formData);
  const echo: ClientFormState["values"] = {
    name: v.name,
    sector: v.sector,
    url: v.url,
    logoId: v.logoIdRaw || null,
    order: v.orderRaw,
  };
  const parsed = clientUpdateSchema.safeParse({
    id,
    name: v.name,
    sector: v.sector,
    url: v.url,
    logoId: v.logoIdRaw || null,
    order: Number(v.orderRaw || 0) || 0,
  });
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as ClientFormState["fieldErrors"];
    console.error("[updateClientAction] validation failed", fieldErrors);
    return { ok: false, fieldErrors, message: buildSummary(fieldErrors), values: echo };
  }
  try {
    await ClientCmsService.update(
      id,
      {
        name: parsed.data.name,
        sector: parsed.data.sector ? parsed.data.sector : null,
        url: parsed.data.url ? parsed.data.url : null,
        logoId: parsed.data.logoId ? parsed.data.logoId : null,
        order: parsed.data.order,
      },
      session,
    );
    revalidatePublic();
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    if (e instanceof ClientNotFoundError) redirect("/admin/clients?error=not_found");
    return { ok: false, fieldErrors: {}, message: e instanceof Error ? e.message : "Terjadi kesalahan.", values: echo };
  }
  redirect("/admin/clients?updated=edited");
}

export async function deleteClientAction(formData: FormData) {
  const session = await requirePermission("content:write");
  const parsed = clientIdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) redirect("/admin/clients?error=missing");
  const id = parsed.success ? parsed.data.id : "";
  try {
    await ClientCmsService.delete(id, session);
    revalidatePublic();
    redirect("/admin/clients?updated=deleted");
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    redirect(`/admin/clients?error=${mapErrorCode(e)}`);
  }
}

export async function reorderClientAction(formData: FormData) {
  const session = await requirePermission("content:write");
  const parsed = clientIdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) redirect("/admin/clients?error=missing");
  const id = parsed.success ? parsed.data.id : "";
  const direction = formData.get("direction") === "up" ? "up" : "down";
  try {
    await ClientCmsService.reorder(id, direction, session);
    revalidatePublic();
    redirect("/admin/clients?updated=reordered");
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    redirect(`/admin/clients?error=${mapErrorCode(e)}`);
  }
}
