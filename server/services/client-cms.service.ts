/**
 * Clients CMS service — admin write surface for `ClientLogo` (Phase 4 M8).
 *
 * No status workflow. Logo, sector, and URL are all optional.
 *
 * Server-only.
 */
import "server-only";
import type { ClientLogo } from "@prisma/client";
import { ContentRepository } from "@/server/repositories/content.repository";
import { writeAudit } from "@/server/audit/write-audit";
import { AUDIT_ACTIONS } from "@/server/audit/actions";
import { requirePermission, type SessionUser } from "@/server/auth/guards";
import {
  applyListOpts,
  countListOpts,
  type ListOpts,
} from "@/server/utils/list-filter";

export class ClientNotFoundError extends Error {
  constructor() {
    super("Klien tidak ditemukan.");
    this.name = "ClientNotFoundError";
  }
}

type WriteFields = {
  name: string;
  sector: string | null;
  url: string | null;
  logoId: string | null;
  order: number;
};

export const ClientCmsService = {
  async list(opts: ListOpts = {}): Promise<ClientLogo[]> {
    await requirePermission("content:read");
    const all = await ContentRepository.findAllClients();
    return applyListOpts(all, opts, (c) => [c.name, c.sector, c.url]);
  },

  async count(opts: Pick<ListOpts, "q"> = {}): Promise<number> {
    await requirePermission("content:read");
    const all = await ContentRepository.findAllClients();
    return countListOpts(all, opts, (c) => [c.name, c.sector, c.url]);
  },

  async findById(id: string): Promise<ClientLogo | null> {
    await requirePermission("content:read");
    return ContentRepository.findClientById(id);
  },

  async create(input: WriteFields, actor: SessionUser): Promise<ClientLogo> {
    await requirePermission("content:write");
    const orderValue =
      input.order > 0 ? input.order : await ContentRepository.getNextClientOrder();
    const created = await ContentRepository.createClientLogo({
      name: input.name,
      sector: input.sector,
      url: input.url,
      logoId: input.logoId,
      order: orderValue,
    });
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.CLIENT_CREATE,
      entity: "ClientLogo",
      entityId: created.id,
      meta: { name: created.name, sector: created.sector },
    });
    return created;
  },

  async update(id: string, input: WriteFields, actor: SessionUser): Promise<ClientLogo> {
    await requirePermission("content:write");
    const existing = await ContentRepository.findClientById(id);
    if (!existing) throw new ClientNotFoundError();
    const updated = await ContentRepository.updateClientLogo(id, {
      name: input.name,
      sector: input.sector,
      url: input.url,
      logoId: input.logoId,
      order: input.order,
    });
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.CLIENT_UPDATE,
      entity: "ClientLogo",
      entityId: id,
      meta: { name: updated.name, sector: updated.sector },
    });
    return updated;
  },

  async delete(id: string, actor: SessionUser): Promise<void> {
    await requirePermission("content:write");
    const existing = await ContentRepository.findClientById(id);
    if (!existing) throw new ClientNotFoundError();
    await ContentRepository.deleteClientLogo(id);
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.CLIENT_DELETE,
      entity: "ClientLogo",
      entityId: id,
      meta: { name: existing.name, sector: existing.sector },
    });
  },

  async reorder(id: string, direction: "up" | "down", actor: SessionUser): Promise<void> {
    await requirePermission("content:write");
    const all = await ContentRepository.findAllClients();
    const index = all.findIndex((c) => c.id === id);
    if (index === -1) throw new ClientNotFoundError();
    const neighbourIndex = direction === "up" ? index - 1 : index + 1;
    if (neighbourIndex < 0 || neighbourIndex >= all.length) return;
    const me = all[index];
    const neighbour = all[neighbourIndex];
    await ContentRepository.swapClientOrders(
      { id: me.id, order: me.order },
      { id: neighbour.id, order: neighbour.order },
    );
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.CLIENT_UPDATE,
      entity: "ClientLogo",
      entityId: me.id,
      meta: { reorder: direction, swappedWith: neighbour.id, name: me.name },
    });
  },
};
