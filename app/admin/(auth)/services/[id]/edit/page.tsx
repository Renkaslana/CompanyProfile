/**
 * /admin/services/[id]/edit — edit existing service metadata.
 *
 * Publish/unpublish is handled separately on the list page so the edit form
 * stays focused on content. Order edits here are still saved through update.
 *
 * Validation errors surface inline via React 19 `useActionState`.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/server/auth/guards";
import { MediaService } from "@/server/services/media.service";
import { ServiceCmsService } from "@/server/services/service-cms.service";
import { ServiceForm } from "../../service-form";
import { updateServiceAction } from "../../actions";
import type { ServiceCategory } from "@/lib/validation/service";

type Params = Promise<{ id: string }>;

export default async function EditServicePage({ params }: { params: Params }) {
  await requirePermission("content:write");
  const { id } = await params;
  const svc = await ServiceCmsService.findById(id);
  if (!svc) notFound();

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
        href="/admin/services"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="size-4" />
        Kembali ke daftar layanan
      </Link>

      <header>
        <h1 className="font-display text-2xl font-bold text-ink-900">Edit layanan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Status publish saat ini: <strong>{svc.published ? "Published" : "Draft"}</strong>.
          Untuk publish/unpublish, gunakan tombol di halaman daftar layanan.
        </p>
      </header>

      <ServiceForm
        mode="edit"
        initial={{
          id: svc.id,
          title: svc.title,
          slug: svc.slug,
          category: svc.category as ServiceCategory,
          summary: svc.summary,
          body: svc.body,
          iconKey: svc.iconKey ?? "",
          coverId: svc.coverId,
          highlights: svc.highlights,
          order: svc.order,
          published: svc.published,
        }}
        mediaAssets={mediaAssets}
        action={updateServiceAction}
      />
    </div>
  );
}
