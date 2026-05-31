/**
 * Service-layer authorization guards.
 *
 * Pattern:
 *   const user = await requirePermission("content:publish");
 *
 * Three errors signal three distinct conditions:
 *   • UnauthorizedError — no session present
 *   • SessionStaleError — `User.sessionVersion` has been bumped since the
 *     JWT was issued (role change, password change, "log out all devices")
 *   • ForbiddenError — session valid, permission missing
 *
 * Server-only.
 */
import "server-only";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { writeAudit } from "@/server/audit/write-audit";
import { AUDIT_ACTIONS } from "@/server/audit/actions";
import type { Permission } from "@/server/auth/permissions";

export class UnauthorizedError extends Error {
  constructor(msg = "Unauthorized") {
    super(msg);
    this.name = "UnauthorizedError";
  }
}
export class ForbiddenError extends Error {
  constructor(msg = "Forbidden") {
    super(msg);
    this.name = "ForbiddenError";
  }
}
export class SessionStaleError extends Error {
  constructor(msg = "Session stale — please log in again") {
    super(msg);
    this.name = "SessionStaleError";
  }
}

/** Rejecting a self-targeted destructive action (e.g. demote/disable yourself). */
export class SelfActionError extends Error {
  constructor(msg = "You cannot perform this action on your own account") {
    super(msg);
    this.name = "SelfActionError";
  }
}

/** Rejecting an action that would leave the system without an active SUPER_ADMIN. */
export class SuperAdminFloorError extends Error {
  constructor(
    msg = "Action denied: the system must always have at least one active SUPER_ADMIN.",
  ) {
    super(msg);
    this.name = "SuperAdminFloorError";
  }
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: Permission[];
  sessionVersion: number;
  mustChangePassword: boolean;
  mfaEnabled: boolean;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as SessionUser;
}

export async function requireSession(): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) throw new UnauthorizedError();
  return u;
}

/**
 * Validates the JWT's `sessionVersion` against the live DB value. Cheap
 * single SELECT. Throws `SessionStaleError` if a role/password change has
 * happened since issue.
 */
export async function requireFreshSession(): Promise<SessionUser> {
  const u = await requireSession();
  const row = await db.user.findUnique({
    where: { id: u.id },
    select: { sessionVersion: true },
  });
  if (!row) throw new UnauthorizedError();
  if (row.sessionVersion !== u.sessionVersion) throw new SessionStaleError();
  return u;
}

export async function requirePermission(perm: Permission): Promise<SessionUser> {
  const user = await requireFreshSession();
  if (!user.permissions.includes(perm)) {
    await writeAudit({
      actorId: user.id,
      action: AUDIT_ACTIONS.ACCESS_DENIED,
      entity: "Permission",
      entityId: perm,
    });
    throw new ForbiddenError(`Missing permission: ${perm}`);
  }
  return user;
}

export async function hasPermission(perm: Permission): Promise<boolean> {
  const u = await getSessionUser();
  return !!u && u.permissions.includes(perm);
}
