/**
 * Admin Leads list — /admin/leads
 *
 * Simple inquiry/lead management for a company profile:
 *   • Status chips (Baru / Sudah dihubungi / Berpotensi / Selesai)
 *   • Search by name / email / company / phone / message
 *   • Pagination (20 / page)
 *   • Row → /admin/leads/[id] for detail + status change + delete
 *
 * No bulk actions, no real ticket workflow — explicitly out of scope.
 */
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Inbox } from "lucide-react";
import { FormBanner } from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { EmptyState } from "@/components/admin/empty-state";
import {
  Pagination,
  paginationFromSearchParam,
} from "@/components/admin/pagination";
import { cn } from "@/lib/utils";
import { requirePermission } from "@/server/auth/guards";
import { LeadService } from "@/server/services/lead.service";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
  type LeadStatusValue,
} from "@/lib/validation/lead";

const PAGE_SIZE = 20;

type SearchParams = Promise<{
  status?: string;
  q?: string;
  page?: string;
  updated?: string;
  error?: string;
}>;

const UPDATED_MAP: Record<string, string> = {
  status: "Status permintaan berhasil diperbarui.",
  deleted: "Permintaan berhasil dihapus.",
};

const ERROR_MAP: Record<string, string> = {
  not_found: "Permintaan tidak ditemukan.",
  validation: "Data tidak valid.",
  unknown: "Terjadi kesalahan. Coba lagi.",
};

export default async function LeadsAdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePermission("lead:read");
  const { status, q, page, updated, error } = await searchParams;

  const filter = (LEAD_STATUSES as readonly string[]).includes(status ?? "")
    ? (status as LeadStatusValue)
    : undefined;
  const query = q?.trim() || undefined;

  const [total, counts] = await Promise.all([
    LeadService.count(filter, { q: query }),
    LeadService.statusCounts(),
  ]);

  const { page: currentPage, skip, take } = paginationFromSearchParam(
    page,
    total,
    PAGE_SIZE,
  );

  const rows = await LeadService.list(filter, { q: query, skip, take });

  function buildChipHref(s?: LeadStatusValue): string {
    const params = new URLSearchParams();
    if (s) params.set("status", s);
    if (query) params.set("q", query);
    const qs = params.toString();
    return qs ? `/admin/leads?${qs}` : "/admin/leads";
  }

  function buildPageHref(nextPage: number): string {
    const params = new URLSearchParams();
    if (filter) params.set("status", filter);
    if (query) params.set("q", query);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/leads?${qs}` : "/admin/leads";
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink-900">
          Permintaan Calon Pelanggan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Semua permintaan yang masuk dari formulir kontak publik. Tandai status
          saat Anda menindaklanjuti — semua perubahan tercatat di Riwayat
          Aktivitas.
        </p>
      </header>

      {updated && (
        <FormBanner
          variant="success"
          message={
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              {UPDATED_MAP[updated] ?? "Berhasil."}
            </span>
          }
        />
      )}
      {error && (
        <FormBanner
          variant="error"
          message={
            <span className="inline-flex items-center gap-2">
              <AlertTriangle className="size-4" />
              {ERROR_MAP[error] ?? ERROR_MAP.unknown}
            </span>
          }
        />
      )}

      <ListToolbar placeholder="Cari nama / email / perusahaan / pesan…">
        <Link
          href={buildChipHref()}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            !filter
              ? "border-brand-orange bg-brand-orange/10 text-brand-orange-strong"
              : "border-border text-muted-foreground hover:bg-muted",
          )}
        >
          Semua ({counts.NEW + counts.CONTACTED + counts.QUALIFIED + counts.CLOSED})
        </Link>
        {LEAD_STATUSES.map((s) => (
          <Link
            key={s}
            href={buildChipHref(s)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              filter === s
                ? "border-brand-orange bg-brand-orange/10 text-brand-orange-strong"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {LEAD_STATUS_LABEL[s]} ({counts[s]})
          </Link>
        ))}
      </ListToolbar>

      {rows.length === 0 && !query && !filter ? (
        <EmptyState
          icon={Inbox}
          title="Belum ada permintaan masuk"
          description="Permintaan dari formulir kontak publik akan muncul di sini secara otomatis. Bagikan link /kontak ke calon pelanggan untuk menerima permintaan pertama."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          mode="no-match"
          icon={Inbox}
          title={
            query
              ? `Tidak ada permintaan cocok dengan "${query}".`
              : `Belum ada permintaan berstatus ${filter ? LEAD_STATUS_LABEL[filter] : ""}.`
          }
          reset={{ label: "Lihat semua permintaan", href: "/admin/leads" }}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 w-36">Tanggal</th>
                <th className="px-4 py-3">Pengirim</th>
                <th className="px-4 py-3 w-40">Layanan</th>
                <th className="px-4 py-3 w-36">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {lead.createdAt.toISOString().slice(0, 10)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {lead.email}
                      {lead.company ? ` · ${lead.company}` : ""}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-foreground/70">
                      {lead.message}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {lead.service ? lead.service.replaceAll("_", " ") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                        lead.status === "NEW" && "bg-brand-orange/10 text-brand-orange-strong",
                        lead.status === "CONTACTED" && "bg-sky-100 text-sky-800",
                        lead.status === "QUALIFIED" && "bg-emerald-100 text-emerald-800",
                        lead.status === "CLOSED" && "bg-muted text-muted-foreground",
                      )}
                    >
                      {LEAD_STATUS_LABEL[lead.status as LeadStatusValue]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      render={<Link href={`/admin/leads/${lead.id}`} aria-label={`Buka permintaan dari ${lead.name}`} />}
                    >
                      Buka
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={currentPage}
        pageSize={PAGE_SIZE}
        total={total}
        buildHref={buildPageHref}
      />
    </div>
  );
}
