import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { NewsCard } from "@/features/content/components/news-card";
import { NewsArticle } from "@/features/content/components/news-article";
import { CtaBand } from "@/components/sections/cta-band";
import { getNews, getNewsBySlug } from "@/lib/data";

// Phase 4 M6: render fresh on every request so CMS publishes show up
// immediately (no .next snapshot lag).
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const posts = await getNews();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) return { title: "Berita tidak ditemukan" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [{ url: post.cover.src }] },
  };
}

export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) notFound();

  const related = (await getNews()).filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
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

      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-xl font-bold text-ink-900">
            Berita lainnya
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <NewsCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
