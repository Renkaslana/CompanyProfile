"use server";

/**
 * Stats CMS Server Actions (Phase 4 M9).
 *
 * Each row is edited inline; the action takes the row's `key` to identify
 * which Stat to update. Reorder swaps adjacent rows.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/server/auth/guards";
import {
  StatsCmsService,
  StatNotFoundError,
} from "@/server/services/stats-cms.service";
import { statUpdateSchema, statReorderSchema } from "@/lib/validation/stats";

function isNextRedirect(e: unknown): boolean {
  return Boolean((e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT"));
}
function mapErrorCode(err: unknown): string {
  if (err instanceof StatNotFoundError) return "not_found";
  return "unknown";
}
function revalidatePublic() {
  revalidatePath("/admin/stats");
  revalidatePath("/");
  revalidatePath("/tentang");
}

export async function updateStatAction(formData: FormData) {
  const session = await requirePermission("content:write");
  const raw = {
    key: (formData.get("key") as string | null)?.trim() ?? "",
    label: (formData.get("label") as string | null)?.trim() ?? "",
    value: Number(formData.get("value") ?? 0) || 0,
    suffix: ((formData.get("suffix") as string | null) ?? "").trim(),
    source: ((formData.get("source") as string | null) === "DERIVED" ? "DERIVED" : "MANUAL") as
      | "DERIVED"
      | "MANUAL",
  };
  const parsed = statUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("[updateStatAction] validation failed", parsed.error.flatten().fieldErrors);
    redirect(`/admin/stats?error=validation&key=${encodeURIComponent(raw.key)}`);
  }
  const data = parsed.success ? parsed.data : raw;
  try {
    await StatsCmsService.updateByKey(
      data.key,
      {
        label: data.label,
        value: data.value,
        suffix: data.suffix ? data.suffix : null,
        source: data.source,
      },
      session,
    );
    revalidatePublic();
    redirect(`/admin/stats?updated=edited&key=${encodeURIComponent(data.key)}`);
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    redirect(`/admin/stats?error=${mapErrorCode(e)}`);
  }
}

export async function reorderStatAction(formData: FormData) {
  const session = await requirePermission("content:write");
  const parsed = statReorderSchema.safeParse({
    key: formData.get("key"),
    direction: formData.get("direction"),
  });
  if (!parsed.success) redirect("/admin/stats?error=missing");
  const { key, direction } = parsed.success ? parsed.data : { key: "", direction: "up" as const };
  try {
    await StatsCmsService.reorder(key, direction, session);
    revalidatePublic();
    redirect("/admin/stats?updated=reordered");
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    redirect(`/admin/stats?error=${mapErrorCode(e)}`);
  }
}
