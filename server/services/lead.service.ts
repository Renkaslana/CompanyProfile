/**
 * Lead service — public submission + admin management.
 *
 * Layer rules:
 *   • Public `submit()` is the ONE entry point with no auth (visitors are
 *     anonymous). Honeypot + Zod validation guard the trust boundary.
 *   • Admin reads/writes require RBAC via `requirePermission`.
 *   • Every mutation writes an `AuditLog` row.
 *   • Audit actor for public submissions is `"anonymous"` (matches the
 *     existing convention used by auth.service for unauthenticated paths).
 *
 * Server-only.
 */
import "server-only";
import type { Lead, LeadStatus, Prisma } from "@prisma/client";
import { LeadRepository, type LeadListOpts } from "@/server/repositories/lead.repository";
import { writeAudit } from "@/server/audit/write-audit";
import { AUDIT_ACTIONS } from "@/server/audit/actions";
import { requirePermission, type SessionUser } from "@/server/auth/guards";
import type { ListOpts } from "@/server/utils/list-filter";

export class LeadNotFoundError extends Error {
  constructor() {
    super("Permintaan tidak ditemukan.");
    this.name = "LeadNotFoundError";
  }
}

/** Public-side fields a visitor can submit. */
type SubmitFields = {
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  service: Prisma.LeadCreateInput["service"];
  message: string;
  /** Free-text source tag (e.g. "kontak" / "karir" / "support-widget"). */
  source: string | null;
};

export const LeadService = {
  /**
   * Public form submission. No auth — but Zod validation (incl. honeypot)
   * runs in the action before reaching here. Audit row is written with
   * `actorId: "anonymous"`.
   */
  async submit(input: SubmitFields): Promise<Lead> {
    const created = await LeadRepository.create({
      name: input.name,
      company: input.company,
      email: input.email,
      phone: input.phone,
      service: input.service,
      message: input.message,
      status: "NEW",
      source: input.source,
    });
    await writeAudit({
      actorId: "anonymous",
      action: AUDIT_ACTIONS.LEAD_CREATE,
      entity: "Lead",
      entityId: created.id,
      meta: {
        name: created.name,
        email: created.email,
        source: created.source ?? null,
        service: created.service ?? null,
      },
    });
    return created;
  },

  /** Admin: list leads with optional status / search / pagination. */
  async list(
    status: LeadStatus | undefined,
    opts: ListOpts = {},
  ): Promise<Lead[]> {
    await requirePermission("lead:read");
    return LeadRepository.list({
      status,
      q: opts.q,
      skip: opts.skip,
      take: opts.take,
    });
  },

  /** Admin: count for pagination total (respects same filters). */
  async count(
    status: LeadStatus | undefined,
    opts: Pick<ListOpts, "q"> = {},
  ): Promise<number> {
    await requirePermission("lead:read");
    return LeadRepository.count({ status, q: opts.q });
  },

  /** Admin: status counts for dashboard chips (no pagination). */
  async statusCounts(): Promise<Record<LeadStatus, number>> {
    await requirePermission("lead:read");
    const [neW, contacted, qualified, closed] = await Promise.all([
      LeadRepository.count({ status: "NEW" }),
      LeadRepository.count({ status: "CONTACTED" }),
      LeadRepository.count({ status: "QUALIFIED" }),
      LeadRepository.count({ status: "CLOSED" }),
    ]);
    return { NEW: neW, CONTACTED: contacted, QUALIFIED: qualified, CLOSED: closed };
  },

  async findById(id: string): Promise<Lead | null> {
    await requirePermission("lead:read");
    return LeadRepository.findById(id);
  },

  async updateStatus(
    id: string,
    status: LeadStatus,
    actor: SessionUser,
  ): Promise<Lead> {
    await requirePermission("lead:update");
    const existing = await LeadRepository.findById(id);
    if (!existing) throw new LeadNotFoundError();
    if (existing.status === status) return existing;
    const updated = await LeadRepository.updateStatus(id, status);
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.LEAD_STATUS_CHANGE,
      entity: "Lead",
      entityId: id,
      meta: {
        name: existing.name,
        email: existing.email,
        from: existing.status,
        to: status,
      },
    });
    return updated;
  },

  async delete(id: string, actor: SessionUser): Promise<void> {
    await requirePermission("lead:update");
    const existing = await LeadRepository.findById(id);
    if (!existing) throw new LeadNotFoundError();
    await LeadRepository.delete(id);
    await writeAudit({
      actorId: actor.id,
      action: AUDIT_ACTIONS.LEAD_DELETE,
      entity: "Lead",
      entityId: id,
      meta: {
        name: existing.name,
        email: existing.email,
        status: existing.status,
      },
    });
  },
};

/** Re-export so admin pages can use the same shape as other modules. */
export type { LeadListOpts };
