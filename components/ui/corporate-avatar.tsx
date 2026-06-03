/**
 * Professional placeholder avatar for when a real photo isn't available.
 *
 * Renders a brand-tinted card with a clean SVG silhouette (head + shoulders)
 * and the person's initials overlaid in a small badge. The silhouette is
 * intentionally generic/neutral so it doesn't read as "fake person".
 *
 * Used by TeamGrid when `member.photo` is unset (Phase 4 M10). Easy to
 * replace via the Team CMS — admin uploads a photo → photo overrides.
 */
import { cn } from "@/lib/utils";

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase();
}

export function CorporateAvatar({
  name,
  size = 80,
  className,
}: {
  name: string;
  /** px — square */
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-orange/15 via-brand-gold/10 to-brand-orange/5 ring-1 ring-brand-orange/20",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "10px 10px",
          color: "var(--brand-orange-strong, #c5651a)",
        }}
      />
      {/* Silhouette SVG — head + shoulders, brand-orange tinted */}
      <svg
        viewBox="0 0 64 64"
        className="absolute inset-x-0 bottom-0 mx-auto h-[80%] w-auto text-brand-orange-strong/30"
        fill="currentColor"
        aria-hidden
      >
        {/* Head */}
        <circle cx="32" cy="22" r="11" />
        {/* Shoulders (rounded top half-pill) */}
        <path d="M10 64 C10 46, 22 38, 32 38 C42 38, 54 46, 54 64 Z" />
      </svg>
      {/* Initials badge bottom-right — small, intentional */}
      <span className="absolute bottom-1.5 right-1.5 rounded-md bg-white/85 px-1.5 py-0.5 font-display text-[10px] font-bold tracking-wider text-brand-orange-strong shadow-sm">
        {initials(name)}
      </span>
    </div>
  );
}
