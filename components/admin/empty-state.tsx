/**
 * Empty-state primitive for admin list pages.
 *
 * Centralizes the "Belum ada …" copy + first-action guidance so non-technical
 * editors get a consistent, inviting message rather than a single grey line.
 *
 * Two modes:
 *   • mode="empty"  — no rows exist at all. Show illustration + headline +
 *                     description + primary action (e.g. "Tambah … pertama").
 *   • mode="no-match" — rows exist but the current filter/search returned 0.
 *                     Show a thin "no match" message + reset link.
 */
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type Props = {
  mode?: "empty" | "no-match";
  /** Headline shown above the description. */
  title: string;
  /** One-sentence description (what is this section for, why is it empty). */
  description?: string;
  /** Lucide icon shown in the brand-tinted square. */
  icon: LucideIcon;
  /** Primary action — usually "Tambah … pertama". */
  action?: {
    label: string;
    href: string;
  };
  /** Optional secondary reset link (mostly used by mode="no-match"). */
  reset?: {
    label: string;
    href: string;
  };
};

export function EmptyState({
  mode = "empty",
  title,
  description,
  icon: Icon,
  action,
  reset,
}: Props) {
  if (mode === "no-match") {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center">
        <p className="text-sm font-medium text-ink-900">{title}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
        {reset && (
          <Link
            href={reset.href}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-orange-strong hover:underline"
          >
            {reset.label} →
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <div className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange-strong">
        <Icon className="size-7" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">
        {title}
      </h3>
      {description && (
        <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-brand-orange px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-orange-strong"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
