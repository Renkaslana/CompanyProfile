import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HelpCircle, Mail, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { CtaBand } from "@/components/sections/cta-band";
import { getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bantuan",
  description:
    "Pusat bantuan PT. Bintang Mulia Investama — pertanyaan umum dan kanal kontak tim support.",
};

export default async function BantuanPage() {
  const settings = await getSiteSettings();
  const waDigits = settings.whatsapp.replace(/[^\d]/g, "");

  return (
    <>
      <PageHeader
        eyebrow="Bantuan"
        title="Bagaimana kami bisa membantu?"
        description="Hubungi tim support kami secara langsung. FAQ lengkap dan portal tiket akan segera tersedia."
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Bantuan" }]}
      />

      <section className="bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
            <div className="flex items-start gap-4">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                <HelpCircle className="size-6" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-ink-900">
                  FAQ &amp; Portal Tiket — Segera Hadir
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Kami sedang menyiapkan pusat pengetahuan mandiri dan sistem
                  tiket untuk respons yang lebih cepat. Sementara ini, tim
                  support kami siap dihubungi langsung melalui kanal di bawah.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 transition-colors hover:border-emerald-400"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                  <MessageCircle className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    WhatsApp
                  </p>
                  <p className="mt-1 font-medium text-emerald-900">
                    {settings.whatsapp}
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-emerald-700 group-hover:gap-2">
                  Chat sekarang
                  <ArrowRight className="size-3.5" />
                </span>
              </a>

              {/* Phone */}
              <a
                href={`tel:${settings.phone.replace(/\s/g, "")}`}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-brand-orange/40"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                  <Phone className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Telepon
                  </p>
                  <p className="mt-1 font-medium text-ink-900">{settings.phone}</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-brand-orange-strong group-hover:gap-2">
                  Hubungi
                  <ArrowRight className="size-3.5" />
                </span>
              </a>

              {/* Email */}
              <a
                href={`mailto:${settings.email}`}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-brand-orange/40"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                  <Mail className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Email
                  </p>
                  <p className="mt-1 break-all font-medium text-ink-900">
                    {settings.email}
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-brand-orange-strong group-hover:gap-2">
                  Kirim email
                  <ArrowRight className="size-3.5" />
                </span>
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                Butuh penawaran khusus? Gunakan formulir kontak resmi kami.
              </p>
              <Button
                render={<Link href="/kontak" />}
                variant="outline"
                size="sm"
              >
                Buka formulir kontak
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
