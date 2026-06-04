"use client";

/**
 * Universal admin list toolbar (Phase 4 M10.2).
 *
 * Mounts above any admin list page. Provides:
 *   • Debounced search input that round-trips through URL ?q=…
 *     (so deep-links are shareable + the server page reads `q` from
 *      searchParams and threads it to the service `.list({ q })`)
 *   • Reset chip when `q` is non-empty
 *   • `children` slot for module-specific filter chips (e.g. News status)
 *
 * Pagination's `?page=…` is reset to 1 on every search change so the
 * user doesn't get stranded on an empty page after narrowing.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  /** Placeholder shown in the search input. */
  placeholder?: string;
  /** Inline children rendered to the right of the search box (status chips, etc.). */
  children?: React.ReactNode;
  /** Optional className on the outer wrapper. */
  className?: string;
};

export function ListToolbar({
  placeholder = "Cari…",
  children,
  className,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const initial = search.get("q") ?? "";
  const [q, setQ] = useState(initial);
  // Track the last URL `q` we synced from. When the URL changes externally
  // (e.g. user clicks Reset or a filter chip that rewrites params), this
  // diverges from `initial` and we resync during render — the React-endorsed
  // pattern for "derive local state from a prop change" without `setState` in
  // an effect.
  const [lastSyncedInitial, setLastSyncedInitial] = useState(initial);
  if (initial !== lastSyncedInitial) {
    setLastSyncedInitial(initial);
    setQ(initial);
  }

  // Debounced URL push. Skip when `q` is already in sync with the URL — this
  // handles the initial mount and the external-resync case (both of which set
  // `q === initial`).
  useEffect(() => {
    if (q === initial) return;
    const t = setTimeout(() => {
      const params = new URLSearchParams(search.toString());
      if (q.trim()) {
        params.set("q", q.trim());
      } else {
        params.delete("q");
      }
      // Reset pagination — page 5 of an old result set is meaningless once
      // the query changes.
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }, 300);
    return () => clearTimeout(t);
  }, [q, initial, pathname, router, search]);

  function resetHref(): string {
    const params = new URLSearchParams(search.toString());
    params.delete("q");
    params.delete("page");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm",
        className,
      )}
    >
      <div className="grid flex-1 gap-1.5 sm:max-w-md">
        <label
          htmlFor="list-toolbar-q"
          className="text-xs font-medium text-muted-foreground"
        >
          Cari
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="list-toolbar-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            className="pl-8"
            type="search"
            autoComplete="off"
          />
        </div>
      </div>

      {children && (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      )}

      {initial && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          render={
            <Link href={resetHref()} aria-label="Reset pencarian">
              <X className="size-3.5" />
              Reset
            </Link>
          }
        />
      )}
    </div>
  );
}
