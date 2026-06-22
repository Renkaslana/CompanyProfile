/**
 * BMI Digital Platform — Database seed
 *
 * Populates the database from `prisma/seed-data/*.mock.ts` + `lib/constants.ts`. Designed
 * to be **idempotent**: safe to re-run any number of times. Every row is
 * upserted by a deterministic key (slug, name, email, key, mock id, or a
 * synthetic id derived from a media path), so counts stay constant.
 *
 * Strategy approved in M4 §3–§8 of the implementation report:
 *   • Wave A — entities with no FK dependencies (Role, admin User, MediaAsset,
 *     SiteSettings, Stat, Coverage, Achievement, Certification, JobOpening,
 *     ClientLogo, TeamMember).
 *   • Wave B — entities that depend on Wave A (Service, FleetVehicle,
 *     GalleryItem, NewsPost — covers reference MediaAsset; news references
 *     admin User as authorId, with the editorial byline preserved in
 *     `displayAuthor`).
 *
 * Not seeded — start empty by design:
 *   Lead, LeadActivity, SupportTicket, FaqSearchLog, AuditLog, FaqCategory,
 *   FaqItem. FAQ is seeded later in Phase 6 alongside the Support Center UI.
 *
 * Run: `npm run db:seed`  (or `npx prisma db seed` via the `prisma.seed`
 * config in package.json — which `migrate reset` will also invoke).
 */
import { PrismaClient, type Prisma } from "@prisma/client";

import { servicesMock } from "./seed-data/services.mock";
import { fleetMock } from "./seed-data/fleet.mock";
import { galleryMock } from "./seed-data/gallery.mock";
import { newsMock } from "./seed-data/news.mock";
import { teamMock } from "./seed-data/team.mock";
import { clientsMock } from "./seed-data/clients.mock";
import { jobsMock } from "./seed-data/jobs.mock";
import { coverageMock } from "./seed-data/coverage.mock";
import { achievementsMock } from "./seed-data/achievements.mock";
import { certificationsMock } from "./seed-data/certifications.mock";
import { statsMock } from "./seed-data/stats.mock";
import { COMPANY, VALUES } from "../lib/constants";
import { ROLE_PERMISSIONS, type RoleName } from "../server/auth/permissions";

const prisma = new PrismaClient();

/* ─────────────── Helpers ─────────────── */

/** Strip a leading slash for use as a media id / publicId. */
const strip = (s: string) => s.replace(/^\//, "");

/** Derive a Phase-1 MediaAsset row from a {src, alt} mock ref.
 *  The `id` and `publicId` are deterministic so seed re-runs upsert in place.
 *  When Phase 4 wires Cloudinary, the same row gets a real publicId/url
 *  (UPDATE by id) — content rows referencing this id stay valid. */
function mediaFromRef(ref: { src: string; alt: string }) {
  const path = strip(ref.src);
  const ext = (path.split(".").pop() ?? "").toLowerCase();
  const mimeType =
    ext === "png"
      ? "image/png"
      : ext === "jpg" || ext === "jpeg"
      ? "image/jpeg"
      : ext === "webp"
      ? "image/webp"
      : "application/octet-stream";
  return {
    id: `media:${path}`,
    publicId: `local:${path}`,
    url: ref.src,
    alt: ref.alt,
    folder: path.split("/")[0] ?? null,
    mimeType,
    tags: [] as string[],
  };
}

/** Convert a deeply-readonly TypeScript object literal into a Prisma JSON
 *  input value. Cheap deep clone strips the `readonly` markers. */
const asJson = (v: unknown): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(v));

/* ─────────────── Wave A: independents ─────────────── */

// Roles + permissions sourced from `server/auth/permissions.ts` so the seed,
// the RBAC guards, and the admin UI always agree on the matrix. Adding a new
// permission only requires touching one file (permissions.ts) + re-seeding.
const ROLES = (
  Object.keys(ROLE_PERMISSIONS) as RoleName[]
).map((name) => ({
  name,
  permissions: ROLE_PERMISSIONS[name],
}));

async function seedRoles() {
  for (const r of ROLES) {
    await prisma.role.upsert({
      where: { name: r.name },
      create: { name: r.name, permissions: asJson(r.permissions) },
      update: { permissions: asJson(r.permissions) },
    });
  }
  return prisma.role.findMany({
    where: { name: { in: ROLES.map((r) => r.name) } },
  });
}

/** Single seeded admin so `NewsPost.authorId` has a valid target.
 *  Password is intentionally non-functional until Phase 3 wires Auth.js. */
const ADMIN_PASSWORD_PLACEHOLDER = "!pending-phase-3!";

async function seedAdmin(superAdminRoleId: string) {
  const email =
    process.env.SEED_ADMIN_EMAIL?.trim() ||
    "admin@bintangmuliainvestama.co.id";
  const name = process.env.SEED_ADMIN_NAME?.trim() || "BMI Admin";

  return prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      password: ADMIN_PASSWORD_PLACEHOLDER,
      roleId: superAdminRoleId,
    },
    // Intentionally NOT updating password on re-seed — preserves any real
    // password set via the Phase 3 password flow.
    update: { name, roleId: superAdminRoleId },
  });
}

async function seedMedia(refs: { src: string; alt: string }[]) {
  // Deduplicate by src so each unique path produces exactly one MediaAsset row.
  const seen = new Set<string>();
  const unique = refs.filter((r) => {
    if (seen.has(r.src)) return false;
    seen.add(r.src);
    return true;
  });

  for (const ref of unique) {
    const m = mediaFromRef(ref);
    await prisma.mediaAsset.upsert({
      where: { id: m.id },
      create: m,
      update: {
        publicId: m.publicId,
        url: m.url,
        alt: m.alt,
        folder: m.folder,
        mimeType: m.mimeType,
        tags: m.tags,
      },
    });
  }
  return unique.length;
}

async function seedSiteSettings() {
  const company = asJson(COMPANY);
  const values = asJson(VALUES);
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", company, values },
    update: { company, values },
  });
}

const STAT_KEY_MAP: Record<string, string> = {
  "stat-fleet": "fleet_units",
  "stat-deliveries": "shipments",
  "stat-ops": "availability",
  "stat-clients": "clients",
};

async function seedStats() {
  for (let i = 0; i < statsMock.length; i++) {
    const s = statsMock[i];
    const key = STAT_KEY_MAP[s.id];
    if (!key) throw new Error(`Unmapped Stat mock id: ${s.id}`);
    const data = {
      key,
      label: s.label,
      value: s.value,
      suffix: s.suffix ?? null,
      source: "MANUAL" as const,
      order: i,
    };
    await prisma.stat.upsert({
      where: { key },
      create: data,
      update: data,
    });
  }
  return statsMock.length;
}

async function seedCoverage() {
  for (let i = 0; i < coverageMock.length; i++) {
    const c = coverageMock[i];
    const data = {
      id: c.id,
      name: c.name,
      x: c.x,
      y: c.y,
      hub: c.hub ?? false,
      order: i,
    };
    await prisma.coverageRegion.upsert({
      where: { id: c.id },
      create: data,
      update: data,
    });
  }
  return coverageMock.length;
}

async function seedAchievements() {
  for (let i = 0; i < achievementsMock.length; i++) {
    const a = achievementsMock[i];
    const data = {
      id: a.id,
      iconKey: a.iconKey,
      title: a.title,
      description: a.description,
      order: i,
    };
    await prisma.achievement.upsert({
      where: { id: a.id },
      create: data,
      update: data,
    });
  }
  return achievementsMock.length;
}

async function seedCertifications() {
  for (let i = 0; i < certificationsMock.length; i++) {
    const c = certificationsMock[i];
    const data = {
      id: c.id,
      title: c.title,
      issuer: c.issuer,
      iconKey: c.iconKey,
      order: i,
    };
    await prisma.certification.upsert({
      where: { id: c.id },
      create: data,
      update: data,
    });
  }
  return certificationsMock.length;
}

async function seedJobs() {
  for (const j of jobsMock) {
    const data = {
      id: j.id,
      title: j.title,
      department: j.department,
      type: j.type,
      location: j.location,
      summary: j.summary,
      published: true,
    };
    await prisma.jobOpening.upsert({
      where: { id: j.id },
      create: data,
      update: data,
    });
  }
  return jobsMock.length;
}

async function seedClients() {
  for (const c of clientsMock) {
    const data = {
      id: c.id,
      name: c.name,
      sector: c.sector ?? null,
      logoId: null,
      url: c.url ?? null,
      order: c.order,
    };
    await prisma.clientLogo.upsert({
      where: { id: c.id },
      create: data,
      update: data,
    });
  }
  return clientsMock.length;
}

async function seedTeam() {
  for (const t of teamMock) {
    const data = {
      id: t.id,
      name: t.name,
      role: t.role,
      photoId: null,
      order: t.order,
    };
    await prisma.teamMember.upsert({
      where: { id: t.id },
      create: data,
      update: data,
    });
  }
  return teamMock.length;
}

/* ─────────────── Wave B: depends on Wave A ─────────────── */

async function seedServices() {
  for (const s of servicesMock) {
    const coverId = `media:${strip(s.cover.src)}`;
    const data = {
      slug: s.slug,
      title: s.title,
      category: s.category,
      summary: s.summary,
      body: s.body,
      iconKey: s.iconKey ?? null,
      coverId,
      highlights: s.highlights,
      order: s.order,
      published: s.published,
    };
    await prisma.service.upsert({
      where: { id: s.id },
      create: { id: s.id, ...data },
      update: data,
    });
  }
  return servicesMock.length;
}

async function seedFleet() {
  for (const f of fleetMock) {
    const photoId = `media:${strip(f.photo.src)}`;
    const data = {
      name: f.name,
      type: f.type,
      capacity: f.capacity ?? null,
      description: f.description ?? null,
      status: f.status,
      photoIds: [photoId],
      specs: asJson(f.specs),
      order: f.order,
    };
    await prisma.fleetVehicle.upsert({
      where: { id: f.id },
      create: { id: f.id, ...data },
      update: data,
    });
  }
  return fleetMock.length;
}

async function seedGallery() {
  for (const g of galleryMock) {
    const mediaId = `media:${strip(g.media.src)}`;
    const data = {
      title: g.title,
      category: g.category,
      mediaId,
      order: g.order,
    };
    await prisma.galleryItem.upsert({
      where: { id: g.id },
      create: { id: g.id, ...data },
      update: data,
    });
  }
  return galleryMock.length;
}

async function seedNews(authorId: string) {
  for (const n of newsMock) {
    const coverId = `media:${strip(n.cover.src)}`;
    const data = {
      slug: n.slug,
      title: n.title,
      excerpt: n.excerpt,
      body: n.body,
      coverId,
      category: n.category,
      displayAuthor: n.author, // preserves editorial byline (M4 D1)
      status: n.status,
      publishedAt: n.publishedAt ? new Date(n.publishedAt) : null,
      authorId,
    };
    await prisma.newsPost.upsert({
      where: { id: n.id },
      create: { id: n.id, ...data },
      update: data,
    });
  }
  return newsMock.length;
}

/* ─────────────── Main ─────────────── */

async function main() {
  const t0 = Date.now();
  console.log("🌱  BMI seed starting");
  console.log("    target:", process.env.DATABASE_URL?.replace(/:[^@/]*@/, ":***@"));

  // Wave A
  const roles = await seedRoles();
  const superAdmin = roles.find((r) => r.name === "SUPER_ADMIN");
  if (!superAdmin) throw new Error("SUPER_ADMIN role missing after seedRoles()");

  const admin = await seedAdmin(superAdmin.id);

  const mediaRefs = [
    ...servicesMock.map((s) => s.cover),
    ...fleetMock.map((f) => f.photo),
    ...galleryMock.map((g) => g.media),
    ...newsMock.map((n) => n.cover),
  ];
  const mediaCount = await seedMedia(mediaRefs);
  await seedSiteSettings();
  const statsCount = await seedStats();
  const coverageCount = await seedCoverage();
  const achievementsCount = await seedAchievements();
  const certificationsCount = await seedCertifications();
  const jobsCount = await seedJobs();
  const clientsCount = await seedClients();
  const teamCount = await seedTeam();

  // Wave B
  const servicesCount = await seedServices();
  const fleetCount = await seedFleet();
  const galleryCount = await seedGallery();
  const newsCount = await seedNews(admin.id);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
  console.log("✅ Seed complete in " + elapsed + "s");
  console.table({
    Role: roles.length,
    User: 1,
    MediaAsset: mediaCount,
    SiteSettings: 1,
    Stat: statsCount,
    CoverageRegion: coverageCount,
    Achievement: achievementsCount,
    Certification: certificationsCount,
    JobOpening: jobsCount,
    ClientLogo: clientsCount,
    TeamMember: teamCount,
    Service: servicesCount,
    FleetVehicle: fleetCount,
    GalleryItem: galleryCount,
    NewsPost: newsCount,
  });
  console.log("    admin email:", admin.email);
}

main()
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .then(() => prisma.$disconnect());
