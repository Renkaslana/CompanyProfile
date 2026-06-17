/**
 * Admin Dashboard — /admin  (Action Center)
 *
 * Launchpad harian untuk satu admin (bukan laporan pasif). Urutan:
 *   1. Sapaan time-aware
 *   2. Aksi Cepat — kartu ke pekerjaan tersering
 *   3. Stat cards — 4 angka berguna (Berita/Galeri/Layanan/Permintaan)
 *   4. Perlu Tindakan ‖ Aktivitas Terbaru
 *   5. Konten Terbaru ‖ Ringkasan Kunjungan (placeholder GA4 — belum aktif)
 *
 * Metrik tanpa nilai-tindakan (jumlah pengguna, total baris audit) dan tabel
 * audit penuh yang redundan sengaja tidak ditampilkan; semuanya ada di modul
 * masing-masing. Tanpa angka palsu — slot analytics adalah placeholder jujur.
 */
import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  Archive,
  ArrowRight,
  BarChart3,
  Boxes,
  Building2,
  CheckCircle2,
  ImageIcon,
  ImagePlus,
  Images,
  Inbox,
  MessagesSquare,
  Newspaper,
  PencilLine,
  Settings2,
  UserCircle2,
  Users2,
  type LucideIcon,
} from "lucide-react";
import { requireFreshSession } from "@/server/auth/guards";
import { db } from "@/lib/db";
import { UserRepository } from "@/server/repositories/user.repository";
import { MediaRepository } from "@/server/repositories/media.repository";
import { ACTION_LABEL, ENTITY_LABEL, ROLE_LABEL } from "@/lib/admin-i18n";
import { formatRelativeID } from "@/lib/format";
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

/** Entitas audit yang bermakna untuk feed aktivitas (buang noise login/auth). */
const CONTENT_ENTITIES = [
  "NewsPost",
  "GalleryItem",
  "Service",
  "TeamMember",
  "ClientLogo",
  "Stat",
  "SiteSettings",
  "MediaAsset",
  "Lead",
];

/** Ikon + warna tile per entitas audit (untuk feed Aktivitas Terbaru). */
const ENTITY_VISUAL: Record<string, { icon: LucideIcon; tile: string }> = {
  NewsPost: { icon: Newspaper, tile: "bg-brand-orange/12 text-brand-orange-strong" },
  GalleryItem: { icon: Images, tile: "bg-violet-500/12 text-violet-600" },
  Service: { icon: Boxes, tile: "bg-sky-500/12 text-sky-600" },
  TeamMember: { icon: Users2, tile: "bg-blue-500/12 text-blue-600" },
  ClientLogo: { icon: Building2, tile: "bg-teal-500/12 text-teal-600" },
  Stat: { icon: BarChart3, tile: "bg-indigo-500/12 text-indigo-600" },
  SiteSettings: { icon: Settings2, tile: "bg-slate-500/12 text-slate-600" },
  MediaAsset: { icon: ImageIcon, tile: "bg-fuchsia-500/12 text-fuchsia-600" },
  Lead: { icon: MessagesSquare, tile: "bg-emerald-500/12 text-emerald-600" },
};
const FALLBACK_VISUAL = { icon: BarChart3, tile: "bg-muted text-muted-foreground" };

/** Sapaan menyesuaikan waktu (zona WIB). */
function greeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Jakarta",
    }).format(new Date()),
  );
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireFreshSession();
  const { error } = await searchParams;

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
    recentNews,
    recentServices,
    recentGallery,
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
      where: { entity: { in: CONTENT_ENTITIES } },
      take: 6,
      orderBy: { createdAt: "desc" },
      select: { id: true, action: true, entity: true, actorId: true, createdAt: true },
    }),
    db.newsPost.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, status: true, updatedAt: true, coverId: true },
    }),
    db.service.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, published: true, updatedAt: true, coverId: true },
    }),
    db.galleryItem.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, category: true, createdAt: true, mediaId: true },
    }),
  ]);

  const actorIds = [
    ...new Set(recentAudit.map((a) => a.actorId).filter((id) => id && id !== "anonymous")),
  ];
  const actors = await UserRepository.findManyByIdSafe(actorIds);
  const actorMap = new Map(actors.map((a) => [a.id, a]));

  const can = (perm: string) => user.permissions.includes(perm as never);

  // ── Aksi Cepat ─────────────────────────────────────────────────────
  const quickActions = [
    { label: "Tulis Berita", desc: "Buat artikel baru", href: "/admin/news/new", icon: PencilLine, perm: "content:write", tile: "bg-brand-orange" },
    { label: "Upload Galeri", desc: "Tambah foto baru", href: "/admin/gallery/new", icon: ImagePlus, perm: "content:write", tile: "bg-violet-500" },
    { label: "Tambah Layanan", desc: "Buat layanan baru", href: "/admin/services/new", icon: Boxes, perm: "content:write", tile: "bg-sky-500" },
    { label: "Cek Permintaan", desc: "Lihat lead masuk", href: "/admin/leads", icon: MessagesSquare, perm: "lead:read", tile: "bg-emerald-500" },
    { label: "Pengaturan", desc: "Kelola website", href: "/admin/settings", icon: Settings2, perm: "content:read", tile: "bg-slate-500" },
  ].filter((a) => can(a.perm));

  // ── Stat cards ─────────────────────────────────────────────────────
  const statCards = [
    { label: "Berita", value: newsPub + newsDraft, sub: `${newsPub} dipublikasi · ${newsDraft} draft`, icon: Newspaper, href: "/admin/news" },
    { label: "Galeri", value: galleryCount, sub: `${galleryCount} foto`, icon: Images, href: "/admin/gallery" },
    { label: "Layanan", value: servicesPub + servicesDraft, sub: `${servicesPub} aktif · ${servicesDraft} draft`, icon: Boxes, href: "/admin/services" },
    ...(can("lead:read")
      ? [{ label: "Permintaan Masuk", value: newLeadCount, sub: newLeadCount > 0 ? `${newLeadCount} belum ditindaklanjuti` : "Semua sudah ditinjau", icon: Inbox, href: "/admin/leads", accent: newLeadCount > 0 }]
      : []),
  ];

  // ── Perlu Tindakan ─────────────────────────────────────────────────
  type Task = { key: string; label: string; note?: string; href: string; icon: typeof Inbox; tone: "urgent" | "warn" | "info" };
  const tasks: Task[] = [];
  if (can("lead:read") && newLeadCount > 0) {
    tasks.push({ key: "leads", label: `${newLeadCount} permintaan masuk belum ditinjau`, href: "/admin/leads", icon: Inbox, tone: "urgent" });
  }
  if (newsDraft > 0) {
    tasks.push({ key: "news-draft", label: `${newsDraft} berita draft menunggu publikasi`, note: staleNewsDrafts > 0 ? `${staleNewsDrafts} di antaranya lebih dari 7 hari` : undefined, href: "/admin/news?status=DRAFT", icon: Newspaper, tone: staleNewsDrafts > 0 ? "warn" : "info" });
  }
  if (servicesDraft > 0) {
    tasks.push({ key: "service-draft", label: `${servicesDraft} layanan draft menunggu publikasi`, note: staleServiceDrafts > 0 ? `${staleServiceDrafts} di antaranya lebih dari 7 hari` : undefined, href: "/admin/services", icon: Boxes, tone: staleServiceDrafts > 0 ? "warn" : "info" });
  }
  if (newsArchived > 0) {
    tasks.push({ key: "news-archived", label: `${newsArchived} berita diarsipkan`, href: "/admin/news?status=ARCHIVED", icon: Archive, tone: "info" });
  }
  const toneClass: Record<Task["tone"], string> = {
    urgent: "bg-brand-orange/12 text-brand-orange-strong",
    warn: "bg-amber-50 text-amber-700",
    info: "bg-muted text-muted-foreground",
  };

  // ── Konten Terbaru (gabungan lintas modul) ─────────────────────────
  type RecentItem = { id: string; title: string; type: string; status: string; date: Date; href: string; icon: LucideIcon; tile: string; mediaId: string | null };
  const newsStatusLabel: Record<string, string> = { PUBLISHED: "Dipublikasi", DRAFT: "Draft", ARCHIVED: "Arsip" };
  const recentContent: RecentItem[] = [
    ...recentNews.map((n) => ({ id: n.id, title: n.title, type: "Berita", status: newsStatusLabel[n.status] ?? n.status, date: n.updatedAt, href: `/admin/news/${n.id}/edit`, icon: Newspaper, tile: "bg-brand-orange/12 text-brand-orange-strong", mediaId: n.coverId })),
    ...recentServices.map((s) => ({ id: s.id, title: s.title, type: "Layanan", status: s.published ? "Aktif" : "Draft", date: s.updatedAt, href: `/admin/services/${s.id}/edit`, icon: Boxes, tile: "bg-sky-500/12 text-sky-600", mediaId: s.coverId })),
    ...recentGallery.map((g) => ({ id: g.id, title: g.title, type: "Galeri", status: g.category, date: g.createdAt, href: `/admin/gallery/${g.id}/edit`, icon: Images, tile: "bg-violet-500/12 text-violet-600", mediaId: g.mediaId })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  // Ambil cover/thumbnail untuk item Konten Terbaru (batched).
  const recentMediaIds = [...new Set(recentContent.map((c) => c.mediaId).filter((id): id is string => Boolean(id)))];
  const recentMedia = recentMediaIds.length ? await MediaRepository.findManyById(recentMediaIds) : [];
  const mediaById = new Map(recentMedia.map((m) => [m.id, m]));

  const roleLabel = ROLE_LABEL[user.role as RoleName] ?? user.role;

  function describeAudit(action: string, entity: string): string {
    const a = ACTION_LABEL[action] ?? action;
    const e = ENTITY_LABEL[entity] ?? entity;
    return `${a} · ${e}`;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-ink-900">
          👋 {greeting()}, {user.name}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Kelola website BMI dengan mudah dan efisien.
        </p>
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
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-brand-orange/40"
            >
              <span className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-white ${a.tile}`}>
                <a.icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink-900">{a.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{a.desc}</span>
              </span>
            </Link>
          ))}
        </section>
      )}

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-brand-orange/40"
          >
            <div className="flex items-start justify-between gap-3">
              <span className={`inline-flex size-10 items-center justify-center rounded-xl ${"accent" in c && c.accent ? "bg-brand-orange/15 text-brand-orange-strong" : "bg-brand-orange/12 text-brand-orange"}`}>
                <c.icon className="size-5" />
              </span>
              <ArrowRight className="size-4 text-muted-foreground/50 transition-colors group-hover:text-brand-orange-strong" />
            </div>
            <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
            <p className="mt-0.5 font-display text-3xl font-bold text-ink-900">{c.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
          </Link>
        ))}
      </section>

      {/* ── Perlu Tindakan ‖ Aktivitas Terbaru ─────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Perlu Tindakan
            {tasks.length > 0 && (
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-brand-orange text-[11px] font-bold text-white">
                {tasks.length}
              </span>
            )}
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
                          {t.tone === "warn" ? <AlertTriangle className="size-4" /> : <t.icon className="size-4" />}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-ink-900">{t.label}</p>
                          {t.note && <p className="text-xs text-amber-700">{t.note}</p>}
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-brand-orange-strong">Tinjau →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Aktivitas Terbaru
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {recentAudit.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                Belum ada aktivitas konten tercatat.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {recentAudit.map((a) => {
                  const actor = actorMap.get(a.actorId);
                  const v = ENTITY_VISUAL[a.entity] ?? FALLBACK_VISUAL;
                  return (
                    <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                      <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-xl ${v.tile}`}>
                        <v.icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink-900">{describeAudit(a.action, a.entity)}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {actor ? actor.name : a.actorId === "anonymous" ? "anonim" : "sistem"}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs text-muted-foreground">{formatRelativeID(a.createdAt)}</p>
                    </li>
                  );
                })}
              </ul>
            )}
            {can("audit:read") && (
              <div className="border-t border-border bg-muted/30 px-5 py-3">
                <Link href="/admin/audit" className="inline-flex items-center gap-1 text-xs font-medium text-brand-orange-strong hover:underline">
                  Lihat semua riwayat aktivitas →
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Konten Terbaru ‖ Ringkasan Kunjungan (placeholder) ──────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Konten Terbaru
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {recentContent.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                Belum ada konten.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {recentContent.map((c) => {
                  const media = c.mediaId ? mediaById.get(c.mediaId) : undefined;
                  const url = media?.url ?? "";
                  const isCloudinary = url.startsWith("https://res.cloudinary.com");
                  const isLocal = url.startsWith("/");
                  const unoptimized = Boolean(url) && !isCloudinary && !isLocal;
                  return (
                    <li key={`${c.type}-${c.id}`}>
                      <Link href={c.href} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30">
                        {url ? (
                          <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={url}
                              alt={media?.alt ?? ""}
                              fill
                              sizes="40px"
                              className="object-cover"
                              unoptimized={unoptimized}
                            />
                          </span>
                        ) : (
                          <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-lg ${c.tile}`}>
                            <c.icon className="size-4" />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink-900">{c.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.type} · {c.status}
                          </p>
                        </div>
                        <p className="shrink-0 text-xs text-muted-foreground">{formatRelativeID(c.date)}</p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <AnalyticsPlaceholder />
      </div>
    </div>
  );
}

/**
 * Slot "Ringkasan Kunjungan Website" — placeholder JUJUR.
 * GA4 belum diintegrasikan; tidak ada angka palsu. Layout final sudah siap
 * menerima data analytics di fase berikutnya tanpa redesign ulang.
 */
function AnalyticsPlaceholder() {
  const metrics = ["Total Kunjungan", "Pengunjung Unik", "Halaman Dilihat", "Tren 30 Hari"];
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Ringkasan Kunjungan Website
      </h2>
      <div className="flex h-[calc(100%-2rem)] flex-col rounded-2xl border border-dashed border-border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <BarChart3 className="size-5" />
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
            Belum Aktif
          </span>
        </div>
        <p className="mt-3 text-sm font-medium text-ink-900">
          Google Analytics belum dihubungkan.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Setelah terhubung, ringkasan trafik website akan tampil di sini:
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {metrics.map((m) => (
            <li key={m} className="rounded-lg border border-border bg-background px-3 py-2">
              <p className="text-xs font-medium text-foreground/70">{m}</p>
              <p className="font-display text-lg font-bold text-muted-foreground/40">—</p>
            </li>
          ))}
        </ul>
        <button
          type="button"
          disabled
          title="Integrasi Google Analytics 4 tersedia pada fase berikutnya."
          className="mt-4 inline-flex items-center justify-center gap-1.5 self-start rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
        >
          <BarChart3 className="size-3.5" />
          Hubungkan Google Analytics
        </button>
      </div>
    </section>
  );
}
