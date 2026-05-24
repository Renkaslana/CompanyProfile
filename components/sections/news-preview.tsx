import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/sections/section-heading";
import { NewsCard } from "@/features/content/components/news-card";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import type { NewsPost } from "@/features/content/types";

export function NewsPreview({ posts }: { posts: NewsPost[] }) {
  return (
    <section id="berita" className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Berita & Update"
            title="Yang sedang bergerak di BMI"
            description="Perkembangan terbaru dari operasional, armada, dan layanan kami."
          />
          <Button
            render={<Link href="/berita" />}
            variant="ghost"
            className="hidden shrink-0 text-brand-orange-strong hover:bg-accent sm:inline-flex"
          >
            Semua Berita
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <Stagger
          className="mt-12 grid gap-5 md:grid-cols-3"
          gap={0.1}
        >
          {posts.map((post) => (
            <StaggerItem key={post.id} className="h-full">
              <NewsCard post={post} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
