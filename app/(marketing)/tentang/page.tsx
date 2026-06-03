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
import { COMPANY } from "@/lib/constants";
import { getStats, getTeam, getSiteSettings } from "@/lib/data";

// Phase 4 M8: render fresh on every request so team/stat changes from the
// CMS appear immediately.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: `Mengenal ${COMPANY.legalName} — perusahaan logistik dan transportasi yang melayani distribusi B2B di seluruh Indonesia.`,
};
void COMPANY; // referenced by metadata; keeps lint happy if Body switches to settings.

export default async function TentangPage() {
  const [team, stats, settings] = await Promise.all([getTeam(), getStats(), getSiteSettings()]);

  return (
    <>
      <PageHeader
        eyebrow="Tentang Kami"
        title="Membangun kepercayaan lewat operasional yang nyata"
        description={settings.tagline}
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
              <SectionHeading eyebrow="Cerita Kami" title={settings.story.headline} />
              {settings.story.paragraphs.map((p, i) => (
                <p key={i} className="mt-5 leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
          </div>

          <Reveal className="mt-16">
            <StatsBar stats={stats} tone="onLight" />
          </Reveal>
        </div>
      </section>

      {/* Visi & Misi (M9 — CMS-managed) */}
      {(settings.visi || settings.misi.length > 0) && (
        <section className="bg-background py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              {settings.visi && (
                <Reveal>
                  <SectionHeading eyebrow="Visi" title="Arah perjalanan kami" />
                  <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                    {settings.visi}
                  </p>
                </Reveal>
              )}
              {settings.misi.length > 0 && (
                <Reveal y={20}>
                  <SectionHeading eyebrow="Misi" title="Komitmen kami" />
                  <ul className="mt-5 space-y-3">
                    {settings.misi.map((m, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-orange" />
                        <span className="leading-relaxed text-muted-foreground">{m}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Values */}
      <section className="bg-surface py-20 sm:py-28">
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
            {settings.values.map((v) => (
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
