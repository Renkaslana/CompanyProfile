import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  Boxes,
  Building2,
  Images,
  ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Package,
  ScrollText,
  Settings2,
  Users,
  Users2,
} from "lucide-react";
import { auth } from "@/auth";
import { Logo } from "@/components/layout/logo";
import { ROLE_LABEL } from "@/lib/admin-i18n";
import type { RoleName } from "@/server/auth/permissions";
import { AdminMobileDrawer } from "@/components/admin/admin-mobile-drawer";
import { CommandPalette, type CommandItem } from "@/components/admin/command-palette";
import { signOutAction } from "./_actions";

type NavGroup = "Konten" | "Interaksi" | "Pengelolaan" | "Sistem";

type NavLink = {
  href: string;
  label: string;
  icon: React.ElementType;
  iconKey: string;
  perm?: string;
  /** Grup sidebar; Dashboard berdiri sendiri (tanpa grup) di paling atas. */
  group?: NavGroup;
};

/** Urutan grup di sidebar (header). Dashboard di-render sebelum semua grup. */
const GROUP_ORDER: NavGroup[] = ["Konten", "Interaksi", "Pengelolaan", "Sistem"];

const NAV: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, iconKey: "dashboard", perm: "dashboard:read" },
  // Konten
  { href: "/admin/news", label: "Berita", icon: Newspaper, iconKey: "news", perm: "content:read", group: "Konten" },
  { href: "/admin/gallery", label: "Galeri", icon: Images, iconKey: "gallery", perm: "content:read", group: "Konten" },
  { href: "/admin/services", label: "Layanan", icon: Package, iconKey: "services", perm: "content:read", group: "Konten" },
  { href: "/admin/team", label: "Tim", icon: Users2, iconKey: "team", perm: "content:read", group: "Konten" },
  { href: "/admin/clients", label: "Klien", icon: Building2, iconKey: "clients", perm: "content:read", group: "Konten" },
  { href: "/admin/stats", label: "Statistik", icon: BarChart3, iconKey: "stats", perm: "content:read", group: "Konten" },
  // Interaksi
  { href: "/admin/leads", label: "Permintaan Masuk", icon: Inbox, iconKey: "leads", perm: "lead:read", group: "Interaksi" },
  // Pengelolaan
  { href: "/admin/media", label: "Media", icon: ImageIcon, iconKey: "media", perm: "media:create", group: "Pengelolaan" },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings2, iconKey: "settings", perm: "content:read", group: "Pengelolaan" },
  { href: "/admin/users", label: "Pengguna", icon: Users, iconKey: "users", perm: "users:manage", group: "Pengelolaan" },
  // Sistem
  { href: "/admin/audit", label: "Riwayat Aktivitas", icon: ScrollText, iconKey: "audit", perm: "audit:read", group: "Sistem" },
];

const SIDEBAR_LINK_CLASS =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white";

export default async function AuthAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  // Middleware already redirects unauthenticated users to /admin/login, but
  // defense-in-depth: re-check here in case middleware ever misfires.
  if (!session?.user) redirect("/admin/login");

  const user = session.user;
  const allowed = (perm?: string) =>
    !perm || user.permissions.includes(perm as never);

  const visibleNav = NAV.filter((l) => allowed(l.perm));
  const dashboardLink = visibleNav.find((l) => !l.group);
  const groupedNav = GROUP_ORDER.map((group) => ({
    group,
    items: visibleNav.filter((l) => l.group === group),
  })).filter((g) => g.items.length > 0);
  const roleLabel = ROLE_LABEL[user.role as RoleName] ?? user.role;

  // Command Palette (Ctrl+K) items — aksi pembuatan dulu, lalu navigasi.
  // Serializable (tanpa komponen ikon); difilter izin di sini.
  const commandItems: CommandItem[] = [
    ...(allowed("content:write")
      ? [
          { href: "/admin/news/new", label: "Tulis berita baru", iconKey: "news-new", group: "Aksi" },
          { href: "/admin/services/new", label: "Tambah layanan", iconKey: "service-new", group: "Aksi" },
          { href: "/admin/gallery/new", label: "Tambah item galeri", iconKey: "gallery-new", group: "Aksi" },
        ]
      : []),
    ...visibleNav.map((l) => ({
      href: l.href,
      label: l.label,
      iconKey: l.iconKey,
      group: "Navigasi",
    })),
  ];

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar — sticky agar tidak ikut scroll konten */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-ink-950 text-white md:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <Logo variant="onDark" />
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto p-3">
          {dashboardLink && (
            <Link href={dashboardLink.href} className={SIDEBAR_LINK_CLASS}>
              <dashboardLink.icon className="size-4" />
              {dashboardLink.label}
            </Link>
          )}
          {groupedNav.map(({ group, items }) => (
            <div key={group} className="space-y-1">
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                {group}
              </p>
              {items.map((link) => (
                <Link key={link.href} href={link.href} className={SIDEBAR_LINK_CLASS}>
                  <link.icon className="size-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4 text-xs text-white/50">
          <p className="font-medium text-white/80">{user.name}</p>
          <p className="truncate">{user.email}</p>
          <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-orange/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-orange">
            {roleLabel}
          </p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
          {/* Mobile drawer trigger + logo (replaces the missing sidebar on <md) */}
          <div className="flex items-center gap-3 md:hidden">
            <AdminMobileDrawer
              links={visibleNav.map((l) => ({ href: l.href, label: l.label, iconKey: l.iconKey, group: l.group }))}
              user={{ name: user.name ?? "", email: user.email ?? "", roleLabel }}
              signOutAction={signOutAction}
            />
            <Logo variant="onLight" showText={false} />
            <span className="font-display text-sm font-semibold text-ink-900">BMI Admin</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <CommandPalette items={commandItems} />
            <span className="hidden text-sm text-muted-foreground md:inline">
              <Boxes className="mr-1 inline size-4" />
              {roleLabel}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
              >
                <LogOut className="size-4" />
                Keluar
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 bg-background p-4 sm:p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
