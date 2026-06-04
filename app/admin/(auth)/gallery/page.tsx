/**
 * Gallery CMS list — /admin/gallery
 *
 * M10.2/3: search + pagination via shared primitives.
 */
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, CheckCircle2, Plus } from "lucide-react";
import { FormBanner } from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { ListToolbar } from "@/components/admin/list-toolbar";
import {
  Pagination,
  paginationFromSearchParam,
} from "@/components/admin/pagination";
import { requirePermission } from "@/server/auth/guards";
import { GalleryCmsService } from "@/server/services/gallery-cms.service";
import { MediaRepository } from "@/server/repositories/media.repository";
import { GalleryActionsRow } from "./gallery-actions-row";

const PAGE_SIZE = 20;

type SearchParams = Promise<{
  updated?: string;
  error?: string;
  q?: string;
  page?: string;
}>;

const UPDATED_MAP: Record<string, string> = {
  created: "Item galeri berhasil dibuat.",
  edited: "Perubahan berhasil disimpan.",
  deleted: "Item galeri berhasil dihapus.",
  reordered: "Urutan galeri diperbarui.",
};

const ERROR_MAP: Record<string, string> = {
  not_found: "Item galeri tidak ditemukan.",
  missing: "Data form tidak lengkap.",
  unknown: "Terjadi kesalahan. Coba lagi.",
};

export default async function GalleryAdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requirePermission("content:read");
  const { updated, error, q, page } = await searchParams;

  const query = q?.trim() || undefined;
  const total = await GalleryCmsService.count({ q: query });
  const { page: currentPage, skip, take } = paginationFromSearchParam(
    page,
    total,
    PAGE_SIZE,
  );
  const items = await GalleryCmsService.list({ q: query, skip, take });

  // Batched media lookup so we can render thumbnails alongside each row.
  const mediaIds = [...new Set(items.map((i) => i.mediaId))];
  const mediaAssets = await MediaRepository.findManyById(mediaIds);
  const mediaById = new Map(mediaAssets.map((m) => [m.id, m]));

  const canWrite = session.permissions.includes("content:write");

  function buildHref(nextPage: number): string {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/gallery?${qs}` : "/admin/gallery";
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Galeri</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola foto operasional yang tampil di halaman publik{" "}
            <code>/galeri</code>. Urutkan dengan tombol panah; item langsung
            tampil tanpa workflow publish.
          </p>
        </div>
        {canWrite && (
          <Button
            render={<Link href="/admin/gallery/new" />}
            className="bg-brand-orange text-white hover:bg-brand-orange-strong"
          >
            <Plus className="size-4" />
            Tambah item galeri
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

      <ListToolbar placeholder="Cari judul / kategori…" />

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-14 px-4 py-3">#</th>
              <th className="w-20 px-4 py-3">Gambar</th>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3 w-40">Kategori</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  {query
                    ? `Tidak ada item galeri yang cocok dengan "${query}".`
                    : "Belum ada item galeri."}{" "}
                  {canWrite && !query && (
                    <Link href="/admin/gallery/new" className="text-brand-orange-strong underline-offset-2 hover:underline">
                      Tambahkan item pertama
                    </Link>
                  )}
                </td>
              </tr>
            ) : (
              items.map((g, i) => {
                const media = mediaById.get(g.mediaId);
                const url = media?.url ?? "";
                const isCloudinary = url.startsWith("https://res.cloudinary.com");
                const isLocal = url.startsWith("/");
                const unoptimized = !isCloudinary && !isLocal;
                return (
                  <tr key={g.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{g.order}</td>
                    <td className="px-4 py-3">
                      <div className="relative size-12 overflow-hidden rounded-md bg-muted">
                        {url ? (
                          <Image
                            src={url}
                            alt={media?.alt ?? ""}
                            fill
                            sizes="48px"
                            className="object-cover"
                            unoptimized={unoptimized}
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                            n/a
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink-900">{g.title}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {g.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <GalleryActionsRow
                        id={g.id}
                        title={g.title}
                        isFirst={i === 0 && currentPage === 1}
                        isLast={i === items.length - 1 && currentPage * PAGE_SIZE >= total}
                        canWrite={canWrite}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={currentPage}
        pageSize={PAGE_SIZE}
        total={total}
        buildHref={buildHref}
      />
    </div>
  );
}
