import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CtaBand } from "@/components/sections/cta-band";
import { NewsCard } from "@/features/content/components/news-card";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { getNews } from "@/lib/data";

export const metadata: Metadata = {
  title: "Berita & Update",
  description:
    "Perkembangan terbaru dari PT. Bintang Mulia Investama — operasional, armada, teknologi, dan kemitraan.",
};

export default async function BeritaPage() {
  const posts = await getNews();

  return (
    <>
      <PageHeader
        eyebrow="Berita & Update"
        title="Kabar terbaru dari BMI"
        description="Ikuti perkembangan operasional, armada, dan layanan kami."
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Berita" }]}
      />

      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" gap={0.08}>
            {posts.map((post) => (
              <StaggerItem key={post.id} className="h-full">
                <NewsCard post={post} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
