import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/server/auth/guards";
import { MediaService } from "@/server/services/media.service";
import { TeamForm } from "../team-form";
import { createTeamAction } from "../actions";

export default async function NewTeamPage() {
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
        href="/admin/team"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="size-4" />
        Kembali ke daftar tim
      </Link>
      <header>
        <h1 className="font-display text-2xl font-bold text-ink-900">Tambah anggota tim</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Anggota baru langsung tampil di halaman <code>/tentang</code>.
        </p>
      </header>
      <TeamForm
        mode="create"
        initial={{ name: "", role: "", photoId: null, order: 0 }}
        mediaAssets={mediaAssets}
        action={createTeamAction}
      />
    </div>
  );
}
