/**
 * Team CMS list — /admin/team
 */
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, CheckCircle2, Plus } from "lucide-react";
import { FormBanner } from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/server/auth/guards";
import { TeamCmsService } from "@/server/services/team-cms.service";
import { MediaRepository } from "@/server/repositories/media.repository";
import { TeamActionsRow } from "./team-actions-row";

type SearchParams = Promise<{ updated?: string; error?: string }>;

const UPDATED_MAP: Record<string, string> = {
  created: "Anggota tim berhasil ditambahkan.",
  edited: "Perubahan berhasil disimpan.",
  deleted: "Anggota tim berhasil dihapus.",
  reordered: "Urutan tim diperbarui.",
};

const ERROR_MAP: Record<string, string> = {
  not_found: "Anggota tim tidak ditemukan.",
  missing: "Data form tidak lengkap.",
  unknown: "Terjadi kesalahan. Coba lagi.",
};

function initialsAvatar(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function TeamAdminPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requirePermission("content:read");
  const items = await TeamCmsService.list();
  const { updated, error } = await searchParams;
  const photoIds = [...new Set(items.map((i) => i.photoId).filter((x): x is string => !!x))];
  const photos = await MediaRepository.findManyById(photoIds);
  const photosById = new Map(photos.map((p) => [p.id, p]));
  const canWrite = session.permissions.includes("content:write");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Tim</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola anggota tim yang tampil di halaman <code>/tentang</code>.
            Foto opsional — jika kosong, avatar inisial otomatis dipakai.
          </p>
        </div>
        {canWrite && (
          <Button render={<Link href="/admin/team/new" />} className="bg-brand-orange text-white hover:bg-brand-orange-strong">
            <Plus className="size-4" />
            Tambah anggota
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
              <th className="w-20 px-4 py-3">Foto</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Jabatan</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Belum ada anggota tim.{" "}
                  {canWrite && (
                    <Link href="/admin/team/new" className="text-brand-orange-strong underline-offset-2 hover:underline">
                      Tambahkan anggota pertama
                    </Link>
                  )}
                </td>
              </tr>
            ) : (
              items.map((t, i) => {
                const photo = t.photoId ? photosById.get(t.photoId) : undefined;
                const url = photo?.url ?? "";
                const isCloudinary = url.startsWith("https://res.cloudinary.com");
                const isLocal = url.startsWith("/");
                const unoptimized = !isCloudinary && !isLocal;
                return (
                  <tr key={t.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.order}</td>
                    <td className="px-4 py-3">
                      <div className="relative size-12 overflow-hidden rounded-full bg-muted">
                        {url ? (
                          <Image
                            src={url}
                            alt={photo?.alt ?? t.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                            unoptimized={unoptimized}
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center text-xs font-semibold text-muted-foreground">
                            {initialsAvatar(t.name)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink-900">{t.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.role}</td>
                    <td className="px-4 py-3 text-right">
                      <TeamActionsRow
                        id={t.id}
                        name={t.name}
                        isFirst={i === 0}
                        isLast={i === items.length - 1}
                        canWrite={canWrite}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
