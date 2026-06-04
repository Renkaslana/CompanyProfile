/**
 * News CMS service — admin write surface for the public-domain `NewsPost`
 * model (Phase 4 M6).
 *
 * Public reads continue to flow through `ContentService.getNews()` /
 * `getNewsBySlug()`. This module is mutations-only: create, update, delete,
 * status transitions (publish, unpublish, archive, restore).
 *
 * Status workflow side-effects:
 *   - DRAFT → PUBLISHED         set publishedAt=now() ONLY IF null
 *                               (preserve original date on re-publish)
 *                               clear archivedAt
 *   - PUBLISHED → DRAFT (unpub) preserve publishedAt
 *                               clear archivedAt
 *   - any → ARCHIVED            preserve publishedAt
 *                               set archivedAt=now()
 *   - ARCHIVED → DRAFT/PUBLISHED  preserve publishedAt
 *                                 clear archivedAt
 *
 * Layer rules:
 *   • Every public method calls requirePermission.
 *   • Every mutation writes an AuditLog row.
 *   • Body is sanitized on write (defense in depth on top of render-side
 *     sanitization via `SanitizedHtml`).
 *
 * Server-only.
 */
import "server-only";
import type { NewsPost } from "@prisma/client";
import { ContentRepository } from "@/server/repositories/content.repository";
import type { NewsPostWithAuthor } from "@/server/repositories/content.repository";
import { writeAudit } from "@/server/audit/write-audit";
import { AUDIT_ACTIONS } from "@/server/audit/actions";
import { requirePermission, type SessionUser } from "@/server/auth/guards";
import { sanitizeRichText } from "@/components/admin/sanitized-html";
import type { NewsStatus } from "@/lib/validation/news";
import {
  applyListOpts,
  countListOpts,
  type ListOpts,
} from "@/server/utils/list-filter";

export class SlugTakenError extends Error {
  constructor(slug: string) {
    super(`Slug "${slug}" sudah dipakai berita lain.`);
    this.name = "SlugTakenError";
  }
}

export class NewsNotFoundError extends Error {
  constructor() {
    super("Berita tidak ditemukan.");
    this.name = "NewsNotFoundError";
  }
}

type WriteFields = {
  title: string;
  slug: string;
  excerpt: string;
  /** RAW body — sanitized inside `create`/`update` before persistence. */
  body: string;
  category: string;
  displayAuthor: string | null;
  coverId: string | null;
};

export const NewsCmsService = {
  /**
   * News posts with optional `status` chip filter + `q`/`skip`/`take` toolbar.
   * Status filter is applied at the DB layer; `q` is post-fetch by title/excerpt/category.
   */
  async list(
    status: NewsStatus | undefined,
    opts: ListOpts = {},
  ): Promise<NewsPostWithAuthor[]> {
    await requirePermission("content:read");
    const all = await ContentRepository.findAllNews({ status });
    return applyListOpts(all, opts, (n) => [n.title, n.slug, n.excerpt, n.category]);
  },

  /** Count for pagination (respects both status + q filters). */
  async count(
    status: NewsStatus | undefined,
    opts: Pick<ListOpts, "q"> = {},
  ): Promise<number> {
    await requirePermission("content:read");
    const all = await ContentRepository.findAllNews({ status });
    return countListOpts(all, opts, (n) => [n.title, n.slug, n.excerpt, n.category]);
  },

  async findById(id: string): Promise<NewsPostWithAuthor | null> {
    await requirePermission("content:read");
    return ContentRepository.findNewsById(id);
  },

  async create(
    input: WriteFields,
    publishImmediately: boolean,
    actor: SessionUser,
  ): Promise<NewsPost> {
    await requirePermission("content:write");
    const clash = await ContentRepository.findNewsByExactSlug(input.slug);
    if (clash) throw new SlugTakenError(input.slug);

    const sanitizedBody = sanitizeRichText(input.body);
    const status: NewsStatus = publishImmediately ? "PUBLISHED" : "DRAFT";

    const created = await ContentRepository.createNewsPost({
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      body: sanitizedBody,
      category: input.category,
      displayAuthor: input.displayAuthor,
      coverId: input.coverId,
      status,
      publishedAt: publishImmediately ? new Date() : null,
      author: { connect: { id: actor.id } },
    });

    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.NEWS_CREATE,
      entity: "NewsPost",
      entityId: created.id,
      meta: { slug: created.slug, title: created.title, status: created.status },
    });
    return created;
  },

  async update(id: string, input: WriteFields, actor: SessionUser): Promise<NewsPost> {
    await requirePermission("content:write");
    const existing = await ContentRepository.findNewsById(id);
    if (!existing) throw new NewsNotFoundError();
    if (input.slug !== existing.slug) {
      const clash = await ContentRepository.findNewsByExactSlug(input.slug, id);
      if (clash) throw new SlugTakenError(input.slug);
    }

    const sanitizedBody = sanitizeRichText(input.body);
    const updated = await ContentRepository.updateNewsPost(id, {
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      body: sanitizedBody,
      category: input.category,
      displayAuthor: input.displayAuthor,
      coverId: input.coverId,
      // status / publishedAt / archivedAt unchanged — dedicated transitions handle those
    });

    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.NEWS_UPDATE,
      entity: "NewsPost",
      entityId: id,
      meta: { slug: updated.slug, title: updated.title },
    });
    return updated;
  },

  async publish(id: string, actor: SessionUser): Promise<NewsPost> {
    await requirePermission("content:publish");
    const existing = await ContentRepository.findNewsById(id);
    if (!existing) throw new NewsNotFoundError();

    const wasFirstPublish = existing.publishedAt === null;
    const updated = await ContentRepository.updateNewsPost(id, {
      status: "PUBLISHED",
      publishedAt: existing.publishedAt ?? new Date(),
      archivedAt: null,
    });
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.NEWS_PUBLISH,
      entity: "NewsPost",
      entityId: id,
      meta: { from: existing.status, slug: updated.slug, firstTimePublish: wasFirstPublish },
    });
    return updated;
  },

  async unpublish(id: string, actor: SessionUser): Promise<NewsPost> {
    await requirePermission("content:publish");
    const existing = await ContentRepository.findNewsById(id);
    if (!existing) throw new NewsNotFoundError();

    const updated = await ContentRepository.updateNewsPost(id, {
      status: "DRAFT",
      // Preserve publishedAt — original editorial date persists across re-publish.
      archivedAt: null,
    });
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.NEWS_UNPUBLISH,
      entity: "NewsPost",
      entityId: id,
      meta: { from: existing.status, slug: updated.slug },
    });
    return updated;
  },

  async archive(id: string, actor: SessionUser): Promise<NewsPost> {
    await requirePermission("content:write");
    const existing = await ContentRepository.findNewsById(id);
    if (!existing) throw new NewsNotFoundError();

    const updated = await ContentRepository.updateNewsPost(id, {
      status: "ARCHIVED",
      archivedAt: new Date(),
      // publishedAt preserved
    });
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.NEWS_ARCHIVE,
      entity: "NewsPost",
      entityId: id,
      meta: { from: existing.status, slug: updated.slug },
    });
    return updated;
  },

  async restore(id: string, actor: SessionUser): Promise<NewsPost> {
    await requirePermission("content:publish");
    const existing = await ContentRepository.findNewsById(id);
    if (!existing) throw new NewsNotFoundError();
    if (existing.status !== "ARCHIVED") {
      // No-op; nothing to restore.
      return existing;
    }
    // Restore back to DRAFT — author chooses to re-publish explicitly.
    const updated = await ContentRepository.updateNewsPost(id, {
      status: "DRAFT",
      archivedAt: null,
      // publishedAt preserved (so date history isn't lost)
    });
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.NEWS_RESTORE,
      entity: "NewsPost",
      entityId: id,
      meta: { from: "ARCHIVED", to: updated.status, slug: updated.slug },
    });
    return updated;
  },

  async delete(id: string, actor: SessionUser): Promise<void> {
    await requirePermission("content:write");
    const existing = await ContentRepository.findNewsById(id);
    if (!existing) throw new NewsNotFoundError();
    await ContentRepository.deleteNewsPost(id);
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.NEWS_DELETE,
      entity: "NewsPost",
      entityId: id,
      meta: { slug: existing.slug, title: existing.title },
    });
  },
};
