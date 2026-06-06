"use client";

/**
 * Floating Support Widget (support cleanup follow-up).
 *
 * Replaces the previous standalone WhatsApp button with a multi-channel
 * popover. Reads contact channels from SiteSettings (passed via prop from
 * the server layout). No chatbot, no live chat, no PII — just static deep
 * links to human channels.
 *
 *   • Trigger: brand-orange floating button bottom-right (WhatsApp green
 *     accent retained on the WA channel inside)
 *   • Popover content:
 *       1. Support hours line (settings.supportHours)
 *       2. WhatsApp deep-link with prefilled message
 *       3. tel: link
 *       4. mailto: link
 *       5. Link to /kontak (form)
 *       6. Link to /kontak#faq (FAQ section anchor)
 *
 * Auto-hides on /admin routes.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import {
  Headphones,
  Mail,
  MessageCircle,
  Phone,
  Send,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PREFILLED_WA = encodeURIComponent(
  "Halo BMI, saya ingin bertanya seputar layanan logistik / transportasi.",
);
const EMAIL_SUBJECT = encodeURIComponent(
  "Pertanyaan layanan BMI",
);

type Props = {
  whatsapp: string;
  phone: string;
  email: string;
  supportHours?: string;
};

export function SupportWidget({
  whatsapp,
  phone,
  email,
  supportHours,
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  if (pathname.startsWith("/admin")) return null;

  const waDigits = whatsapp.replace(/[^\d]/g, "");
  const telSafe = phone.replace(/\s/g, "");

  return (
    <BasePopover.Root open={open} onOpenChange={setOpen}>
      <BasePopover.Trigger
        className={cn(
          "fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-brand-orange px-4 py-3 font-medium text-white shadow-xl shadow-brand-orange/30 ring-1 ring-brand-orange-strong/40 transition-transform hover:scale-105 hover:bg-brand-orange-strong sm:bottom-6 sm:right-6",
        )}
        aria-label="Buka kontak cepat (WhatsApp, telepon, email)"
      >
        {open ? (
          <X className="size-5" />
        ) : (
          <Headphones className="size-5" />
        )}
        <span className="hidden text-sm sm:inline">
          {open ? "Tutup" : "Chat Cepat"}
        </span>
      </BasePopover.Trigger>

      <BasePopover.Portal>
        <BasePopover.Positioner
          side="top"
          align="end"
          sideOffset={12}
          className="z-50"
        >
          <BasePopover.Popup
            className={cn(
              "w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl ring-1 ring-black/5",
            )}
          >
            <header className="flex items-start justify-between gap-3">
              <div>
                <BasePopover.Title className="font-display text-base font-semibold text-ink-900">
                  Hubungi Tim BMI
                </BasePopover.Title>
                {supportHours && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {supportHours}
                  </p>
                )}
              </div>
              <BasePopover.Close
                aria-label="Tutup"
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-ink-900"
              >
                <X className="size-4" />
              </BasePopover.Close>
            </header>

            <p className="mt-3 text-xs text-muted-foreground">
              Pilih kanal yang paling nyaman untuk Anda — semua terhubung
              langsung ke tim kami, tanpa bot.
            </p>

            <div className="mt-4 grid gap-2">
              {waDigits && (
                <a
                  href={`https://wa.me/${waDigits}?text=${PREFILLED_WA}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 transition-colors hover:bg-emerald-100"
                >
                  <span className="inline-flex size-9 items-center justify-center rounded-lg bg-emerald-500 text-white">
                    <MessageCircle className="size-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-900">
                      WhatsApp
                    </p>
                    <p className="text-xs text-emerald-800/80">
                      Respons paling cepat
                    </p>
                  </div>
                </a>
              )}

              {telSafe && (
                <a
                  href={`tel:${telSafe}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 transition-colors hover:bg-muted"
                >
                  <span className="inline-flex size-9 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange-strong">
                    <Phone className="size-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-900">Telepon</p>
                    <p className="text-xs text-muted-foreground">{phone}</p>
                  </div>
                </a>
              )}

              {email && (
                <a
                  href={`mailto:${email}?subject=${EMAIL_SUBJECT}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 transition-colors hover:bg-muted"
                >
                  <span className="inline-flex size-9 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange-strong">
                    <Mail className="size-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-900">Email</p>
                    <p className="break-all text-xs text-muted-foreground">
                      {email}
                    </p>
                  </div>
                </a>
              )}

              <Link
                href="/kontak"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 transition-colors hover:bg-muted"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange-strong">
                  <Send className="size-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink-900">
                    Formulir permintaan
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Kirim detail kebutuhan secara tertulis
                  </p>
                </div>
              </Link>
            </div>

          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
