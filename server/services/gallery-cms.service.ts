/**
 * Gallery CMS service — admin write surface for `GalleryItem` (Phase 4 M7).
 *
 * Layer rules (DOCS/BACKEND_STRUCTURE.md):
 *   • Every public method calls `requirePermission`.
 *   • Every mutation writes an `AuditLog` row.
 *
 * Simpler than M5/M6:
 *   - No status workflow — items appear publicly the moment they're created.
 *   - No slug, no rich text.
 *   - `mediaId` is required (gallery items must have a picture).
 *
 * Server-only.
 */
import "server-only";
import type { GalleryItem } from "@prisma/client";
import { ContentRepository } from "@/server/repositories/content.repository";
import { writeAudit } from "@/server/audit/write-audit";
import { AUDIT_ACTIONS } from "@/server/audit/actions";
import { requirePermission, type SessionUser } from "@/server/auth/guards";
import {
  applyListOpts,
  countListOpts,
  type ListOpts,
} from "@/server/utils/list-filter";

export class GalleryNotFoundError extends Error {
  constructor() {
    super("Item galeri tidak ditemukan.");
    this.name = "GalleryNotFoundError";
  }
}

type WriteFields = {
  title: string;
  category: string;
  mediaId: string;
  order: number;
};

export const GalleryCmsService = {
  async list(opts: ListOpts = {}): Promise<GalleryItem[]> {
    await requirePermission("content:read");
    const all = await ContentRepository.findAllGallery();
    return applyListOpts(all, opts, (g) => [g.title, g.category]);
  },

  async count(opts: Pick<ListOpts, "q"> = {}): Promise<number> {
    await requirePermission("content:read");
    const all = await ContentRepository.findAllGallery();
    return countListOpts(all, opts, (g) => [g.title, g.category]);
  },

  async findById(id: string): Promise<GalleryItem | null> {
    await requirePermission("content:read");
    return ContentRepository.findGalleryById(id);
  },

  async create(input: WriteFields, actor: SessionUser): Promise<GalleryItem> {
    await requirePermission("content:write");
    const orderValue =
      input.order > 0 ? input.order : await ContentRepository.getNextGalleryOrder();

    const created = await ContentRepository.createGalleryItem({
      title: input.title,
      category: input.category,
      mediaId: input.mediaId,
      order: orderValue,
    });

    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.GALLERY_CREATE,
      entity: "GalleryItem",
      entityId: created.id,
      meta: { title: created.title, category: created.category, mediaId: created.mediaId },
    });
    return created;
  },

  async update(id: string, input: WriteFields, actor: SessionUser): Promise<GalleryItem> {
    await requirePermission("content:write");
    const existing = await ContentRepository.findGalleryById(id);
    if (!existing) throw new GalleryNotFoundError();

    const updated = await ContentRepository.updateGalleryItem(id, {
      title: input.title,
      category: input.category,
      mediaId: input.mediaId,
      order: input.order,
    });

    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.GALLERY_UPDATE,
      entity: "GalleryItem",
      entityId: id,
      meta: { title: updated.title, category: updated.category },
    });
    return updated;
  },

  async delete(id: string, actor: SessionUser): Promise<void> {
    await requirePermission("content:write");
    const existing = await ContentRepository.findGalleryById(id);
    if (!existing) throw new GalleryNotFoundError();
    await ContentRepository.deleteGalleryItem(id);
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.GALLERY_DELETE,
      entity: "GalleryItem",
      entityId: id,
      meta: { title: existing.title, category: existing.category },
    });
  },

  /** Move one slot up/down by swapping `order` with the neighbour. Atomic. */
  async reorder(id: string, direction: "up" | "down", actor: SessionUser): Promise<void> {
    await requirePermission("content:write");
    const all = await ContentRepository.findAllGallery();
    const index = all.findIndex((g) => g.id === id);
    if (index === -1) throw new GalleryNotFoundError();
    const neighbourIndex = direction === "up" ? index - 1 : index + 1;
    if (neighbourIndex < 0 || neighbourIndex >= all.length) return;
    const me = all[index];
    const neighbour = all[neighbourIndex];
    await ContentRepository.swapGalleryOrders(
      { id: me.id, order: me.order },
      { id: neighbour.id, order: neighbour.order },
    );
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.GALLERY_UPDATE,
      entity: "GalleryItem",
      entityId: me.id,
      meta: { reorder: direction, swappedWith: neighbour.id, title: me.title },
    });
  },
};
