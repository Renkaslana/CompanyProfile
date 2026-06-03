/**
 * SiteSettings repository — singleton row at id="singleton".
 *
 * Phase 4 M9. Repository is intentionally thin: read + write the two JSON
 * columns. Validation happens in the service layer via Zod.
 */
import "server-only";
import type { Prisma, SiteSettings } from "@prisma/client";
import { db } from "@/lib/db";

export const SettingsRepository = {
  async findSiteSettings(): Promise<SiteSettings | null> {
    return db.siteSettings.findUnique({ where: { id: "singleton" } });
  },

  async updateSiteSettings(data: Prisma.SiteSettingsUpdateInput): Promise<SiteSettings> {
    return db.siteSettings.update({ where: { id: "singleton" }, data });
  },
};
