/**
 * Media repository — thin Prisma access for the central media library.
 *
 * Used by every content/fleet/marketing service to resolve image references.
 * Repositories don't translate shapes — that's the mapper's job
 * (`server/mappers/media.mapper.ts`).
 *
 * Server-only.
 */
import "server-only";
import type { MediaAsset } from "@prisma/client";
import { db } from "@/lib/db";

export const MediaRepository = {
  /**
   * Batched lookup by id. Pass any non-empty list of MediaAsset ids; returns
   * the corresponding rows in *no particular order* (callers index by id).
   */
  async findManyById(ids: string[]): Promise<MediaAsset[]> {
    if (ids.length === 0) return [];
    return db.mediaAsset.findMany({ where: { id: { in: ids } } });
  },
};
