import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { SanitizedHtml } from "@/components/admin/sanitized-html";
import { getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan privasi PT. Bintang Mulia Investama.",
};

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Kebijakan Privasi"
        description={`Berlaku untuk seluruh layanan ${settings.legalName}.`}
        breadcrumb={[
          { label: "Beranda", href: "/" },
          { label: "Kebijakan Privasi" },
        ]}
      />
      <section className="bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SanitizedHtml
            html={settings.privacyPolicy ?? ""}
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
