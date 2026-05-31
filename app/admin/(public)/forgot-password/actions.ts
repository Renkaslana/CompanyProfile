"use server";

import { redirect } from "next/navigation";
import { createPasswordResetToken } from "@/server/services/auth.service";
import { env } from "@/lib/config/env";

export async function forgotPasswordAction(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  if (!email) redirect("/admin/forgot-password?sent=1");

  // Always respond with the same generic state to prevent email enumeration.
  const raw = await createPasswordResetToken(email);
  if (raw) {
    const url = `${env.AUTH_URL.replace(/\/$/, "")}/admin/reset-password?token=${raw}`;
    // Phase 3: log the URL to server console (no email service yet).
    // Phase 4 will replace this with a transactional email send.
    console.info("[forgot-password] reset link:", url);
  }
  redirect("/admin/forgot-password?sent=1");
}
