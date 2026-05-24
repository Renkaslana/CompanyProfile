import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/sections/section-heading";
import { Icon } from "@/components/icon";
import { ImageFrame } from "@/components/image-frame";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import type { Service } from "@/features/content/types";

export function ServicesGrid({ services }: { services: Service[] }) {
  return (
    <section
      id="layanan"
      className="section-ink relative overflow-hidden py-20 sm:py-28"
    >
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.05]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <SectionHeading
            tone="dark"
            eyebrow="Layanan Kami"
            title="Empat pilar yang menggerakkan bisnis Anda"
            description="Layanan terintegrasi yang dirancang untuk keandalan, keamanan, dan ketepatan waktu di setiap tahap."
          />

          <Reveal className="hidden max-w-xs shrink-0 lg:block">
            <div className="flex items-start gap-4 pt-2">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange ring-1 ring-brand-orange/20">
                <ShieldCheck className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-base font-semibold text-white">
                  Terpercaya &amp; Profesional
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                  Didukung tim berpengalaman dan armada yang terawat untuk
                  layanan terbaik.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <Stagger
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          gap={0.1}
        >
          {services.map((s) => (
            <StaggerItem key={s.id} className="h-full">
              <Link
                href={`/layanan/${s.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/40 hover:bg-white/[0.07] hover:shadow-2xl hover:shadow-black/30"
              >
                <ImageFrame
                  media={s.cover}
                  className="aspect-[4/3]"
                  rounded="rounded-none"
                  overlay={false}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="flex flex-1 flex-col p-6">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange ring-1 ring-brand-orange/20 transition-colors group-hover:bg-brand-orange group-hover:text-white">
                    <Icon name={s.iconKey} className="size-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-white">
                    {s.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60">
                    {s.summary}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-gold">
                    Pelajari Selengkapnya
                    <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
