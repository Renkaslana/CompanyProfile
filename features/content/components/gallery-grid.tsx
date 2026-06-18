"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ImageOff } from "lucide-react";
import { ImageFrame } from "@/components/image-frame";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/features/content/types";

/**
 * Gallery V2 (G1) — grid foto operasional publik.
 *
 * Default tenang & bersih (foto tanpa pita gelap permanen); informasi muncul
 * elegan saat hover. Reveal bertahap saat scroll memakai komponen <Reveal>
 * yang sudah ada (reduced-motion aman). Filter kategori tetap reflow halus.
 *
 * Catatan: 1 item = 1 foto (bukan album). Tidak ada perubahan data/skema.
 */
export function GalleryGrid({
  items,
  categories,
}: {
  items: GalleryItem[];
  categories: readonly string[];
}) {
  const [active, setActive] = useState<string>(categories[0] ?? "Semua");
  const reduce = useReducedMotion();

  const filtered = useMemo(
    () =>
      active === "Semua" || active === categories[0]
        ? items
        : items.filter((i) => i.category === active),
    [active, items, categories],
  );

  return (
    <div>
      {/* Filter kategori */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            aria-pressed={active === c}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2",
              active === c
                ? "bg-brand-orange text-white"
                : "bg-accent text-foreground/70 hover:bg-accent/70",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div
        layout={!reduce}
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((item, idx) => (
            <motion.figure
              key={item.id}
              layout={!reduce}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="m-0"
            >
              <Reveal y={20} delay={reduce ? 0 : Math.min(idx * 0.05, 0.4)} duration={0.5}>
                {/* Kartu — hover: lift + shadow + zoom + overlay reveal */}
                <div className="group relative block overflow-hidden rounded-2xl bg-muted shadow-sm transition-[transform,box-shadow] duration-300 ease-bmi hover:-translate-y-1 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <ImageFrame
                    media={item.media}
                    className="aspect-4/3"
                    rounded="rounded-none"
                    imgClassName="transition-transform duration-700 ease-bmi group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Scrim — hanya saat hover */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/15 to-transparent opacity-0 transition-opacity duration-300 ease-bmi group-hover:opacity-100"
                  />

                  {/* Caption reveal (slide-up) + garis aksen */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
                    <span
                      aria-hidden
                      className="block h-0.5 w-0 bg-brand-orange transition-all duration-500 ease-bmi group-hover:w-10"
                    />
                    <div className="translate-y-2 opacity-0 transition-all duration-300 ease-bmi group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="mt-2 inline-block rounded-full bg-brand-orange/90 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                        {item.category}
                      </span>
                      <figcaption className="mt-2 font-display text-lg font-semibold text-white">
                        {item.title}
                      </figcaption>
                    </div>
                  </div>
                </div>
              </Reveal>
            </motion.figure>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <ImageOff className="size-6" />
          </span>
          <p className="mt-4 text-sm font-medium text-ink-900">
            Belum ada foto untuk kategori “{active}”.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Coba kategori lain atau lihat semua dokumentasi.
          </p>
          <button
            type="button"
            onClick={() => setActive(categories[0] ?? "Semua")}
            className="mt-4 rounded-full bg-brand-orange px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-orange-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
          >
            Lihat semua
          </button>
        </div>
      )}
    </div>
  );
}
