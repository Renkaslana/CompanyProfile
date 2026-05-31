/**
 * Auth service — authentication, password lifecycle, MFA flows.
 *
 * Layer rules: all auth-related business logic lives here. Server-only.
 */
import "server-only";
import { db } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  DUMMY_PASSWORD_HASH,
} from "@/server/auth/password";
import { generateToken, sha256 } from "@/server/auth/tokens";
import { checkLoginRateLimit } from "@/server/auth/rate-limit";
// MFA helpers are dormant in Phase 3 (UI lands in Phase 8) — encryption
// helpers in `server/auth/mfa.ts` are ready; TOTP wiring is Phase 8.
import type { Permission } from "@/server/auth/permissions";
import { writeAudit } from "@/server/audit/write-audit";
import { AUDIT_ACTIONS } from "@/server/audit/actions";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const PLACEHOLDER_PASSWORD = "!pending-phase-3!";

/** Used by NextAuth Credentials `authorize` callback (runs in Node). */
export async function authenticateUser(
  email: string,
  plain: string,
  ip = "unknown",
) {
  const normalizedEmail = email.toLowerCase().trim();

  // Rate limit (fail-OPEN with audit, per approved Phase 3 decision)
  const rl = await checkLoginRateLimit(ip, normalizedEmail);
  if (rl.reason === "unavailable") {
    await writeAudit({
      actorId: "anonymous",
      action: AUDIT_ACTIONS.RATE_LIMIT_UNAVAILABLE,
      entity: "Auth",
      meta: { surface: "login", ip },
    });
  }
  if (rl.allowed === false) {
    await writeAudit({
      actorId: "anonymous",
      action: AUDIT_ACTIONS.LOGIN_LOCKOUT,
      entity: "Auth",
      meta: { email: normalizedEmail, ip, retryAfter: rl.retryAfterSeconds },
    });
    return null;
  }

  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    include: { role: true },
  });

  // Constant-time-ish: always run a verify even when user is absent.
  const referenceHash =
    user && user.password !== PLACEHOLDER_PASSWORD
      ? user.password
      : DUMMY_PASSWORD_HASH;
  const ok = await verifyPassword(plain, referenceHash);

  if (!user) {
    await writeAudit({
      actorId: "anonymous",
      action: AUDIT_ACTIONS.LOGIN_FAIL,
      entity: "User",
      meta: { email: normalizedEmail, ip, reason: "unknown_email" },
    });
    return null;
  }

  if (user.disabledAt) {
    // Disabled (soft-deleted) accounts cannot authenticate. Generic error to
    // the caller — same response as bad-password so disabled-ness is not
    // disclosed by login behaviour.
    await writeAudit({
      actorId: user.id,
      action: AUDIT_ACTIONS.LOGIN_FAIL,
      entity: "User",
      entityId: user.id,
      meta: { ip, reason: "account_disabled" },
    });
    return null;
  }

  if (user.mustChangePassword || user.password === PLACEHOLDER_PASSWORD) {
    await writeAudit({
      actorId: user.id,
      action: AUDIT_ACTIONS.LOGIN_FAIL,
      entity: "User",
      entityId: user.id,
      meta: { ip, reason: "password_setup_required" },
    });
    return null;
  }

  if (!ok) {
    await writeAudit({
      actorId: user.id,
      action: AUDIT_ACTIONS.LOGIN_FAIL,
      entity: "User",
      entityId: user.id,
      meta: { ip, reason: "bad_password" },
    });
    return null;
  }

  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await writeAudit({
    actorId: user.id,
    action: AUDIT_ACTIONS.LOGIN_SUCCESS,
    entity: "User",
    entityId: user.id,
    meta: { ip },
  });

  const permissions = (user.role.permissions as Permission[]) ?? [];
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role.name,
    permissions,
    sessionVersion: user.sessionVersion,
    mustChangePassword: user.mustChangePassword,
    mfaEnabled: user.mfaEnabled,
  };
}

/* ── Password setup / reset tokens ───────────────────────────────────────── */

export async function createPasswordSetupToken(userId: string): Promise<string> {
  const { raw, hash } = generateToken();
  await db.authToken.deleteMany({
    where: { userId, type: "PASSWORD_SETUP", usedAt: null },
  });
  await db.authToken.create({
    data: {
      userId,
      type: "PASSWORD_SETUP",
      tokenHash: hash,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  return raw;
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (!user) return null;
  const { raw, hash } = generateToken();
  await db.authToken.deleteMany({
    where: { userId: user.id, type: "PASSWORD_RESET", usedAt: null },
  });
  await db.authToken.create({
    data: {
      userId: user.id,
      type: "PASSWORD_RESET",
      tokenHash: hash,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  await writeAudit({
    actorId: user.id,
    action: AUDIT_ACTIONS.PASSWORD_RESET_REQUEST,
    entity: "User",
    entityId: user.id,
  });
  return raw;
}

export async function consumePasswordSetupToken(
  raw: string,
  newPassword: string,
): Promise<boolean> {
  return consumePasswordToken(raw, "PASSWORD_SETUP", newPassword, AUDIT_ACTIONS.PASSWORD_SET);
}

export async function consumePasswordResetToken(
  raw: string,
  newPassword: string,
): Promise<boolean> {
  return consumePasswordToken(raw, "PASSWORD_RESET", newPassword, AUDIT_ACTIONS.PASSWORD_RESET);
}

async function consumePasswordToken(
  raw: string,
  type: "PASSWORD_SETUP" | "PASSWORD_RESET",
  newPassword: string,
  action: string,
): Promise<boolean> {
  const tokenHash = sha256(raw);
  const token = await db.authToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!token) return false;
  if (token.usedAt) return false;
  if (token.type !== type) return false;
  if (token.expiresAt < new Date()) return false;

  const pwHash = await hashPassword(newPassword);
  await db.$transaction([
    db.user.update({
      where: { id: token.userId },
      data: {
        password: pwHash,
        mustChangePassword: false,
        sessionVersion: { increment: 1 },
      },
    }),
    db.authToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await writeAudit({
    actorId: token.userId,
    action,
    entity: "User",
    entityId: token.userId,
  });
  return true;
}

/* ── MFA flows — deferred to Phase 8 ────────────────────────────────────── */
// Schema (User.mfaEnabled, User.mfaSecret, MfaBackupCode) and AES-GCM
// encryption helpers in `server/auth/mfa.ts` are ready for Phase 8 to wire
// the enrollment + login challenge UI together with the otplib v13 TOTP
// integration. Phase 3 ships no MFA UI — no service method here.
