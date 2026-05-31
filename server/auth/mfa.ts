/**
 * MFA helpers — STUB for Phase 3.
 *
 * Schema fields (`User.mfaEnabled`, `User.mfaSecret`, `MfaBackupCode`) and
 * env (`MFA_ENCRYPTION_KEY`) are in place so Phase 8 can wire the full
 * TOTP-with-otplib-v13 flow + login challenge UI without a migration.
 *
 * Phase 3 ships no MFA UI, so these functions are dormant. Calling them
 * throws — defensive: no code path should reach them this phase.
 *
 * AES-256-GCM encryption helpers ARE provided in working form because they
 * have no library dependency and Phase 8 will reuse them as-is.
 *
 * Server-only.
 */
import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";
import { env } from "@/lib/config/env";

const KEY = Buffer.from(env.MFA_ENCRYPTION_KEY, "hex");
if (KEY.length !== 32) {
  throw new Error("MFA_ENCRYPTION_KEY must be 32 bytes (64 hex chars)");
}

/* ── AES-256-GCM at-rest encryption — Phase-8-ready ─────────────────────── */

/** Pack format: iv(12) || tag(16) || ciphertext — base64-encoded. */
export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", KEY, iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString("base64");
}

export function decryptSecret(packed: string): string {
  const buf = Buffer.from(packed, "base64");
  if (buf.length < 12 + 16 + 1) throw new Error("ciphertext too short");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

export function hashBackupCode(code: string): string {
  return createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

/* ── TOTP — STUBBED in Phase 3 ──────────────────────────────────────────── */

function notImplemented(): never {
  throw new Error(
    "MFA TOTP helpers are not implemented in Phase 3. " +
      "Phase 8 wires otplib v13 (TOTP class) + the enrollment UI. " +
      "See server/auth/mfa.ts for the encryption helpers that ARE ready.",
  );
}

export function generateTotpSecret(): string {
  notImplemented();
}
export function otpAuthUrl(): string {
  notImplemented();
}
export async function qrDataUrl(): Promise<string> {
  notImplemented();
}
export function verifyTotp(): boolean {
  notImplemented();
}
export function generateBackupCodes(): Array<{ code: string; hash: string }> {
  notImplemented();
}
