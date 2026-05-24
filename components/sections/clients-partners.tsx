import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import type { ClientLogo } from "@/features/content/types";

export function ClientsPartners({ clients }: { clients: ClientLogo[] }) {
  return (
    <section className="border-y border-border bg-surface py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-center text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Dipercaya oleh perusahaan lintas industri
          </p>
        </Reveal>
        <Stagger
          className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4"
          gap={0.05}
        >
          {clients.map((c) => (
            <StaggerItem key={c.id}>
              <div className="group flex h-full flex-col items-center justify-center gap-1 bg-card px-4 py-7 text-center transition-colors hover:bg-accent/60">
                <span className="font-display text-lg font-bold tracking-tight text-ink-900/70 transition-colors group-hover:text-brand-orange-strong">
                  {c.name}
                </span>
                {c.sector && (
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {c.sector}
                  </span>
                )}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
