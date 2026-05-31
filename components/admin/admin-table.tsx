/**
 * Reusable admin table. Server-component friendly (renders a plain table);
 * sortable / paginated UX can be layered above by the page using URL params.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AdminTableColumn<T> = {
  header: ReactNode;
  /** Optional fixed width via Tailwind class (e.g. "w-32"). */
  width?: string;
  /** Right-align numeric columns. */
  align?: "left" | "right" | "center";
  cell: (row: T, index: number) => ReactNode;
};

export type AdminTableProps<T> = {
  columns: AdminTableColumn<T>[];
  rows: T[];
  /** Stable React key per row. */
  rowKey: (row: T) => string;
  /** Rendered when `rows` is empty. */
  empty?: ReactNode;
  /** Wrap each row in a link / clickable container. */
  rowHref?: (row: T) => string | undefined;
  className?: string;
};

export function AdminTable<T>({
  columns,
  rows,
  rowKey,
  empty,
  className,
}: AdminTableProps<T>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            {columns.map((c, i) => (
              <th
                key={i}
                className={cn(
                  "px-4 py-3 font-semibold",
                  c.width,
                  c.align === "right" && "text-right",
                  c.align === "center" && "text-center",
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm text-muted-foreground"
              >
                {empty ?? "Tidak ada data."}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={rowKey(row)} className="hover:bg-muted/20">
                {columns.map((c, ci) => (
                  <td
                    key={ci}
                    className={cn(
                      "px-4 py-3 align-middle",
                      c.align === "right" && "text-right",
                      c.align === "center" && "text-center",
                    )}
                  >
                    {c.cell(row, i)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
