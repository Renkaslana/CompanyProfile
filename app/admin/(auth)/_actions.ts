"use server";

/**
 * Shared admin auth actions — used by both the desktop header sign-out form
 * (server-rendered in layout.tsx) and the mobile nav drawer (client) so the
 * same Server Action reference is reused on both surfaces.
 */
import { signOut } from "@/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
