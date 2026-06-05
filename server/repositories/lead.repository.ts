/**
 * Lead repository — Prisma data access for inbound contact submissions
 * (Phase 4 follow-up "support cleanup").
 *
 * Layer rules (DOCS/BACKEND_STRUCTURE.md):
 *   • Thin Prisma wrappers. No business logic, no authorization.
 *   • Repositories are the only code that imports `db` directly.
 *
 * Server-only.
 */
import "server-only";
import type { Lead, LeadStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type LeadListOpts = {
  status?: LeadStatus;
  q?: string;
  skip?: number;
  take?: number;
};

function whereClause(opts: LeadListOpts): Prisma.LeadWhereInput | undefined {
  const ands: Prisma.LeadWhereInput[] = [];
  if (opts.status) ands.push({ status: opts.status });
  if (opts.q) {
    ands.push({
      OR: [
        { name: { contains: opts.q, mode: "insensitive" } },
        { email: { contains: opts.q, mode: "insensitive" } },
        { company: { contains: opts.q, mode: "insensitive" } },
        { phone: { contains: opts.q, mode: "insensitive" } },
        { message: { contains: opts.q, mode: "insensitive" } },
      ],
    });
  }
  return ands.length ? { AND: ands } : undefined;
}

export const LeadRepository = {
  async create(data: Prisma.LeadCreateInput): Promise<Lead> {
    return db.lead.create({ data });
  },

  async findById(id: string): Promise<Lead | null> {
    return db.lead.findUnique({ where: { id } });
  },

  async list(opts: LeadListOpts = {}): Promise<Lead[]> {
    return db.lead.findMany({
      where: whereClause(opts),
      orderBy: { createdAt: "desc" },
      skip: opts.skip ?? 0,
      take: opts.take ?? 20,
    });
  },

  async count(opts: Pick<LeadListOpts, "status" | "q"> = {}): Promise<number> {
    return db.lead.count({ where: whereClause(opts) });
  },

  async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    return db.lead.update({ where: { id }, data: { status } });
  },

  async delete(id: string): Promise<Lead> {
    return db.lead.delete({ where: { id } });
  },
};
