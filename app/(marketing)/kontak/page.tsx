import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { LeadForm } from "@/features/leads/components/lead-form";
import { Reveal } from "@/components/motion/reveal";
import { getSiteSettings } from "@/lib/data";
import { COMPANY } from "@/lib/constants";

// Phase 4 M9: marketing pages stay fresh so admin Settings edits surface
// immediately on next visit.
export const dynamic = "force-dynamic";

// Static metadata is generated at build time so it still falls back to the
// constants (admin can update title/description per-route in a later phase
// via `generateMetadata`).
export const metadata: Metadata = {
  title: "Kontak",
  description: `Hubungi ${COMPANY.legalName} untuk permintaan penawaran layanan logistik, transportasi, rental, dan perdagangan umum.`,
};

export default async function KontakPage() {
  const settings = await getSiteSettings();

  const mapsQuery = encodeURIComponent(
    `${settings.address}, ${settings.city}, ${settings.province} ${settings.postalCode}`,
  );
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const waNumber = settings.whatsapp.replace(/[^\d]/g, "");

  const contacts = [
    {
      icon: Phone,
      label: "Telepon",
      value: settings.phone,
      href: `tel:${settings.phone.replace(/\s/g, "")}`,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: settings.whatsapp,
      href: `https://wa.me/${waNumber}`,
    },
    {
      icon: Mail,
      label: "Email",
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Hubungi Kami"
        title="Mari diskusikan kebutuhan logistik Anda"
        description="Tim kami siap membantu — dari pertanyaan umum hingga permintaan penawaran khusus."
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Kontak" }]}
      />

      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Info */}
            <div>
              <h2 className="font-display text-2xl font-bold text-ink-900">
                Informasi Kontak
              </h2>
              <p className="mt-2 text-muted-foreground">{settings.operationalHours}</p>

              <div className="mt-8 space-y-4">
                {contacts.map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-brand-orange/40"
                  >
                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-orange/12 text-brand-orange">
                      <c.icon className="size-5" />
                    </span>
                    <span>
                      <span className="block text-xs uppercase tracking-wide text-muted-foreground">
                        {c.label}
                      </span>
                      <span className="font-medium text-ink-900">{c.value}</span>
                    </span>
                  </a>
                ))}
              </div>

              {/* Address + map */}
              <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                {settings.mapEmbedUrl ? (
                  // Real embedded Google Map when admin has set the embed URL
                  <iframe
                    src={settings.mapEmbedUrl}
                    title="Peta lokasi kantor"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="aspect-16/9 w-full border-0"
                    allowFullScreen
                  />
                ) : (
                  // Placeholder + external link to Google Maps search
                  <a
                    href={mapsSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-16/9 bg-[radial-gradient(circle,rgba(57,65,79,0.18)_1px,transparent_1px)] [background-size:16px_16px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-steel/5 to-brand-orange/5" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="inline-flex size-12 items-center justify-center rounded-full bg-brand-orange text-white shadow-lg transition-transform group-hover:scale-110">
                        <MapPin className="size-6" />
                      </span>
                      <span className="mt-3 text-sm font-medium text-ink-900">
                        Lihat lokasi di Google Maps
                      </span>
                    </div>
                  </a>
                )}
                <div className="flex items-start gap-3 p-5">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-brand-orange" />
                  <p className="text-sm text-muted-foreground">
                    {settings.address}, {settings.city}, {settings.province}{" "}
                    {settings.postalCode}, {settings.country}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <Reveal y={24}>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-brand-orange" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Respons cepat di jam operasional
                  </span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-bold text-ink-900">
                  Kirim permintaan
                </h2>
                <div className="mt-6">
                  <LeadForm />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
