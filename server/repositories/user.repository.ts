/**
 * User + Role + Auth-related Prisma reads/writes. Thin wrappers only —
 * services own all business rules.
 *
 * Server-only.
 */
import "server-only";
import type { User, Role, AuthToken, AuthTokenType } from "@prisma/client";
import { db } from "@/lib/db";

export const UserRepository = {
  async list(): Promise<Array<User & { role: Role }>> {
    return db.user.findMany({
      include: { role: true },
      orderBy: { createdAt: "asc" },
    });
  },

  async findById(id: string) {
    return db.user.findUnique({ where: { id }, include: { role: true } });
  },

  async findByEmail(email: string) {
    return db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { role: true },
    });
  },

  /**
   * Batched lookup of users by id — used by the Audit Log page to display
   * actor name/email for cuid actorIds. Returns only the public-safe columns.
   */
  async findManyByIdSafe(
    ids: string[],
  ): Promise<Array<{ id: string; name: string; email: string }>> {
    if (ids.length === 0) return [];
    return db.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, email: true },
    });
  },

  async listRoles(): Promise<Role[]> {
    return db.role.findMany({ orderBy: { name: "asc" } });
  },

  async findRoleById(id: string): Promise<Role | null> {
    return db.role.findUnique({ where: { id } });
  },
};

export const AuthTokenRepository = {
  async findByHash(tokenHash: string): Promise<(AuthToken & { user: User }) | null> {
    return db.authToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  },

  async deleteUnusedFor(userId: string, type: AuthTokenType): Promise<void> {
    await db.authToken.deleteMany({
      where: { userId, type, usedAt: null },
    });
  },
};
