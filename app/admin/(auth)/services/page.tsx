/**
 * Services CMS list — /admin/services
 *
 * - Lists all services (drafts + published) ordered by `order` ASC.
 * - Status, category, slug, reorder ↑↓, publish toggle, edit, delete.
 * - Read gated by `content:read`; mutation buttons hidden per permission.
 */
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Plus } from "lucide-react";
import { FormBanner } from "@/components/admin/admin-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/server/auth/guards";
import { ServiceCmsService } from "@/server/services/service-cms.service";
import { CATEGORY_LABEL, type ServiceCategory } from "@/lib/validation/service";
import { ServiceActionsRow } from "./service-actions-row";

type SearchParams = Promise<{
  updated?: string;
  error?: string;
}>;

const UPDATED_MAP: Record<string, string> = {
  created: "Layanan berhasil dibuat.",
  edited: "Perubahan berhasil disimpan.",
  deleted: "Layanan berhasil dihapus.",
  published: "Layanan dipublikasikan. Halaman /layanan telah diperbarui.",
  unpublished: "Layanan disembunyikan dari publik.",
  reordered: "Urutan layanan diperbarui.",
};

const ERROR_MAP: Record<string, string> = {
  slug_taken: "Slug tersebut sudah dipakai layanan lain. Pilih slug yang berbeda.",
  not_found: "Layanan tidak ditemukan. Mungkin sudah dihapus.",
  validation: "Form tidak valid. Periksa kembali isiannya.",
  missing: "Data form tidak lengkap.",
  unknown: "Terjadi kesalahan. Coba lagi.",
};

export default async function ServicesAdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requirePermission("content:read");
  const rows = await ServiceCmsService.list();
  const { updated, error } = await searchParams;

  const canWrite = session.permissions.includes("content:write");
  const canPublish = session.permissions.includes("content:publish");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Layanan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola layanan yang tampil di halaman publik <code>/layanan</code>.
            Urutkan dengan tombol panah; publish/unpublish menerapkan perubahan
            ke halaman publik secara otomatis.
          </p>
        </div>
        {canWrite && (
          <Button
            render={<Link href="/admin/services/new" />}
            className="bg-brand-orange text-white hover:bg-brand-orange-strong"
          >
            <Plus className="size-4" />
            Tambah layanan
          </Button>
        )}
      </header>

      {updated && (
        <FormBanner
          variant="success"
          message={
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              {UPDATED_MAP[updated] ?? "Berhasil."}
            </span>
          }
        />
      )}
      {error && (
        <FormBanner
          variant="error"
          message={
            <span className="inline-flex items-center gap-2">
              <AlertTriangle className="size-4" />
              {ERROR_MAP[error] ?? ERROR_MAP.unknown}
            </span>
          }
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-14 px-4 py-3">#</th>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3 w-32">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Belum ada layanan. {canWrite && (
                    <Link href="/admin/services/new" className="text-brand-orange-strong underline-offset-2 hover:underline">
                      Tambahkan layanan pertama
                    </Link>
                  )}
                </td>
              </tr>
            ) : (
              rows.map((s, i) => (
                <tr key={s.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.order}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{s.title}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{s.summary}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {CATEGORY_LABEL[s.category as ServiceCategory]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/layanan/${s.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-muted-foreground hover:text-brand-orange-strong"
                      title="Buka halaman publik (tab baru)"
                    >
                      /{s.slug} ↗
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.published ? "PUBLISHED" : "DRAFT"} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ServiceActionsRow
                      id={s.id}
                      title={s.title}
                      published={s.published}
                      isFirst={i === 0}
                      isLast={i === rows.length - 1}
                      canPublish={canPublish}
                      canWrite={canWrite}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
