import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy untuk situs publik. App Router butuh inline
 * style/script (tanpa nonce), jadi 'unsafe-inline' diperlukan. Cloudinary untuk
 * gambar; Cloudflare Turnstile (challenges.cloudflare.com) untuk captcha form.
 * Di dev ditambah 'unsafe-eval' + ws: agar HMR/overlay Next tetap jalan.
 */
const csp = [
  "default-src 'self'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ""}`,
  "font-src 'self' data:",
  `connect-src 'self' https://challenges.cloudflare.com${isDev ? " ws: wss:" : ""}`,
  "frame-src https://challenges.cloudflare.com",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
].join("; ");

/** Header keamanan untuk seluruh route publik (admin punya header sendiri di proxy.ts). */
const PUBLIC_SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 85, 90],
    // Cloudinary-hosted MediaAsset rows (Phase 4 M4). Local seeded assets
    // remain in /public/images and need no remotePattern.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  /**
   * 301 redirects.
   *
   * /bantuan → /kontak — the placeholder "Bantuan" page was retired in the
   * support-cleanup band; help flows now live on /kontak (FAQ section +
   * contact form) plus the floating Support Widget. Preserve any inbound
   * links (business cards, prior promo material) by redirecting permanently.
   */
  async redirects() {
    return [
      {
        source: "/bantuan",
        destination: "/kontak",
        permanent: true,
      },
    ];
  },

  /**
   * Security headers untuk situs publik. Dikecualikan untuk /admin & /api/v1/admin
   * yang sudah punya header lebih ketat dari proxy.ts (middleware) — menghindari
   * header ganda/bentrok.
   */
  async headers() {
    return [
      {
        source: "/((?!admin|api/v1/admin).*)",
        headers: PUBLIC_SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
