/**
 * News CMS list — /admin/news
 *
 * Status filter chips (All / Draft / Published / Archived) via search-param.
 * Actions per row vary by status (see NewsActionsRow).
 * M10.2/3: search + pagination via shared primitives.
 */
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Newspaper, Plus } from "lucide-react";
import { FormBanner } from "@/components/admin/admin-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { EmptyState } from "@/components/admin/empty-state";
import {
  Pagination,
  paginationFromSearchParam,
} from "@/components/admin/pagination";
import { cn } from "@/lib/utils";
import { requirePermission } from "@/server/auth/guards";
import { NewsCmsService } from "@/server/services/news-cms.service";
import {
  NEWS_STATUSES,
  STATUS_LABEL,
  type NewsStatus,
} from "@/lib/validation/news";
import { NewsActionsRow } from "./news-actions-row";

const PAGE_SIZE = 20;

type SearchParams = Promise<{
  status?: string;
  q?: string;
  page?: string;
  updated?: string;
  error?: string;
}>;

const UPDATED_MAP: Record<string, string> = {
  created: "Berita berhasil dibuat.",
  edited: "Perubahan berhasil disimpan.",
  deleted: "Berita berhasil dihapus.",
  published: "Berita dipublikasikan. Halaman /berita telah diperbarui.",
  unpublished: "Berita disembunyikan dari publik (kembali ke Draft).",
  archived: "Berita diarsipkan.",
  restored: "Berita dipulihkan dari arsip.",
};

const ERROR_MAP: Record<string, string> = {
  slug_taken: "Slug tersebut sudah dipakai berita lain.",
  not_found: "Berita tidak ditemukan.",
  missing: "Data form tidak lengkap.",
  unknown: "Terjadi kesalahan. Coba lagi.",
};

export default async function NewsAdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requirePermission("content:read");
  const { status, q, page, updated, error } = await searchParams;

  const filter = NEWS_STATUSES.includes(status as NewsStatus)
    ? (status as NewsStatus)
    : undefined;
  const query = q?.trim() || undefined;

  const total = await NewsCmsService.count(filter, { q: query });
  const { page: currentPage, skip, take } = paginationFromSearchParam(
    page,
    total,
    PAGE_SIZE,
  );
  const rows = await NewsCmsService.list(filter, { q: query, skip, take });

  const canWrite = session.permissions.includes("content:write");
  const canPublish = session.permissions.includes("content:publish");

  function buildChipHref(s?: NewsStatus): string {
    const params = new URLSearchParams();
    if (s) params.set("status", s);
    if (query) params.set("q", query);
    const qs = params.toString();
    return qs ? `/admin/news?${qs}` : "/admin/news";
  }

  function buildPageHref(nextPage: number): string {
    const params = new URLSearchParams();
    if (filter) params.set("status", filter);
    if (query) params.set("q", query);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/news?${qs}` : "/admin/news";
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Berita</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola berita yang tampil di halaman publik <code>/berita</code>.
            Workflow: <strong>Draft → Published → Archived</strong>. Isi
            berita disanitasi otomatis (HTML allowlist).
          </p>
        </div>
        {canWrite && (
          <Button
            render={<Link href="/admin/news/new" />}
            className="bg-brand-orange text-white hover:bg-brand-orange-strong"
          >
            <Plus className="size-4" />
            Tambah berita
          </Button>
        )}
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

      <ListToolbar placeholder="Cari judul / slug / excerpt / kategori…">
        <Link
          href={buildChipHref()}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider",
            !filter
              ? "border-brand-orange bg-brand-orange/10 text-brand-orange-strong"
              : "border-border text-muted-foreground hover:bg-muted",
          )}
        >
          Semua
        </Link>
        {NEWS_STATUSES.map((s) => (
          <Link
            key={s}
            href={buildChipHref(s)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider",
              filter === s
                ? "border-brand-orange bg-brand-orange/10 text-brand-orange-strong"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </ListToolbar>

      {rows.length === 0 && !query && !filter ? (
        <EmptyState
          icon={Newspaper}
          title="Belum ada berita"
          description="Berita yang dipublikasikan akan tampil di halaman publik /berita. Mulai dengan menulis berita pertama Anda — bisa disimpan dulu sebagai draft."
          action={canWrite ? { label: "Tambah berita pertama", href: "/admin/news/new" } : undefined}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          mode="no-match"
          icon={Newspaper}
          title={
            query
              ? `Tidak ada berita cocok dengan "${query}".`
              : `Belum ada berita dengan status ${filter ? STATUS_LABEL[filter] : ""}.`
          }
          description="Coba ubah filter atau bersihkan pencarian."
          reset={{ label: "Lihat semua berita", href: "/admin/news" }}
        />
      ) : (
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3 w-40">Kategori</th>
              <th className="px-4 py-3">URL Halaman</th>
              <th className="px-4 py-3 w-32">Status</th>
              <th className="px-4 py-3 w-44">Tanggal</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((n) => {
                const dateLabel = n.publishedAt
                  ? new Date(n.publishedAt).toISOString().slice(0, 10)
                  : n.archivedAt
                  ? `archived ${new Date(n.archivedAt).toISOString().slice(0, 10)}`
                  : `draft ${new Date(n.createdAt).toISOString().slice(0, 10)}`;
                return (
                  <tr key={n.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900">{n.title}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{n.excerpt}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {n.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {n.status === "PUBLISHED" ? (
                        <Link
                          href={`/berita/${n.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-muted-foreground hover:text-brand-orange-strong"
                          title="Buka halaman publik (tab baru)"
                        >
                          /{n.slug} ↗
                        </Link>
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">
                          /{n.slug}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={n.status} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {dateLabel}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <NewsActionsRow
                        id={n.id}
                        title={n.title}
                        status={n.status as NewsStatus}
                        canWrite={canWrite}
                        canPublish={canPublish}
                      />
                    </td>
                  </tr>
                );
              })}
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
