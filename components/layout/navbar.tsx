"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Headphones, Menu, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CustomerSupportPanel,
} from "@/components/layout/customer-support-panel";
import type { SupportTopic } from "@/lib/validation/settings";

type SupportProps = {
  /** Contact channels + guided FAQ pulled from SiteSettings by the layout. */
  support?: {
    faq: Array<{ topic: SupportTopic; question: string; answer: string }>;
    whatsapp: string;
    phone: string;
    email: string;
    supportHours?: string;
  };
};

export function Navbar({ support }: SupportProps = {}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-surface/85 shadow-sm backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo variant={scrolled ? "onLight" : "onDark"} />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                scrolled
                  ? "text-foreground/80 hover:bg-accent hover:text-foreground"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
                isActive(item.href) && (scrolled ? "text-foreground" : "text-white"),
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-orange" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Customer Support guided panel — entry point #1 (header). The
              floating bottom-right widget remains the secondary always-visible
              entry. */}
          {support && (
            <CustomerSupportPanel
              faq={support.faq}
              whatsapp={support.whatsapp}
              phone={support.phone}
              email={support.email}
              supportHours={support.supportHours}
              triggerClassName={cn(
                "hidden sm:inline-flex",
                scrolled
                  ? "text-foreground/80 hover:bg-accent hover:text-foreground"
                  : "text-white/85 hover:bg-white/10 hover:text-white",
              )}
              triggerLabel={
                <>
                  <Headphones className="size-4" />
                  Bantuan
                </>
              }
            />
          )}
          <Button
            render={<Link href="/kontak" />}
            className="hidden bg-brand-orange text-white hover:bg-brand-orange-strong sm:inline-flex"
          >
            <Phone className="size-4" />
            Hubungi Kami
          </Button>

          {/* Mobile */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Buka menu"
                  className={cn(
                    "lg:hidden",
                    scrolled
                      ? "text-foreground hover:bg-accent"
                      : "text-white hover:bg-white/10",
                  )}
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-surface p-0">
              <SheetHeader className="border-b border-border px-6 py-4">
                <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
                <Logo variant="onLight" />
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 py-4">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-accent",
                      isActive(item.href)
                        ? "bg-accent text-brand-orange-strong"
                        : "text-foreground/80",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="space-y-2 px-6 pt-2">
                {support && (
                  <CustomerSupportPanel
                    faq={support.faq}
                    whatsapp={support.whatsapp}
                    phone={support.phone}
                    email={support.email}
                    supportHours={support.supportHours}
                    triggerClassName="flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground"
                    triggerLabel={
                      <>
                        <Headphones className="size-4" />
                        Bantuan
                      </>
                    }
                  />
                )}
                <Button
                  render={<Link href="/kontak" onClick={() => setOpen(false)} />}
                  className="w-full bg-brand-orange text-white hover:bg-brand-orange-strong"
                >
                  <Phone className="size-4" />
                  Hubungi Kami
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
