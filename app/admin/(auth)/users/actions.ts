"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  requirePermission,
  SelfActionError,
  SuperAdminFloorError,
} from "@/server/auth/guards";
import { UserService } from "@/server/services/user.service";
import { env } from "@/lib/config/env";

/** Maps known errors to short, machine-friendly query codes shown in the UI. */
function mapErrorCode(err: unknown): string {
  if (err instanceof SelfActionError) return "self";
  if (err instanceof SuperAdminFloorError) return "super_admin_floor";
  return "unknown";
}

/** Distinguishes Next's internal redirect throw from real errors. */
function isNextRedirect(e: unknown): boolean {
  return Boolean((e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT"));
}

export async function changeRoleAction(formData: FormData) {
  const session = await requirePermission("users:manage");
  const userId = (formData.get("userId") as string | null)?.trim() ?? "";
  const roleId = (formData.get("roleId") as string | null)?.trim() ?? "";
  if (!userId || !roleId) redirect("/admin/users?error=missing");

  try {
    await UserService.changeRole(userId, roleId, session.id);
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    revalidatePath("/admin/users");
    redirect(`/admin/users?error=${mapErrorCode(e)}`);
  }
  revalidatePath("/admin/users");
  redirect("/admin/users?updated=role");
}

export async function disableUserAction(formData: FormData) {
  const session = await requirePermission("users:manage");
  const userId = (formData.get("userId") as string | null)?.trim() ?? "";
  if (!userId) redirect("/admin/users?error=missing");

  try {
    await UserService.disableUser(userId, session.id);
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    revalidatePath("/admin/users");
    redirect(`/admin/users?error=${mapErrorCode(e)}`);
  }
  revalidatePath("/admin/users");
  redirect("/admin/users?updated=disabled");
}

export async function reactivateUserAction(formData: FormData) {
  const session = await requirePermission("users:manage");
  const userId = (formData.get("userId") as string | null)?.trim() ?? "";
  if (!userId) redirect("/admin/users?error=missing");

  try {
    await UserService.reactivateUser(userId, session.id);
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    revalidatePath("/admin/users");
    redirect(`/admin/users?error=${mapErrorCode(e)}`);
  }
  revalidatePath("/admin/users");
  redirect("/admin/users?updated=reactivated");
}

export async function inviteUserAction(formData: FormData) {
  const session = await requirePermission("users:manage");
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const roleId = (formData.get("roleId") as string | null)?.trim() ?? "";

  if (!email || !name || !roleId) {
    redirect("/admin/users/new?error=missing");
  }

  try {
    const { setupToken } = await UserService.invite(
      { email, name, roleId },
      session.id,
    );
    const link = `${env.AUTH_URL.replace(/\/$/, "")}/admin/setup-password?token=${setupToken}`;
    revalidatePath("/admin/users");
    redirect(`/admin/users?created=1&setupLink=${encodeURIComponent(link)}`);
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    const msg = e instanceof Error ? e.message : "unknown";
    redirect(`/admin/users/new?error=${encodeURIComponent(msg)}`);
  }
}
