/**
 * Audit writer — records every meaningful mutation as an `AuditLog` row.
 *
 * Called from the service layer in Phase 3+ (RBAC) and Phase 4+ (CMS) — every
 * create/update/delete that changes state should call `writeAudit(...)` with
 * the actor, the action, the entity, and any structured metadata.
 *
 * Phase 8 (security hardening) makes the `AuditLog` table append-only at the
 * DB level (no UPDATE/DELETE privileges). For Phase 1 this is just the API.
 *
 * Server-only.
 */
import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type WriteAuditInput = {
  /** `User.id` of the actor performing the mutation. */
  actorId: string;
  /** Human-readable verb + scope, e.g. `"UPDATE news.publish"`. */
  action: string;
  /** Prisma model name, e.g. `"NewsPost"`. */
  entity: string;
  /** Affected row id, when applicable. */
  entityId?: string;
  /** Optional structured payload (before/after diff, IP, user-agent…). */
  meta?: Prisma.InputJsonValue;
};

/**
 * Inserts one `AuditLog` row. Intentionally **fire-and-await** rather than
 * fire-and-forget so the caller can surface failures (callers may wrap in
 * `try { await … } catch …` if they want best-effort semantics).
 */
export async function writeAudit(input: WriteAuditInput): Promise<void> {
  await db.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      meta: input.meta,
    },
  });
}
