import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import type { ClientLogo } from "@/features/content/types";

function isCloudinary(src: string) {
  return src.startsWith("https://res.cloudinary.com");
}
function isLocal(src: string) {
  return src.startsWith("/");
}

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
          {clients.map((c) => {
            const logoSrc = c.logo?.src;
            const logoAlt = c.logo?.alt ?? c.name;
            const card = (
              <div className="group flex h-full flex-col items-center justify-center gap-2 bg-card px-4 py-7 text-center transition-colors hover:bg-accent/60">
                {logoSrc ? (
                  <div className="relative h-10 w-32">
                    <Image
                      src={logoSrc}
                      alt={logoAlt}
                      fill
                      sizes="128px"
                      className="object-contain opacity-70 grayscale transition group-hover:opacity-100 group-hover:grayscale-0"
                      unoptimized={!isCloudinary(logoSrc) && !isLocal(logoSrc)}
                    />
                  </div>
                ) : (
                  <span className="font-display text-lg font-bold tracking-tight text-ink-900/70 transition-colors group-hover:text-brand-orange-strong">
                    {c.name}
                  </span>
                )}
                {c.sector && (
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {c.sector}
                  </span>
                )}
              </div>
            );
            return (
              <StaggerItem key={c.id}>
                {c.url ? (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Buka situs ${c.name}`}
                    className="block h-full"
                  >
                    {card}
                  </a>
                ) : (
                  card
                )}
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
