import { CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/sections/section-heading";
import { ImageFrame } from "@/components/image-frame";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { COMPANY, VALUES } from "@/lib/constants";

export function About() {
  return (
    <section id="tentang" className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Visual */}
          <Reveal className="order-last lg:order-first">
            <div className="relative">
              <ImageFrame
                media={{
                  src: "/images/about/about.png",
                  alt: "Fasilitas pergudangan dan operasional BMI",
                }}
                className="aspect-3/2"
                imgClassName="object-cover object-center"
                overlay={false}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </Reveal>

          {/* Copy */}
          <div>
            <SectionHeading
              eyebrow="Tentang Kami"
              title="Mitra logistik yang tumbuh bersama operasional Anda"
              description={`${COMPANY.legalName} adalah perusahaan logistik dan transportasi yang melayani kebutuhan distribusi B2B di seluruh Indonesia. Kami memadukan armada yang andal, tim profesional, dan proses yang disiplin untuk menjaga setiap muatan bergerak tepat waktu dan aman.`}
            />

            <Stagger className="mt-8 grid gap-5 sm:grid-cols-2" gap={0.08}>
              {VALUES.map((v) => (
                <StaggerItem key={v.title}>
                  <div className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-orange" />
                    <div>
                      <h3 className="font-display text-base font-semibold text-ink-900">
                        {v.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {v.description}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}
