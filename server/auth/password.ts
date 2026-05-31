/**
 * Argon2id password hashing.
 *
 * Parameters per OWASP Password Storage Cheat Sheet (2023 baseline):
 *   m=19456 KiB (19 MiB), t=2, p=1. Tuned for adequate cost on commodity
 *   serverless hardware (~50ms per verify on Vercel Node). Increase only with
 *   a security review.
 *
 * Server-only.
 */
import "server-only";
import { hash, verify } from "@node-rs/argon2";

// Argon2id = 2 in @node-rs/argon2's `Algorithm` enum. Using the literal avoids
// the isolatedModules const-enum restriction.
const ARGON2_PARAMS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
  algorithm: 2 as const,
};

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, ARGON2_PARAMS);
}

/**
 * Constant-time verify. Returns `false` on any error to avoid leaking parser
 * errors as a side-channel. Callers should run a verify against a dummy hash
 * even when the user does not exist, to equalize timing (handled in the
 * authenticate flow).
 */
export async function verifyPassword(
  plain: string,
  encoded: string,
): Promise<boolean> {
  try {
    return await verify(encoded, plain);
  } catch {
    return false;
  }
}

/**
 * A pre-computed argon2id hash of a random string. Used as the verify target
 * when a login attempt's email doesn't match any user, so the response timing
 * looks identical to a real-but-wrong-password attempt. Periodically refresh.
 */
export const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$ZHVtbXktc2FsdC1ub25vbmU$Ay/h8ZxXOOhk+u3y3J5cdmL3VrPv9nJh4Bq1S4PqnVU";
