"use client";

/**
 * Floating WhatsApp deep-link button (Phase 4 M10).
 *
 * Reads the WA number from Settings (passed via prop from a server wrapper).
 * Static `wa.me/<digits>` deep-link with prefilled message — no chat
 * integration, no PII, no third-party JS. Hidden on admin routes.
 *
 * Repositions above any future cookie banner via CSS.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

const PREFILLED = encodeURIComponent(
  "Halo BMI, saya ingin bertanya seputar layanan logistik / transportasi.",
);

export function WhatsAppButton({ whatsapp }: { whatsapp: string }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const digits = whatsapp.replace(/[^\d]/g, "");
  if (!digits) return null;

  return (
    <Link
      href={`https://wa.me/${digits}?text=${PREFILLED}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp dengan tim BMI"
      className="group fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 font-medium text-white shadow-xl shadow-emerald-500/30 ring-1 ring-emerald-600/40 transition-transform hover:scale-105 hover:bg-emerald-600 sm:bottom-6 sm:right-6"
    >
      <MessageCircle className="size-5" />
      <span className="hidden text-sm sm:inline">Chat WhatsApp</span>
    </Link>
  );
}
