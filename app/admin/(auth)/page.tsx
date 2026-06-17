/**
 * Admin Dashboard — /admin  (Action Center)
 *
 * Bukan laporan pasif: launchpad harian untuk satu admin.
 *   • Aksi Cepat — tombol primer ke pekerjaan tersering (tulis berita, dll).
 *   • Perlu Tindakan — daftar tugas tertunda yang BISA ditindak (permintaan
 *     baru, draft menunggu publikasi, draft basi >7 hari, berita arsip).
 *   • Ringkasan Konten — angka yang berguna (publish vs draft per modul).
 *   • Aktivitas Terbaru — jejak audit terakhir.
 *
 * Metrik tanpa nilai-tindakan sengaja dihilangkan (jumlah pengguna, total baris
 * audit). Satu admin → satu feed aktivitas (tak ada pemisahan "saya" vs "tim").
 */
import Link from "next/link";
import {
  AlertTriangle,
  Archive,
  Boxes,
  CheckCircle2,
  Images,
  ImagePlus,
  Inbox,
  Newspaper,
  Settings2,
  UserCircle2,
} from "lucide-react";
import { requireFreshSession } from "@/server/auth/guards";
import { db } from "@/lib/db";
import { UserRepository } from "@/server/repositories/user.repository";
import { Button } from "@/components/ui/button";
import { ACTION_LABEL, ENTITY_LABEL, ROLE_LABEL } from "@/lib/admin-i18n";
import type { RoleName } from "@/server/auth/permissions";

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

  // Live aggregates — batched in parallel. Hanya yang dipakai untuk tindakan
  // atau ringkasan; metrik vanity (users/audit total) tidak diambil.
  const [
    servicesPub,
    servicesDraft,
    newsPub,
    newsDraft,
    newsArchived,
    galleryCount,
    staleServiceDrafts,
    staleNewsDrafts,
    newLeadCount,
    recentAudit,
  ] = await Promise.all([
    db.service.count({ where: { published: true } }),
    db.service.count({ where: { published: false } }),
    db.newsPost.count({ where: { status: "PUBLISHED" } }),
    db.newsPost.count({ where: { status: "DRAFT" } }),
    db.newsPost.count({ where: { status: "ARCHIVED" } }),
    db.galleryItem.count(),
    db.service.count({ where: { published: false, updatedAt: { lt: SEVEN_DAYS_AGO() } } }),
    db.newsPost.count({ where: { status: "DRAFT", updatedAt: { lt: SEVEN_DAYS_AGO() } } }),
    db.lead.count({ where: { status: "NEW" } }),
    db.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: { id: true, action: true, entity: true, actorId: true, createdAt: true },
    }),
  ]);

  // Batched actor lookup for the activity feed
  const actorIds = [
    ...new Set(recentAudit.map((a) => a.actorId).filter((id) => id && id !== "anonymous")),
  ];
  const actors = await UserRepository.findManyByIdSafe(actorIds);
  const actorMap = new Map(actors.map((a) => [a.id, a]));

  const can = (perm: string) => user.permissions.includes(perm as never);

  // ── Aksi Cepat — launchpad ke pekerjaan tersering ──────────────────
  const quickActions = [
    { label: "Tulis berita", href: "/admin/news/new", icon: Newspaper, perm: "content:write", primary: true },
    { label: "Tambah layanan", href: "/admin/services/new", icon: Boxes, perm: "content:write" },
    { label: "Tambah galeri", href: "/admin/gallery/new", icon: ImagePlus, perm: "content:write" },
    { label: "Media", href: "/admin/media", icon: Images, perm: "media:create" },
    { label: "Pengaturan", href: "/admin/settings", icon: Settings2, perm: "content:read" },
  ].filter((l) => can(l.perm));

  // ── Perlu Tindakan — tugas tertunda yang bisa ditindak ─────────────
  type Task = {
    key: string;
    label: string;
    note?: string;
    href: string;
    icon: typeof Inbox;
    tone: "urgent" | "warn" | "info";
  };
  const tasks: Task[] = [];
  if (can("lead:read") && newLeadCount > 0) {
    tasks.push({
      key: "leads",
      label: `${newLeadCount} permintaan masuk belum ditinjau`,
      href: "/admin/leads",
      icon: Inbox,
      tone: "urgent",
    });
  }
  if (newsDraft > 0) {
    tasks.push({
      key: "news-draft",
      label: `${newsDraft} berita draft menunggu publikasi`,
      note: staleNewsDrafts > 0 ? `${staleNewsDrafts} di antaranya lebih dari 7 hari` : undefined,
      href: "/admin/news?status=DRAFT",
      icon: Newspaper,
      tone: staleNewsDrafts > 0 ? "warn" : "info",
    });
  }
  if (servicesDraft > 0) {
    tasks.push({
      key: "service-draft",
      label: `${servicesDraft} layanan draft menunggu publikasi`,
      note: staleServiceDrafts > 0 ? `${staleServiceDrafts} di antaranya lebih dari 7 hari` : undefined,
      href: "/admin/services",
      icon: Boxes,
      tone: staleServiceDrafts > 0 ? "warn" : "info",
    });
  }
  if (newsArchived > 0) {
    tasks.push({
      key: "news-archived",
      label: `${newsArchived} berita diarsipkan`,
      href: "/admin/news?status=ARCHIVED",
      icon: Archive,
      tone: "info",
    });
  }

  const toneClass: Record<Task["tone"], string> = {
    urgent: "bg-brand-orange/12 text-brand-orange-strong",
    warn: "bg-amber-50 text-amber-700",
    info: "bg-muted text-muted-foreground",
  };

  // ── Ringkasan Konten — angka yang berguna ──────────────────────────
  const contentCards = [
    { label: "Berita", published: newsPub, draft: newsDraft, icon: Newspaper, href: "/admin/news" },
    { label: "Layanan", published: servicesPub, draft: servicesDraft, icon: Boxes, href: "/admin/services" },
    { label: "Galeri", total: galleryCount, icon: Images, href: "/admin/gallery" },
  ];

  const roleLabel = ROLE_LABEL[user.role as RoleName] ?? user.role;

  function describeAudit(action: string, entity: string): string {
    const a = ACTION_LABEL[action] ?? action;
    const e = ENTITY_LABEL[entity] ?? entity;
    return `${a} · ${e}`;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header>
        <p className="text-sm text-muted-foreground">Selamat datang kembali,</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-ink-900">{user.name}</h1>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-orange/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-brand-orange-strong">
          <UserCircle2 className="size-3.5" />
          {roleLabel}
        </p>
      </header>

      {error && (
        <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {ERROR_MESSAGES[error] ?? "Aksi tidak diizinkan."}
        </div>
      )}

      {/* ── Aksi Cepat ─────────────────────────────────────────────── */}
      {quickActions.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Aksi Cepat
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {quickActions.map((l) => (
              <Button
                key={l.href}
                render={<Link href={l.href} />}
                className={
                  l.primary
                    ? "bg-brand-orange text-white hover:bg-brand-orange-strong"
                    : ""
                }
                variant={l.primary ? "default" : "outline"}
              >
                <l.icon className="size-4" />
                {l.label}
              </Button>
            ))}
          </div>
        </section>
      )}

      {/* ── Ringkasan Konten ───────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ringkasan Konten
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
                      {c.total ?? c.published}
                    </p>
                    {c.draft !== undefined && c.draft > 0 && (
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
                {c.total !== undefined
                  ? `${c.total} item total`
                  : `${c.published} dipublikasi · ${c.draft} draft`}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Perlu Tindakan + Aktivitas Terbaru ─────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Perlu Tindakan (Pending Tasks) */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Perlu Tindakan
          </h2>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            {tasks.length === 0 ? (
              <div className="flex items-start gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink-900">Tidak ada tugas tertunda.</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Semua permintaan sudah ditinjau dan konten terpublikasi.
                  </p>
                </div>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {tasks.map((t) => (
                  <li key={t.key}>
                    <Link
                      href={t.href}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5 transition-colors hover:border-brand-orange/40"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-xl ${toneClass[t.tone]}`}>
                          {t.tone === "warn" ? (
                            <AlertTriangle className="size-4" />
                          ) : (
                            <t.icon className="size-4" />
                          )}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-ink-900">{t.label}</p>
                          {t.note && (
                            <p className="text-xs text-amber-700">{t.note}</p>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-brand-orange-strong">
                        Tinjau →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Aktivitas Terbaru */}
        <section>
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
                        <p className="text-sm font-medium text-ink-900">
                          {describeAudit(a.action, a.entity)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {actor ? (
                            <span className="font-medium text-ink-900">{actor.name}</span>
                          ) : a.actorId === "anonymous" ? (
                            <span className="italic">anonim</span>
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
                  Lihat semua riwayat aktivitas →
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
