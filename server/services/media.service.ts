/**
 * Media service — Cloudinary signed uploads + Media Library CRUD.
 *
 * Phase 4 M1 surface:
 *   • getSignedUploadPayload()  — server-side signing for browser direct-upload
 *   • persistFromUpload()       — write MediaAsset row after Cloudinary confirms
 *   • list()                    — for Media Library UI (M4) and pickers
 *   • update()                  — edit alt / title / tags
 *   • deleteWithGuard()         — reference-guarded delete (refuses if used)
 *
 * Layer rules:
 *   • Every public method calls `requirePermission("media:create")`.
 *   • Every mutation writes an `AuditLog` row.
 *
 * Cloudinary credentials are OPTIONAL — if absent, `getSignedUploadPayload`
 * throws `MediaNotConfiguredError`. Existing local-only MediaAsset rows
 * (`publicId` prefixed `local:`) still load normally; only NEW Cloudinary
 * uploads require configuration.
 *
 * Server-only.
 */
import "server-only";
import { v2 as cloudinary } from "cloudinary";
import type { MediaAsset } from "@prisma/client";
import { db } from "@/lib/db";
import { env } from "@/lib/config/env";
import { writeAudit } from "@/server/audit/write-audit";
import { AUDIT_ACTIONS } from "@/server/audit/actions";
import { requirePermission, type SessionUser } from "@/server/auth/guards";

export class MediaNotConfiguredError extends Error {
  constructor(missing: string[] = []) {
    const detail = missing.length ? `Missing: ${missing.join(", ")}. ` : "";
    super(
      `${detail}Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, ` +
        "CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env, then restart the dev server.",
    );
    this.name = "MediaNotConfiguredError";
  }
}

export class MediaInUseError extends Error {
  constructor(refs: { entity: string; count: number }[]) {
    super(
      "Media is referenced by " +
        refs
          .filter((r) => r.count > 0)
          .map((r) => `${r.count} ${r.entity}`)
          .join(", ") +
        ". Remove references before deleting.",
    );
    this.name = "MediaInUseError";
  }
}

function ensureCloudinaryConfigured() {
  const missing: string[] = [];
  if (!env.CLOUDINARY_CLOUD_NAME) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!env.CLOUDINARY_API_KEY) missing.push("CLOUDINARY_API_KEY");
  if (!env.CLOUDINARY_API_SECRET) missing.push("CLOUDINARY_API_SECRET");
  if (missing.length > 0) throw new MediaNotConfiguredError(missing);
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/** Folders mirror the seeded layout — keep consistent. */
const ALLOWED_FOLDERS = ["gallery", "fleet", "news", "about", "brand"] as const;
export type MediaFolder = (typeof ALLOWED_FOLDERS)[number];

/** Cloudinary signed-upload helper — called by an API route, NOT the client. */
async function buildSignedUploadPayload(folder: MediaFolder) {
  ensureCloudinaryConfigured();
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string | number> = {
    timestamp,
    folder: `bmi/${folder}`,
  };
  const signature = cloudinary.utils.api_sign_request(
    params,
    env.CLOUDINARY_API_SECRET!,
  );
  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME!,
    apiKey: env.CLOUDINARY_API_KEY!,
    timestamp,
    folder: `bmi/${folder}`,
    signature,
  };
}

/** Best-effort Cloudinary destroy. Failures don't block local DB deletion. */
async function destroyOnCloudinary(publicId: string): Promise<void> {
  if (!publicId || publicId.startsWith("local:")) return;
  try {
    ensureCloudinaryConfigured();
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
  } catch {
    // Swallow — Cloudinary may already be unconfigured or the asset removed
    // externally. The DB delete still proceeds.
  }
}

export const MediaService = {
  async getSignedUploadPayload(folder: MediaFolder) {
    await requirePermission("media:create");
    if (!ALLOWED_FOLDERS.includes(folder)) {
      throw new Error(`Folder "${folder}" is not allowed`);
    }
    return buildSignedUploadPayload(folder);
  },

  /** Called after Cloudinary upload completes; writes the MediaAsset row. */
  async persistFromUpload(
    input: {
      publicId: string;
      url: string;
      width?: number | null;
      height?: number | null;
      mimeType: string;
      folder: string;
      alt?: string | null;
      title?: string | null;
      tags?: string[];
    },
    actor: SessionUser,
  ): Promise<MediaAsset> {
    await requirePermission("media:create");
    const asset = await db.mediaAsset.create({
      data: {
        publicId: input.publicId,
        url: input.url,
        width: input.width ?? null,
        height: input.height ?? null,
        mimeType: input.mimeType,
        folder: input.folder,
        alt: input.alt ?? null,
        title: input.title ?? null,
        tags: input.tags ?? [],
      },
    });
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.MEDIA_CREATE,
      entity: "MediaAsset",
      entityId: asset.id,
      meta: { publicId: asset.publicId, folder: asset.folder },
    });
    return asset;
  },

  async list(opts: { folder?: string; q?: string; limit?: number; offset?: number } = {}) {
    await requirePermission("media:create");
    const where = {
      ...(opts.folder ? { folder: opts.folder } : {}),
      ...(opts.q
        ? {
            OR: [
              { title: { contains: opts.q, mode: "insensitive" as const } },
              { alt: { contains: opts.q, mode: "insensitive" as const } },
              { tags: { has: opts.q } },
            ],
          }
        : {}),
    };
    return db.mediaAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: opts.limit ?? 60,
      skip: opts.offset ?? 0,
    });
  },

  async findById(id: string) {
    await requirePermission("media:create");
    return db.mediaAsset.findUnique({ where: { id } });
  },

  async update(
    id: string,
    input: { alt?: string | null; title?: string | null; tags?: string[] },
    actor: SessionUser,
  ) {
    await requirePermission("media:create");
    const updated = await db.mediaAsset.update({
      where: { id },
      data: {
        ...(input.alt !== undefined ? { alt: input.alt } : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.tags !== undefined ? { tags: input.tags } : {}),
      },
    });
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.MEDIA_UPDATE,
      entity: "MediaAsset",
      entityId: id,
    });
    return updated;
  },

  /**
   * Delete a MediaAsset, but only if no content row references it. Counts
   * references across Service.coverId, NewsPost.coverId, GalleryItem.mediaId,
   * TeamMember.photoId, ClientLogo.logoId, FleetVehicle.photoIds[].
   *
   * Best-effort Cloudinary destroy; DB delete is the source of truth.
   */
  async deleteWithGuard(id: string, actor: SessionUser): Promise<void> {
    await requirePermission("media:create");
    const asset = await db.mediaAsset.findUnique({ where: { id } });
    if (!asset) throw new Error("Media not found");

    const [svc, news, gal, team, client, fleet] = await Promise.all([
      db.service.count({ where: { coverId: id } }),
      db.newsPost.count({ where: { coverId: id } }),
      db.galleryItem.count({ where: { mediaId: id } }),
      db.teamMember.count({ where: { photoId: id } }),
      db.clientLogo.count({ where: { logoId: id } }),
      db.fleetVehicle.count({ where: { photoIds: { has: id } } }),
    ]);
    const refs = [
      { entity: "service(s)", count: svc },
      { entity: "news post(s)", count: news },
      { entity: "gallery item(s)", count: gal },
      { entity: "team member(s)", count: team },
      { entity: "client(s)", count: client },
      { entity: "fleet vehicle(s)", count: fleet },
    ];
    if (refs.some((r) => r.count > 0)) {
      throw new MediaInUseError(refs);
    }

    await destroyOnCloudinary(asset.publicId);
    await db.mediaAsset.delete({ where: { id } });
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.MEDIA_DELETE,
      entity: "MediaAsset",
      entityId: id,
      meta: { publicId: asset.publicId, folder: asset.folder },
    });
  },
};
