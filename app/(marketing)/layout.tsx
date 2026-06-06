import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SupportWidget } from "@/components/layout/support-widget";
import { CookiesBanner } from "@/components/layout/cookies-banner";
import { Toaster } from "@/components/ui/sonner";
import { getSiteSettings } from "@/lib/data";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const supportHours = settings.supportHours ?? settings.operationalHours;
  return (
    <>
      <Navbar
        support={{
          faq: settings.faq ?? [],
          whatsapp: settings.whatsapp,
          phone: settings.phone,
          email: settings.email,
          supportHours,
        }}
      />
      <main className="flex-1">{children}</main>
      <Footer />
      <SupportWidget
        whatsapp={settings.whatsapp}
        phone={settings.phone}
        email={settings.email}
        supportHours={supportHours}
      />
      <CookiesBanner />
      <Toaster position="top-center" richColors />
    </>
  );
}
