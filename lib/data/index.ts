/**
 * Data access layer — the single swap point (ADR 0008).
 *
 * Components and pages call ONLY these accessors. Phase 2 has flipped each
 * body from returning mock arrays to delegating to a server-only service.
 * Signatures are unchanged from the mock era; the frontend types in
 * `features/*` describe the contract.
 *
 * Each accessor remains a single line so the seam stays obvious: anyone
 * wanting to add caching, RBAC-scoped reads, or feature flags edits *here*,
 * not the components.
 *
 * Server-only: importing this from a client component will fail the build.
 */
import "server-only";

import { ContentService } from "@/server/services/content.service";
import { FleetService } from "@/server/services/fleet.service";
import { MarketingService } from "@/server/services/marketing.service";

import type {
  Service,
  NewsPost,
  GalleryItem,
  TeamMember,
  ClientLogo,
  Stat,
  Achievement,
  CoverageRegion,
  Certification,
  JobOpening,
} from "@/features/content/types";
import type { FleetVehicle } from "@/features/fleet/types";

/* ---- Services ---- */
export async function getServices(): Promise<Service[]> {
  return ContentService.getPublishedServices();
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  return ContentService.getServiceBySlug(slug);
}

/* ---- Fleet ---- */
export async function getFleet(): Promise<FleetVehicle[]> {
  return FleetService.getFleet();
}

/* ---- Gallery ---- */
export async function getGallery(): Promise<GalleryItem[]> {
  return ContentService.getGallery();
}

/* ---- News ---- */
export async function getNews(): Promise<NewsPost[]> {
  return ContentService.getNews();
}

export async function getLatestNews(limit = 3): Promise<NewsPost[]> {
  return ContentService.getLatestNews(limit);
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | null> {
  return ContentService.getNewsBySlug(slug);
}

/* ---- Team ---- */
export async function getTeam(): Promise<TeamMember[]> {
  return ContentService.getTeam();
}

/* ---- Clients ---- */
export async function getClients(): Promise<ClientLogo[]> {
  return ContentService.getClients();
}

/* ---- Marketing presentational ---- */
export async function getStats(): Promise<Stat[]> {
  return MarketingService.getStats();
}

export async function getAchievements(): Promise<Achievement[]> {
  return MarketingService.getAchievements();
}

export async function getCoverage(): Promise<CoverageRegion[]> {
  return MarketingService.getCoverage();
}

export async function getCertifications(): Promise<Certification[]> {
  return MarketingService.getCertifications();
}

export async function getJobs(): Promise<JobOpening[]> {
  return MarketingService.getJobs();
}
