import Link from "next/link";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import { ImageFrame } from "@/components/image-frame";
import { SanitizedHtml } from "@/components/admin/sanitized-html";
import { Reveal } from "@/components/motion/reveal";
import { formatDateID } from "@/lib/format";
import type { NewsPost } from "@/features/content/types";

/**
 * Renders a single news article body (meta + cover + excerpt + sanitized body
 * + back link). Shared by the public `/berita/[slug]` page and the admin
 * preview-as-visitor route so both stay byte-for-byte identical.
 *
 * Body is re-sanitized on render via `<SanitizedHtml>` (defense in depth).
 */
export function NewsArticle({ post }: { post: NewsPost }) {
  return (
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
  );
}
