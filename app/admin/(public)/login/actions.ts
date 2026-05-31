"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  if (!email || !password) redirect("/admin/login?error=invalid");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin",
    });
  } catch (e) {
    // signIn throws a NEXT_REDIRECT internally on success; re-throw those.
    if ((e as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      throw e;
    }
    if (e instanceof AuthError) {
      redirect("/admin/login?error=invalid");
    }
    redirect("/admin/login?error=invalid");
  }
}
