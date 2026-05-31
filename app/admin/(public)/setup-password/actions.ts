"use server";

import { redirect } from "next/navigation";
import { consumePasswordSetupToken } from "@/server/services/auth.service";

const PWD_RULES = {
  minLength: 12,
  test: (p: string) =>
    p.length >= 12 &&
    /[a-z]/.test(p) &&
    /[A-Z]/.test(p) &&
    /[0-9]/.test(p) &&
    /[^A-Za-z0-9]/.test(p),
};

export async function setupPasswordAction(formData: FormData) {
  const token = (formData.get("token") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const confirm = (formData.get("confirm") as string | null) ?? "";

  if (!token) redirect("/admin/login?error=invalid");
  if (password !== confirm) {
    redirect(`/admin/setup-password?token=${encodeURIComponent(token)}&error=mismatch`);
  }
  if (!PWD_RULES.test(password)) {
    redirect(`/admin/setup-password?token=${encodeURIComponent(token)}&error=weak`);
  }

  const ok = await consumePasswordSetupToken(token, password);
  if (!ok) {
    redirect(`/admin/setup-password?token=${encodeURIComponent(token)}&error=invalid_token`);
  }
  redirect("/admin/login");
}
