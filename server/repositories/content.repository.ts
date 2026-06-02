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
import type {
  Prisma,
  Service,
  NewsPost,
  GalleryItem,
  TeamMember,
  ClientLogo,
} from "@prisma/client";
import { db } from "@/lib/db";

// (M8) shared admin extension helpers below — Team + Clients use the same
// reorder-swap + getNextOrder pattern as Services + Gallery.

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

  /**
   * Lookup a PUBLISHED `Service` by slug. Returns null for drafts or missing
   * rows — public detail page should not expose unpublished content.
   * (Tightened in M6 to close the analogous M5 hole.)
   */
  async findServiceBySlug(slug: string): Promise<Service | null> {
    return db.service.findFirst({ where: { slug, published: true } });
  },

  /* ── Services — admin read/write (Phase 4 M5) ──────────────────────────── */

  /** All services, drafts included, ordered by `order` ASC (admin list). */
  async findAllServices(): Promise<Service[]> {
    return db.service.findMany({ orderBy: { order: "asc" } });
  },

  async findServiceById(id: string): Promise<Service | null> {
    return db.service.findUnique({ where: { id } });
  },

  async findServiceByExactSlug(slug: string, excludeId?: string): Promise<Service | null> {
    return db.service.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    });
  },

  async createService(data: Prisma.ServiceCreateInput): Promise<Service> {
    return db.service.create({ data });
  },

  async updateService(id: string, data: Prisma.ServiceUpdateInput): Promise<Service> {
    return db.service.update({ where: { id }, data });
  },

  async deleteService(id: string): Promise<Service> {
    return db.service.delete({ where: { id } });
  },

  /** Swap two services' `order` values in a single transaction (for reorder). */
  async swapServiceOrders(a: { id: string; order: number }, b: { id: string; order: number }) {
    await db.$transaction([
      db.service.update({ where: { id: a.id }, data: { order: b.order } }),
      db.service.update({ where: { id: b.id }, data: { order: a.order } }),
    ]);
  },

  /** Next free `order` value (used when creating a new service at the end). */
  async getNextServiceOrder(): Promise<number> {
    const last = await db.service.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
    return (last?.order ?? -1) + 1;
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

  /**
   * Lookup a PUBLISHED news article by slug. Drafts and archived posts
   * return null so the public `/berita/[slug]` route never serves them
   * even if the slug is guessed. (Tightened in M6.)
   */
  async findNewsBySlug(slug: string): Promise<NewsPostWithAuthor | null> {
    return db.newsPost.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: { author: { select: { name: true } } },
    });
  },

  /* ── News — admin read/write (Phase 4 M6) ──────────────────────────── */

  /** All news posts (any status), ordered by `publishedAt` DESC then by
   *  `createdAt` DESC so drafts and archived appear sensibly. */
  async findAllNews(opts?: { status?: NewsPost["status"] }): Promise<NewsPostWithAuthor[]> {
    return db.newsPost.findMany({
      where: opts?.status ? { status: opts.status } : undefined,
      include: { author: { select: { name: true } } },
      orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    });
  },

  async findNewsById(id: string): Promise<NewsPostWithAuthor | null> {
    return db.newsPost.findUnique({
      where: { id },
      include: { author: { select: { name: true } } },
    });
  },

  async findNewsByExactSlug(slug: string, excludeId?: string): Promise<NewsPost | null> {
    return db.newsPost.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    });
  },

  async createNewsPost(data: Prisma.NewsPostCreateInput): Promise<NewsPost> {
    return db.newsPost.create({ data });
  },

  async updateNewsPost(id: string, data: Prisma.NewsPostUpdateInput): Promise<NewsPost> {
    return db.newsPost.update({ where: { id }, data });
  },

  async deleteNewsPost(id: string): Promise<NewsPost> {
    return db.newsPost.delete({ where: { id } });
  },

  /* ── Gallery ──────────────────────────────────────────────────────────── */

  /** All gallery items, ordered by `order` ASC. */
  async findGallery(): Promise<GalleryItem[]> {
    return db.galleryItem.findMany({ orderBy: { order: "asc" } });
  },

  /* ── Gallery — admin (Phase 4 M7) ──────────────────────────────────── */

  async findAllGallery(): Promise<GalleryItem[]> {
    return db.galleryItem.findMany({ orderBy: { order: "asc" } });
  },

  async findGalleryById(id: string): Promise<GalleryItem | null> {
    return db.galleryItem.findUnique({ where: { id } });
  },

  async createGalleryItem(data: Prisma.GalleryItemCreateInput): Promise<GalleryItem> {
    return db.galleryItem.create({ data });
  },

  async updateGalleryItem(id: string, data: Prisma.GalleryItemUpdateInput): Promise<GalleryItem> {
    return db.galleryItem.update({ where: { id }, data });
  },

  async deleteGalleryItem(id: string): Promise<GalleryItem> {
    return db.galleryItem.delete({ where: { id } });
  },

  async swapGalleryOrders(a: { id: string; order: number }, b: { id: string; order: number }) {
    await db.$transaction([
      db.galleryItem.update({ where: { id: a.id }, data: { order: b.order } }),
      db.galleryItem.update({ where: { id: b.id }, data: { order: a.order } }),
    ]);
  },

  async getNextGalleryOrder(): Promise<number> {
    const last = await db.galleryItem.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
    return (last?.order ?? -1) + 1;
  },

  /* ── Team ─────────────────────────────────────────────────────────────── */

  /** All team members, ordered by `order` ASC. */
  async findTeam(): Promise<TeamMember[]> {
    return db.teamMember.findMany({ orderBy: { order: "asc" } });
  },

  /* ── Team — admin (Phase 4 M8) ──────────────────────────────────────── */

  async findAllTeam(): Promise<TeamMember[]> {
    return db.teamMember.findMany({ orderBy: { order: "asc" } });
  },

  async findTeamById(id: string): Promise<TeamMember | null> {
    return db.teamMember.findUnique({ where: { id } });
  },

  async createTeamMember(data: Prisma.TeamMemberCreateInput): Promise<TeamMember> {
    return db.teamMember.create({ data });
  },

  async updateTeamMember(id: string, data: Prisma.TeamMemberUpdateInput): Promise<TeamMember> {
    return db.teamMember.update({ where: { id }, data });
  },

  async deleteTeamMember(id: string): Promise<TeamMember> {
    return db.teamMember.delete({ where: { id } });
  },

  async swapTeamOrders(a: { id: string; order: number }, b: { id: string; order: number }) {
    await db.$transaction([
      db.teamMember.update({ where: { id: a.id }, data: { order: b.order } }),
      db.teamMember.update({ where: { id: b.id }, data: { order: a.order } }),
    ]);
  },

  async getNextTeamOrder(): Promise<number> {
    const last = await db.teamMember.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
    return (last?.order ?? -1) + 1;
  },

  /* ── Clients ──────────────────────────────────────────────────────────── */

  /** All client logos, ordered by `order` ASC. */
  async findClients(): Promise<ClientLogo[]> {
    return db.clientLogo.findMany({ orderBy: { order: "asc" } });
  },

  /* ── Clients — admin (Phase 4 M8) ───────────────────────────────────── */

  async findAllClients(): Promise<ClientLogo[]> {
    return db.clientLogo.findMany({ orderBy: { order: "asc" } });
  },

  async findClientById(id: string): Promise<ClientLogo | null> {
    return db.clientLogo.findUnique({ where: { id } });
  },

  async createClientLogo(data: Prisma.ClientLogoCreateInput): Promise<ClientLogo> {
    return db.clientLogo.create({ data });
  },

  async updateClientLogo(id: string, data: Prisma.ClientLogoUpdateInput): Promise<ClientLogo> {
    return db.clientLogo.update({ where: { id }, data });
  },

  async deleteClientLogo(id: string): Promise<ClientLogo> {
    return db.clientLogo.delete({ where: { id } });
  },

  async swapClientOrders(a: { id: string; order: number }, b: { id: string; order: number }) {
    await db.$transaction([
      db.clientLogo.update({ where: { id: a.id }, data: { order: b.order } }),
      db.clientLogo.update({ where: { id: b.id }, data: { order: a.order } }),
    ]);
  },

  async getNextClientOrder(): Promise<number> {
    const last = await db.clientLogo.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
    return (last?.order ?? -1) + 1;
  },
};
