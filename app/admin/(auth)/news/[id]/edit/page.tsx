/**
 * /admin/news/[id]/edit — edit existing news metadata + body.
 *
 * Status workflow (publish / unpublish / archive / restore) is handled
 * separately on the list page so the edit form stays focused on content.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { requirePermission } from "@/server/auth/guards";
import { MediaService } from "@/server/services/media.service";
import { NewsCmsService } from "@/server/services/news-cms.service";
import { STATUS_LABEL, type NewsStatus } from "@/lib/validation/news";
import { NewsForm } from "../../news-form";
import { updateNewsAction } from "../../actions";

type Params = Promise<{ id: string }>;

export default async function EditNewsPage({ params }: { params: Params }) {
  await requirePermission("content:write");
  const { id } = await params;
  const post = await NewsCmsService.findById(id);
  if (!post) notFound();

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
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/admin/news"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="size-4" />
        Kembali ke daftar berita
      </Link>

      <header>
        <h1 className="font-display text-2xl font-bold text-ink-900">Edit berita</h1>
        <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
          Status:{" "}
          <StatusBadge status={post.status} />
          <span>· {STATUS_LABEL[post.status as NewsStatus]}.</span>
          <span className="ml-1">
            Untuk publish / unpublish / arsip, gunakan tombol di halaman daftar.
          </span>
        </p>
      </header>

      <NewsForm
        mode="edit"
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          body: post.body,
          category: post.category,
          displayAuthor: post.displayAuthor ?? "",
          coverId: post.coverId,
          publishImmediately: false,
        }}
        mediaAssets={mediaAssets}
        action={updateNewsAction}
      />
    </div>
  );
}
