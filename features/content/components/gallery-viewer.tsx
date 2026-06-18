"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryItem } from "@/features/content/types";

/**
 * Cinematic fullscreen viewer untuk Galeri (Gallery V2 · G2).
 *
 * Foto membesar secara natural (scale-up) di atas backdrop gelap + blur.
 * Navigasi: tombol ←/→, keyboard (←/→/Esc), dan swipe di mobile. Aksesibel:
 * role="dialog" + aria-modal, fokus dipindah ke tombol tutup saat buka,
 * focus-trap sederhana, scroll body dikunci, fokus dikembalikan saat tutup
 * (ditangani pemanggil). Tanpa perubahan data — 1 item = 1 foto.
 */
export function GalleryViewer({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}) {
  const reduce = useReducedMotion();
  const item = items[index];
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [dir, setDir] = useState(0); // arah navigasi terakhir (-1 / +1) untuk slide
  const touchX = useRef<number | null>(null);

  const goPrev = useCallback(() => {
    setDir(-1);
    onNavigate((index - 1 + items.length) % items.length);
  }, [index, items.length, onNavigate]);

  const goNext = useCallback(() => {
    setDir(1);
    onNavigate((index + 1) % items.length);
  }, [index, items.length, onNavigate]);

  // Keyboard: Esc tutup, ←/→ navigasi, Tab di-trap di dalam dialog.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "Tab") {
        const focusables = panelRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, onClose]);

  // Kunci scroll body + fokus tombol tutup saat buka.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!item) return null;

  const slideFrom = reduce ? 0 : dir * 40;

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Foto: ${item.title}`}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.25 }}
      onClick={onClose}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
        if (dx > 50) goPrev();
        else if (dx < -50) goNext();
        touchX.current = null;
      }}
    >
      {/* Backdrop gelap + blur */}
      <div className="absolute inset-0 bg-ink-950/85 backdrop-blur-md" />

      {/* Tutup */}
      <button
        ref={closeRef}
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <X className="size-5" />
      </button>

      {/* Sebelumnya */}
      {items.length > 1 && (
        <button
          type="button"
          aria-label="Foto sebelumnya"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute left-3 top-1/2 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:left-5"
        >
          <ChevronLeft className="size-6" />
        </button>
      )}

      {/* Konten foto — membesar natural + cross-fade saat navigasi */}
      <motion.div
        className="relative z-[1] w-full max-w-5xl"
        initial={{ opacity: 0, scale: reduce ? 1 : 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: reduce ? 1 : 0.92 }}
        transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-4/3 max-h-[78vh] w-full overflow-hidden rounded-2xl bg-ink-950/40 shadow-2xl">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={item.id}
              className="absolute inset-0"
              initial={{ opacity: 0, x: slideFrom }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -slideFrom }}
              transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={item.media.src}
                alt={item.media.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-contain"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Caption */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/85 to-transparent p-6">
            <span className="inline-block rounded-full bg-brand-orange/90 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
              {item.category}
            </span>
            <h2 className="mt-2 font-display text-xl font-semibold text-white">
              {item.title}
            </h2>
          </div>
        </div>
      </motion.div>

      {/* Berikutnya */}
      {items.length > 1 && (
        <button
          type="button"
          aria-label="Foto berikutnya"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="absolute right-3 top-1/2 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-5"
        >
          <ChevronRight className="size-6" />
        </button>
      )}

      {/* Indikator posisi */}
      {items.length > 1 && (
        <p className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
          {index + 1} / {items.length}
        </p>
      )}
    </motion.div>
  );
}
