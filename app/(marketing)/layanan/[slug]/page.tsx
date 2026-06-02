import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ImageFrame } from "@/components/image-frame";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { CtaBand } from "@/components/sections/cta-band";
import { Reveal } from "@/components/motion/reveal";
import { getServiceBySlug, getServices } from "@/lib/data";

// Phase 4 M5/M6: render fresh so newly-published services appear immediately.
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Layanan tidak ditemukan" };
  return { title: service.title, description: service.summary };
}

export default async function LayananDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const others = (await getServices()).filter((s) => s.slug !== slug);

  return (
    <>
      <PageHeader
        eyebrow="Layanan"
        title={service.title}
        description={service.summary}
        breadcrumb={[
          { label: "Beranda", href: "/" },
          { label: "Layanan", href: "/layanan" },
          { label: service.title },
        ]}
      />

      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <Reveal>
              <ImageFrame
                media={service.cover}
                className="aspect-16/10"
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="mt-8 max-w-2xl">
                <h2 className="font-display text-2xl font-bold text-ink-900">
                  Tentang layanan ini
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  {service.body}
                </p>
              </div>
            </Reveal>

            {/* Sidebar */}
            <Reveal y={20}>
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <span className="inline-flex size-12 items-center justify-center rounded-xl bg-brand-orange/12 text-brand-orange ring-1 ring-brand-orange/20">
                  <Icon name={service.iconKey} className="size-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">
                  Yang Anda dapatkan
                </h3>
                <ul className="mt-4 space-y-3">
                  {service.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-ink-900">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand-orange" />
                      {h}
                    </li>
                  ))}
                </ul>
                <Button
                  render={<Link href="/kontak" />}
                  className="mt-6 w-full bg-brand-orange text-white hover:bg-brand-orange-strong"
                >
                  Minta Penawaran
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Other services */}
          <div className="mt-20">
            <h2 className="font-display text-xl font-bold text-ink-900">
              Layanan lainnya
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {others.map((o) => (
                <Link
                  key={o.id}
                  href={`/layanan/${o.slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-brand-orange/40"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
                    <Icon name={o.iconKey} className="size-5" />
                  </span>
                  <span className="font-medium text-ink-900">{o.title}</span>
                  <ArrowRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
