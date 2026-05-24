import type { Metadata } from "next";
import { inter, spaceGrotesk } from "@/lib/fonts";
import { COMPANY } from "@/lib/constants";
import "./globals.css";

const siteUrl = "https://bintangmuliainvestama.co.id";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${COMPANY.legalName} — Logistik, Transportasi, Rental & Trading`,
    template: `%s · ${COMPANY.shortName}`,
  },
  description: COMPANY.tagline,
  keywords: [
    "logistik Indonesia",
    "jasa transportasi",
    "rental mobil",
    "general trading",
    "ekspedisi",
    COMPANY.legalName,
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: COMPANY.legalName,
    title: `${COMPANY.legalName} — Mitra Logistik Terpercaya`,
    description: COMPANY.tagline,
    images: [{ url: "/brand/hero.png", width: 1700, height: 944, alt: COMPANY.legalName }],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
              name: COMPANY.legalName,
              alternateName: COMPANY.shortName,
              url: siteUrl,
              logo: `${siteUrl}/brand/logo.png`,
              description: COMPANY.tagline,
              foundingDate: String(COMPANY.foundedYear),
              email: COMPANY.email,
              telephone: COMPANY.phone,
              address: {
                "@type": "PostalAddress",
                streetAddress: COMPANY.address,
                addressLocality: COMPANY.city,
                addressRegion: COMPANY.province,
                postalCode: COMPANY.postalCode,
                addressCountry: "ID",
              },
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
