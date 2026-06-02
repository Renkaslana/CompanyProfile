import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ImageFrame } from "@/components/image-frame";
import { SanitizedHtml } from "@/components/admin/sanitized-html";
import { NewsCard } from "@/features/content/components/news-card";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal } from "@/components/motion/reveal";
import { formatDateID } from "@/lib/format";
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

      <article className="bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {formatDateID(post.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="size-4" />
              {post.author}
            </span>
          </div>

          <Reveal className="mt-6">
            <ImageFrame
              media={post.cover}
              className="aspect-16/9"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </Reveal>

          <div className="mt-8 space-y-5 text-lg leading-relaxed text-foreground/80">
            <p className="font-medium text-ink-900">{post.excerpt}</p>
            <SanitizedHtml html={post.body} className="news-body" />
          </div>

          <div className="mt-10">
            <Link
              href="/berita"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-orange-strong hover:gap-3"
            >
              <ArrowLeft className="size-4 transition-all" />
              Kembali ke semua berita
            </Link>
          </div>
        </div>
      </article>

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
