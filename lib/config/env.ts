/**
 * Environment configuration — single source of truth for `process.env`.
 *
 * Phase 1 scope: Database (Neon) only. Future phases extend `envSchema`
 * (Auth.js secrets in Phase 3, Cloudinary in Phase 4, Upstash/Turnstile in
 * Phase 7/8, Sentry in Phase 10). See `.env.example` for the full roadmap.
 *
 * Policy (per ADR 0007 and DOCS/SECURITY.md):
 *   • Server-only. Never imported by client components.
 *   • Validated at boot. Missing or malformed values throw immediately so the
 *     app fails fast rather than failing mysteriously at first DB call.
 *   • Secrets never appear as `NEXT_PUBLIC_*`.
 *
 * Usage:
 *   import { env } from "@/lib/config/env";
 *   const url = env.DATABASE_URL;
 */
import "server-only";
import { z } from "zod";

/**
 * Accept either the legacy `postgres://` scheme or the modern `postgresql://`.
 * Neon emits `postgresql://...?sslmode=require` for both pooled and direct URLs.
 */
const postgresUrl = z
  .string()
  .trim()
  .min(1, "must not be empty")
  .refine(
    (v) => v.startsWith("postgres://") || v.startsWith("postgresql://"),
    "must start with postgres:// or postgresql://",
  );

/** AUTH_SECRET — at least 32 random bytes, base64 or hex. Required for Auth.js
 *  JWT signing. Rotation invalidates all live sessions (documented in
 *  DOCS/DEPLOYMENT.md). */
const authSecret = z
  .string()
  .trim()
  .min(32, "AUTH_SECRET must be at least 32 characters");

/** AUTH_URL — base URL of the deployment, used by Auth.js for callback URLs
 *  and to validate same-origin requests. Local dev: http://localhost:3000. */
const authUrl = z.string().trim().url();

/** MFA_ENCRYPTION_KEY — 32-byte AES-256-GCM key as 64 hex characters.
 *  Encrypts `User.mfaSecret` at rest. Rotating the key requires re-issuing
 *  MFA secrets (Phase 8 documents the procedure). */
const mfaKey = z
  .string()
  .trim()
  .regex(
    /^[0-9a-fA-F]{64}$/,
    "MFA_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)",
  );

const envSchema = z.object({
  /** Neon **pooled** connection string — used by the app at runtime. */
  DATABASE_URL: postgresUrl,
  /** Neon **direct** connection string — used by Prisma for migrations only. */
  DIRECT_DATABASE_URL: postgresUrl,
  /** Auth.js v5 JWT signing key. */
  AUTH_SECRET: authSecret,
  /** Deployment base URL (Auth.js redirects, CSRF allow-list). */
  AUTH_URL: authUrl,
  /** AES-256-GCM key encrypting `User.mfaSecret` at rest. */
  MFA_ENCRYPTION_KEY: mfaKey,
  /** Optional Upstash Redis for login + form rate-limiting. Phase 3 fails OPEN
   *  if unavailable (logged to AuditLog as WARN) — see ADR section in
   *  SECURITY.md. */
  UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal("")),
  UPSTASH_REDIS_REST_TOKEN: z.string().trim().optional().or(z.literal("")),
  /** Cloudinary — Phase 4. Optional so local dev can run without uploads; the
   *  MediaService throws "not configured" if any operation needs them.
   *
   *  NOTE: NO `NEXT_PUBLIC_` prefix. `cloud_name` and `api_key` are not
   *  secrets, but they are also not embedded at build time — the browser
   *  receives them at runtime via the JSON response from
   *  `/api/v1/admin/media/sign`. Keeping them server-side avoids bundling
   *  them into the client JS. */
  CLOUDINARY_CLOUD_NAME: z.string().trim().optional().or(z.literal("")),
  CLOUDINARY_API_KEY: z.string().trim().optional().or(z.literal("")),
  CLOUDINARY_API_SECRET: z.string().trim().optional().or(z.literal("")),
  /** Cloudflare Turnstile (captcha) untuk form publik — opsional. Tanpa key,
   *  captcha dilewati (form tetap jalan). Site key boleh NEXT_PUBLIC karena
   *  bukan rahasia (dipakai widget di browser); secret key server-only. */
  TURNSTILE_SECRET_KEY: z.string().trim().optional().or(z.literal("")),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().trim().optional().or(z.literal("")),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Pretty-print which keys are missing or invalid — make the failure obvious
  // in dev and CI logs without leaking secret values.
  const issues = parsed.error.flatten().fieldErrors;
  console.error("❌ Invalid environment variables:", issues);
  throw new Error(
    "Invalid environment variables. Check `.env` against `.env.example` " +
      "(see lib/config/env.ts for the schema).",
  );
}

/** Validated, typed access to the current environment. */
export const env: Env = parsed.data;
