/**
 * Login rate limiter using Upstash Redis (sliding window).
 *
 * Phase-3 decision (approved): **fail-OPEN** when the rate-limit backend is
 * unavailable or unconfigured. Every fail-open is logged to the audit table
 * as `RATE_LIMIT_UNAVAILABLE` so operators can monitor and detect outages.
 *
 * Two parallel limits: per-IP and per-email. Either tripped → deny.
 *
 * Server-only.
 */
import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/config/env";

export type RateLimitOutcome =
  | { allowed: true; reason?: "ok" | "unavailable" }
  | { allowed: false; reason: "limit"; retryAfterSeconds: number };

let ipLimiter: Ratelimit | null = null;
let emailLimiter: Ratelimit | null = null;
let initialized = false;

function init() {
  if (initialized) return;
  initialized = true;
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return;
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
  ipLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    prefix: "rl:login:ip",
    analytics: false,
  });
  emailLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    prefix: "rl:login:email",
    analytics: false,
  });
}

export async function checkLoginRateLimit(
  ip: string,
  email: string,
): Promise<RateLimitOutcome> {
  init();
  if (!ipLimiter || !emailLimiter) {
    return { allowed: true, reason: "unavailable" };
  }
  try {
    const [ipRes, emailRes] = await Promise.all([
      ipLimiter.limit(ip || "unknown"),
      emailLimiter.limit(email.toLowerCase()),
    ]);
    if (!ipRes.success || !emailRes.success) {
      const retry = Math.max(
        Math.ceil((ipRes.reset - Date.now()) / 1000),
        Math.ceil((emailRes.reset - Date.now()) / 1000),
        1,
      );
      return { allowed: false, reason: "limit", retryAfterSeconds: retry };
    }
    return { allowed: true, reason: "ok" };
  } catch {
    return { allowed: true, reason: "unavailable" };
  }
}
