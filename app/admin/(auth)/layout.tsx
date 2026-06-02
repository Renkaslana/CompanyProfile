import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Boxes,
  Building2,
  Images,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Package,
  ScrollText,
  Users,
  Users2,
} from "lucide-react";
import { auth, signOut } from "@/auth";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string; icon: React.ElementType; perm?: string };

const NAV: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, perm: "dashboard:read" },
  { href: "/admin/services", label: "Layanan", icon: Package, perm: "content:read" },
  { href: "/admin/news", label: "Berita", icon: Newspaper, perm: "content:read" },
  { href: "/admin/gallery", label: "Galeri", icon: Images, perm: "content:read" },
  { href: "/admin/team", label: "Tim", icon: Users2, perm: "content:read" },
  { href: "/admin/clients", label: "Klien", icon: Building2, perm: "content:read" },
  { href: "/admin/media", label: "Media", icon: ImageIcon, perm: "media:create" },
  { href: "/admin/users", label: "Pengguna", icon: Users, perm: "users:manage" },
  { href: "/admin/audit", label: "Audit Log", icon: ScrollText, perm: "audit:read" },
];

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/admin/login" });
}

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

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-ink-950 text-white md:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <Logo variant="onDark" />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.filter((l) => allowed(l.perm)).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors",
                "hover:bg-white/5 hover:text-white",
              )}
            >
              <link.icon className="size-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4 text-xs text-white/50">
          <p className="font-medium text-white/80">{user.name}</p>
          <p className="truncate">{user.email}</p>
          <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-orange/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-orange">
            {user.role}
          </p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-3 md:hidden">
            <Logo variant="onLight" showText={false} />
            <span className="font-display font-semibold text-ink-900">BMI Admin</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground md:inline">
              <Boxes className="mr-1 inline size-4" />
              {user.role}
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
        <main className="flex-1 bg-background p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
