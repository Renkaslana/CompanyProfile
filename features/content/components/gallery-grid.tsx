"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ImageFrame } from "@/components/image-frame";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/features/content/types";

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
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              active === c
                ? "bg-brand-orange text-white"
                : "bg-accent text-foreground/70 hover:bg-accent/70",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <motion.div
        layout={!reduce}
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => (
            <motion.figure
              key={item.id}
              layout={!reduce}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="group relative"
            >
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
            </motion.figure>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
