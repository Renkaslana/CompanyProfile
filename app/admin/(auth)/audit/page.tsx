/**
 * Audit Log — /admin/audit
 *
 * M10.4: lightweight filter strip (action / entity / q) + server-side pagination.
 * Heavier work (CSV export, append-only privileges) stays in Phase 8.
 */
import Link from "next/link";
import { requirePermission } from "@/server/auth/guards";
import { AuditRepository } from "@/server/repositories/audit.repository";
import { UserRepository } from "@/server/repositories/user.repository";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  paginationFromSearchParam,
} from "@/components/admin/pagination";
import { AUDIT_ACTIONS } from "@/server/audit/actions";
import {
  ACTION_LABEL,
  ENTITY_LABEL,
  summarizeAuditMeta,
} from "@/lib/admin-i18n";

const PAGE_SIZE = 25;

/**
 * Stable allowlist of `entity` strings the services pass to writeAudit. Kept
 * in sync with the literal strings used across server/services/*.service.ts.
 */
const AUDIT_ENTITIES = [
  "User",
  "Auth",
  "Service",
  "NewsPost",
  "GalleryItem",
  "TeamMember",
  "ClientLogo",
  "Stat",
  "SiteSettings",
  "MediaAsset",
  "Lead",
] as const;

type SearchParams = Promise<{
  action?: string;
  entity?: string;
  q?: string;
  page?: string;
}>;

export default async function AuditPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePermission("audit:read");
  const { action, entity, q, page } = await searchParams;

  // Normalize / allowlist filter params so URL trash falls back to "all".
  const actionFilter =
    action && Object.values(AUDIT_ACTIONS).includes(action as never)
      ? action
      : undefined;
  const entityFilter =
    entity && (AUDIT_ENTITIES as readonly string[]).includes(entity)
      ? entity
      : undefined;
  const query = q?.trim() || undefined;

  const filter = { action: actionFilter, entity: entityFilter, q: query };

  const total = await AuditRepository.count(filter);
  const { page: currentPage, skip, take } = paginationFromSearchParam(
    page,
    total,
    PAGE_SIZE,
  );
  const entries = await AuditRepository.list({
    ...filter,
    limit: take,
    offset: skip,
  });

  // Batched actor lookup.
  const actorIds = [
    ...new Set(entries.map((e) => e.actorId).filter((id) => !!id && id !== "anonymous")),
  ];
  const actors = await UserRepository.findManyByIdSafe(actorIds);
  const actorMap = new Map(actors.map((a) => [a.id, a]));

  function buildHref(nextPage: number): string {
    const params = new URLSearchParams();
    if (actionFilter) params.set("action", actionFilter);
    if (entityFilter) params.set("entity", entityFilter);
    if (query) params.set("q", query);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/audit?${qs}` : "/admin/audit";
  }

  const filtersActive = Boolean(actionFilter || entityFilter || query);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Riwayat Aktivitas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Menampilkan <strong>{entries.length}</strong> dari total{" "}
            <strong>{total}</strong> entri
            {filtersActive ? " (sesuai filter)" : ""}. Read-only — Phase 8 akan
            menambahkan append-only privileges di DB + ekspor CSV.
          </p>
        </div>
      </header>

      {/* Filter strip — submits a fresh GET so URL is always shareable. */}
      <form
        method="GET"
        action="/admin/audit"
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
      >
        <div className="grid gap-1.5">
          <label
            htmlFor="audit-action"
            className="text-xs font-medium text-muted-foreground"
          >
            Aksi
          </label>
          <select
            id="audit-action"
            name="action"
            defaultValue={actionFilter ?? ""}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">Semua aksi</option>
            {Object.values(AUDIT_ACTIONS).map((a) => (
              <option key={a} value={a} title={a}>
                {ACTION_LABEL[a] ?? a}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <label
            htmlFor="audit-entity"
            className="text-xs font-medium text-muted-foreground"
          >
            Entity
          </label>
          <select
            id="audit-entity"
            name="entity"
            defaultValue={entityFilter ?? ""}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">Semua entity</option>
            {AUDIT_ENTITIES.map((e) => (
              <option key={e} value={e} title={e}>
                {ENTITY_LABEL[e] ?? e}
              </option>
            ))}
          </select>
        </div>

        <div className="grid flex-1 gap-1.5 sm:max-w-xs">
          <label
            htmlFor="audit-q"
            className="text-xs font-medium text-muted-foreground"
          >
            Cari (entity / entityId)
          </label>
          <Input
            id="audit-q"
            name="q"
            type="search"
            defaultValue={query ?? ""}
            placeholder="cuid, slug, atau nama entity…"
            autoComplete="off"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" variant="outline" size="sm">
            Terapkan
          </Button>
          {filtersActive && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              render={<Link href="/admin/audit" />}
            >
              Reset
            </Button>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 w-44">Waktu</th>
              <th className="px-4 py-3">Pengguna</th>
              <th className="px-4 py-3 w-56">Aktivitas</th>
              <th className="px-4 py-3 w-40">Objek</th>
              <th className="px-4 py-3">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((e) => {
              const actor = actorMap.get(e.actorId);
              const actionLabel = ACTION_LABEL[e.action] ?? e.action;
              const entityLabel = ENTITY_LABEL[e.entity] ?? e.entity;
              const metaSummary = summarizeAuditMeta(e.meta);
              const metaJson = e.meta ? JSON.stringify(e.meta) : "—";
              return (
                <tr key={e.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {e.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                  </td>
                  <td className="px-4 py-2.5">
                    {actor ? (
                      <div className="leading-tight" title={`User id: ${e.actorId}`}>
                        <p className="font-medium text-ink-900">{actor.name}</p>
                        <p className="text-xs text-muted-foreground">{actor.email}</p>
                      </div>
                    ) : e.actorId === "anonymous" ? (
                      <span className="font-mono text-xs italic text-muted-foreground">
                        anonim
                      </span>
                    ) : (
                      <span
                        className="font-mono text-xs text-muted-foreground"
                        title="Pengguna sudah tidak ada di database"
                      >
                        {e.actorId.slice(0, 12)}…
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="inline-flex rounded-full bg-brand-orange/10 px-2 py-0.5 text-xs font-medium text-brand-orange-strong"
                      title={e.action}
                    >
                      {actionLabel}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="leading-tight">
                      <p className="text-xs font-medium text-ink-900" title={e.entity}>
                        {entityLabel}
                      </p>
                      {e.entityId && (
                        <p
                          className="font-mono text-[10px] text-muted-foreground"
                          title={e.entityId}
                        >
                          {e.entityId.length > 16
                            ? `${e.entityId.slice(0, 16)}…`
                            : e.entityId}
                        </p>
                      )}
                    </div>
                  </td>
                  <td
                    className="px-4 py-2.5 max-w-md truncate text-xs text-muted-foreground"
                    title={metaJson}
                  >
                    {metaSummary}
                  </td>
                </tr>
              );
            })}
            {entries.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  {filtersActive
                    ? "Tidak ada entri audit yang cocok dengan filter."
                    : "Belum ada entri audit."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={currentPage}
        pageSize={PAGE_SIZE}
        total={total}
        buildHref={buildHref}
      />
    </div>
  );
}
