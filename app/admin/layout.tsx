import type { Metadata } from "next";

/**
 * Root admin layout.
 *
 * Defense in depth: middleware sets `X-Robots-Tag` and `Cache-Control`; this
 * layout exports `robots: noindex` so it's also baked into the document head.
 * The route is not in `app/sitemap.ts` and is never linked from the marketing
 * routes.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: { default: "Admin", template: "%s · BMI Admin" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-surface">{children}</div>;
}
