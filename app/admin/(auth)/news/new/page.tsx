/**
 * /admin/news/new — create a new news post.
 */
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/server/auth/guards";
import { MediaService } from "@/server/services/media.service";
import { NewsForm } from "../news-form";
import { createNewsAction } from "../actions";

export default async function NewNewsPage() {
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
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/admin/news"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="size-4" />
        Kembali ke daftar berita
      </Link>

      <header>
        <h1 className="font-display text-2xl font-bold text-ink-900">Tambah berita</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Berita baru otomatis berstatus <strong>Draft</strong> kecuali Anda
          centang &ldquo;Langsung publish&rdquo;. Anda bisa publish / unpublish
          / arsip kapan saja dari halaman daftar.
        </p>
      </header>

      <NewsForm
        mode="create"
        initial={{
          title: "",
          slug: "",
          excerpt: "",
          body: "",
          category: "Operasional",
          displayAuthor: "",
          coverId: null,
          publishImmediately: false,
        }}
        mediaAssets={mediaAssets}
        action={createNewsAction}
      />
    </div>
  );
}
