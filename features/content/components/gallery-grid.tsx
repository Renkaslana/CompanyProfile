"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Expand, ImageOff } from "lucide-react";
import { ImageFrame } from "@/components/image-frame";
import { Reveal } from "@/components/motion/reveal";
import { GalleryViewer } from "@/features/content/components/gallery-viewer";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/features/content/types";

/**
 * Gallery V2 — grid foto operasional publik.
 *
 * G1: default tenang & bersih, hover premium (lift + shadow + zoom + overlay
 * reveal), scroll reveal via <Reveal>, empty state.
 * G2: kartu klik → Cinematic Fullscreen Viewer; focus keyboard setara hover.
 *
 * 1 item = 1 foto (bukan album). Tanpa perubahan data/skema.
 */
export function GalleryGrid({
  items,
  categories,
}: {
  items: GalleryItem[];
  categories: readonly string[];
}) {
  const [active, setActive] = useState<string>(categories[0] ?? "Semua");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();

  const filtered = useMemo(
    () =>
      active === "Semua" || active === categories[0]
        ? items
        : items.filter((i) => i.category === active),
    [active, items, categories],
  );

  const openAt = (idx: number, el: HTMLDivElement) => {
    triggerRef.current = el;
    setOpenIndex(idx);
  };
  const closeViewer = () => {
    setOpenIndex(null);
    // Kembalikan fokus ke kartu yang tadi dibuka (a11y).
    triggerRef.current?.focus();
  };

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
                {/* Kartu klikabel — hover & focus-visible memberi efek sama */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={`Buka foto: ${item.title}`}
                  onClick={(e) => openAt(idx, e.currentTarget)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openAt(idx, e.currentTarget);
                    }
                  }}
                  className="group relative block w-full cursor-pointer overflow-hidden rounded-2xl bg-muted text-left shadow-sm transition-[transform,box-shadow] duration-300 ease-bmi hover:-translate-y-1 hover:shadow-xl focus-visible:-translate-y-1 focus-visible:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <ImageFrame
                    media={item.media}
                    className="aspect-4/3"
                    rounded="rounded-none"
                    imgClassName="transition-transform duration-700 ease-bmi group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Scrim — hover/focus */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/15 to-transparent opacity-0 transition-opacity duration-300 ease-bmi group-hover:opacity-100 group-focus-visible:opacity-100"
                  />

                  {/* Affordance "perbesar" */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute right-3 top-3 z-[1] inline-flex size-9 scale-90 items-center justify-center rounded-full bg-ink-950/45 text-white opacity-0 backdrop-blur-sm transition-all duration-300 ease-bmi group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
                  >
                    <Expand className="size-4" />
                  </span>

                  {/* Caption reveal (slide-up) + garis aksen */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
                    <span
                      aria-hidden
                      className="block h-0.5 w-0 bg-brand-orange transition-all duration-500 ease-bmi group-hover:w-10 group-focus-visible:w-10"
                    />
                    <div className="translate-y-2 opacity-0 transition-all duration-300 ease-bmi group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
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

      {/* Cinematic Fullscreen Viewer */}
      <AnimatePresence>
        {openIndex !== null && filtered[openIndex] && (
          <GalleryViewer
            items={filtered}
            index={openIndex}
            onClose={closeViewer}
            onNavigate={(next) => setOpenIndex(next)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
