/**
 * Clients CMS list — /admin/clients
 * M10.2/3: search + pagination.
 */
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, Building2, CheckCircle2, ExternalLink, Plus } from "lucide-react";
import { FormBanner } from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { EmptyState } from "@/components/admin/empty-state";
import {
  Pagination,
  paginationFromSearchParam,
} from "@/components/admin/pagination";
import { requirePermission } from "@/server/auth/guards";
import { ClientCmsService } from "@/server/services/client-cms.service";
import { MediaRepository } from "@/server/repositories/media.repository";
import { ClientActionsRow } from "./client-actions-row";

const PAGE_SIZE = 20;

type SearchParams = Promise<{ updated?: string; error?: string; q?: string; page?: string }>;

const UPDATED_MAP: Record<string, string> = {
  created: "Klien berhasil ditambahkan.",
  edited: "Perubahan berhasil disimpan.",
  deleted: "Klien berhasil dihapus.",
  reordered: "Urutan klien diperbarui.",
};

const ERROR_MAP: Record<string, string> = {
  not_found: "Klien tidak ditemukan.",
  missing: "Data form tidak lengkap.",
  unknown: "Terjadi kesalahan. Coba lagi.",
};

export default async function ClientsAdminPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requirePermission("content:read");
  const { updated, error, q, page } = await searchParams;

  const query = q?.trim() || undefined;
  const total = await ClientCmsService.count({ q: query });
  const { page: currentPage, skip, take } = paginationFromSearchParam(page, total, PAGE_SIZE);
  const items = await ClientCmsService.list({ q: query, skip, take });

  const logoIds = [...new Set(items.map((i) => i.logoId).filter((x): x is string => !!x))];
  const logos = await MediaRepository.findManyById(logoIds);
  const logoById = new Map(logos.map((l) => [l.id, l]));
  const canWrite = session.permissions.includes("content:write");

  function buildHref(nextPage: number): string {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/clients?${qs}` : "/admin/clients";
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Klien</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola logo klien & mitra yang tampil di halaman beranda.
            Logo opsional — jika kosong, wordmark monokrom otomatis dipakai.
          </p>
        </div>
        {canWrite && (
          <Button render={<Link href="/admin/clients/new" />} className="bg-brand-orange text-white hover:bg-brand-orange-strong">
            <Plus className="size-4" />
            Tambah klien
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

      <ListToolbar placeholder="Cari nama / sektor / URL…" />

      {items.length === 0 && !query ? (
        <EmptyState
          icon={Building2}
          title="Belum ada klien"
          description="Logo klien & mitra akan tampil di halaman beranda. Logo opsional — jika kosong, wordmark monokrom otomatis dipakai."
          action={canWrite ? { label: "Tambah klien pertama", href: "/admin/clients/new" } : undefined}
        />
      ) : items.length === 0 ? (
        <EmptyState
          mode="no-match"
          icon={Building2}
          title={`Tidak ada klien cocok dengan "${query}".`}
          reset={{ label: "Bersihkan pencarian", href: "/admin/clients" }}
        />
      ) : (
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-14 px-4 py-3">#</th>
              <th className="w-20 px-4 py-3">Logo</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3 w-40">Sektor</th>
              <th className="px-4 py-3">URL</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((c, i) => {
                const logo = c.logoId ? logoById.get(c.logoId) : undefined;
                const url = logo?.url ?? "";
                const isCloudinary = url.startsWith("https://res.cloudinary.com");
                const isLocal = url.startsWith("/");
                const unoptimized = !isCloudinary && !isLocal;
                return (
                  <tr key={c.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.order}</td>
                    <td className="px-4 py-3">
                      <div className="relative h-10 w-16 overflow-hidden rounded bg-muted">
                        {url ? (
                          <Image
                            src={url}
                            alt={logo?.alt ?? c.name}
                            fill
                            sizes="64px"
                            className="object-contain"
                            unoptimized={unoptimized}
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                            n/a
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink-900">{c.name}</td>
                    <td className="px-4 py-3">
                      {c.sector ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {c.sector}
                        </span>
                      ) : (
                        <span className="text-xs italic text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.url ? (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-brand-orange-strong hover:underline"
                          title={c.url}
                        >
                          {new URL(c.url).hostname}
                          <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        <span className="text-xs italic text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ClientActionsRow
                        id={c.id}
                        name={c.name}
                        isFirst={i === 0 && currentPage === 1}
                        isLast={i === items.length - 1 && currentPage * PAGE_SIZE >= total}
                        canWrite={canWrite}
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
        buildHref={buildHref}
      />
    </div>
  );
}
