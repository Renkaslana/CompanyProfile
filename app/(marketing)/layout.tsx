import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CookiesBanner } from "@/components/layout/cookies-banner";
import { Toaster } from "@/components/ui/sonner";
import { getSiteSettings } from "@/lib/data";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  return (
    <>
      <Navbar
        support={{
          faq: settings.faq ?? [],
          whatsapp: settings.whatsapp,
          phone: settings.phone,
          email: settings.email,
        }}
      />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookiesBanner />
      <Toaster position="top-center" richColors />
    </>
  );
}
