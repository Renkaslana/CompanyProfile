"use client";

/**
 * One MediaAsset card in the library grid.
 *
 * Renders the thumbnail (next/image), title, folder badge, and tag pills.
 * Hover overlay surfaces Edit (Link → /admin/media/[id]/edit) and Delete
 * (ConfirmDialog → deleteMediaAction). The reference guard runs in
 * MediaService.deleteWithGuard; if violated, the action redirects with
 * ?error=in_use and the list page surfaces the banner.
 */
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { deleteMediaAction } from "./actions";

export type MediaCardAsset = {
  id: string;
  url: string;
  alt: string | null;
  title: string | null;
  folder: string | null;
  tags: string[];
  width: number | null;
  height: number | null;
};

export function MediaCard({ asset }: { asset: MediaCardAsset }) {
  const isCloudinary = asset.url.startsWith("https://res.cloudinary.com");
  const isLocal = asset.url.startsWith("/");
  // For images neither hosted on res.cloudinary.com nor under /public, fall
  // back to unoptimized to avoid next/image rejecting the host.
  const unoptimized = !isCloudinary && !isLocal;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-4/3 bg-muted">
        <Image
          src={asset.url}
          alt={asset.alt ?? asset.title ?? ""}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
          unoptimized={unoptimized}
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-end justify-end gap-2 bg-gradient-to-t from-ink-950/70 via-ink-950/10 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="sm"
            variant="outline"
            className="bg-card/95 backdrop-blur"
            render={
              <Link
                href={`/admin/media/${asset.id}/edit`}
                aria-label={`Edit ${asset.title ?? asset.id}`}
              />
            }
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
          <ConfirmDialog
            trigger={
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="bg-card/95 text-destructive backdrop-blur hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" />
                Hapus
              </Button>
            }
            title="Hapus media?"
            description={
              <>
                Media akan dihapus dari database dan (best-effort) dari
                Cloudinary. Aksi ini akan <strong>ditolak</strong> jika media
                masih dipakai oleh Layanan, Berita, Galeri, Tim, Klien, atau
                Armada.
              </>
            }
            confirmLabel="Hapus"
            variant="danger"
            action={deleteMediaAction}
            hiddenFields={{ id: asset.id }}
          />
        </div>
      </div>

      <div className="space-y-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium text-ink-900" title={asset.title ?? ""}>
            {asset.title ?? <span className="text-muted-foreground">(tanpa judul)</span>}
          </p>
          {asset.folder && (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {asset.folder}
            </span>
          )}
        </div>
        {asset.alt && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{asset.alt}</p>
        )}
        {asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {asset.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full bg-brand-orange/10 px-2 py-0.5 text-[10px] font-medium text-brand-orange-strong"
              >
                {t}
              </span>
            ))}
            {asset.tags.length > 4 && (
              <span className="text-[10px] text-muted-foreground">
                +{asset.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
