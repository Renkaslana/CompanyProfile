/**
 * Admin Dashboard — /admin
 *
 * Phase 4 M10 expansion:
 *   • Welcome header with role + permission count
 *   • Content metrics (drafts vs published) for Services + News + Gallery
 *   • Media + audit + user counts
 *   • Recent activity feed (last 8 audit entries with actor join)
 *   • "Needs attention" panel (drafts older than 7 days, ARCHIVED news)
 *   • Quick links filtered by permission
 */
import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Images,
  ImagePlus,
  Newspaper,
  Plus,
  ScrollText,
  Settings2,
  Users,
} from "lucide-react";
import { requireFreshSession } from "@/server/auth/guards";
import { db } from "@/lib/db";
import { UserRepository } from "@/server/repositories/user.repository";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";

type SearchParams = Promise<{ error?: string }>;

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: "Anda tidak memiliki izin untuk halaman tersebut.",
};

const SEVEN_DAYS_AGO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireFreshSession();
  const { error } = await searchParams;

  // Live aggregates — keep the query count low; batched in parallel
  const [
    servicesPub,
    servicesDraft,
    newsPub,
    newsDraft,
    newsArchived,
    galleryCount,
    mediaCount,
    userCount,
    auditCount,
    staleServiceDrafts,
    staleNewsDrafts,
    recentAudit,
  ] = await Promise.all([
    db.service.count({ where: { published: true } }),
    db.service.count({ where: { published: false } }),
    db.newsPost.count({ where: { status: "PUBLISHED" } }),
    db.newsPost.count({ where: { status: "DRAFT" } }),
    db.newsPost.count({ where: { status: "ARCHIVED" } }),
    db.galleryItem.count(),
    db.mediaAsset.count(),
    db.user.count(),
    db.auditLog.count(),
    db.service.count({ where: { published: false, updatedAt: { lt: SEVEN_DAYS_AGO() } } }),
    db.newsPost.count({ where: { status: "DRAFT", updatedAt: { lt: SEVEN_DAYS_AGO() } } }),
    db.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: { id: true, action: true, entity: true, entityId: true, actorId: true, createdAt: true },
    }),
  ]);

  // Batched actor lookup for the activity feed
  const actorIds = [
    ...new Set(recentAudit.map((a) => a.actorId).filter((id) => id && id !== "anonymous")),
  ];
  const actors = await UserRepository.findManyByIdSafe(actorIds);
  const actorMap = new Map(actors.map((a) => [a.id, a]));

  const can = (perm: string) => user.permissions.includes(perm as never);

  // Quick links filtered by permission
  const quickLinks = [
    { label: "Tambah berita", href: "/admin/news/new", icon: Newspaper, perm: "content:write" },
    { label: "Tambah layanan", href: "/admin/services/new", icon: Boxes, perm: "content:write" },
    { label: "Tambah item galeri", href: "/admin/gallery/new", icon: ImagePlus, perm: "content:write" },
    { label: "Buka pengaturan", href: "/admin/settings", icon: Settings2, perm: "content:read" },
    { label: "Audit Log", href: "/admin/audit", icon: ScrollText, perm: "audit:read" },
  ].filter((l) => can(l.perm));

  const contentCards = [
    { label: "Layanan", published: servicesPub, draft: servicesDraft, icon: Boxes, href: "/admin/services" },
    { label: "Berita", published: newsPub, draft: newsDraft, icon: Newspaper, href: "/admin/news" },
    { label: "Galeri", published: galleryCount, draft: 0, icon: Images, href: "/admin/gallery" },
  ];

  const utilityCards = [
    { label: "Media Library", value: mediaCount, icon: ImagePlus, href: "/admin/media", perm: "media:create" },
    { label: "Pengguna admin", value: userCount, icon: Users, href: "/admin/users", perm: "users:manage" },
    { label: "Audit entries", value: auditCount, icon: ScrollText, href: "/admin/audit", perm: "audit:read" },
  ].filter((c) => can(c.perm));

  const hasAttention = staleServiceDrafts + staleNewsDrafts + newsArchived > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header>
        <p className="text-sm text-muted-foreground">Selamat datang kembali,</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-ink-900">{user.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Peran Anda: <span className="font-semibold text-foreground">{user.role}</span>{" "}
          · {user.permissions.length} permission aktif.
        </p>
      </header>

      {error && (
        <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {ERROR_MESSAGES[error] ?? "Aksi tidak diizinkan."}
        </div>
      )}

      {/* Quick links */}
      {quickLinks.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Aksi cepat
          </h2>
          <div className="flex flex-wrap gap-2">
            {quickLinks.map((l) => (
              <Button
                key={l.href}
                size="sm"
                variant="outline"
                render={<Link href={l.href} />}
              >
                <l.icon className="size-3.5" />
                {l.label}
              </Button>
            ))}
          </div>
        </section>
      )}

      {/* Content metrics — drafts vs published */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Konten
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contentCards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-brand-orange/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {c.label}
                  </p>
                  <div className="mt-2 flex items-baseline gap-3">
                    <p className="font-display text-3xl font-bold text-ink-900">
                      {c.published}
                    </p>
                    {c.label !== "Galeri" && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{c.draft}</span> draft
                      </p>
                    )}
                  </div>
                </div>
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-orange/12 text-brand-orange transition-colors group-hover:bg-brand-orange/20">
                  <c.icon className="size-5" />
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {c.label === "Galeri"
                  ? `${c.published} item total`
                  : `${c.published} dipublikasi · ${c.draft} draft`}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Utility metrics */}
      {utilityCards.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sistem
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {utilityCards.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-brand-orange/40"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-orange/12 text-brand-orange">
                  <c.icon className="size-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {c.label}
                  </p>
                  <p className="font-display text-2xl font-bold text-ink-900">{c.value}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <section className="lg:col-span-2">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Aktivitas Terbaru
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {recentAudit.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                Belum ada aktivitas tercatat.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {recentAudit.map((a) => {
                  const actor = actorMap.get(a.actorId);
                  return (
                    <li key={a.id} className="flex items-start justify-between gap-3 px-5 py-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={a.action} />
                          <span className="text-xs text-muted-foreground">{a.entity}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {actor ? (
                            <>
                              <span className="font-medium text-ink-900">{actor.name}</span>
                              <span> · {actor.email}</span>
                            </>
                          ) : a.actorId === "anonymous" ? (
                            <span className="italic">anonymous</span>
                          ) : (
                            <span className="font-mono">{a.actorId.slice(0, 12)}…</span>
                          )}
                        </p>
                      </div>
                      <p className="shrink-0 font-mono text-[11px] text-muted-foreground">
                        {a.createdAt.toISOString().replace("T", " ").slice(0, 16)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
            {can("audit:read") && (
              <div className="border-t border-border bg-muted/30 px-5 py-3">
                <Link
                  href="/admin/audit"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-orange-strong hover:underline"
                >
                  Lihat semua audit log →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Needs attention */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Perlu Perhatian
          </h2>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            {!hasAttention ? (
              <div className="flex items-start gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink-900">Semua bersih.</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tidak ada draft tertinggal atau berita yang diarsipkan.
                  </p>
                </div>
              </div>
            ) : (
              <ul className="space-y-3">
                {staleServiceDrafts > 0 && (
                  <li className="flex items-start gap-3">
                    <span className="inline-flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                      <AlertTriangle className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink-900">
                        {staleServiceDrafts} draft layanan {">"} 7 hari
                      </p>
                      <Link
                        href="/admin/services"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-brand-orange-strong hover:underline"
                      >
                        Tinjau layanan →
                      </Link>
                    </div>
                  </li>
                )}
                {staleNewsDrafts > 0 && (
                  <li className="flex items-start gap-3">
                    <span className="inline-flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                      <AlertTriangle className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink-900">
                        {staleNewsDrafts} draft berita {">"} 7 hari
                      </p>
                      <Link
                        href="/admin/news?status=DRAFT"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-brand-orange-strong hover:underline"
                      >
                        Tinjau draft →
                      </Link>
                    </div>
                  </li>
                )}
                {newsArchived > 0 && (
                  <li className="flex items-start gap-3">
                    <span className="inline-flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <Plus className="size-5 rotate-45" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink-900">
                        {newsArchived} berita diarsipkan
                      </p>
                      <Link
                        href="/admin/news?status=ARCHIVED"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-brand-orange-strong hover:underline"
                      >
                        Lihat arsip →
                      </Link>
                    </div>
                  </li>
                )}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
