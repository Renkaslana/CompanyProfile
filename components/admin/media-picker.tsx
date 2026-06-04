"use client";

/**
 * Media picker primitive — grid of MediaAsset rows in a dialog, with a
 * single-select "Pilih" callback.
 *
 * Phase 4 M1 ships the foundation:
 *   • Renders a list passed in as prop (caller fetches via MediaService.list)
 *   • Search-by-tag input (client-side filter)
 *   • Selection + emits the chosen id via the form's hidden input
 *
 * Phase 4 M4 (Media Library UI) will extend this with:
 *   • Cloudinary direct upload
 *   • Server-side pagination / search
 *   • Tag editing in-place
 */
import { useId, useMemo, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type MediaPickerAsset = {
  id: string;
  url: string;
  alt: string | null;
  title: string | null;
  folder: string | null;
  tags: string[];
};

type Props = {
  /** Hidden input name (the picker writes the chosen MediaAsset.id here). */
  name: string;
  /** Pre-existing selection on form load. */
  defaultValue?: string;
  /** Media to choose from (caller decides scope, e.g. by folder). */
  assets: MediaPickerAsset[];
  /** Optional label for the trigger button. */
  triggerLabel?: string;
  /**
   * Optional change callback. Lets parents that don't post the picker's hidden
   * input (e.g. Settings, which serializes a parent JSON state into a single
   * companyJson hidden input) observe the selection. Called with the new id
   * or `undefined` when the user clears the selection.
   */
  onSelect?: (id: string | undefined) => void;
};

export function MediaPicker({
  name,
  defaultValue,
  assets,
  triggerLabel = "Pilih dari Media Library",
  onSelect,
}: Props) {
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | undefined>(defaultValue);
  const [q, setQ] = useState("");

  function commitSelected(next: string | undefined) {
    setSelected(next);
    onSelect?.(next);
  }

  const filtered = useMemo(() => {
    if (!q.trim()) return assets;
    const lc = q.trim().toLowerCase();
    return assets.filter((a) =>
      [a.alt, a.title, a.folder, ...(a.tags ?? [])]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(lc)),
    );
  }, [assets, q]);

  const chosen = selected
    ? assets.find((a) => a.id === selected)
    : undefined;

  return (
    <div className="grid gap-2">
      <input id={inputId} type="hidden" name={name} value={selected ?? ""} />

      {chosen ? (
        <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-3">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
            <Image
              src={chosen.url}
              alt={chosen.alt ?? ""}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div className="flex-1 text-sm">
            <p className="font-medium text-ink-900">{chosen.title ?? "(tanpa judul)"}</p>
            <p className="truncate text-xs text-muted-foreground">{chosen.url}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => commitSelected(undefined)}
            aria-label="Hapus pilihan"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Belum ada media dipilih.</p>
      )}

      <BaseDialog.Root open={open} onOpenChange={setOpen}>
        <BaseDialog.Trigger
          render={
            <Button type="button" variant="outline" size="sm" className="w-fit">
              {triggerLabel}
            </Button>
          }
        />
        <BaseDialog.Portal>
          <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-ink-950/40 backdrop-blur-sm" />
          <BaseDialog.Popup className="fixed left-1/2 top-1/2 z-50 flex h-[calc(100%-4rem)] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-card shadow-2xl ring-1 ring-border">
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
              <BaseDialog.Title className="font-display text-lg font-semibold text-ink-900">
                Media Library
              </BaseDialog.Title>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari nama / alt / tag…"
                  className="pl-8 w-64"
                />
              </div>
            </header>

            <div className="flex-1 overflow-auto p-6">
              {filtered.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Tidak ada media yang cocok.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {filtered.map((a) => {
                    const isSel = selected === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => commitSelected(a.id)}
                        className={cn(
                          "group relative overflow-hidden rounded-lg border bg-muted text-left transition-colors",
                          isSel
                            ? "border-brand-orange ring-2 ring-brand-orange"
                            : "border-border hover:border-brand-orange/40",
                        )}
                      >
                        <div className="relative aspect-4/3">
                          <Image
                            src={a.url}
                            alt={a.alt ?? ""}
                            fill
                            sizes="(max-width: 640px) 50vw, 25vw"
                            className="object-cover"
                          />
                        </div>
                        <div className="p-2">
                          <p className="truncate text-xs font-medium text-ink-900">
                            {a.title ?? "(tanpa judul)"}
                          </p>
                          {a.folder && (
                            <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
                              {a.folder}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <footer className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button
                type="button"
                onClick={() => setOpen(false)}
                disabled={!selected}
                className="bg-brand-orange text-white hover:bg-brand-orange-strong"
              >
                Pilih
              </Button>
            </footer>
          </BaseDialog.Popup>
        </BaseDialog.Portal>
      </BaseDialog.Root>
    </div>
  );
}
