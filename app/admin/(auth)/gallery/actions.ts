"use server";

/**
 * Server Actions for the Gallery CMS (Phase 4 M7).
 *
 * Create + update use `useActionState` (field-level errors). Delete +
 * reorder are pure redirect actions. Revalidates `/admin/gallery`,
 * `/galeri`, and `/` after every mutation.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/server/auth/guards";
import {
  GalleryCmsService,
  GalleryNotFoundError,
} from "@/server/services/gallery-cms.service";
import {
  galleryCreateSchema,
  galleryUpdateSchema,
  galleryIdSchema,
  type GalleryFormState,
} from "@/lib/validation/gallery";

function isNextRedirect(e: unknown): boolean {
  return Boolean((e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT"));
}

function mapErrorCode(err: unknown): string {
  if (err instanceof GalleryNotFoundError) return "not_found";
  return "unknown";
}

function revalidatePublic() {
  revalidatePath("/admin/gallery");
  revalidatePath("/galeri");
  revalidatePath("/"); // landing page operational gallery section
}

function readFormValues(formData: FormData) {
  return {
    title: (formData.get("title") as string | null)?.trim() ?? "",
    category: (formData.get("category") as string | null)?.trim() ?? "",
    mediaIdRaw: ((formData.get("mediaId") as string | null) ?? "").trim(),
    orderRaw: (formData.get("order") as string | null) ?? "",
  };
}

function buildSummaryMessage(fieldErrors: GalleryFormState["fieldErrors"]): string {
  const entries = Object.entries(fieldErrors);
  if (entries.length === 0) return "Form tidak valid.";
  const labels: Record<string, string> = {
    title: "Judul",
    category: "Kategori",
    mediaId: "Media",
    order: "Urutan",
  };
  const list = entries.map(([k]) => labels[k] ?? k).slice(0, 3).join(", ");
  const more = entries.length > 3 ? `, dan ${entries.length - 3} lainnya` : "";
  return `Form tidak valid. Periksa kembali: ${list}${more}.`;
}

/* ───────────────── create ───────────────── */

export async function createGalleryAction(
  _prev: GalleryFormState | null,
  formData: FormData,
): Promise<GalleryFormState | null> {
  const session = await requirePermission("content:write");
  const v = readFormValues(formData);

  const valuesEcho: GalleryFormState["values"] = {
    title: v.title,
    category: v.category,
    mediaId: v.mediaIdRaw || null,
    order: v.orderRaw,
  };

  const parsed = galleryCreateSchema.safeParse({
    title: v.title,
    category: v.category,
    mediaId: v.mediaIdRaw,
    order: Number(v.orderRaw || 0) || 0,
  });
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as GalleryFormState["fieldErrors"];
    console.error("[createGalleryAction] validation failed", fieldErrors);
    return {
      ok: false,
      fieldErrors,
      message: buildSummaryMessage(fieldErrors),
      values: valuesEcho,
    };
  }

  try {
    await GalleryCmsService.create(parsed.data, session);
    revalidatePublic();
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    return {
      ok: false,
      fieldErrors: {},
      message: e instanceof Error ? e.message : "Terjadi kesalahan tak terduga.",
      values: valuesEcho,
    };
  }
  redirect("/admin/gallery?updated=created");
}

/* ───────────────── update ───────────────── */

export async function updateGalleryAction(
  _prev: GalleryFormState | null,
  formData: FormData,
): Promise<GalleryFormState | null> {
  const session = await requirePermission("content:write");
  const id = (formData.get("id") as string | null)?.trim() ?? "";
  if (!id) redirect("/admin/gallery?error=missing");

  const v = readFormValues(formData);
  const valuesEcho: GalleryFormState["values"] = {
    title: v.title,
    category: v.category,
    mediaId: v.mediaIdRaw || null,
    order: v.orderRaw,
  };

  const parsed = galleryUpdateSchema.safeParse({
    id,
    title: v.title,
    category: v.category,
    mediaId: v.mediaIdRaw,
    order: Number(v.orderRaw || 0) || 0,
  });
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as GalleryFormState["fieldErrors"];
    console.error("[updateGalleryAction] validation failed", fieldErrors);
    return {
      ok: false,
      fieldErrors,
      message: buildSummaryMessage(fieldErrors),
      values: valuesEcho,
    };
  }

  try {
    await GalleryCmsService.update(
      id,
      {
        title: parsed.data.title,
        category: parsed.data.category,
        mediaId: parsed.data.mediaId,
        order: parsed.data.order,
      },
      session,
    );
    revalidatePublic();
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    if (e instanceof GalleryNotFoundError) {
      redirect("/admin/gallery?error=not_found");
    }
    return {
      ok: false,
      fieldErrors: {},
      message: e instanceof Error ? e.message : "Terjadi kesalahan tak terduga.",
      values: valuesEcho,
    };
  }
  redirect("/admin/gallery?updated=edited");
}

/* ───────────────── delete ───────────────── */

export async function deleteGalleryAction(formData: FormData) {
  const session = await requirePermission("content:write");
  const parsed = galleryIdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) redirect("/admin/gallery?error=missing");
  const id = parsed.success ? parsed.data.id : "";
  try {
    await GalleryCmsService.delete(id, session);
    revalidatePublic();
    redirect("/admin/gallery?updated=deleted");
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    redirect(`/admin/gallery?error=${mapErrorCode(e)}`);
  }
}

/* ───────────────── reorder ───────────────── */

export async function reorderGalleryAction(formData: FormData) {
  const session = await requirePermission("content:write");
  const parsed = galleryIdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) redirect("/admin/gallery?error=missing");
  const id = parsed.success ? parsed.data.id : "";
  const direction = formData.get("direction") === "up" ? "up" : "down";
  try {
    await GalleryCmsService.reorder(id, direction, session);
    revalidatePublic();
    redirect("/admin/gallery?updated=reordered");
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    redirect(`/admin/gallery?error=${mapErrorCode(e)}`);
  }
}
