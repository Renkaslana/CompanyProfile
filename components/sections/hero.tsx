import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { StatsBar } from "@/components/sections/stats-bar";
import type { Stat } from "@/features/content/types";

export function Hero({ stats }: { stats: Stat[] }) {
  return (
    <section className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden bg-ink-950 text-white">
      {/* Background image with parallax */}
      <Parallax distance={80} className="absolute inset-0 -z-10 h-[115%]">
        <Image
          src="/brand/hero.png"
          alt="Operasional logistik BMI saat golden hour — truk, gudang, dan tim lapangan"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </Parallax>
      {/* Cinematic gradients */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/30" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_15%_20%,rgba(232,132,43,0.18),transparent_55%)]" />

      <div className="mx-auto w-full max-w-7xl px-4 pt-28 pb-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Reveal y={16}>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-orange sm:text-sm">
              Logistics · Transportation · Rental · Trading
            </p>
          </Reveal>

          <Reveal y={24} delay={0.08}>
            <h1 className="mt-6 text-balance font-display text-4xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
              Menggerakkan Logistik Indonesia dengan{" "}
              <span className="text-gradient-warm">Presisi &amp; Kepercayaan</span>
            </h1>
          </Reveal>

          <Reveal y={20} delay={0.16}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              Armada yang andal, operasional 24/7, dan pemantauan real-time 
              dari gudang hingga tujuan akhir, di seluruh nusantara.
            </p>
          </Reveal>

          <Reveal y={20} delay={0.24}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                render={<Link href="/kontak" />}
                size="lg"
                className="bg-brand-orange text-white hover:bg-brand-orange-strong"
              >
                Minta Penawaran
                <ArrowRight className="size-4" />
              </Button>
              <Button
                render={<Link href="/layanan" />}
                size="lg"
                variant="outline"
                className="border-transparent bg-white/95 text-ink-900 shadow-md backdrop-blur-sm hover:bg-white hover:text-ink-900"
              >
                <FileText className="size-4" />
                Lihat Layanan
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal y={28} delay={0.32} className="mt-14 lg:mt-20">
          <StatsBar stats={stats} tone="onDark" className="max-w-4xl" />
        </Reveal>
      </div>
    </section>
  );
}
