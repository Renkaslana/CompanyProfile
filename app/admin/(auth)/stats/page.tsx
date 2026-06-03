/**
 * Stats CMS — /admin/stats
 *
 * Fixed-size 4-row editor; one inline form per row.
 */
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2 } from "lucide-react";
import { FormBanner } from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requirePermission } from "@/server/auth/guards";
import { StatsCmsService } from "@/server/services/stats-cms.service";
import { reorderStatAction, updateStatAction } from "./actions";

type SearchParams = Promise<{
  updated?: string;
  error?: string;
  key?: string;
}>;

const UPDATED_MAP: Record<string, string> = {
  edited: "Statistik berhasil diperbarui.",
  reordered: "Urutan statistik diperbarui.",
};

const ERROR_MAP: Record<string, string> = {
  validation: "Form tidak valid. Periksa kembali isiannya.",
  not_found: "Statistik tidak ditemukan.",
  missing: "Data form tidak lengkap.",
  unknown: "Terjadi kesalahan. Coba lagi.",
};

export default async function StatsAdminPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requirePermission("content:read");
  const stats = await StatsCmsService.list();
  const { updated, error, key: highlightKey } = await searchParams;
  const canWrite = session.permissions.includes("content:write");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink-900">Statistik</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atur counter homepage. <code>Key</code> bersifat tetap (kontrak render publik).
          Atur <code>label</code>, <code>value</code>, <code>suffix</code>, dan urutan.
          <code>Source DERIVED</code> mengunci nilai (untuk integrasi sistem operasional di masa
          mendatang; belum aktif sekarang).
        </p>
      </header>

      {updated && (
        <FormBanner
          variant="success"
          message={
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              {UPDATED_MAP[updated] ?? "Berhasil."}
            </span>
          }
        />
      )}
      {error && (
        <FormBanner
          variant="error"
          message={
            <span className="inline-flex items-center gap-2">
              <AlertTriangle className="size-4" />
              {ERROR_MAP[error] ?? ERROR_MAP.unknown}
            </span>
          }
        />
      )}

      <div className="space-y-3">
        {stats.map((s, i) => {
          const isFirst = i === 0;
          const isLast = i === stats.length - 1;
          const isDerived = s.source === "DERIVED";
          const highlight = highlightKey === s.key;
          return (
            <div
              key={s.key}
              className={`rounded-2xl border bg-card p-5 shadow-sm transition ${
                highlight ? "border-brand-orange ring-1 ring-brand-orange/30" : "border-border"
              }`}
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  {s.key}
                </span>
                <span className="text-xs text-muted-foreground">order: {s.order}</span>
                {canWrite && (
                  <div className="ml-auto flex gap-1.5">
                    <form action={reorderStatAction}>
                      <input type="hidden" name="key" value={s.key} />
                      <input type="hidden" name="direction" value="up" />
                      <Button type="submit" size="icon-sm" variant="outline" disabled={isFirst} aria-label="Pindah ke atas">
                        <ArrowUp className="size-3.5" />
                      </Button>
                    </form>
                    <form action={reorderStatAction}>
                      <input type="hidden" name="key" value={s.key} />
                      <input type="hidden" name="direction" value="down" />
                      <Button type="submit" size="icon-sm" variant="outline" disabled={isLast} aria-label="Pindah ke bawah">
                        <ArrowDown className="size-3.5" />
                      </Button>
                    </form>
                  </div>
                )}
              </div>

              <form action={updateStatAction} className="grid gap-3 sm:grid-cols-[1fr_120px_100px_140px_auto] sm:items-end">
                <input type="hidden" name="key" value={s.key} />

                <div className="grid gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Label</label>
                  <Input name="label" defaultValue={s.label} maxLength={60} required disabled={!canWrite || isDerived} />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Value</label>
                  <Input name="value" type="number" min={0} max={9999999} defaultValue={s.value} required disabled={!canWrite || isDerived} />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Suffix</label>
                  <Input name="suffix" defaultValue={s.suffix ?? ""} maxLength={8} disabled={!canWrite || isDerived} />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Source</label>
                  <select
                    name="source"
                    defaultValue={s.source}
                    disabled={!canWrite}
                    className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  >
                    <option value="MANUAL">MANUAL</option>
                    <option value="DERIVED">DERIVED (kunci)</option>
                  </select>
                </div>
                <Button
                  type="submit"
                  disabled={!canWrite}
                  className="bg-brand-orange text-white hover:bg-brand-orange-strong"
                >
                  Simpan
                </Button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
