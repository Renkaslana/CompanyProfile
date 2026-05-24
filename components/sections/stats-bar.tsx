import { CountUp } from "@/components/motion/count-up";
import { cn } from "@/lib/utils";
import type { Stat } from "@/features/content/types";

type StatsBarProps = {
  stats: Stat[];
  tone?: "onDark" | "onLight";
  className?: string;
};

export function StatsBar({ stats, tone = "onDark", className }: StatsBarProps) {
  const dark = tone === "onDark";
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-2xl md:grid-cols-4",
        dark
          ? "bg-white/10 ring-1 ring-white/10"
          : "bg-border ring-1 ring-border",
        className,
      )}
    >
      {stats.map((s) => (
        <div
          key={s.id}
          className={cn(
            "flex flex-col gap-1 px-6 py-6 text-center",
            dark ? "bg-ink-950/60 backdrop-blur-sm" : "bg-card",
          )}
        >
          <dd className="font-display text-3xl font-bold tracking-tight text-brand-gold sm:text-4xl">
            <CountUp to={s.value} suffix={s.suffix} prefix={s.prefix} />
          </dd>
          <dt
            className={cn(
              "text-xs font-medium uppercase tracking-wider",
              dark ? "text-white/60" : "text-muted-foreground",
            )}
          >
            {s.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
