"use client";

/**
 * Dismissable cookies banner (Phase 4 M10).
 *
 * UX shell only — no real consent storage; Phase 8 will harden if GDPR
 * compliance is needed for the BMI audience.
 *
 * Persists dismissal via `localStorage["bmi.cookies"] = "ok"`.
 */
import Link from "next/link";
import { useSyncExternalStore, useState } from "react";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "bmi.cookies";

// SSR-safe subscribe so we don't setState inside useEffect (React 19 rule).
const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};
const getSnapshot = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "ok"; // pretend dismissed if storage blocked
  }
};
const getServerSnapshot = () => "ok"; // SSR: don't render banner

export function CookiesBanner() {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissedThisRender, setDismissedThisRender] = useState(false);
  const open = stored !== "ok" && !dismissedThisRender;

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "ok");
    } catch {
      /* swallow — private browsing etc. */
    }
    setDismissedThisRender(true);
  }

  if (!open) return null;

  return (
    <div
      role="region"
      aria-label="Pemberitahuan cookies"
      className="fixed inset-x-3 bottom-3 z-30 mx-auto max-w-3xl rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-md sm:bottom-4 sm:inset-x-4"
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange-strong">
          <Cookie className="size-5" />
        </span>
        <div className="flex-1 text-sm text-foreground/85">
          <p>
            Situs ini menggunakan cookies untuk meningkatkan pengalaman Anda.
            Dengan terus menjelajah, Anda setuju dengan{" "}
            <Link
              href="/privasi"
              className="font-medium text-brand-orange-strong underline-offset-2 hover:underline"
            >
              Kebijakan Privasi
            </Link>{" "}
            dan{" "}
            <Link
              href="/syarat-ketentuan"
              className="font-medium text-brand-orange-strong underline-offset-2 hover:underline"
            >
              Syarat &amp; Ketentuan
            </Link>{" "}
            kami.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Tutup pemberitahuan cookies"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex h-9 items-center justify-center rounded-md bg-brand-orange px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-orange-strong"
        >
          Saya mengerti
        </button>
      </div>
    </div>
  );
}
