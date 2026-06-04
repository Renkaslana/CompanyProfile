/**
 * Services CMS service — admin write surface for the public-domain `Service`
 * model (Phase 4 M5).
 *
 * Public reads continue to flow through `ContentService.getPublishedServices()`
 * / `getServiceBySlug()`. This module is mutations-only: create, update,
 * delete, publish toggle, reorder.
 *
 * Layer rules (DOCS/BACKEND_STRUCTURE.md):
 *   • Every public method checks RBAC via `requirePermission`.
 *   • Every mutation writes an `AuditLog` row via `writeAudit`.
 *   • Repository calls are the only DB access.
 *   • Cover image (MediaAsset) is referenced by id; the repository persists
 *     the FK, the marketing-site render path resolves it via mappers.
 *
 * Server-only.
 */
import "server-only";
import type { Service } from "@prisma/client";
import { ContentRepository } from "@/server/repositories/content.repository";
import { writeAudit } from "@/server/audit/write-audit";
import { AUDIT_ACTIONS } from "@/server/audit/actions";
import { requirePermission, type SessionUser } from "@/server/auth/guards";
import {
  applyListOpts,
  countListOpts,
  type ListOpts,
} from "@/server/utils/list-filter";

export class SlugTakenError extends Error {
  constructor(slug: string) {
    super(`Slug "${slug}" sudah dipakai layanan lain.`);
    this.name = "SlugTakenError";
  }
}

export class ServiceNotFoundError extends Error {
  constructor() {
    super("Layanan tidak ditemukan.");
    this.name = "ServiceNotFoundError";
  }
}

type WriteFields = {
  title: string;
  slug: string;
  category: "LOGISTICS" | "TRANSPORTATION" | "CAR_RENTAL" | "GENERAL_TRADING";
  summary: string;
  body: string;
  iconKey: string;
  coverId: string | null;
  highlights: string[];
  order: number;
  published: boolean;
};

export const ServiceCmsService = {
  /**
   * All services, drafts included — for the admin list page.
   * `q` (optional): case-insensitive substring match against title + slug.
   * `skip` / `take`: server-side pagination.
   */
  async list(opts: ListOpts = {}): Promise<Service[]> {
    await requirePermission("content:read");
    const all = await ContentRepository.findAllServices();
    return applyListOpts(all, opts, (s) => [s.title, s.slug, s.summary]);
  },

  /** Count of services matching `q` (for pagination total). */
  async count(opts: Pick<ListOpts, "q"> = {}): Promise<number> {
    await requirePermission("content:read");
    const all = await ContentRepository.findAllServices();
    return countListOpts(all, opts, (s) => [s.title, s.slug, s.summary]);
  },

  /** One service by id — for the admin edit page. */
  async findById(id: string): Promise<Service | null> {
    await requirePermission("content:read");
    return ContentRepository.findServiceById(id);
  },

  async create(input: WriteFields, actor: SessionUser): Promise<Service> {
    await requirePermission("content:write");
    const clash = await ContentRepository.findServiceByExactSlug(input.slug);
    if (clash) throw new SlugTakenError(input.slug);

    const nextOrder = input.order > 0 ? input.order : await ContentRepository.getNextServiceOrder();

    const created = await ContentRepository.createService({
      slug: input.slug,
      title: input.title,
      category: input.category,
      summary: input.summary,
      body: input.body,
      iconKey: input.iconKey,
      coverId: input.coverId,
      highlights: input.highlights,
      order: nextOrder,
      published: input.published,
    });

    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.SERVICE_CREATE,
      entity: "Service",
      entityId: created.id,
      meta: { slug: created.slug, title: created.title, published: created.published },
    });
    return created;
  },

  async update(id: string, input: WriteFields, actor: SessionUser): Promise<Service> {
    await requirePermission("content:write");
    const existing = await ContentRepository.findServiceById(id);
    if (!existing) throw new ServiceNotFoundError();
    if (input.slug !== existing.slug) {
      const clash = await ContentRepository.findServiceByExactSlug(input.slug, id);
      if (clash) throw new SlugTakenError(input.slug);
    }

    const updated = await ContentRepository.updateService(id, {
      slug: input.slug,
      title: input.title,
      category: input.category,
      summary: input.summary,
      body: input.body,
      iconKey: input.iconKey,
      coverId: input.coverId,
      highlights: input.highlights,
      order: input.order,
      // Update never flips published here — togglePublish is the dedicated path.
    });

    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.SERVICE_UPDATE,
      entity: "Service",
      entityId: updated.id,
      meta: { slug: updated.slug, title: updated.title },
    });
    return updated;
  },

  async togglePublish(id: string, actor: SessionUser): Promise<Service> {
    await requirePermission("content:publish");
    const existing = await ContentRepository.findServiceById(id);
    if (!existing) throw new ServiceNotFoundError();
    const updated = await ContentRepository.updateService(id, {
      published: !existing.published,
    });
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.SERVICE_PUBLISH_TOGGLE,
      entity: "Service",
      entityId: updated.id,
      meta: { from: existing.published, to: updated.published, slug: updated.slug },
    });
    return updated;
  },

  async delete(id: string, actor: SessionUser): Promise<void> {
    await requirePermission("content:write");
    const existing = await ContentRepository.findServiceById(id);
    if (!existing) throw new ServiceNotFoundError();
    await ContentRepository.deleteService(id);
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.SERVICE_DELETE,
      entity: "Service",
      entityId: id,
      meta: { slug: existing.slug, title: existing.title },
    });
  },

  /**
   * Move a service one slot up or down by swapping `order` with its neighbour.
   * Atomic via Prisma `$transaction`. No-op at the ends of the list.
   */
  async reorder(
    id: string,
    direction: "up" | "down",
    actor: SessionUser,
  ): Promise<void> {
    await requirePermission("content:write");
    const all = await ContentRepository.findAllServices();
    const index = all.findIndex((s) => s.id === id);
    if (index === -1) throw new ServiceNotFoundError();
    const neighbourIndex = direction === "up" ? index - 1 : index + 1;
    if (neighbourIndex < 0 || neighbourIndex >= all.length) return; // no-op at edge
    const me = all[index];
    const neighbour = all[neighbourIndex];
    await ContentRepository.swapServiceOrders(
      { id: me.id, order: me.order },
      { id: neighbour.id, order: neighbour.order },
    );
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.SERVICE_UPDATE,
      entity: "Service",
      entityId: me.id,
      meta: { reorder: direction, swappedWith: neighbour.id, slug: me.slug },
    });
  },
};
