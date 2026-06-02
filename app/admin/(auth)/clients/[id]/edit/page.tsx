import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/server/auth/guards";
import { MediaService } from "@/server/services/media.service";
import { ClientCmsService } from "@/server/services/client-cms.service";
import { ClientForm } from "../../client-form";
import { updateClientAction } from "../../actions";

type Params = Promise<{ id: string }>;

export default async function EditClientPage({ params }: { params: Params }) {
  await requirePermission("content:write");
  const { id } = await params;
  const client = await ClientCmsService.findById(id);
  if (!client) notFound();
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
        href="/admin/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="size-4" />
        Kembali ke daftar klien
      </Link>
      <header>
        <h1 className="font-display text-2xl font-bold text-ink-900">Edit klien</h1>
      </header>
      <ClientForm
        mode="edit"
        initial={{
          id: client.id,
          name: client.name,
          sector: client.sector ?? "",
          url: client.url ?? "",
          logoId: client.logoId,
          order: client.order,
        }}
        mediaAssets={mediaAssets}
        action={updateClientAction}
      />
    </div>
  );
}
