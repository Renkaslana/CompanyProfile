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
};

export default nextConfig;
