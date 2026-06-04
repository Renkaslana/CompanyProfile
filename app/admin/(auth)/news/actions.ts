"use server";

/**
 * Server Actions for the News CMS (Phase 4 M6).
 *
 * Mirrors the M5 pattern:
 *   • create + update use React 19 `useActionState` — on validation failure
 *     they RETURN a `NewsFormState` so the form can render field-level errors.
 *   • status transitions (publish / unpublish / archive / restore) and delete
 *     are pure redirect actions.
 *
 * Revalidation: every mutation re-paints `/admin/news`, `/`, `/berita`, and
 * `/berita/[slug]` so admin + public views stay in lockstep.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/server/auth/guards";
import {
  NewsCmsService,
  SlugTakenError,
  NewsNotFoundError,
} from "@/server/services/news-cms.service";
import {
  newsCreateSchema,
  newsUpdateSchema,
  newsIdSchema,
  type NewsFormState,
} from "@/lib/validation/news";

function isNextRedirect(e: unknown): boolean {
  return Boolean((e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT"));
}

function mapErrorCode(err: unknown): string {
  if (err instanceof SlugTakenError) return "slug_taken";
  if (err instanceof NewsNotFoundError) return "not_found";
  return "unknown";
}

function revalidatePublic(slug?: string) {
  revalidatePath("/admin/news");
  revalidatePath("/");
  revalidatePath("/berita");
  if (slug) revalidatePath(`/berita/${slug}`);
}

function readFormValues(formData: FormData) {
  return {
    title: (formData.get("title") as string | null)?.trim() ?? "",
    slug: (formData.get("slug") as string | null)?.trim() ?? "",
    excerpt: (formData.get("excerpt") as string | null)?.trim() ?? "",
    body: (formData.get("body") as string | null)?.trim() ?? "",
    category: (formData.get("category") as string | null)?.trim() ?? "",
    displayAuthor: (formData.get("displayAuthor") as string | null)?.trim() ?? "",
    coverIdRaw: ((formData.get("coverId") as string | null) ?? "").trim(),
    publishImmediately:
      formData.get("publishImmediately") === "on" ||
      formData.get("publishImmediately") === "true",
  };
}

function buildSummaryMessage(fieldErrors: NewsFormState["fieldErrors"]): string {
  const entries = Object.entries(fieldErrors);
  if (entries.length === 0) return "Form tidak valid.";
  const labels: Record<string, string> = {
    title: "Judul",
    slug: "URL Halaman",
    excerpt: "Ringkasan",
    body: "Isi",
    category: "Kategori",
    displayAuthor: "Penulis",
    coverId: "Cover",
  };
  const list = entries
    .map(([k]) => labels[k] ?? k)
    .slice(0, 3)
    .join(", ");
  const more = entries.length > 3 ? `, dan ${entries.length - 3} lainnya` : "";
  return `Form tidak valid. Periksa kembali: ${list}${more}.`;
}

/* ───────────────── create ───────────────── */

export async function createNewsAction(
  _prev: NewsFormState | null,
  formData: FormData,
): Promise<NewsFormState | null> {
  const session = await requirePermission("content:write");
  const v = readFormValues(formData);

  const valuesEcho: NewsFormState["values"] = {
    title: v.title,
    slug: v.slug,
    excerpt: v.excerpt,
    body: v.body,
    category: v.category,
    displayAuthor: v.displayAuthor,
    coverId: v.coverIdRaw || null,
    publishImmediately: v.publishImmediately,
  };

  const parsed = newsCreateSchema.safeParse({
    title: v.title,
    slug: v.slug,
    excerpt: v.excerpt,
    body: v.body,
    category: v.category,
    displayAuthor: v.displayAuthor,
    coverId: v.coverIdRaw || null,
    publishImmediately: v.publishImmediately,
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as NewsFormState["fieldErrors"];
    console.error("[createNewsAction] validation failed", fieldErrors);
    return {
      ok: false,
      fieldErrors,
      message: buildSummaryMessage(fieldErrors),
      values: valuesEcho,
    };
  }

  let slug: string;
  try {
    const created = await NewsCmsService.create(
      {
        title: parsed.data.title,
        slug: parsed.data.slug,
        excerpt: parsed.data.excerpt,
        body: parsed.data.body,
        category: parsed.data.category,
        displayAuthor: parsed.data.displayAuthor || null,
        coverId: parsed.data.coverId ? parsed.data.coverId : null,
      },
      parsed.data.publishImmediately,
      session,
    );
    slug = created.slug;
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
  redirect(`/admin/news?updated=created&slug=${encodeURIComponent(slug)}`);
}

/* ───────────────── update ───────────────── */

export async function updateNewsAction(
  _prev: NewsFormState | null,
  formData: FormData,
): Promise<NewsFormState | null> {
  const session = await requirePermission("content:write");
  const id = (formData.get("id") as string | null)?.trim() ?? "";
  if (!id) redirect("/admin/news?error=missing");

  const v = readFormValues(formData);
  const valuesEcho: NewsFormState["values"] = {
    title: v.title,
    slug: v.slug,
    excerpt: v.excerpt,
    body: v.body,
    category: v.category,
    displayAuthor: v.displayAuthor,
    coverId: v.coverIdRaw || null,
    publishImmediately: false, // not editable from update form
  };

  const parsed = newsUpdateSchema.safeParse({
    id,
    title: v.title,
    slug: v.slug,
    excerpt: v.excerpt,
    body: v.body,
    category: v.category,
    displayAuthor: v.displayAuthor,
    coverId: v.coverIdRaw || null,
  });
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as NewsFormState["fieldErrors"];
    console.error("[updateNewsAction] validation failed", fieldErrors);
    return {
      ok: false,
      fieldErrors,
      message: buildSummaryMessage(fieldErrors),
      values: valuesEcho,
    };
  }

  try {
    const updated = await NewsCmsService.update(
      id,
      {
        title: parsed.data.title,
        slug: parsed.data.slug,
        excerpt: parsed.data.excerpt,
        body: parsed.data.body,
        category: parsed.data.category,
        displayAuthor: parsed.data.displayAuthor || null,
        coverId: parsed.data.coverId ? parsed.data.coverId : null,
      },
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
    if (e instanceof NewsNotFoundError) {
      redirect("/admin/news?error=not_found");
    }
    return {
      ok: false,
      fieldErrors: {},
      message: e instanceof Error ? e.message : "Terjadi kesalahan tak terduga.",
      values: valuesEcho,
    };
  }
  redirect("/admin/news?updated=edited");
}

/* ───────────────── status transitions ───────────────── */

export async function publishNewsAction(formData: FormData) {
  const session = await requirePermission("content:publish");
  const parsed = newsIdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) redirect("/admin/news?error=missing");
  const id = parsed.success ? parsed.data.id : "";
  try {
    const updated = await NewsCmsService.publish(id, session);
    revalidatePublic(updated.slug);
    redirect("/admin/news?updated=published");
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    redirect(`/admin/news?error=${mapErrorCode(e)}`);
  }
}

export async function unpublishNewsAction(formData: FormData) {
  const session = await requirePermission("content:publish");
  const parsed = newsIdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) redirect("/admin/news?error=missing");
  const id = parsed.success ? parsed.data.id : "";
  try {
    const updated = await NewsCmsService.unpublish(id, session);
    revalidatePublic(updated.slug);
    redirect("/admin/news?updated=unpublished");
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    redirect(`/admin/news?error=${mapErrorCode(e)}`);
  }
}

export async function archiveNewsAction(formData: FormData) {
  const session = await requirePermission("content:write");
  const parsed = newsIdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) redirect("/admin/news?error=missing");
  const id = parsed.success ? parsed.data.id : "";
  try {
    const updated = await NewsCmsService.archive(id, session);
    revalidatePublic(updated.slug);
    redirect("/admin/news?updated=archived");
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    redirect(`/admin/news?error=${mapErrorCode(e)}`);
  }
}

export async function restoreNewsAction(formData: FormData) {
  const session = await requirePermission("content:publish");
  const parsed = newsIdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) redirect("/admin/news?error=missing");
  const id = parsed.success ? parsed.data.id : "";
  try {
    const updated = await NewsCmsService.restore(id, session);
    revalidatePublic(updated.slug);
    redirect("/admin/news?updated=restored");
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    redirect(`/admin/news?error=${mapErrorCode(e)}`);
  }
}

export async function deleteNewsAction(formData: FormData) {
  const session = await requirePermission("content:write");
  const parsed = newsIdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) redirect("/admin/news?error=missing");
  const id = parsed.success ? parsed.data.id : "";
  try {
    await NewsCmsService.delete(id, session);
    revalidatePublic();
    redirect("/admin/news?updated=deleted");
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    redirect(`/admin/news?error=${mapErrorCode(e)}`);
  }
}
