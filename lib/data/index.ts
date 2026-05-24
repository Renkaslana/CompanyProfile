/**
 * Data access layer — the single swap point (PRD Lampiran C).
 *
 * Components and pages call ONLY these accessors. In Phase 2 they return mock
 * data; in Phase 3 the bodies are replaced with Prisma/repository calls and the
 * signatures stay identical, so no component needs to change.
 */
import { servicesMock } from "@/mock/services.mock";
import { fleetMock } from "@/mock/fleet.mock";
import { galleryMock } from "@/mock/gallery.mock";
import { newsMock } from "@/mock/news.mock";
import { teamMock } from "@/mock/team.mock";
import { clientsMock } from "@/mock/clients.mock";
import { statsMock } from "@/mock/stats.mock";
import { achievementsMock } from "@/mock/achievements.mock";
import { coverageMock } from "@/mock/coverage.mock";
import { certificationsMock } from "@/mock/certifications.mock";
import { jobsMock } from "@/mock/jobs.mock";

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

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

/* ---- Services ---- */
export async function getServices(): Promise<Service[]> {
  return [...servicesMock].filter((s) => s.published).sort(byOrder);
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  return servicesMock.find((s) => s.slug === slug) ?? null;
}

/* ---- Fleet ---- */
export async function getFleet(): Promise<FleetVehicle[]> {
  return [...fleetMock].sort(byOrder);
}

/* ---- Gallery ---- */
export async function getGallery(): Promise<GalleryItem[]> {
  return [...galleryMock].sort(byOrder);
}

/* ---- News ---- */
export async function getNews(): Promise<NewsPost[]> {
  return [...newsMock]
    .filter((n) => n.status === "PUBLISHED")
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

export async function getLatestNews(limit = 3): Promise<NewsPost[]> {
  return (await getNews()).slice(0, limit);
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | null> {
  return newsMock.find((n) => n.slug === slug) ?? null;
}

/* ---- Team ---- */
export async function getTeam(): Promise<TeamMember[]> {
  return [...teamMock].sort(byOrder);
}

/* ---- Clients ---- */
export async function getClients(): Promise<ClientLogo[]> {
  return [...clientsMock].sort(byOrder);
}

/* ---- Marketing presentational ---- */
export async function getStats(): Promise<Stat[]> {
  return statsMock;
}

export async function getAchievements(): Promise<Achievement[]> {
  return achievementsMock;
}

export async function getCoverage(): Promise<CoverageRegion[]> {
  return coverageMock;
}

export async function getCertifications(): Promise<Certification[]> {
  return certificationsMock;
}

export async function getJobs(): Promise<JobOpening[]> {
  return jobsMock;
}
