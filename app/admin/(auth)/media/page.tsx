/**
 * Media Library list page — /admin/media
 *
 * - Folder filter (?folder=)
 * - Tag/title/alt search (?q=)
 * - Upload trigger (Cloudinary signed direct-upload)
 * - Edit (per card) + Delete (per card, reference-guarded)
 */
import Link from "next/link";
import { CheckCircle2, AlertTriangle, Search } from "lucide-react";
import { FormBanner } from "@/components/admin/admin-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/server/auth/guards";
import { MediaService } from "@/server/services/media.service";
import { MEDIA_FOLDERS } from "@/lib/validation/media";
import { UploadFormDialog } from "./upload-form";
import { MediaCard } from "./media-card";

type SearchParams = Promise<{
  folder?: string;
  q?: string;
  updated?: string;
  error?: string;
}>;

const UPDATED_MAP: Record<string, string> = {
  created: "Media berhasil diunggah.",
  edited: "Metadata media berhasil diperbarui.",
  deleted: "Media berhasil dihapus.",
};

const ERROR_MAP: Record<string, string> = {
  in_use:
    "Media masih dipakai oleh konten lain (Layanan / Berita / Galeri / Tim / Klien / Armada). Lepas referensinya terlebih dahulu.",
  not_configured:
    "Cloudinary belum dikonfigurasi. Tambahkan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET ke .env, lalu restart server.",
  validation: "Form tidak valid. Periksa kembali isiannya.",
  missing: "Data form tidak lengkap.",
  unknown: "Terjadi kesalahan. Coba lagi.",
};

export default async function MediaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePermission("media:create");
  const { folder, q, updated, error } = await searchParams;

  const folderFilter = folder && MEDIA_FOLDERS.includes(folder as (typeof MEDIA_FOLDERS)[number]) ? folder : undefined;
  const query = q?.trim() || undefined;

  const assets = await MediaService.list({ folder: folderFilter, q: query, limit: 120 });

  function buildHref(next: { folder?: string; q?: string }) {
    const params = new URLSearchParams();
    if (next.folder) params.set("folder", next.folder);
    if (next.q) params.set("q", next.q);
    const s = params.toString();
    return s ? `/admin/media?${s}` : "/admin/media";
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">
            Media Library
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pustaka gambar terpusat. Unggahan baru disimpan di Cloudinary
            (folder <code className="rounded bg-muted px-1">bmi/{`{folder}`}</code>).
            Aset seed lokal tetap muncul dari <code className="rounded bg-muted px-1">/public/images</code>.
          </p>
        </div>
        <UploadFormDialog />
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

      {/* Filters */}
      <form
        method="GET"
        action="/admin/media"
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
      >
        <div className="grid gap-1.5">
          <label htmlFor="folder" className="text-xs font-medium text-muted-foreground">
            Folder
          </label>
          <select
            id="folder"
            name="folder"
            defaultValue={folderFilter ?? ""}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">Semua folder</option>
            {MEDIA_FOLDERS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="grid flex-1 gap-1.5 sm:max-w-sm">
          <label htmlFor="q" className="text-xs font-medium text-muted-foreground">
            Cari (judul / alt / tag)
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="q"
              name="q"
              defaultValue={query ?? ""}
              placeholder="armada, operasional…"
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="submit" variant="outline" size="sm">
            Terapkan
          </Button>
          {(folderFilter || query) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              render={<Link href="/admin/media" />}
            >
              Reset
            </Button>
          )}
        </div>
      </form>

      {/* Active-filter summary */}
      {(folderFilter || query) && (
        <p className="text-xs text-muted-foreground">
          {assets.length} hasil
          {folderFilter && (
            <>
              {" • folder "}
              <Link
                href={buildHref({ q: query })}
                className="font-medium text-ink-900 underline-offset-2 hover:underline"
              >
                {folderFilter} ✕
              </Link>
            </>
          )}
          {query && (
            <>
              {" • cari "}
              <Link
                href={buildHref({ folder: folderFilter })}
                className="font-medium text-ink-900 underline-offset-2 hover:underline"
              >
                “{query}” ✕
              </Link>
            </>
          )}
        </p>
      )}

      {/* Grid */}
      {assets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Belum ada media yang cocok. Coba ubah filter atau unggah media baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {assets.map((a) => (
            <MediaCard
              key={a.id}
              asset={{
                id: a.id,
                url: a.url,
                alt: a.alt,
                title: a.title,
                folder: a.folder,
                tags: a.tags,
                width: a.width,
                height: a.height,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
