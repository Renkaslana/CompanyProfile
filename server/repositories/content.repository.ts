/**
 * Content repository — Prisma data access for the public content domain
 * (Service, NewsPost, GalleryItem, TeamMember, ClientLogo).
 *
 * Layer rules (DOCS/BACKEND_STRUCTURE.md):
 *   • Repositories are **thin Prisma wrappers**. No business logic, no
 *     authorization, no shape translation — those belong to the service layer.
 *   • Repositories are the only code that imports `db` directly.
 *   • Return Prisma row shapes (typed by `@prisma/client`). The service layer
 *     resolves media references and maps to frontend domain types.
 *
 * Server-only.
 */
import "server-only";
import type { Prisma, Service, GalleryItem, TeamMember, ClientLogo } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * `NewsPost` rows always come with the author's display name selected so the
 * service layer can fall back to it when `displayAuthor` is null.
 */
export type NewsPostWithAuthor = Prisma.NewsPostGetPayload<{
  include: { author: { select: { name: true } } };
}>;

export const ContentRepository = {
  /* ── Services ─────────────────────────────────────────────────────────── */

  /** Published `Service` rows, ordered by `order` ASC. */
  async findPublishedServices(): Promise<Service[]> {
    return db.service.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    });
  },

  /** Lookup a `Service` by slug. Returns null when missing. */
  async findServiceBySlug(slug: string): Promise<Service | null> {
    return db.service.findUnique({ where: { slug } });
  },

  /* ── News ─────────────────────────────────────────────────────────────── */

  /** Published news, newest first. Optional limit. */
  async findPublishedNews(opts?: { limit?: number }): Promise<NewsPostWithAuthor[]> {
    return db.newsPost.findMany({
      where: { status: "PUBLISHED" },
      include: { author: { select: { name: true } } },
      orderBy: { publishedAt: "desc" },
      ...(opts?.limit ? { take: opts.limit } : {}),
    });
  },

  /** Lookup a news article by slug (no published filter — mirrors mock). */
  async findNewsBySlug(slug: string): Promise<NewsPostWithAuthor | null> {
    return db.newsPost.findUnique({
      where: { slug },
      include: { author: { select: { name: true } } },
    });
  },

  /* ── Gallery ──────────────────────────────────────────────────────────── */

  /** All gallery items, ordered by `order` ASC. */
  async findGallery(): Promise<GalleryItem[]> {
    return db.galleryItem.findMany({ orderBy: { order: "asc" } });
  },

  /* ── Team ─────────────────────────────────────────────────────────────── */

  /** All team members, ordered by `order` ASC. */
  async findTeam(): Promise<TeamMember[]> {
    return db.teamMember.findMany({ orderBy: { order: "asc" } });
  },

  /* ── Clients ──────────────────────────────────────────────────────────── */

  /** All client logos, ordered by `order` ASC. */
  async findClients(): Promise<ClientLogo[]> {
    return db.clientLogo.findMany({ orderBy: { order: "asc" } });
  },
};
