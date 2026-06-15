import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Eye, PencilLine } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { NewsArticle } from "@/features/content/components/news-article";
import { getSessionUser } from "@/server/auth/guards";
import { getNewsByIdForPreview } from "@/lib/data";

/**
 * Admin "Pratinjau sebagai pengunjung" untuk Berita.
 *
 * Berada di marketing group → mendapat chrome publik (navbar/footer) sehingga
 * tampak persis seperti `/berita/[slug]`, TAPI mengizinkan status DRAFT/ARCHIVED
 * karena di-gate auth di level halaman ini (admin-only). Tidak ada token publik
 * — non-admin diarahkan ke login.
 */
export const dynamic = "force-dynamic";

export default async function BeritaPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Auth gate (graceful redirect, tidak throw). Preview hanya untuk admin.
  const user = await getSessionUser();
  if (!user || !user.permissions.includes("content:read")) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const post = await getNewsByIdForPreview(id);
  if (!post) notFound();

  return (
    <>
      {/* Banner mode pratinjau — jelas ini bukan halaman live */}
      <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 bg-brand-orange px-4 py-2 text-sm text-white">
        <span className="inline-flex items-center gap-2 font-medium">
          <Eye className="size-4" />
          Mode Pratinjau — tampilan seperti dilihat pengunjung. Belum tentu
          sudah dipublikasikan.
        </span>
        <Link
          href={`/admin/news/${id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1 text-xs font-medium hover:bg-white/25"
        >
          <PencilLine className="size-3.5" />
          Kembali mengedit
        </Link>
      </div>

      <PageHeader
        eyebrow={post.category}
        title={post.title}
        breadcrumb={[
          { label: "Beranda", href: "/" },
          { label: "Berita", href: "/berita" },
          { label: post.title },
        ]}
      />

      <NewsArticle post={post} />
    </>
  );
}
