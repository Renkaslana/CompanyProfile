/**
 * /admin/services/new — create a new service.
 *
 * Loads the Media Library for the cover-image picker (reusing MediaService.list).
 * Validation errors are surfaced inline by the client form via
 * React 19 `useActionState`, not via search-param banners.
 */
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/server/auth/guards";
import { MediaService } from "@/server/services/media.service";
import { ServiceForm } from "../service-form";
import { createServiceAction } from "../actions";

export default async function NewServicePage() {
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
        href="/admin/services"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="size-4" />
        Kembali ke daftar layanan
      </Link>

      <header>
        <h1 className="font-display text-2xl font-bold text-ink-900">Tambah layanan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Layanan baru akan menjadi <strong>draft</strong> kecuali Anda
          centang &ldquo;Langsung publish&rdquo;. Setelah dibuat Anda dapat
          mengatur urutan, edit isi, atau publish/unpublish kapan saja.
        </p>
      </header>

      <ServiceForm
        mode="create"
        initial={{
          title: "",
          slug: "",
          category: "LOGISTICS",
          summary: "",
          body: "",
          iconKey: "Truck",
          coverId: null,
          highlights: [],
          order: 0,
          published: false,
        }}
        mediaAssets={mediaAssets}
        action={createServiceAction}
      />
    </div>
  );
}
