/**
 * Testimonials trust band (Phase 4 M10).
 *
 * Reads `settings.testimonials` from the SiteSettings JSON. Renders a
 * 2-col card row. Avatar is a MediaPicker id when set; otherwise we fall
 * back to a clean initials chip.
 *
 * Lives between `<ClientsPartners>` and `<Certifications>` on the homepage.
 */
import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/sections/section-heading";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import type { CompanyJson } from "@/lib/validation/settings";

type Testimonial = NonNullable<CompanyJson["testimonials"]>[number];

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase();
}

export function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="center"
          eyebrow="Testimoni Klien"
          title="Apa kata mitra dan klien kami"
          description="Pengalaman nyata dari perusahaan yang memercayakan distribusi mereka pada BMI."
        />
        <Stagger className="mt-12 grid gap-6 lg:grid-cols-2" gap={0.08}>
          {items.map((t, i) => (
            <StaggerItem key={`${t.name}-${i}`}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7">
                <Quote className="size-7 text-brand-orange/40" aria-hidden />
                <blockquote className="mt-4 flex-1 text-base leading-relaxed text-foreground/85">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange/15 to-brand-gold/10 font-display text-sm font-bold text-brand-orange-strong ring-1 ring-brand-orange/20">
                    {initials(t.name)}
                  </span>
                  <div>
                    <p className="font-medium text-ink-900">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.role}
                      {t.company ? ` · ${t.company}` : ""}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
