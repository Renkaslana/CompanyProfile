import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeading } from "@/components/sections/section-heading";
import { ImageFrame } from "@/components/image-frame";
import { CtaBand } from "@/components/sections/cta-band";
import { TeamGrid } from "@/features/content/components/team-grid";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { StatsBar } from "@/components/sections/stats-bar";
import { COMPANY, VALUES } from "@/lib/constants";
import { getStats, getTeam } from "@/lib/data";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: `Mengenal ${COMPANY.legalName} — perusahaan logistik dan transportasi yang melayani distribusi B2B di seluruh Indonesia.`,
};

export default async function TentangPage() {
  const [team, stats] = await Promise.all([getTeam(), getStats()]);

  return (
    <>
      <PageHeader
        eyebrow="Tentang Kami"
        title="Membangun kepercayaan lewat operasional yang nyata"
        description={COMPANY.tagline}
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Tentang" }]}
      />

      {/* Story */}
      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <ImageFrame
                media={{
                  src: "/images/about/our-story.png",
                  alt: "Tim operasional BMI di lapangan",
                }}
                className="aspect-4/3"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </Reveal>
            <div>
              <SectionHeading
                eyebrow="Cerita Kami"
                title="Dari armada pertama hingga jaringan nasional"
                description={`Berdiri sejak ${COMPANY.foundedYear}, ${COMPANY.legalName} tumbuh dari layanan transportasi sederhana menjadi mitra logistik terintegrasi. Fokus kami tak pernah berubah: menggerakkan barang dengan tepat waktu, aman, dan terpantau.`}
              />
              <p className="mt-5 leading-relaxed text-muted-foreground">
                Kami melayani perusahaan lintas industri ritel, manufaktur,
                FMCG, hingga konstruksi dengan kombinasi armada yang andal, tim
                profesional, dan proses yang disiplin. Setiap pengiriman adalah
                komitmen yang kami jaga.
              </p>
            </div>
          </div>

          <Reveal className="mt-16">
            <StatsBar stats={stats} tone="onLight" />
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            align="center"
            eyebrow="Nilai Kami"
            title="Prinsip yang memandu setiap perjalanan"
          />
          <Stagger
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            gap={0.08}
          >
            {VALUES.map((v) => (
              <StaggerItem key={v.title} className="h-full">
                <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <CheckCircle2 className="size-6 text-brand-orange" />
                  <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {v.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Team */}
      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            align="center"
            eyebrow="Tim Kami"
            title="Orang-orang di balik operasional"
            description="Tim berpengalaman yang menjaga setiap roda tetap berputar."
          />
          <div className="mt-12">
            <TeamGrid members={team} />
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
