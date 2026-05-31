/**
 * User management service — for SUPER_ADMIN administering accounts.
 *
 * Phase-3 surface + Phase-4 M1 hardening:
 *   • invite()       — create new user with placeholder password + setup token.
 *   • changeRole()   — assign a different role; bumps sessionVersion.
 *   • disableUser()  — soft-delete (sets `disabledAt`); preserves audit FKs.
 *   • reactivateUser() — clears `disabledAt`.
 *
 * Phase-4 M1 invariants (enforced HERE, not just in UI):
 *   1. A user can never change their own role.
 *   2. A user can never disable themselves.
 *   3. The system must always have at least one active SUPER_ADMIN.
 *      Any change that would leave the count at zero is rejected.
 *
 * Server-only.
 */
import "server-only";
import { db } from "@/lib/db";
import { UserRepository } from "@/server/repositories/user.repository";
import { createPasswordSetupToken } from "@/server/services/auth.service";
import { writeAudit } from "@/server/audit/write-audit";
import { AUDIT_ACTIONS } from "@/server/audit/actions";
import {
  SelfActionError,
  SuperAdminFloorError,
} from "@/server/auth/guards";
import { ROLES } from "@/server/auth/permissions";

const PLACEHOLDER_PASSWORD = "!pending-phase-3!";

/**
 * Counts active (non-disabled) SUPER_ADMINs *excluding* `excludeUserId`. Runs
 * inside the provided Prisma transaction client so the count is consistent
 * with the change being applied.
 */
async function countActiveSuperAdminsExcluding(
  tx: Pick<typeof db, "user">,
  excludeUserId: string,
): Promise<number> {
  return tx.user.count({
    where: {
      role: { name: ROLES.SUPER_ADMIN },
      disabledAt: null,
      id: { not: excludeUserId },
    },
  });
}

export const UserService = {
  async list() {
    return UserRepository.list();
  },

  async findById(id: string) {
    return UserRepository.findById(id);
  },

  async listRoles() {
    return UserRepository.listRoles();
  },

  /**
   * Invite a new admin. Returns a one-time setup token URL fragment so the
   * inviting admin can hand it off (Phase 3 has no email service yet).
   */
  async invite(
    input: { email: string; name: string; roleId: string },
    actorId: string,
  ): Promise<{ userId: string; setupToken: string }> {
    const email = input.email.toLowerCase().trim();
    const existing = await UserRepository.findByEmail(email);
    if (existing) throw new Error("Email already in use");
    const role = await UserRepository.findRoleById(input.roleId);
    if (!role) throw new Error("Role not found");

    const user = await db.user.create({
      data: {
        email,
        name: input.name.trim(),
        password: PLACEHOLDER_PASSWORD,
        roleId: input.roleId,
        mustChangePassword: true,
      },
    });

    const token = await createPasswordSetupToken(user.id);

    await writeAudit({
      actorId,
      action: AUDIT_ACTIONS.USER_CREATE,
      entity: "User",
      entityId: user.id,
      meta: { email, role: role.name },
    });

    return { userId: user.id, setupToken: token };
  },

  /**
   * Change a user's role.
   *   • Rejects self-targeted change (Phase 4 M1 invariant #1).
   *   • Rejects if moving the last active SUPER_ADMIN to a different role
   *     would leave zero active SUPER_ADMINs (invariant #3).
   *   • Bumps `sessionVersion` so the target's JWT becomes stale.
   */
  async changeRole(userId: string, newRoleId: string, actorId: string) {
    if (userId === actorId) {
      throw new SelfActionError("You cannot change your own role.");
    }
    await db.$transaction(async (tx) => {
      const target = await tx.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });
      if (!target) throw new Error("User not found");
      const newRole = await tx.role.findUnique({ where: { id: newRoleId } });
      if (!newRole) throw new Error("Role not found");

      // No-op
      if (target.roleId === newRoleId) return;

      // Floor check: leaving SUPER_ADMIN drops the count by one.
      if (
        target.role.name === ROLES.SUPER_ADMIN &&
        newRole.name !== ROLES.SUPER_ADMIN
      ) {
        const remaining = await countActiveSuperAdminsExcluding(tx, userId);
        if (remaining < 1) throw new SuperAdminFloorError();
      }

      await tx.user.update({
        where: { id: userId },
        data: { roleId: newRoleId, sessionVersion: { increment: 1 } },
      });

      await writeAudit({
        actorId,
        action: AUDIT_ACTIONS.ROLE_CHANGE,
        entity: "User",
        entityId: userId,
        meta: { from: target.role.name, to: newRole.name },
      });
    });
  },

  /**
   * Soft-delete a user.
   *   • Rejects self-targeted disable (invariant #2).
   *   • Rejects if disabling the last active SUPER_ADMIN (invariant #3).
   *   • Idempotent: disabling an already-disabled user is a no-op.
   *   • Bumps `sessionVersion` so the target's JWT becomes stale immediately.
   */
  async disableUser(userId: string, actorId: string) {
    if (userId === actorId) {
      throw new SelfActionError("You cannot deactivate your own account.");
    }
    await db.$transaction(async (tx) => {
      const target = await tx.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });
      if (!target) throw new Error("User not found");
      if (target.disabledAt) return; // already disabled

      if (target.role.name === ROLES.SUPER_ADMIN) {
        const remaining = await countActiveSuperAdminsExcluding(tx, userId);
        if (remaining < 1) throw new SuperAdminFloorError();
      }

      await tx.user.update({
        where: { id: userId },
        data: { disabledAt: new Date(), sessionVersion: { increment: 1 } },
      });

      await writeAudit({
        actorId,
        action: AUDIT_ACTIONS.USER_DISABLE,
        entity: "User",
        entityId: userId,
        meta: { role: target.role.name, email: target.email },
      });
    });
  },

  /** Reactivate a soft-deleted user. Bumps sessionVersion as defense. */
  async reactivateUser(userId: string, actorId: string) {
    if (userId === actorId) {
      // Defensive: cannot happen via UI (disabled users can't log in), but
      // enforce in case the service is called via a script.
      throw new SelfActionError("You cannot reactivate your own account.");
    }
    const target = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, disabledAt: true, email: true, role: { select: { name: true } } },
    });
    if (!target) throw new Error("User not found");
    if (target.disabledAt === null) return; // already active

    await db.user.update({
      where: { id: userId },
      data: { disabledAt: null, sessionVersion: { increment: 1 } },
    });

    await writeAudit({
      actorId,
      action: AUDIT_ACTIONS.USER_REACTIVATE,
      entity: "User",
      entityId: userId,
      meta: { role: target.role.name, email: target.email },
    });
  },
};
