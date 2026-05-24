import { SectionHeading } from "@/components/sections/section-heading";
import { Icon } from "@/components/icon";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import type { Certification } from "@/features/content/types";

export function Certifications({ items }: { items: Certification[] }) {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="center"
          eyebrow="Legalitas & Kredibilitas"
          title="Badan usaha resmi yang dapat dipertanggungjawabkan"
          description="Beroperasi sebagai perseroan terbatas dengan kepatuhan perizinan dan komitmen pada standar keselamatan kerja."
        />
        <Stagger
          className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-2 lg:grid-cols-4"
          gap={0.08}
        >
          {items.map((c) => (
            <StaggerItem key={c.id}>
              <div className="flex h-full flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
                <span className="inline-flex size-12 items-center justify-center rounded-xl bg-brand-gold/12 text-brand-gold ring-1 ring-brand-gold/20">
                  <Icon name={c.iconKey} className="size-6" />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold text-ink-900">
                  {c.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">{c.issuer}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
