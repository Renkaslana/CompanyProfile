"use server";

import { redirect } from "next/navigation";
import { consumePasswordResetToken } from "@/server/services/auth.service";

function isStrong(p: string): boolean {
  return (
    p.length >= 12 &&
    /[a-z]/.test(p) &&
    /[A-Z]/.test(p) &&
    /[0-9]/.test(p) &&
    /[^A-Za-z0-9]/.test(p)
  );
}

export async function resetPasswordAction(formData: FormData) {
  const token = (formData.get("token") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const confirm = (formData.get("confirm") as string | null) ?? "";

  if (!token) redirect("/admin/login");
  if (password !== confirm) {
    redirect(`/admin/reset-password?token=${encodeURIComponent(token)}&error=mismatch`);
  }
  if (!isStrong(password)) {
    redirect(`/admin/reset-password?token=${encodeURIComponent(token)}&error=weak`);
  }

  const ok = await consumePasswordResetToken(token, password);
  if (!ok) {
    redirect(`/admin/reset-password?token=${encodeURIComponent(token)}&error=invalid_token`);
  }
  redirect("/admin/login");
}
