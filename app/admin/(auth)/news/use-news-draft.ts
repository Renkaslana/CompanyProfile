"use client";

/**
 * Autosave + draft-recovery untuk form Berita — berbasis localStorage
 * (per-perangkat), tanpa backend. Tujuannya "jangan kehilangan tulisan":
 * jika browser tertutup / crash sebelum disimpan, draft bisa dipulihkan.
 *
 * Catatan desain:
 *  • Server-side autosave sengaja TIDAK dipakai karena akan menimpa artikel
 *    yang sudah PUBLISHED secara diam-diam (konten publik render dari DB) dan
 *    butuh perubahan backend besar (revisi/status). Di luar scope.
 *  • Lint-clean: status "menyimpan" diturunkan saat render (bukan setState
 *    sinkron dalam effect); penulisan localStorage memakai setState async di
 *    dalam setTimeout.
 *  • Hydration-safe: pembacaan localStorage saat mount lewat
 *    `useSyncExternalStore` dengan server snapshot = null (tidak ada banner di
 *    SSR / paint pertama), lalu di-cache agar stabil meski autosave menimpa
 *    nilai key yang sama.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

export type NewsDraftSnapshot = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  displayAuthor: string;
};

export type AutosaveStatus = "idle" | "saving" | "saved";

const PREFIX = "bmi:news-draft:";
const keyFor = (id?: string) => `${PREFIX}${id ?? "new"}`;

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function serialize(s: NewsDraftSnapshot): string {
  return JSON.stringify([s.title, s.slug, s.excerpt, s.body, s.category, s.displayAuthor]);
}

/** Apakah snapshot dianggap "ada isinya" (layak disimpan / dipulihkan). */
function hasContent(s: NewsDraftSnapshot): boolean {
  return s.title.trim().length >= 2 || s.body.trim().length > 0 || s.excerpt.trim().length > 0;
}

export type UseNewsDraftResult = {
  status: AutosaveStatus;
  savedAt: number | null;
  /** Snapshot tersimpan saat mount yang BERBEDA dari initial (layak dipulihkan), atau null. */
  recoverable: NewsDraftSnapshot | null;
  /** Buang draft tersimpan + sembunyikan banner recovery. */
  clear: () => void;
  /** Sembunyikan banner recovery tanpa menghapus draft. */
  dismissRecovery: () => void;
};

export function useNewsDraft(
  id: string | undefined,
  snapshot: NewsDraftSnapshot,
  /** Snapshot awal dari server (untuk membandingkan apakah draft tersimpan berbeda). */
  initial: NewsDraftSnapshot,
): UseNewsDraftResult {
  const key = keyFor(id);

  // ── Pembacaan saat mount (di-cache, hydration-safe) ──────────────────
  const cacheRef = useRef<{ read: boolean; raw: string | null }>({ read: false, raw: null });
  const getSnapshot = () => {
    if (!cacheRef.current.read) {
      try {
        cacheRef.current = { read: true, raw: window.localStorage.getItem(key) };
      } catch {
        cacheRef.current = { read: true, raw: null };
      }
    }
    return cacheRef.current.raw;
  };
  const mountRaw = useSyncExternalStore(subscribe, getSnapshot, () => null);

  const [dismissed, setDismissed] = useState(false);
  const [lastSavedSerialized, setLastSavedSerialized] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const firstRun = useRef(true);

  // ── Autosave (debounced write) ───────────────────────────────────────
  const current = serialize(snapshot);
  useEffect(() => {
    // Lewati run pertama (mount) agar tidak menimpa sebelum user mengetik.
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (!hasContent(snapshot)) return;
    const t = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          key,
          JSON.stringify({ snapshot, _ts: Date.now() }),
        );
        setLastSavedSerialized(current);
        setSavedAt(Date.now());
      } catch {
        /* storage penuh / private mode — abaikan */
      }
    }, 1200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, key]);

  // Status diturunkan saat render (bukan setState dalam effect).
  const status: AutosaveStatus =
    lastSavedSerialized === null
      ? "idle"
      : lastSavedSerialized === current
        ? "saved"
        : "saving";

  // ── Recovery: parse snapshot mount-time, tawarkan bila beda dari initial ─
  let recoverable: NewsDraftSnapshot | null = null;
  if (!dismissed && mountRaw) {
    try {
      const parsed = JSON.parse(mountRaw) as { snapshot?: NewsDraftSnapshot };
      const snap = parsed?.snapshot;
      if (snap && hasContent(snap) && serialize(snap) !== serialize(initial)) {
        recoverable = snap;
      }
    } catch {
      recoverable = null;
    }
  }

  function clear() {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    cacheRef.current = { read: true, raw: null };
    setDismissed(true);
  }

  function dismissRecovery() {
    setDismissed(true);
  }

  return { status, savedAt, recoverable, clear, dismissRecovery };
}
