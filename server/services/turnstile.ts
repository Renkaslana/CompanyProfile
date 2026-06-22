/**
 * Verifikasi Cloudflare Turnstile (captcha) untuk form publik.
 *
 * Graceful/opsional:
 *   • Bila `TURNSTILE_SECRET_KEY` TIDAK di-set → lewati (return true). Situs
 *     tetap jalan di lokal/dev tanpa captcha.
 *   • Bila di-set → token WAJIB valid. Token kosong/invalid → false (blokir).
 *   • Error jaringan ke Cloudflare → fail-OPEN (true) agar pengguna sah tidak
 *     terblokir saat CF outage (sejalan dgn kebijakan rate-limit fail-open).
 *
 * Server-only.
 */
import "server-only";
import { env } from "@/lib/config/env";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(
  token: string,
  ip?: string,
): Promise<boolean> {
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // tidak dikonfigurasi → skip
  if (!token) return false; // dikonfigurasi tapi tak ada token → blokir
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return true; // CF outage → jangan blokir pengguna sah
  }
}
