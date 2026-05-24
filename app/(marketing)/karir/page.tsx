import type { Metadata } from "next";
import { Briefcase, MapPin, Building2, Heart, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeading } from "@/components/sections/section-heading";
import { ImageFrame } from "@/components/image-frame";
import { CtaBand } from "@/components/sections/cta-band";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { COMPANY } from "@/lib/constants";
import { getJobs } from "@/lib/data";

export const metadata: Metadata = {
  title: "Karir",
  description: `Bergabung dengan ${COMPANY.legalName} — tumbuh bersama tim logistik yang profesional dan berkomitmen.`,
};

const CULTURE = [
  { icon: TrendingUp, title: "Pertumbuhan", text: "Ruang untuk berkembang seiring perusahaan yang terus tumbuh." },
  { icon: Users, title: "Tim Solid", text: "Lingkungan kerja kolaboratif yang saling mendukung." },
  { icon: Heart, title: "Keselamatan", text: "Budaya keselamatan kerja yang dijunjung tinggi." },
];

export default async function KarirPage() {
  const jobs = await getJobs();

  return (
    <>
      <PageHeader
        eyebrow="Karir"
        title="Tumbuh bersama tim yang menggerakkan logistik Indonesia"
        description="Kami mencari orang-orang yang disiplin, peduli pada detail, dan bangga pada pekerjaan lapangan."
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Karir" }]}
      />

      {/* Culture */}
      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <ImageFrame
                media={{
                  src: "/images/gallery/briefing.jpg",
                  alt: "Tim BMI saat briefing pagi",
                }}
                className="aspect-4/3"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </Reveal>
            <div>
              <SectionHeading
                eyebrow="Budaya Kami"
                title="Tempat di mana kerja keras dihargai"
                description="Di BMI, setiap peran berkontribusi langsung pada janji yang kami berikan ke klien. Kami menghargai integritas, kerja sama, dan kebanggaan profesional."
              />
              <Stagger className="mt-8 grid gap-5 sm:grid-cols-3" gap={0.08}>
                {CULTURE.map((c) => (
                  <StaggerItem key={c.title}>
                    <c.icon className="size-6 text-brand-orange" />
                    <h3 className="mt-3 font-display text-base font-semibold text-ink-900">
                      {c.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>
        </div>
      </section>

      {/* Openings */}
      <section className="bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            align="center"
            eyebrow="Lowongan"
            title="Posisi yang sedang kami buka"
          />
          <Stagger className="mt-12 space-y-4" gap={0.08}>
            {jobs.map((job) => (
              <StaggerItem key={job.id}>
                <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink-900">
                      {job.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{job.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="size-3.5" /> {job.department}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="size-3.5" /> {job.type}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" /> {job.location}
                      </span>
                    </div>
                  </div>
                  <Button
                    render={
                      <a
                        href={`mailto:${COMPANY.email}?subject=Lamaran: ${encodeURIComponent(job.title)}`}
                      />
                    }
                    className="shrink-0 bg-brand-orange text-white hover:bg-brand-orange-strong"
                  >
                    Lamar Posisi
                  </Button>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Tidak menemukan posisi yang cocok? Kirim CV Anda ke{" "}
            <a
              href={`mailto:${COMPANY.email}`}
              className="font-medium text-brand-orange-strong hover:underline"
            >
              {COMPANY.email}
            </a>
          </p>
        </div>
      </section>

      <CtaBand title="Siap bergabung dengan BMI?" description="Kirim lamaran Anda dan jadilah bagian dari tim kami." />
    </>
  );
}
