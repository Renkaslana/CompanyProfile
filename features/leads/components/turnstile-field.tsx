"use client";

/**
 * Widget Cloudflare Turnstile untuk form lead. Render HANYA bila
 * `NEXT_PUBLIC_TURNSTILE_SITE_KEY` di-set — jadi di lokal/dev tanpa key,
 * komponen ini tidak menampilkan apa pun (form tetap jalan). Saat solve,
 * widget menyuntik `<input name="cf-turnstile-response">` ke form induk,
 * yang lalu diverifikasi server di `submitLeadAction`.
 */
import Script from "next/script";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function TurnstileField() {
  if (!SITE_KEY) return null;
  return (
    <div>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
        strategy="afterInteractive"
      />
      <div className="cf-turnstile" data-sitekey={SITE_KEY} data-theme="light" />
    </div>
  );
}
