import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/server/auth/guards";
import { MediaService } from "@/server/services/media.service";
import { TeamCmsService } from "@/server/services/team-cms.service";
import { TeamForm } from "../../team-form";
import { updateTeamAction } from "../../actions";

type Params = Promise<{ id: string }>;

export default async function EditTeamPage({ params }: { params: Params }) {
  await requirePermission("content:write");
  const { id } = await params;
  const member = await TeamCmsService.findById(id);
  if (!member) notFound();
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
        href="/admin/team"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="size-4" />
        Kembali ke daftar tim
      </Link>
      <header>
        <h1 className="font-display text-2xl font-bold text-ink-900">Edit anggota tim</h1>
      </header>
      <TeamForm
        mode="edit"
        initial={{
          id: member.id,
          name: member.name,
          role: member.role,
          photoId: member.photoId,
          order: member.order,
        }}
        mediaAssets={mediaAssets}
        action={updateTeamAction}
      />
    </div>
  );
}
