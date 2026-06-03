/**
 * SiteSettings CMS service — admin write surface for the singleton
 * `SiteSettings` row (Phase 4 M9).
 *
 * Reads and writes the `company` and `values` JSON columns. Validation
 * happens at the action layer via Zod (`lib/validation/settings.ts`);
 * this service trusts the parsed payload.
 *
 * Server-only.
 */
import "server-only";
import type { SiteSettings, Prisma } from "@prisma/client";
import { SettingsRepository } from "@/server/repositories/settings.repository";
import { writeAudit } from "@/server/audit/write-audit";
import { AUDIT_ACTIONS } from "@/server/audit/actions";
import { requirePermission, type SessionUser } from "@/server/auth/guards";
import type { CompanyJson, ValueItem } from "@/lib/validation/settings";

export const SettingsCmsService = {
  async get(): Promise<SiteSettings | null> {
    await requirePermission("content:read");
    return SettingsRepository.findSiteSettings();
  },

  async update(
    payload: { company: CompanyJson; values: ValueItem[] },
    actor: SessionUser,
  ): Promise<SiteSettings> {
    await requirePermission("settings:write");

    const updated = await SettingsRepository.updateSiteSettings({
      company: payload.company as unknown as Prisma.InputJsonValue,
      values: payload.values as unknown as Prisma.InputJsonValue,
    });

    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.SETTINGS_UPDATE,
      entity: "SiteSettings",
      entityId: "singleton",
      meta: {
        // Capture which top-level keys are present for traceability without
        // dumping the whole JSON (which can be large + may contain
        // emails/phones).
        companyKeys: Object.keys(payload.company),
        valuesCount: payload.values.length,
      },
    });
    return updated;
  },
};
