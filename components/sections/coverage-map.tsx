"use client";

import { motion, useReducedMotion } from "motion/react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CoverageRegion } from "@/features/content/types";

export function CoverageMap({ regions }: { regions: CoverageRegion[] }) {
  const reduce = useReducedMotion();
  const hub = regions.find((r) => r.id === "cov-jakarta") ?? regions[0];
  const targets = regions.filter((r) => r.id !== hub.id);

  // SVG canvas is 100 x 50 (2:1) with preserveAspectRatio="none".
  const toSvg = (r: CoverageRegion) => ({ x: r.x, y: r.y * 0.5 });
  const h = toSvg(hub);

  return (
    <section className="section-ink relative overflow-hidden py-20 sm:py-28">
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.05]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Copy */}
          <div className="max-w-md">
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-brand-orange" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange">
                Jangkauan Layanan
              </span>
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
              Menjangkau nusantara, dari Sumatra hingga Papua
            </h2>
            <p className="mt-4 leading-relaxed text-white/65">
              Jaringan distribusi BMI menghubungkan kota-kota utama di seluruh
              Indonesia, dengan hub strategis untuk menjaga kecepatan dan
              keandalan pengiriman antar pulau.
            </p>
            <dl className="mt-8 grid grid-cols-3 gap-4">
              {[
                { v: "15+", l: "Kota Layanan" },
                { v: "5", l: "Pulau Utama" },
                { v: "4", l: "Hub Strategis" },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="font-display text-2xl font-bold text-brand-gold">
                    {s.v}
                  </dt>
                  <dd className="mt-1 text-xs uppercase tracking-wide text-white/55">
                    {s.l}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Map */}
          <div className="relative aspect-2/1 w-full rounded-2xl border border-white/10 bg-[radial-gradient(circle,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:18px_18px]">
            <svg
              viewBox="0 0 100 50"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full overflow-visible"
            >
              {targets.map((t, i) => {
                const p = toSvg(t);
                return (
                  <motion.line
                    key={t.id}
                    x1={h.x}
                    y1={h.y}
                    x2={p.x}
                    y2={p.y}
                    stroke="url(#routeGrad)"
                    strokeWidth={0.4}
                    strokeLinecap="round"
                    initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 0.5 : 0 }}
                    whileInView={{ pathLength: 1, opacity: 0.55 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{
                      duration: reduce ? 0 : 1.1,
                      delay: reduce ? 0 : 0.2 + i * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                );
              })}
              <defs>
                <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#e8842b" />
                  <stop offset="100%" stopColor="#dda017" />
                </linearGradient>
              </defs>
            </svg>

            {/* City dots */}
            {regions.map((r) => (
              <div
                key={r.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${r.x}%`, top: `${r.y}%` }}
              >
                <div className="relative flex items-center justify-center">
                  {r.hub && !reduce && (
                    <motion.span
                      className="absolute inline-flex rounded-full bg-brand-orange/40"
                      style={{ width: 22, height: 22 }}
                      animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 rounded-full ring-2 ring-ink-950",
                      r.hub
                        ? "size-3 bg-brand-orange"
                        : "size-2 bg-brand-gold",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-1/2 top-3 hidden -translate-x-1/2 whitespace-nowrap text-[10px] font-medium md:block",
                      r.hub ? "text-white/90" : "text-white/55",
                    )}
                  >
                    {r.name}
                  </span>
                </div>
              </div>
            ))}

            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-ink-950/70 px-3 py-1 text-[11px] text-white/70 ring-1 ring-white/10">
              <MapPin className="size-3 text-brand-orange" />
              Hub &amp; Kota Layanan
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
