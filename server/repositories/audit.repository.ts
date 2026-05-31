/**
 * Audit log reads. Writes go through `server/audit/write-audit.ts`.
 * Server-only.
 */
import "server-only";
import type { AuditLog } from "@prisma/client";
import { db } from "@/lib/db";

export const AuditRepository = {
  async list(opts: { limit?: number; offset?: number } = {}): Promise<AuditLog[]> {
    return db.auditLog.findMany({
      take: opts.limit ?? 100,
      skip: opts.offset ?? 0,
      orderBy: { createdAt: "desc" },
    });
  },

  async count(): Promise<number> {
    return db.auditLog.count();
  },
};
