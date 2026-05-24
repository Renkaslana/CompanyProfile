import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/sections/section-heading";
import { ImageFrame } from "@/components/image-frame";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import type { GalleryItem } from "@/features/content/types";

export function OperationalGallery({ items }: { items: GalleryItem[] }) {
  const shown = items.slice(0, 6);
  return (
    <section id="galeri" className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Dokumentasi Operasional"
            title="Bukti nyata, bukan sekadar klaim"
            description="Potret kegiatan harian kami di lapangan — dari briefing pagi hingga pengiriman selesai."
          />
          <Button
            render={<Link href="/galeri" />}
            variant="ghost"
            className="hidden shrink-0 text-brand-orange-strong hover:bg-accent sm:inline-flex"
          >
            Lihat Semua
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <Stagger
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          gap={0.08}
        >
          {shown.map((item) => (
            <StaggerItem key={item.id}>
              <figure className="group relative">
                <ImageFrame
                  media={item.media}
                  className="aspect-4/3"
                  imgClassName="transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-2xl bg-gradient-to-t from-ink-950/85 to-transparent p-5">
                  <span className="inline-block rounded-full bg-brand-orange/90 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                    {item.category}
                  </span>
                  <figcaption className="mt-2 font-display text-lg font-semibold text-white">
                    {item.title}
                  </figcaption>
                </div>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-8 sm:hidden">
          <Button
            render={<Link href="/galeri" />}
            variant="outline"
            className="w-full"
          >
            Lihat Semua
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
