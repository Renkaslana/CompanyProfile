import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

type CtaBandProps = {
  title?: string;
  description?: string;
};

export function CtaBand({
  title = "Diskusikan kebutuhan logistik Anda",
  description = "Tim BMI siap menyusun solusi yang tepat untuk operasional Anda.",
}: CtaBandProps) {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="section-ink relative overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12 sm:py-16">
            <div className="absolute inset-0 bg-[radial-gradient(100%_120%_at_50%_0%,rgba(232,132,43,0.18),transparent_55%)]" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                {title}
              </h2>
              <p className="mt-3 text-white/65">{description}</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  render={<Link href="/kontak" />}
                  size="lg"
                  className="bg-brand-orange text-white hover:bg-brand-orange-strong"
                >
                  <Phone className="size-4" />
                  Minta Penawaran
                </Button>
                <Button
                  render={<Link href="/layanan" />}
                  size="lg"
                  variant="outline"
                  className="border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white"
                >
                  Lihat Layanan
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
