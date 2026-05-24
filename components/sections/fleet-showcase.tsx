import { SectionHeading } from "@/components/sections/section-heading";
import { ImageFrame } from "@/components/image-frame";
import { Icon } from "@/components/icon";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { Badge } from "@/components/ui/badge";
import type { FleetVehicle } from "@/features/fleet/types";
import type { Achievement } from "@/features/content/types";

export function FleetShowcase({
  fleet,
  achievements,
}: {
  fleet: FleetVehicle[];
  achievements: Achievement[];
}) {
  return (
    <section id="armada" className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Armada Kami"
          title="Skala armada yang siap untuk volume apa pun"
          description="Dari last-mile perkotaan hingga angkutan antar pulau — setiap unit terawat dan siap operasi."
        />

        <Stagger
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          gap={0.07}
        >
          {fleet.map((v) => (
            <StaggerItem key={v.id} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
                <ImageFrame
                  media={v.photo}
                  rounded="rounded-none"
                  className="aspect-16/10"
                  imgClassName="transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold text-ink-900">
                      {v.name}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="shrink-0 bg-brand-orange/10 text-brand-orange-strong"
                    >
                      {v.type}
                    </Badge>
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {v.description}
                  </p>
                  <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
                    {v.specs.map((spec) => (
                      <div key={spec.label}>
                        <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {spec.label}
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold text-ink-900">
                          {spec.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Dark achievements panel */}
        <Reveal y={32} className="mt-16">
          <div className="section-ink relative overflow-hidden rounded-3xl px-6 py-12 sm:px-12">
            <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.05]" />
            <div className="absolute inset-0 bg-[radial-gradient(90%_120%_at_85%_15%,rgba(232,132,43,0.16),transparent_55%)]" />
            <div className="relative">
              <h3 className="max-w-md font-display text-2xl font-bold text-white sm:text-3xl">
                Mengapa perusahaan memercayakan logistiknya pada BMI
              </h3>
              <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {achievements.map((a) => (
                  <div key={a.id}>
                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange ring-1 ring-brand-orange/25">
                      <Icon name={a.iconKey} className="size-5" />
                    </span>
                    <h4 className="mt-4 font-display text-base font-semibold text-white">
                      {a.title}
                    </h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                      {a.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
