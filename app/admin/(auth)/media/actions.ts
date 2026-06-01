"use server";

/**
 * Server Actions for the Media Library page (Phase 4 M4).
 *
 *   • persistUploadAction — after the browser direct-uploads to Cloudinary,
 *     this action validates the upload result and writes the MediaAsset row.
 *   • updateMediaAction — edit alt / title / tags.
 *   • deleteMediaAction — reference-guarded delete (MediaInUseError → banner).
 *
 * All actions:
 *   • RBAC via requirePermission("media:create") inside MediaService.
 *   • Audit-write inside MediaService.
 *   • Map known errors (MediaInUseError / MediaNotConfiguredError) to short
 *     query-string codes consumed by ERROR_MAP in `page.tsx`.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/server/auth/guards";
import {
  MediaService,
  MediaInUseError,
  MediaNotConfiguredError,
} from "@/server/services/media.service";
import {
  mediaPersistSchema,
  mediaUpdateSchema,
  mediaIdSchema,
  parseTagInput,
} from "@/lib/validation/media";

/** Distinguishes Next's internal redirect throw from real errors. */
function isNextRedirect(e: unknown): boolean {
  return Boolean((e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT"));
}

function mapErrorCode(err: unknown): string {
  if (err instanceof MediaInUseError) return "in_use";
  if (err instanceof MediaNotConfiguredError) return "not_configured";
  return "unknown";
}

/* ───────────────── persist after Cloudinary upload ───────────────── */

export async function persistUploadAction(formData: FormData) {
  const session = await requirePermission("media:create");

  const rawTags = formData.get("tags") as string | null;
  const widthStr = formData.get("width") as string | null;
  const heightStr = formData.get("height") as string | null;

  const input = {
    publicId: (formData.get("publicId") as string | null)?.trim() ?? "",
    url: (formData.get("url") as string | null)?.trim() ?? "",
    width: widthStr ? Number(widthStr) : null,
    height: heightStr ? Number(heightStr) : null,
    mimeType: (formData.get("mimeType") as string | null)?.trim() ?? "",
    folder: (formData.get("folder") as string | null)?.trim() ?? "",
    alt: ((formData.get("alt") as string | null) ?? "").trim(),
    title: ((formData.get("title") as string | null) ?? "").trim(),
    tags: parseTagInput(rawTags),
  };

  const parsed = mediaPersistSchema.safeParse(input);
  if (!parsed.success) {
    // Server-side diagnostic so the next validation failure is one-grep
    // diagnosable instead of opaque "form tidak valid".
    console.error(
      "[persistUploadAction] validation failed",
      parsed.error.flatten().fieldErrors,
      { received: { ...input, url: input.url ? "<url>" : "" } },
    );
    redirect("/admin/media?error=validation");
  }

  try {
    await MediaService.persistFromUpload(
      {
        publicId: parsed.data.publicId,
        url: parsed.data.url,
        width: parsed.data.width ?? null,
        height: parsed.data.height ?? null,
        mimeType: parsed.data.mimeType,
        folder: parsed.data.folder,
        alt: parsed.data.alt || null,
        title: parsed.data.title || null,
        tags: parsed.data.tags ?? [],
      },
      session,
    );
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    redirect(`/admin/media?error=${mapErrorCode(e)}`);
  }
  revalidatePath("/admin/media");
  redirect("/admin/media?updated=created");
}

/* ───────────────── update metadata ───────────────── */

export async function updateMediaAction(formData: FormData) {
  const session = await requirePermission("media:create");

  const idParse = mediaIdSchema.safeParse({ id: formData.get("id") });
  if (!idParse.success) {
    redirect("/admin/media?error=missing");
  }
  const id = idParse.success ? idParse.data.id : "";

  const input = {
    alt: ((formData.get("alt") as string | null) ?? "").trim(),
    title: ((formData.get("title") as string | null) ?? "").trim(),
    tags: parseTagInput(formData.get("tags") as string | null),
  };
  const parsed = mediaUpdateSchema.safeParse(input);
  if (!parsed.success) {
    console.error(
      "[updateMediaAction] validation failed",
      parsed.error.flatten().fieldErrors,
      { received: input },
    );
    redirect(`/admin/media/${id}/edit?error=validation`);
  }

  try {
    await MediaService.update(
      id,
      {
        alt: parsed.data.alt || null,
        title: parsed.data.title || null,
        tags: parsed.data.tags,
      },
      session,
    );
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    redirect(`/admin/media/${id}/edit?error=${mapErrorCode(e)}`);
  }
  revalidatePath("/admin/media");
  revalidatePath(`/admin/media/${id}/edit`);
  redirect("/admin/media?updated=edited");
}

/* ───────────────── delete (reference-guarded) ───────────────── */

export async function deleteMediaAction(formData: FormData) {
  const session = await requirePermission("media:create");

  const idParse = mediaIdSchema.safeParse({ id: formData.get("id") });
  if (!idParse.success) redirect("/admin/media?error=missing");
  const id = idParse.success ? idParse.data.id : "";

  try {
    await MediaService.deleteWithGuard(id, session);
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    revalidatePath("/admin/media");
    redirect(`/admin/media?error=${mapErrorCode(e)}`);
  }
  revalidatePath("/admin/media");
  redirect("/admin/media?updated=deleted");
}
