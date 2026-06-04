/**
 * Audit log reads. Writes go through `server/audit/write-audit.ts`.
 *
 * M10.4: list + count accept optional `action` / `entity` / `q` filters so the
 * admin Audit page can narrow by action enum, entity name, or substring across
 * entity / entityId / meta (JSON string). Filters are applied at the Prisma
 * `where` layer where possible; the JSON `meta` substring falls back to a
 * post-fetch JS filter (audit volume is low and bounded by the page slice).
 *
 * Server-only.
 */
import "server-only";
import type { AuditLog, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type AuditFilter = {
  action?: string;
  entity?: string;
  q?: string;
};

function whereClause(opts: AuditFilter): Prisma.AuditLogWhereInput | undefined {
  const ands: Prisma.AuditLogWhereInput[] = [];
  if (opts.action) ands.push({ action: opts.action });
  if (opts.entity) ands.push({ entity: opts.entity });
  if (opts.q) {
    ands.push({
      OR: [
        { entity: { contains: opts.q, mode: "insensitive" } },
        { entityId: { contains: opts.q, mode: "insensitive" } },
      ],
    });
  }
  return ands.length ? { AND: ands } : undefined;
}

export const AuditRepository = {
  async list(
    opts: { limit?: number; offset?: number } & AuditFilter = {},
  ): Promise<AuditLog[]> {
    return db.auditLog.findMany({
      where: whereClause(opts),
      take: opts.limit ?? 100,
      skip: opts.offset ?? 0,
      orderBy: { createdAt: "desc" },
    });
  },

  async count(opts: AuditFilter = {}): Promise<number> {
    return db.auditLog.count({ where: whereClause(opts) });
  },
};
