"use server";

/**
 * Admin lead actions — status change + delete.
 *
 * Public submission lives in `features/leads/actions.ts`. This file is
 * mutation-side from the admin panel only.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/server/auth/guards";
import { LeadService } from "@/server/services/lead.service";
import { LEAD_STATUSES } from "@/lib/validation/lead";

const statusFormSchema = z.object({
  id: z.string().min(1),
  status: z.enum(LEAD_STATUSES),
});

const idSchema = z.object({ id: z.string().min(1) });

function readString(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

export async function updateLeadStatusAction(formData: FormData) {
  const session = await requirePermission("lead:update");
  const parsed = statusFormSchema.safeParse({
    id: readString(formData, "id"),
    status: readString(formData, "status"),
  });
  if (!parsed.success) {
    redirect("/admin/leads?error=validation");
  }
  try {
    await LeadService.updateStatus(parsed.data.id, parsed.data.status, session);
  } catch {
    redirect("/admin/leads?error=not_found");
  }
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${parsed.data.id}`);
  redirect(`/admin/leads/${parsed.data.id}?updated=status`);
}

export async function deleteLeadAction(formData: FormData) {
  const session = await requirePermission("lead:update");
  const parsed = idSchema.safeParse({ id: readString(formData, "id") });
  if (!parsed.success) {
    redirect("/admin/leads?error=validation");
  }
  try {
    await LeadService.delete(parsed.data.id, session);
  } catch {
    redirect("/admin/leads?error=not_found");
  }
  revalidatePath("/admin/leads");
  redirect("/admin/leads?updated=deleted");
}
