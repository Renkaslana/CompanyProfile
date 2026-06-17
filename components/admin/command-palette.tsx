"use client";

/**
 * Command Palette (Ctrl/⌘+K) — enhancement UX modern (roadmap #6).
 *
 * Lompat cepat ke modul mana pun atau jalankan aksi pembuatan tanpa menyentuh
 * mouse. Dibuka via Ctrl/⌘+K (global) atau tombol "Cari" di header. Daftar item
 * sudah difilter izin di server (layout) lalu dikirim sebagai data serializable
 * (href/label/iconKey/group) — komponen ini hanya menavigasi, tidak membaca DB.
 *
 * Keyboard: ketik untuk memfilter · ↑/↓ pindah · Enter buka · Esc tutup
 * (Esc + focus-trap ditangani Base UI Dialog).
 */
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import {
  BarChart3,
  Boxes,
  Building2,
  CornerDownLeft,
  ImagePlus,
  Images,
  ImageIcon,
  Inbox,
  LayoutDashboard,
  Newspaper,
  Package,
  PencilLine,
  ScrollText,
  Search,
  Settings2,
  Users,
  Users2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  services: Package,
  news: Newspaper,
  gallery: Images,
  team: Users2,
  clients: Building2,
  stats: BarChart3,
  leads: Inbox,
  settings: Settings2,
  media: ImageIcon,
  users: Users,
  audit: ScrollText,
  "news-new": PencilLine,
  "service-new": Boxes,
  "gallery-new": ImagePlus,
};

export type CommandItem = {
  href: string;
  label: string;
  iconKey: string;
  group: string;
};

export function CommandPalette({ items }: { items: CommandItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl/⌘+K toggle. Reset di sini (event handler), bukan di effect.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery("");
        setActive(0);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [query, items]);

  // Reset state saat dialog dibuka (trigger/Esc/backdrop lewat Base UI).
  function handleOpenChange(next: boolean) {
    if (next) {
      setQuery("");
      setActive(0);
    }
    setOpen(next);
  }

  // Jaga item aktif tetap terlihat.
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-cmd-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const select = useCallback(
    (item: CommandItem) => {
      setOpen(false);
      router.push(item.href);
    },
    [router],
  );

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = filtered[active];
      if (it) select(it);
    }
  }

  return (
    <BaseDialog.Root open={open} onOpenChange={handleOpenChange}>
      <BaseDialog.Trigger
        aria-label="Cari atau lompat ke modul (Ctrl K)"
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Cari atau lompat…</span>
        <kbd className="ml-1 hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline">
          Ctrl K
        </kbd>
      </BaseDialog.Trigger>

      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-ink-950/40 backdrop-blur-sm data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <BaseDialog.Popup
          initialFocus={inputRef}
          className="fixed left-1/2 top-[14%] z-50 flex w-[min(92vw,640px)] -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl outline-none data-ending-style:opacity-0 data-starting-style:opacity-0"
        >
          <BaseDialog.Title className="sr-only">Palet perintah</BaseDialog.Title>
          <div className="flex items-center gap-2.5 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onInputKeyDown}
              placeholder="Cari modul atau aksi…"
              aria-label="Cari modul atau aksi"
              className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                Tidak ada hasil untuk “{query}”.
              </p>
            ) : (
              filtered.map((item, idx) => {
                const Icon = ICONS[item.iconKey];
                const prev = filtered[idx - 1];
                const showHeader = !prev || prev.group !== item.group;
                const isActive = idx === active;
                return (
                  <div key={item.href}>
                    {showHeader && (
                      <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {item.group}
                      </p>
                    )}
                    <button
                      type="button"
                      data-cmd-index={idx}
                      onClick={() => select(item)}
                      onMouseMove={() => setActive(idx)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                        isActive
                          ? "bg-brand-orange/12 text-ink-900"
                          : "text-foreground/80",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex size-7 shrink-0 items-center justify-center rounded-md",
                          isActive
                            ? "bg-brand-orange/20 text-brand-orange-strong"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {Icon ? <Icon className="size-4" /> : null}
                      </span>
                      <span className="flex-1 font-medium">{item.label}</span>
                      {isActive && (
                        <CornerDownLeft className="size-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center gap-3 border-t border-border bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-background px-1 font-mono">↑</kbd>
              <kbd className="rounded border border-border bg-background px-1 font-mono">↓</kbd>
              navigasi
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-background px-1 font-mono">↵</kbd>
              buka
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-background px-1 font-mono">Esc</kbd>
              tutup
            </span>
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
