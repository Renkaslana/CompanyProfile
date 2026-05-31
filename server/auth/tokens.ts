/**
 * Auth token primitives. Raw tokens are 32 bytes (base64url-encoded ≈ 43
 * chars). Only sha256 hashes are persisted — DB compromise cannot leak
 * usable tokens.
 *
 * Server-only.
 */
import "server-only";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";

export function generateToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("base64url");
  return { raw, hash: sha256(raw) };
}

export function sha256(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}
