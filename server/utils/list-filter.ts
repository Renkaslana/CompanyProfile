/**
 * Post-fetch filter+paginate helper for admin list services (Phase 4 M10.2/3).
 *
 * Each CMS service (`ServiceCmsService.list`, `NewsCmsService.list`, etc.)
 * accepts `{ q, skip, take }`. At the current row counts (< 200 / module),
 * filtering after fetch is fast enough and keeps the repository layer
 * unchanged. Once any module crosses ~200 rows, the same `q`/`skip`/`take`
 * surface can be pushed into Prisma `where` + `take` without changing the
 * call sites.
 *
 * Server-only.
 */
import "server-only";

export type ListOpts = {
  q?: string;
  skip?: number;
  take?: number;
};

/**
 * Apply a case-insensitive substring match across the caller-chosen fields,
 * then slice. Use as: `applyListOpts(rows, opts, (r) => [r.title, r.slug])`.
 */
export function applyListOpts<T>(
  rows: T[],
  opts: ListOpts,
  pickFields: (row: T) => Array<string | null | undefined>,
): T[] {
  let filtered = rows;
  const q = opts.q?.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter((r) =>
      pickFields(r)
        .filter((s): s is string => typeof s === "string" && s.length > 0)
        .some((s) => s.toLowerCase().includes(q)),
    );
  }
  if (opts.skip || opts.take) {
    const start = opts.skip ?? 0;
    const end = opts.take ? start + opts.take : undefined;
    filtered = filtered.slice(start, end);
  }
  return filtered;
}

/**
 * Count-only variant — applies the same `q` filter without paginating.
 * Used by the page to compute total before calling `applyListOpts` for the
 * current page slice.
 */
export function countListOpts<T>(
  rows: T[],
  opts: Pick<ListOpts, "q">,
  pickFields: (row: T) => Array<string | null | undefined>,
): number {
  const q = opts.q?.trim().toLowerCase();
  if (!q) return rows.length;
  return rows.filter((r) =>
    pickFields(r)
      .filter((s): s is string => typeof s === "string" && s.length > 0)
      .some((s) => s.toLowerCase().includes(q)),
  ).length;
}
