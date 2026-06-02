import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ImageFrame } from "@/components/image-frame";
import { Icon } from "@/components/icon";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal } from "@/components/motion/reveal";
import { getServices } from "@/lib/data";

// Phase 4 M5/M6: render fresh on every request so newly-published services
// appear immediately. Trade-off accepted (CMS-driven content wins over
// static caching for this size of marketing site).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Layanan",
  description:
    "Jasa Logistik, Transportasi, Rental Mobil, dan Perdagangan Umum — layanan terintegrasi BMI untuk kebutuhan operasional bisnis Anda.",
};

export default async function LayananPage() {
  const services = await getServices();

  return (
    <>
      <PageHeader
        eyebrow="Layanan Kami"
        title="Solusi terintegrasi untuk setiap kebutuhan operasional"
        description="Empat pilar layanan yang saling melengkapi — dirancang untuk keandalan, keamanan, dan ketepatan waktu."
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Layanan" }]}
      />

      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
          {services.map((s, i) => (
            <Reveal key={s.id}>
              <div
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                  i % 2 === 1 ? "lg:[&>*:first-child]:order-last" : ""
                }`}
              >
                <ImageFrame
                  media={s.cover}
                  className="aspect-4/3"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div>
                  <span className="inline-flex size-12 items-center justify-center rounded-xl bg-brand-orange/12 text-brand-orange ring-1 ring-brand-orange/20">
                    <Icon name={s.iconKey} className="size-6" />
                  </span>
                  <h2 className="mt-5 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
                    {s.title}
                  </h2>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {s.summary}
                  </p>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {s.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-sm text-ink-900">
                        <Check className="mt-0.5 size-4 shrink-0 text-brand-orange" />
                        {h}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/layanan/${s.slug}`}
                    className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange-strong hover:gap-2.5"
                  >
                    Pelajari Selengkapnya
                    <ArrowRight className="size-4 transition-all" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
