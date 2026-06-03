import type { Metadata } from "next";
import { inter, spaceGrotesk } from "@/lib/fonts";
import { COMPANY } from "@/lib/constants";
import { getSiteSettings } from "@/lib/data";
import "./globals.css";

const siteUrl = "https://bintangmuliainvestama.co.id";

/**
 * Site-wide metadata + Open Graph + keywords. Reads from the admin-managed
 * SiteSettings (with constant fallbacks for the boot-time path). Phase 4 M9.5.
 */
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${s.legalName} — Logistik, Transportasi, Rental & Trading`,
      template: `%s · ${s.shortName}`,
    },
    description: s.tagline,
    keywords: [
      "logistik Indonesia",
      "jasa transportasi",
      "rental mobil",
      "general trading",
      "ekspedisi",
      s.legalName,
    ],
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: s.legalName,
      title: `${s.legalName} — Mitra Logistik Terpercaya`,
      description: s.tagline,
      images: [
        { url: "/brand/hero.png", width: 1700, height: 944, alt: s.legalName },
      ],
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const s = await getSiteSettings();
  const sameAs = [
    s.socials.instagram,
    s.socials.linkedin,
    s.socials.facebook,
    s.socials.youtube,
    s.socials.tiktok,
  ].filter((u): u is string => Boolean(u && u.trim() !== ""));

  return (
    <html
      lang="id"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: s.legalName,
              alternateName: s.shortName,
              url: siteUrl,
              logo: `${siteUrl}/brand/logo.png`,
              description: s.tagline,
              foundingDate: String(s.foundedYear),
              email: s.email,
              telephone: s.phone,
              address: {
                "@type": "PostalAddress",
                streetAddress: s.address,
                addressLocality: s.city,
                addressRegion: s.province,
                postalCode: s.postalCode,
                addressCountry: "ID",
              },
              ...(sameAs.length > 0 ? { sameAs } : {}),
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}

// Boot-time reference so the COMPANY symbol survives consumer migrations and
// the env-validation chain doesn't tree-shake the constants away.
void COMPANY;
