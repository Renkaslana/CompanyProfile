import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { cn } from "@/lib/utils";

type Milestone = {
  readonly year: string;
  readonly title: string;
  readonly description: string;
};

/**
 * Timeline perjalanan perusahaan (BMI). Horizontal di desktop (garis konektor
 * brand-orange + reveal bertahap), bertumpuk vertikal di mobile. Presentasional
 * — data dari konstanta `COMPANY_JOURNEY`. Reuse <Stagger> dari design system.
 */
export function CompanyTimeline({
  milestones,
  className,
}: {
  milestones: readonly Milestone[];
  className?: string;
}) {
  return (
    <Stagger
      className={cn("grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8", className)}
      gap={0.1}
    >
      {milestones.map((m, i) => {
        const isLast = i === milestones.length - 1;
        return (
          <StaggerItem key={m.title}>
            <div className="relative">
              {/* Rel + titik */}
              <div className="flex items-center gap-3">
                <span className="relative z-[1] inline-flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-brand-orange bg-surface">
                  <span className="size-1.5 rounded-full bg-brand-orange" />
                </span>
                {/* Konektor horizontal (desktop) */}
                {!isLast && (
                  <span
                    aria-hidden
                    className="hidden h-px flex-1 bg-gradient-to-r from-brand-orange/50 to-border lg:block"
                  />
                )}
              </div>

              {/* Konten */}
              <div className="mt-3 lg:mt-4">
                <p className="font-display text-lg font-bold text-brand-orange-strong">
                  {m.year}
                </p>
                <h3 className="mt-1 font-display text-base font-semibold text-ink-900">
                  {m.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {m.description}
                </p>
              </div>
            </div>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
