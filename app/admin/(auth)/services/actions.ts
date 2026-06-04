"use server";

/**
 * Server Actions for the Services CMS (Phase 4 M5).
 *
 * Create + update use React 19 `useActionState` — on validation or
 * business-rule failure they RETURN a `ServiceFormState` so the client form
 * can render field-level errors inline. On success they `redirect` (which
 * propagates via NEXT_REDIRECT and is rendered as a navigation by Next).
 *
 * Publish toggle, delete, and reorder remain pure-redirect actions — they're
 * one-button operations with no form to re-render.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/server/auth/guards";
import {
  ServiceCmsService,
  SlugTakenError,
  ServiceNotFoundError,
} from "@/server/services/service-cms.service";
import {
  serviceCreateSchema,
  serviceUpdateSchema,
  serviceIdSchema,
  parseHighlights,
  type ServiceFormState,
} from "@/lib/validation/service";

function isNextRedirect(e: unknown): boolean {
  return Boolean((e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT"));
}

function mapErrorCode(err: unknown): string {
  if (err instanceof SlugTakenError) return "slug_taken";
  if (err instanceof ServiceNotFoundError) return "not_found";
  return "unknown";
}

/** Re-paint every surface that reads a Service row. */
function revalidatePublic(slug?: string) {
  revalidatePath("/admin/services");
  revalidatePath("/"); // landing page services grid
  revalidatePath("/layanan");
  if (slug) revalidatePath(`/layanan/${slug}`);
}

function readFormValues(formData: FormData) {
  return {
    title: (formData.get("title") as string | null)?.trim() ?? "",
    slug: (formData.get("slug") as string | null)?.trim() ?? "",
    category: (formData.get("category") as string | null) ?? "",
    summary: (formData.get("summary") as string | null)?.trim() ?? "",
    body: (formData.get("body") as string | null)?.trim() ?? "",
    iconKey: (formData.get("iconKey") as string | null)?.trim() ?? "",
    coverIdRaw: ((formData.get("coverId") as string | null) ?? "").trim(),
    highlightsRaw: (formData.get("highlights") as string | null) ?? "",
    orderRaw: (formData.get("order") as string | null) ?? "",
    published:
      formData.get("published") === "on" || formData.get("published") === "true",
  };
}

function buildSummaryMessage(fieldErrors: ServiceFormState["fieldErrors"]): string {
  const entries = Object.entries(fieldErrors);
  if (entries.length === 0) return "Form tidak valid.";
  const labels: Record<string, string> = {
    title: "Judul",
    slug: "URL Halaman",
    category: "Kategori",
    summary: "Ringkasan",
    body: "Deskripsi",
    iconKey: "Icon",
    coverId: "Cover",
    highlights: "Highlight",
    order: "Urutan",
    published: "Status",
  };
  const fieldList = entries
    .map(([k]) => labels[k] ?? k)
    .slice(0, 3)
    .join(", ");
  const more = entries.length > 3 ? `, dan ${entries.length - 3} lainnya` : "";
  return `Form tidak valid. Periksa kembali: ${fieldList}${more}.`;
}

/* ───────────────── create (useActionState) ───────────────── */

export async function createServiceAction(
  _prev: ServiceFormState | null,
  formData: FormData,
): Promise<ServiceFormState | null> {
  const session = await requirePermission("content:write");
  const v = readFormValues(formData);

  // Build the values echo first — useActionState re-renders with these so
  // the user doesn't lose their input on failure.
  const valuesEcho: ServiceFormState["values"] = {
    title: v.title,
    slug: v.slug,
    category: v.category,
    summary: v.summary,
    body: v.body,
    iconKey: v.iconKey,
    coverId: v.coverIdRaw || null,
    highlights: v.highlightsRaw,
    order: v.orderRaw,
    published: v.published,
  };

  const parsed = serviceCreateSchema.safeParse({
    title: v.title,
    slug: v.slug,
    category: v.category,
    summary: v.summary,
    body: v.body,
    iconKey: v.iconKey,
    coverId: v.coverIdRaw || null,
    highlights: parseHighlights(v.highlightsRaw),
    order: Number(v.orderRaw || 0) || 0,
    published: v.published,
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as ServiceFormState["fieldErrors"];
    console.error("[createServiceAction] validation failed", fieldErrors);
    return {
      ok: false,
      fieldErrors,
      message: buildSummaryMessage(fieldErrors),
      values: valuesEcho,
    };
  }

  try {
    const created = await ServiceCmsService.create(
      { ...parsed.data, coverId: parsed.data.coverId ? parsed.data.coverId : null },
      session,
    );
    revalidatePublic(created.slug);
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    if (e instanceof SlugTakenError) {
      return {
        ok: false,
        fieldErrors: { slug: [e.message] },
        message: e.message,
        values: valuesEcho,
      };
    }
    return {
      ok: false,
      fieldErrors: {},
      message: e instanceof Error ? e.message : "Terjadi kesalahan tak terduga.",
      values: valuesEcho,
    };
  }
  redirect("/admin/services?updated=created");
}

/* ───────────────── update (useActionState) ───────────────── */

export async function updateServiceAction(
  _prev: ServiceFormState | null,
  formData: FormData,
): Promise<ServiceFormState | null> {
  const session = await requirePermission("content:write");
  const id = (formData.get("id") as string | null)?.trim() ?? "";
  if (!id) redirect("/admin/services?error=missing");

  const v = readFormValues(formData);
  const valuesEcho: ServiceFormState["values"] = {
    title: v.title,
    slug: v.slug,
    category: v.category,
    summary: v.summary,
    body: v.body,
    iconKey: v.iconKey,
    coverId: v.coverIdRaw || null,
    highlights: v.highlightsRaw,
    order: v.orderRaw,
    published: v.published,
  };

  const parsed = serviceUpdateSchema.safeParse({
    id,
    title: v.title,
    slug: v.slug,
    category: v.category,
    summary: v.summary,
    body: v.body,
    iconKey: v.iconKey,
    coverId: v.coverIdRaw || null,
    highlights: parseHighlights(v.highlightsRaw),
    order: Number(v.orderRaw || 0) || 0,
    published: v.published,
  });
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as ServiceFormState["fieldErrors"];
    console.error("[updateServiceAction] validation failed", fieldErrors);
    return {
      ok: false,
      fieldErrors,
      message: buildSummaryMessage(fieldErrors),
      values: valuesEcho,
    };
  }

  try {
    const updated = await ServiceCmsService.update(
      id,
      { ...parsed.data, coverId: parsed.data.coverId ? parsed.data.coverId : null },
      session,
    );
    revalidatePublic(updated.slug);
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    if (e instanceof SlugTakenError) {
      return {
        ok: false,
        fieldErrors: { slug: [e.message] },
        message: e.message,
        values: valuesEcho,
      };
    }
    if (e instanceof ServiceNotFoundError) {
      redirect("/admin/services?error=not_found");
    }
    return {
      ok: false,
      fieldErrors: {},
      message: e instanceof Error ? e.message : "Terjadi kesalahan tak terduga.",
      values: valuesEcho,
    };
  }
  redirect("/admin/services?updated=edited");
}

/* ───────────────── publish toggle ───────────────── */

export async function togglePublishServiceAction(formData: FormData) {
  const session = await requirePermission("content:publish");
  const parsed = serviceIdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) redirect("/admin/services?error=missing");
  const id = parsed.success ? parsed.data.id : "";
  try {
    const updated = await ServiceCmsService.togglePublish(id, session);
    revalidatePublic(updated.slug);
    redirect(
      updated.published
        ? "/admin/services?updated=published"
        : "/admin/services?updated=unpublished",
    );
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    redirect(`/admin/services?error=${mapErrorCode(e)}`);
  }
}

/* ───────────────── delete ───────────────── */

export async function deleteServiceAction(formData: FormData) {
  const session = await requirePermission("content:write");
  const parsed = serviceIdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) redirect("/admin/services?error=missing");
  const id = parsed.success ? parsed.data.id : "";
  try {
    await ServiceCmsService.delete(id, session);
    revalidatePublic();
    redirect("/admin/services?updated=deleted");
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    redirect(`/admin/services?error=${mapErrorCode(e)}`);
  }
}

/* ───────────────── reorder ───────────────── */

export async function reorderServiceAction(formData: FormData) {
  const session = await requirePermission("content:write");
  const parsed = serviceIdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) redirect("/admin/services?error=missing");
  const id = parsed.success ? parsed.data.id : "";
  const direction = formData.get("direction") === "up" ? "up" : "down";
  try {
    await ServiceCmsService.reorder(id, direction, session);
    revalidatePublic();
    redirect("/admin/services?updated=reordered");
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    redirect(`/admin/services?error=${mapErrorCode(e)}`);
  }
}
