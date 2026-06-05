import type { NextConfig } from "next";

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
};

export default nextConfig;
