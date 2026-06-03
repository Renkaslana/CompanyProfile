/**
 * Stats CMS service — admin write surface for `Stat` (Phase 4 M9).
 *
 * Fixed-size 4 rows; `key` is immutable per row. Editing one row writes
 * an audit `STAT_UPDATE` with before/after diff in meta.
 *
 * Server-only.
 */
import "server-only";
import type { Stat } from "@prisma/client";
import { ContentRepository } from "@/server/repositories/content.repository";
import { writeAudit } from "@/server/audit/write-audit";
import { AUDIT_ACTIONS } from "@/server/audit/actions";
import { requirePermission, type SessionUser } from "@/server/auth/guards";

export class StatNotFoundError extends Error {
  constructor() {
    super("Stat tidak ditemukan.");
    this.name = "StatNotFoundError";
  }
}

type UpdateFields = {
  label: string;
  value: number;
  suffix: string | null;
  source: "MANUAL" | "DERIVED";
};

export const StatsCmsService = {
  async list(): Promise<Stat[]> {
    await requirePermission("content:read");
    return ContentRepository.findAllStats();
  },

  async updateByKey(key: string, input: UpdateFields, actor: SessionUser): Promise<Stat> {
    await requirePermission("content:write");
    const existing = await ContentRepository.findStatByKey(key);
    if (!existing) throw new StatNotFoundError();

    const updated = await ContentRepository.updateStatByKey(key, {
      label: input.label,
      value: input.value,
      suffix: input.suffix,
      source: input.source,
    });

    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.STAT_UPDATE,
      entity: "Stat",
      entityId: existing.id,
      meta: {
        key,
        before: {
          label: existing.label,
          value: existing.value,
          suffix: existing.suffix,
          source: existing.source,
        },
        after: {
          label: updated.label,
          value: updated.value,
          suffix: updated.suffix,
          source: updated.source,
        },
      },
    });
    return updated;
  },

  async reorder(key: string, direction: "up" | "down", actor: SessionUser): Promise<void> {
    await requirePermission("content:write");
    const all = await ContentRepository.findAllStats();
    const index = all.findIndex((s) => s.key === key);
    if (index === -1) throw new StatNotFoundError();
    const neighbourIndex = direction === "up" ? index - 1 : index + 1;
    if (neighbourIndex < 0 || neighbourIndex >= all.length) return;
    const me = all[index];
    const neighbour = all[neighbourIndex];
    await ContentRepository.swapStatOrders(
      { key: me.key, order: me.order },
      { key: neighbour.key, order: neighbour.order },
    );
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.STAT_UPDATE,
      entity: "Stat",
      entityId: me.id,
      meta: { reorder: direction, swappedWith: neighbour.key, key: me.key },
    });
  },
};
