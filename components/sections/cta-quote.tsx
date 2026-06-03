import { Mail, MapPin, Phone } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { LeadForm } from "@/features/leads/components/lead-form";
import type { SiteSettingsResolved } from "@/lib/data/settings";

type Props = { settings: SiteSettingsResolved };

export function CtaQuote({ settings }: Props) {
  return (
    <section
      id="kontak"
      className="section-ink relative overflow-hidden py-20 sm:py-28"
    >
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.05]" />
      <div className="absolute inset-0 bg-[radial-gradient(100%_90%_at_10%_0%,rgba(232,132,43,0.16),transparent_55%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Copy + contact */}
          <div className="max-w-lg">
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-brand-orange" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange">
                Minta Penawaran
              </span>
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
              Siap menggerakkan logistik Anda bersama BMI?
            </h2>
            <p className="mt-4 leading-relaxed text-white/65">
              Ceritakan kebutuhan Anda dan tim kami akan menyiapkan solusi yang
              tepat — dari pengiriman tunggal hingga kontrak operasional jangka
              panjang.
            </p>

            <ul className="mt-10 space-y-5">
              <li className="flex gap-4">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-brand-orange ring-1 ring-white/10">
                  <Phone className="size-5" />
                </span>
                <div>
                  <p className="text-sm text-white/55">Telepon</p>
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, "")}`}
                    className="text-white hover:text-brand-gold"
                  >
                    {settings.phone}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-brand-orange ring-1 ring-white/10">
                  <Mail className="size-5" />
                </span>
                <div>
                  <p className="text-sm text-white/55">Email</p>
                  <a
                    href={`mailto:${settings.email}`}
                    className="break-all text-white hover:text-brand-gold"
                  >
                    {settings.email}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-brand-orange ring-1 ring-white/10">
                  <MapPin className="size-5" />
                </span>
                <div>
                  <p className="text-sm text-white/55">Alamat</p>
                  <p className="text-white">
                    {settings.address}, {settings.city}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Form card */}
          <Reveal y={28}>
            <div className="rounded-3xl bg-card p-6 shadow-2xl sm:p-8">
              <h3 className="font-display text-xl font-semibold text-ink-900">
                Formulir Penawaran
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Kami merespons setiap permintaan dengan cepat.
              </p>
              <div className="mt-6">
                <LeadForm />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
