/**
 * Admin list pagination (Phase 4 M10.3).
 *
 * Pure-`<Link>` server component. Renders "Sebelumnya · Halaman X dari Y ·
 * Berikutnya" plus a total-rows label. Caller supplies `buildHref` so the
 * URL keeps its other search params (e.g. `?q=…&status=DRAFT`).
 *
 * Hides itself entirely when `total <= pageSize` (nothing to paginate).
 */
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  /** 1-indexed current page. */
  page: number;
  pageSize: number;
  total: number;
  /** Caller-supplied URL builder so other search params are preserved. */
  buildHref: (page: number) => string;
  /** Optional className on the outer container. */
  className?: string;
};

export function Pagination({ page, pageSize, total, buildHref, className }: Props) {
  if (total <= pageSize) return null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const hasPrev = safePage > 1;
  const hasNext = safePage < totalPages;

  const baseLink =
    "inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium transition-colors";
  const enabled = "text-ink-900 hover:bg-muted";
  const disabled = "text-muted-foreground/50 pointer-events-none";

  return (
    <nav
      aria-label="Paginasi"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/60 px-4 py-2.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <p>
        Total <strong className="text-ink-900">{total}</strong> entri · Halaman{" "}
        <strong className="text-ink-900">{safePage}</strong> dari{" "}
        <strong className="text-ink-900">{totalPages}</strong>
      </p>
      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Link href={buildHref(safePage - 1)} className={cn(baseLink, enabled)}>
            <ChevronLeft className="size-3.5" />
            Sebelumnya
          </Link>
        ) : (
          <span className={cn(baseLink, disabled)} aria-disabled="true">
            <ChevronLeft className="size-3.5" />
            Sebelumnya
          </span>
        )}
        {hasNext ? (
          <Link href={buildHref(safePage + 1)} className={cn(baseLink, enabled)}>
            Berikutnya
            <ChevronRight className="size-3.5" />
          </Link>
        ) : (
          <span className={cn(baseLink, disabled)} aria-disabled="true">
            Berikutnya
            <ChevronRight className="size-3.5" />
          </span>
        )}
      </div>
    </nav>
  );
}

/**
 * Helper for list pages: clamp the requested `page` from a search param into
 * [1, totalPages] and compute `skip`. Use in conjunction with service `.list({
 * skip, take })` + `.count()`.
 */
export function paginationFromSearchParam(
  raw: string | undefined,
  total: number,
  pageSize: number,
): { page: number; skip: number; take: number } {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const parsed = Number.parseInt(raw ?? "", 10);
  const page = Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, totalPages) : 1;
  return { page, skip: (page - 1) * pageSize, take: pageSize };
}
