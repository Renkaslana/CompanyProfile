/**
 * /admin/gallery/[id]/edit — edit a gallery item.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/server/auth/guards";
import { MediaService } from "@/server/services/media.service";
import { GalleryCmsService } from "@/server/services/gallery-cms.service";
import { GalleryForm } from "../../gallery-form";
import { updateGalleryAction } from "../../actions";

type Params = Promise<{ id: string }>;

export default async function EditGalleryPage({ params }: { params: Params }) {
  await requirePermission("content:write");
  const { id } = await params;
  const item = await GalleryCmsService.findById(id);
  if (!item) notFound();

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
        <h1 className="font-display text-2xl font-bold text-ink-900">Edit item galeri</h1>
      </header>

      <GalleryForm
        mode="edit"
        initial={{
          id: item.id,
          title: item.title,
          category: item.category,
          mediaId: item.mediaId,
          order: item.order,
        }}
        mediaAssets={mediaAssets}
        action={updateGalleryAction}
      />
    </div>
  );
}
