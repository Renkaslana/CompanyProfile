/**
 * Content service — business logic for the public content domain
 * (Service, NewsPost, GalleryItem, TeamMember, ClientLogo).
 *
 * Layer rules (DOCS/BACKEND_STRUCTURE.md):
 *   • The only place business rules live. In later phases each public method
 *     will (1) check RBAC, (2) validate input with Zod, (3) call repositories,
 *     (4) write an audit entry on mutation.
 *   • Phase-2 scope: read paths only. No mutations, no RBAC, no Zod yet.
 *   • Responsibilities here: batch-resolve media, translate Prisma rows into
 *     the frontend domain shapes from `features/content/types`.
 *
 * Server-only.
 */
import "server-only";
import type {
  Service as DbService,
  GalleryItem as DbGalleryItem,
  TeamMember as DbTeamMember,
  ClientLogo as DbClientLogo,
  MediaAsset,
} from "@prisma/client";
import type {
  Service,
  NewsPost,
  GalleryItem,
  TeamMember,
  ClientLogo,
} from "@/features/content/types";
import {
  ContentRepository,
  type NewsPostWithAuthor,
} from "@/server/repositories/content.repository";
import {
  toMediaRef,
  toMediaRefOrUndefined,
  fetchMediaForIds,
} from "@/server/mappers/media.mapper";

/* ─────────────── Private mappers (Prisma row → frontend type) ─────────────── */

function toFrontendService(row: DbService, media: Map<string, MediaAsset>): Service {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    summary: row.summary,
    body: row.body,
    iconKey: row.iconKey ?? "",
    cover: toMediaRef(row.coverId ? media.get(row.coverId) : null),
    highlights: row.highlights,
    order: row.order,
    published: row.published,
  };
}

function toFrontendNews(row: NewsPostWithAuthor, media: Map<string, MediaAsset>): NewsPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    cover: toMediaRef(row.coverId ? media.get(row.coverId) : null),
    status: row.status,
    // ISO date string (yyyy-mm-dd) — matches the historical mock value.
    publishedAt: row.publishedAt
      ? row.publishedAt.toISOString().slice(0, 10)
      : "",
    // Editorial byline preserved (M4 D1); falls back to the owning user's name.
    author: row.displayAuthor ?? row.author?.name ?? "",
    category: row.category,
  };
}

function toFrontendGalleryItem(
  row: DbGalleryItem,
  media: Map<string, MediaAsset>,
): GalleryItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    media: toMediaRef(media.get(row.mediaId)),
    order: row.order,
  };
}

function toFrontendTeam(
  row: DbTeamMember,
  media: Map<string, MediaAsset>,
): TeamMember {
  const base: TeamMember = {
    id: row.id,
    name: row.name,
    role: row.role,
    order: row.order,
  };
  if (row.photoId) {
    const photo = toMediaRefOrUndefined(media.get(row.photoId));
    if (photo) base.photo = photo;
  }
  if (row.bio) base.bio = row.bio;
  return base;
}

function toFrontendClient(
  row: DbClientLogo,
  media: Map<string, MediaAsset>,
): ClientLogo {
  const base: ClientLogo = {
    id: row.id,
    name: row.name,
    order: row.order,
  };
  if (row.sector) base.sector = row.sector;
  if (row.url) base.url = row.url;
  if (row.logoId) {
    const logo = toMediaRefOrUndefined(media.get(row.logoId));
    if (logo) base.logo = logo;
  }
  return base;
}

/* ─────────────── Public service surface ─────────────── */

export const ContentService = {
  /* Services */

  async getPublishedServices(): Promise<Service[]> {
    const rows = await ContentRepository.findPublishedServices();
    const media = await fetchMediaForIds(rows.map((r) => r.coverId));
    return rows.map((r) => toFrontendService(r, media));
  },

  async getServiceBySlug(slug: string): Promise<Service | null> {
    const row = await ContentRepository.findServiceBySlug(slug);
    if (!row) return null;
    const media = await fetchMediaForIds([row.coverId]);
    return toFrontendService(row, media);
  },

  /* News */

  async getNews(): Promise<NewsPost[]> {
    const rows = await ContentRepository.findPublishedNews();
    const media = await fetchMediaForIds(rows.map((r) => r.coverId));
    return rows.map((r) => toFrontendNews(r, media));
  },

  async getLatestNews(limit = 3): Promise<NewsPost[]> {
    const rows = await ContentRepository.findPublishedNews({ limit });
    const media = await fetchMediaForIds(rows.map((r) => r.coverId));
    return rows.map((r) => toFrontendNews(r, media));
  },

  async getNewsBySlug(slug: string): Promise<NewsPost | null> {
    const row = await ContentRepository.findNewsBySlug(slug);
    if (!row) return null;
    const media = await fetchMediaForIds([row.coverId]);
    return toFrontendNews(row, media);
  },

  /* Gallery */

  async getGallery(): Promise<GalleryItem[]> {
    const rows = await ContentRepository.findGallery();
    const media = await fetchMediaForIds(rows.map((r) => r.mediaId));
    return rows.map((r) => toFrontendGalleryItem(r, media));
  },

  /* Team */

  async getTeam(): Promise<TeamMember[]> {
    const rows = await ContentRepository.findTeam();
    const media = await fetchMediaForIds(rows.map((r) => r.photoId));
    return rows.map((r) => toFrontendTeam(r, media));
  },

  /* Clients */

  async getClients(): Promise<ClientLogo[]> {
    const rows = await ContentRepository.findClients();
    const media = await fetchMediaForIds(rows.map((r) => r.logoId));
    return rows.map((r) => toFrontendClient(r, media));
  },
};
