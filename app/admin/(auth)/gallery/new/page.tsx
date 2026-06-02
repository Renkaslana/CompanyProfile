/**
 * /admin/gallery/new — create a new gallery item.
 */
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/server/auth/guards";
import { MediaService } from "@/server/services/media.service";
import { GalleryForm } from "../gallery-form";
import { createGalleryAction } from "../actions";

export default async function NewGalleryPage() {
  await requirePermission("content:write");
  const assets = await MediaService.list({ limit: 120 });
  const mediaAssets = assets.map((a) => ({
    id: a.id,
    url: a.url,
    alt: a.alt,
    title: a.title,
    folder: a.folder,
    tags: a.tags,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/gallery"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="size-4" />
        Kembali ke galeri
      </Link>

      <header>
        <h1 className="font-display text-2xl font-bold text-ink-900">Tambah item galeri</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Item galeri langsung tampil di halaman publik <code>/galeri</code>{" "}
          setelah disimpan — tidak ada workflow draft.
        </p>
      </header>

      <GalleryForm
        mode="create"
        initial={{
          title: "",
          category: "Briefing",
          mediaId: null,
          order: 0,
        }}
        mediaAssets={mediaAssets}
        action={createGalleryAction}
      />
    </div>
  );
}
