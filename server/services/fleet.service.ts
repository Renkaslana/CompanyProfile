/**
 * Fleet service — business logic for the fleet domain (Phase-2 read paths).
 *
 * Shape translation:
 *   • DB `photoIds: string[]` → frontend `photo: MediaRef` (uses the first
 *     photo id; current seeded data has exactly one entry per vehicle).
 *   • DB `specs: Json` → frontend `specs: { label, value }[]` (typed cast).
 *
 * Server-only.
 */
import "server-only";
import type { FleetVehicle as DbFleetVehicle, MediaAsset } from "@prisma/client";
import type { FleetVehicle } from "@/features/fleet/types";
import { FleetRepository } from "@/server/repositories/fleet.repository";
import { toMediaRef, fetchMediaForIds } from "@/server/mappers/media.mapper";

function toFrontendFleet(
  row: DbFleetVehicle,
  media: Map<string, MediaAsset>,
): FleetVehicle {
  const firstPhotoId = row.photoIds[0];
  const base: FleetVehicle = {
    id: row.id,
    name: row.name,
    type: row.type,
    status: row.status,
    photo: toMediaRef(firstPhotoId ? media.get(firstPhotoId) : null),
    specs: (row.specs ?? []) as { label: string; value: string }[],
    order: row.order,
  };
  if (row.capacity) base.capacity = row.capacity;
  if (row.description) base.description = row.description;
  return base;
}

export const FleetService = {
  async getFleet(): Promise<FleetVehicle[]> {
    const rows = await FleetRepository.findFleet();
    // Each fleet vehicle currently has a single photo; collect the first id
    // of each across the whole list to batch-fetch in one round-trip.
    const photoIds = rows.flatMap((r) => r.photoIds);
    const media = await fetchMediaForIds(photoIds);
    return rows.map((r) => toFrontendFleet(r, media));
  },
};
