import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { ImageFrame } from "@/components/image-frame";
import { formatDateID } from "@/lib/format";
import type { NewsPost } from "@/features/content/types";

export function NewsCard({ post }: { post: NewsPost }) {
  return (
    <Link
      href={`/berita/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
    >
      <ImageFrame
        media={post.cover}
        rounded="rounded-none"
        className="aspect-16/9"
        imgClassName="transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="rounded-full bg-accent px-2.5 py-0.5 font-medium text-brand-orange-strong">
            {post.category}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {formatDateID(post.publishedAt)}
          </span>
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-ink-900 transition-colors group-hover:text-brand-orange-strong">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
      </div>
    </Link>
  );
}
