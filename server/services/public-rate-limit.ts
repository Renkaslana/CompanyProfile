/**
 * Rate limiter untuk form PUBLIK (mis. lead/kontak) — Upstash Redis sliding
 * window. Mengikuti pola & kebijakan `server/auth/rate-limit.ts`:
 * **fail-OPEN** bila Upstash tak dikonfigurasi atau error (situs tetap menerima
 * pengajuan; proteksi aktif begitu key di-set di produksi).
 *
 * Server-only.
 */
import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/config/env";

export type PublicFormRateOutcome =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

let leadLimiter: Ratelimit | null = null;
let initialized = false;

function init() {
  if (initialized) return;
  initialized = true;
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return;
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
  leadLimiter = new Ratelimit({
    redis,
    // 3 pengajuan per 10 menit per IP — cukup untuk pengguna sah, menahan spam.
    limiter: Ratelimit.slidingWindow(3, "10 m"),
    prefix: "rl:lead:ip",
    analytics: false,
  });
}

/** Batasi per-IP. Fail-open (allowed) bila backend tak ada / error. */
export async function checkPublicFormRateLimit(
  ip: string,
): Promise<PublicFormRateOutcome> {
  init();
  if (!leadLimiter) return { allowed: true };
  try {
    const res = await leadLimiter.limit(ip || "unknown");
    if (!res.success) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(Math.ceil((res.reset - Date.now()) / 1000), 1),
      };
    }
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}
