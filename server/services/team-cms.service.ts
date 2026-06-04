/**
 * Team CMS service — admin write surface for `TeamMember` (Phase 4 M8).
 *
 * No status workflow. Photo is optional.
 *
 * Server-only.
 */
import "server-only";
import type { TeamMember } from "@prisma/client";
import { ContentRepository } from "@/server/repositories/content.repository";
import { writeAudit } from "@/server/audit/write-audit";
import { AUDIT_ACTIONS } from "@/server/audit/actions";
import { requirePermission, type SessionUser } from "@/server/auth/guards";
import {
  applyListOpts,
  countListOpts,
  type ListOpts,
} from "@/server/utils/list-filter";

export class TeamNotFoundError extends Error {
  constructor() {
    super("Anggota tim tidak ditemukan.");
    this.name = "TeamNotFoundError";
  }
}

type WriteFields = {
  name: string;
  role: string;
  bio: string | null;
  photoId: string | null;
  order: number;
};

export const TeamCmsService = {
  async list(opts: ListOpts = {}): Promise<TeamMember[]> {
    await requirePermission("content:read");
    const all = await ContentRepository.findAllTeam();
    return applyListOpts(all, opts, (t) => [t.name, t.role, t.bio]);
  },

  async count(opts: Pick<ListOpts, "q"> = {}): Promise<number> {
    await requirePermission("content:read");
    const all = await ContentRepository.findAllTeam();
    return countListOpts(all, opts, (t) => [t.name, t.role, t.bio]);
  },

  async findById(id: string): Promise<TeamMember | null> {
    await requirePermission("content:read");
    return ContentRepository.findTeamById(id);
  },

  async create(input: WriteFields, actor: SessionUser): Promise<TeamMember> {
    await requirePermission("content:write");
    const orderValue =
      input.order > 0 ? input.order : await ContentRepository.getNextTeamOrder();
    const created = await ContentRepository.createTeamMember({
      name: input.name,
      role: input.role,
      bio: input.bio,
      photoId: input.photoId,
      order: orderValue,
    });
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.TEAM_CREATE,
      entity: "TeamMember",
      entityId: created.id,
      meta: { name: created.name, role: created.role },
    });
    return created;
  },

  async update(id: string, input: WriteFields, actor: SessionUser): Promise<TeamMember> {
    await requirePermission("content:write");
    const existing = await ContentRepository.findTeamById(id);
    if (!existing) throw new TeamNotFoundError();
    const updated = await ContentRepository.updateTeamMember(id, {
      name: input.name,
      role: input.role,
      bio: input.bio,
      photoId: input.photoId,
      order: input.order,
    });
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.TEAM_UPDATE,
      entity: "TeamMember",
      entityId: id,
      meta: { name: updated.name, role: updated.role },
    });
    return updated;
  },

  async delete(id: string, actor: SessionUser): Promise<void> {
    await requirePermission("content:write");
    const existing = await ContentRepository.findTeamById(id);
    if (!existing) throw new TeamNotFoundError();
    await ContentRepository.deleteTeamMember(id);
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.TEAM_DELETE,
      entity: "TeamMember",
      entityId: id,
      meta: { name: existing.name, role: existing.role },
    });
  },

  async reorder(id: string, direction: "up" | "down", actor: SessionUser): Promise<void> {
    await requirePermission("content:write");
    const all = await ContentRepository.findAllTeam();
    const index = all.findIndex((t) => t.id === id);
    if (index === -1) throw new TeamNotFoundError();
    const neighbourIndex = direction === "up" ? index - 1 : index + 1;
    if (neighbourIndex < 0 || neighbourIndex >= all.length) return;
    const me = all[index];
    const neighbour = all[neighbourIndex];
    await ContentRepository.swapTeamOrders(
      { id: me.id, order: me.order },
      { id: neighbour.id, order: neighbour.order },
    );
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.TEAM_UPDATE,
      entity: "TeamMember",
      entityId: me.id,
      meta: { reorder: direction, swappedWith: neighbour.id, name: me.name },
    });
  },
};
