"use client";

/**
 * Per-row admin actions for the News list page.
 *
 * UX 6: secondary actions are icon-only with tooltip + aria-label, Edit is
 * the only labeled button. Reduces visual clutter while keeping every action
 * one click away.
 */
import Link from "next/link";
import { Archive, ArchiveRestore, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  publishNewsAction,
  unpublishNewsAction,
  archiveNewsAction,
  restoreNewsAction,
  deleteNewsAction,
} from "./actions";
import type { NewsStatus } from "@/lib/validation/news";

type Props = {
  id: string;
  title: string;
  status: NewsStatus;
  canWrite: boolean;
  canPublish: boolean;
};

export function NewsActionsRow({ id, title, status, canWrite, canPublish }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {/* Publish / Unpublish / Restore — single icon, depends on current status */}
      {canPublish && status === "DRAFT" && (
        <ConfirmDialog
          trigger={
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label={`Publikasikan ${title}`}
              title="Publikasikan"
              className="text-emerald-700 hover:bg-emerald-50"
            >
              <Eye className="size-3.5" />
            </Button>
          }
          title="Publikasikan berita?"
          description={
            <>
              <strong>{title}</strong> akan tampil di halaman /berita. Tanggal
              publikasi akan tercatat sekarang (jika belum pernah dipublikasi
              sebelumnya).
            </>
          }
          confirmLabel="Publikasikan"
          variant="default"
          action={publishNewsAction}
          hiddenFields={{ id }}
        />
      )}
      {canPublish && status === "PUBLISHED" && (
        <ConfirmDialog
          trigger={
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label={`Sembunyikan ${title} dari publik`}
              title="Sembunyikan dari publik"
              className="text-amber-700 hover:bg-amber-50"
            >
              <EyeOff className="size-3.5" />
            </Button>
          }
          title="Sembunyikan berita dari publik?"
          description={
            <>
              <strong>{title}</strong> akan kembali ke status Draft & disembunyikan
              dari halaman publik. Tanggal publikasi asli tetap disimpan.
            </>
          }
          confirmLabel="Sembunyikan"
          variant="danger"
          action={unpublishNewsAction}
          hiddenFields={{ id }}
        />
      )}
      {canPublish && status === "ARCHIVED" && (
        <ConfirmDialog
          trigger={
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label={`Pulihkan ${title} dari arsip`}
              title="Pulihkan dari arsip"
              className="text-sky-700 hover:bg-sky-50"
            >
              <ArchiveRestore className="size-3.5" />
            </Button>
          }
          title="Pulihkan dari arsip?"
          description={
            <>
              <strong>{title}</strong> akan kembali ke status Draft. Anda bisa
              meninjau lalu publikasikan lagi jika perlu.
            </>
          }
          confirmLabel="Pulihkan"
          variant="default"
          action={restoreNewsAction}
          hiddenFields={{ id }}
        />
      )}

      {/* Archive (only from DRAFT or PUBLISHED) */}
      {canWrite && status !== "ARCHIVED" && (
        <ConfirmDialog
          trigger={
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label={`Arsipkan ${title}`}
              title="Arsipkan"
              className="text-muted-foreground hover:bg-muted"
            >
              <Archive className="size-3.5" />
            </Button>
          }
          title="Arsipkan berita?"
          description={
            <>
              <strong>{title}</strong> akan disembunyikan dari halaman publik &
              dipindahkan ke arsip. Bisa dipulihkan kapan saja.
            </>
          }
          confirmLabel="Arsipkan"
          variant="danger"
          action={archiveNewsAction}
          hiddenFields={{ id }}
        />
      )}

      {/* Edit — primary, labeled */}
      {canWrite && (
        <Button
          size="sm"
          variant="outline"
          render={<Link href={`/admin/news/${id}/edit`} aria-label={`Edit ${title}`} />}
        >
          <Pencil className="size-3.5" />
          Edit
        </Button>
      )}

      {/* Delete — secondary, icon-only */}
      {canWrite && (
        <ConfirmDialog
          trigger={
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label={`Hapus ${title}`}
              title="Hapus"
              className="text-destructive hover:bg-destructive/5"
            >
              <Trash2 className="size-3.5" />
            </Button>
          }
          title="Hapus berita?"
          description={
            <>
              <strong>{title}</strong> akan dihapus permanen. Cover image di
              Media Library tidak ikut terhapus.
            </>
          }
          confirmLabel="Hapus"
          variant="danger"
          action={deleteNewsAction}
          hiddenFields={{ id }}
        />
      )}
    </div>
  );
}
