import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

type Crumb = { label: string; href?: string };

type PageHeaderProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumb?: Crumb[];
};

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <section className="section-ink relative overflow-hidden">
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.05]" />
      <div className="absolute inset-0 bg-[radial-gradient(110%_90%_at_10%_0%,rgba(232,132,43,0.15),transparent_55%)]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 sm:pt-36 lg:px-8">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex items-center gap-1.5 text-sm text-white/50"
          >
            {breadcrumb.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3.5" />}
                {c.href ? (
                  <Link href={c.href} className="transition-colors hover:text-brand-gold">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-white/80">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <Reveal>
          {eyebrow && (
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-brand-orange" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange">
                {eyebrow}
              </span>
            </div>
          )}
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold text-white sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65">
              {description}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
