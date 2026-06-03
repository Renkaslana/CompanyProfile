import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { SanitizedHtml } from "@/components/admin/sanitized-html";
import { getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description: "Syarat dan ketentuan penggunaan situs PT. Bintang Mulia Investama.",
};

export default async function TermsPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Syarat & Ketentuan"
        description={`Berlaku untuk seluruh pengguna situs ${settings.legalName}.`}
        breadcrumb={[
          { label: "Beranda", href: "/" },
          { label: "Syarat & Ketentuan" },
        ]}
      />
      <section className="bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SanitizedHtml
            html={settings.termsAndConditions ?? ""}
            className="legal-body"
          />
          <p className="mt-10 text-xs text-muted-foreground">
            Terakhir diperbarui: dikelola via Admin Settings.
          </p>
        </div>
      </section>
    </>
  );
}
