/**
 * Marketing service — business logic for marketing-presentational entities
 * (Stat, Achievement, CoverageRegion, Certification, JobOpening).
 *
 * Phase-2 scope: read paths only. These mappers drop DB-only fields (`order`,
 * `published`, timestamps) that the frontend types don't expose, so the
 * serialized output equals the historical mock output (verification V6).
 *
 * Server-only.
 */
import "server-only";
import type {
  Stat as DbStat,
  Achievement as DbAchievement,
  CoverageRegion as DbCoverageRegion,
  Certification as DbCertification,
  JobOpening as DbJobOpening,
} from "@prisma/client";
import type {
  Stat,
  Achievement,
  CoverageRegion,
  Certification,
  JobOpening,
} from "@/features/content/types";
import { MarketingRepository } from "@/server/repositories/marketing.repository";

function toFrontendStat(row: DbStat): Stat {
  const base: Stat = {
    id: row.id, // cuid; differs from mock string id — frontend uses as React key only
    value: row.value,
    label: row.label,
  };
  if (row.suffix) base.suffix = row.suffix;
  return base;
}

function toFrontendAchievement(row: DbAchievement): Achievement {
  return {
    id: row.id,
    iconKey: row.iconKey,
    title: row.title,
    description: row.description,
  };
}

function toFrontendCoverage(row: DbCoverageRegion): CoverageRegion {
  const base: CoverageRegion = {
    id: row.id,
    name: row.name,
    x: row.x,
    y: row.y,
  };
  // Mock only set `hub: true` on hubs (the key was absent on non-hubs).
  // Match that exactly so V6 deep-equal probe passes.
  if (row.hub) base.hub = true;
  return base;
}

function toFrontendCertification(row: DbCertification): Certification {
  return {
    id: row.id,
    title: row.title,
    issuer: row.issuer,
    iconKey: row.iconKey,
  };
}

function toFrontendJob(row: DbJobOpening): JobOpening {
  return {
    id: row.id,
    title: row.title,
    department: row.department,
    type: row.type,
    location: row.location,
    summary: row.summary,
  };
}

export const MarketingService = {
  async getStats(): Promise<Stat[]> {
    const rows = await MarketingRepository.findStats();
    return rows.map(toFrontendStat);
  },

  async getAchievements(): Promise<Achievement[]> {
    const rows = await MarketingRepository.findAchievements();
    return rows.map(toFrontendAchievement);
  },

  async getCoverage(): Promise<CoverageRegion[]> {
    const rows = await MarketingRepository.findCoverage();
    return rows.map(toFrontendCoverage);
  },

  async getCertifications(): Promise<Certification[]> {
    const rows = await MarketingRepository.findCertifications();
    return rows.map(toFrontendCertification);
  },

  async getJobs(): Promise<JobOpening[]> {
    const rows = await MarketingRepository.findJobs();
    return rows.map(toFrontendJob);
  },
};
