import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { NAV_ITEMS } from "@/lib/constants";
import { getServices, getSiteSettings } from "@/lib/data";

export async function Footer() {
  const [services, settings] = await Promise.all([getServices(), getSiteSettings()]);
  const year = new Date().getFullYear();

  const socials: Array<{ href: string; label: string; short: string }> = [
    { href: settings.socials.instagram ?? "", label: "Instagram", short: "IG" },
    { href: settings.socials.linkedin ?? "", label: "LinkedIn", short: "in" },
    { href: settings.socials.facebook ?? "", label: "Facebook", short: "f" },
    { href: settings.socials.youtube ?? "", label: "YouTube", short: "YT" },
    { href: settings.socials.tiktok ?? "", label: "TikTok", short: "TT" },
  ].filter((s) => s.href && s.href.trim() !== "");

  return (
    <footer className="section-ink relative mt-auto overflow-hidden">
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.04]" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <Logo variant="onDark" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
              {settings.tagline}
            </p>
            {socials.length > 0 && (
              <div className="mt-6 flex items-center gap-3">
                {socials.map(({ href, label, short }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex size-9 items-center justify-center rounded-lg bg-white/5 text-sm font-semibold text-white/70 ring-1 ring-white/10 transition-colors hover:bg-brand-orange hover:text-white"
                  >
                    {short}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/90">
              Navigasi
            </h3>
            <ul className="mt-5 space-y-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/60 transition-colors hover:text-brand-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/90">
              Layanan
            </h3>
            <ul className="mt-5 space-y-3">
              {services.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/layanan/${s.slug}`}
                    className="text-sm text-white/60 transition-colors hover:text-brand-gold"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/90">
              Kontak
            </h3>
            <ul className="mt-5 space-y-4 text-sm text-white/60">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-orange" />
                <span>
                  {settings.address}, {settings.city}, {settings.province} {settings.postalCode}
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-brand-orange" />
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-brand-gold">
                  {settings.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-brand-orange" />
                <a href={`mailto:${settings.email}`} className="break-all hover:text-brand-gold">
                  {settings.email}
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-brand-orange" />
                <span>{settings.operationalHours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="rule-gold mt-14 opacity-30" />

        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-white/40 sm:flex-row">
          <p>
            © {year} {settings.legalName}. Hak cipta dilindungi.
          </p>
          <p>
            {settings.legal.entity} · NIB {settings.legal.nib}
          </p>
        </div>
      </div>
    </footer>
  );
}
