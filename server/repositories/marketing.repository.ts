/**
 * Marketing repository — Prisma data access for the marketing-presentational
 * entities: Stat, Achievement, CoverageRegion, Certification, JobOpening.
 *
 * Layer rules same as content repository — thin Prisma access only.
 * Server-only.
 */
import "server-only";
import type {
  Stat,
  Achievement,
  CoverageRegion,
  Certification,
  JobOpening,
} from "@prisma/client";
import { db } from "@/lib/db";

export const MarketingRepository = {
  /** Stats ordered by `order` ASC. Seeded order matches the mock array. */
  async findStats(): Promise<Stat[]> {
    return db.stat.findMany({ orderBy: { order: "asc" } });
  },

  /** Achievements ordered by `order` ASC. */
  async findAchievements(): Promise<Achievement[]> {
    return db.achievement.findMany({ orderBy: { order: "asc" } });
  },

  /** Coverage regions ordered by `order` ASC. */
  async findCoverage(): Promise<CoverageRegion[]> {
    return db.coverageRegion.findMany({ orderBy: { order: "asc" } });
  },

  /** Certifications ordered by `order` ASC. */
  async findCertifications(): Promise<Certification[]> {
    return db.certification.findMany({ orderBy: { order: "asc" } });
  },

  /**
   * Published job openings. The `JobOpening` schema has no `order` field, so
   * we tie-break by `createdAt` ASC — for the seeded data this equals mock
   * array order (M4 seed inserts in array order, so `createdAt` is monotonic).
   */
  async findJobs(): Promise<JobOpening[]> {
    return db.jobOpening.findMany({
      where: { published: true },
      orderBy: { createdAt: "asc" },
    });
  },
};
