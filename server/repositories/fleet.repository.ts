/**
 * Fleet repository — Prisma data access for the fleet domain.
 *
 * Layer rules same as the content repository — thin Prisma access only.
 * Server-only.
 */
import "server-only";
import type { FleetVehicle } from "@prisma/client";
import { db } from "@/lib/db";

export const FleetRepository = {
  /** All fleet vehicles ordered by `order` ASC.
   *
   *  Mirrors the historical `lib/data.getFleet()` behaviour, which returned
   *  the entire mock array sorted by `order` regardless of status (no public
   *  filter). The CMS in Phase 5 will manage status filters via a separate
   *  admin-side read path. */
  async findFleet(): Promise<FleetVehicle[]> {
    return db.fleetVehicle.findMany({ orderBy: { order: "asc" } });
  },
};
