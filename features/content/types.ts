/**
 * Domain types for public content.
 * Field names mirror the PRD §10 Prisma schema so the Phase-3 swap to a real
 * backend is a single-adaptor change (see lib/data). MediaAsset is represented
 * here by the lightweight MediaRef the frontend actually needs.
 */

export type MediaRef = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export type ServiceCategory =
  | "LOGISTICS"
  | "TRANSPORTATION"
  | "CAR_RENTAL"
  | "GENERAL_TRADING";

export interface Service {
  id: string;
  slug: string;
  title: string;
  category: ServiceCategory;
  summary: string;
  /** long-form description (plain text / lightweight markdown) */
  body: string;
  /** lucide-react icon key */
  iconKey: string;
  cover: MediaRef;
  highlights: string[];
  order: number;
  published: boolean;
}

export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface NewsPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover: MediaRef;
  status: PostStatus;
  /** ISO date string */
  publishedAt: string;
  author: string;
  category: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  /** Briefing · Loading · Pengiriman · Warehouse · Fleet */
  category: string;
  media: MediaRef;
  order: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  /** optional — when absent, an initials avatar is rendered */
  photo?: MediaRef;
  /** optional short bio (≤500 chars). Added in Phase 4 M9. */
  bio?: string;
  order: number;
}

export interface ClientLogo {
  id: string;
  name: string;
  /** optional — when absent, the name is rendered as a monochrome wordmark */
  logo?: MediaRef;
  /** short industry/sector label shown under the wordmark */
  sector?: string;
  url?: string;
  order: number;
}

/* ---- Marketing presentational types (frontend-only this phase) ---- */

export interface Stat {
  id: string;
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

export interface Achievement {
  id: string;
  iconKey: string;
  title: string;
  description: string;
}

export interface CoverageRegion {
  id: string;
  name: string;
  /** percentage coordinates on the coverage map (0–100) */
  x: number;
  y: number;
  hub?: boolean;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  iconKey: string;
}

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  summary: string;
}
