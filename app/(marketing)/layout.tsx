import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
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
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton whatsapp={settings.whatsapp} />
      <CookiesBanner />
      <Toaster position="top-center" richColors />
    </>
  );
}
