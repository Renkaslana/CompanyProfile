import { cn } from "@/lib/utils";

type StatusKind =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED"
  | "ACTIVE"
  | "MAINTENANCE"
  | "RETIRED"
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "CLOSED"
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED";

const STYLE: Record<StatusKind, string> = {
  DRAFT:       "bg-muted text-muted-foreground ring-border",
  PUBLISHED:   "bg-emerald-50 text-emerald-700 ring-emerald-200",
  ARCHIVED:    "bg-amber-50 text-amber-700 ring-amber-200",
  ACTIVE:      "bg-emerald-50 text-emerald-700 ring-emerald-200",
  MAINTENANCE: "bg-amber-50 text-amber-700 ring-amber-200",
  RETIRED:     "bg-muted text-muted-foreground ring-border",
  NEW:         "bg-brand-orange/10 text-brand-orange-strong ring-brand-orange/30",
  CONTACTED:   "bg-sky-50 text-sky-700 ring-sky-200",
  QUALIFIED:   "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CLOSED:      "bg-muted text-muted-foreground ring-border",
  OPEN:        "bg-brand-orange/10 text-brand-orange-strong ring-brand-orange/30",
  IN_PROGRESS: "bg-sky-50 text-sky-700 ring-sky-200",
  RESOLVED:    "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const klass = STYLE[status as StatusKind] ?? "bg-muted text-muted-foreground ring-border";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ring-1 ring-inset",
        klass,
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
