"use client";

/**
 * Mobile admin nav drawer (UX 1).
 *
 * On viewports <md, the sidebar is hidden — without this drawer the admin had
 * no way to navigate between sections on a phone. The drawer:
 *   • Renders a hamburger button (Menu icon) that lives in the mobile header
 *   • Opens a left-anchored Base UI Dialog with the same nav links the desktop
 *     sidebar renders (already permission-filtered by the parent layout)
 *   • Auto-closes when the user picks a link via `onClick={() => setOpen(false)}`
 *   • Includes user info + Sign Out at the bottom — same as the desktop footer
 *
 * The drawer never appears on md+ viewports; the desktop aside remains primary.
 */
import Link from "next/link";
import { useState } from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import {
  BarChart3,
  Building2,
  Images,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Package,
  ScrollText,
  Settings2,
  Users,
  Users2,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  services: Package,
  news: Newspaper,
  gallery: Images,
  team: Users2,
  clients: Building2,
  stats: BarChart3,
  settings: Settings2,
  media: ImageIcon,
  users: Users,
  audit: ScrollText,
};

export type AdminNavLink = {
  href: string;
  label: string;
  iconKey: string;
};

type Props = {
  links: AdminNavLink[];
  user: { name: string; email: string; roleLabel: string };
  /** Server Action reference passed from the layout. */
  signOutAction: () => Promise<void>;
};

export function AdminMobileDrawer({ links, user, signOutAction }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <BaseDialog.Root open={open} onOpenChange={setOpen}>
      <BaseDialog.Trigger
        className="inline-flex size-9 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-accent hover:text-foreground md:hidden"
        aria-label="Buka navigasi"
      >
        <Menu className="size-5" />
      </BaseDialog.Trigger>

      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-ink-950/40 backdrop-blur-sm md:hidden" />
        <BaseDialog.Popup
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85%] flex-col bg-ink-950 text-white shadow-2xl md:hidden",
          )}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <Logo variant="onDark" />
            <BaseDialog.Close
              className="inline-flex size-8 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Tutup navigasi"
            >
              <X className="size-4" />
            </BaseDialog.Close>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {links.map((link) => {
              const Icon = ICONS[link.iconKey];
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors",
                    "hover:bg-white/5 hover:text-white",
                  )}
                >
                  {Icon ? <Icon className="size-4" /> : null}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4 text-xs text-white/50">
            <p className="font-medium text-white/80">{user.name}</p>
            <p className="truncate">{user.email}</p>
            <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-orange/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-orange">
              {user.roleLabel}
            </p>
            <form action={signOutAction} className="mt-3">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-white/15 px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/5"
              >
                <LogOut className="size-3.5" />
                Keluar
              </button>
            </form>
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
