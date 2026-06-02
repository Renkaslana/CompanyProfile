"use client";

/**
 * Per-row admin actions for the News list page.
 *
 *   • Publish        (DRAFT  → PUBLISHED)
 *   • Unpublish      (PUBLISHED → DRAFT)
 *   • Archive        (any → ARCHIVED)
 *   • Restore        (ARCHIVED → DRAFT)
 *   • Edit           (Link)
 *   • Delete         (ConfirmDialog)
 *
 * RBAC at UI: hides buttons the user can't action; the service layer
 * still enforces (defense in depth).
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
      {/* Publish / Unpublish */}
      {canPublish && status === "DRAFT" && (
        <ConfirmDialog
          trigger={
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-emerald-700 hover:bg-emerald-50"
            >
              <Eye className="size-3.5" />
              Publish
            </Button>
          }
          title="Publish berita?"
          description={
            <>
              <strong>{title}</strong> akan tampil di halaman /berita. Tanggal
              publikasi akan tercatat sekarang (jika belum pernah dipublikasi
              sebelumnya).
            </>
          }
          confirmLabel="Publish"
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
              size="sm"
              variant="outline"
              className="text-amber-700 hover:bg-amber-50"
            >
              <EyeOff className="size-3.5" />
              Unpublish
            </Button>
          }
          title="Unpublish berita?"
          description={
            <>
              <strong>{title}</strong> akan kembali ke status Draft & disembunyikan
              dari halaman publik. Tanggal publikasi asli tetap disimpan.
            </>
          }
          confirmLabel="Unpublish"
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
              size="sm"
              variant="outline"
              className="text-sky-700 hover:bg-sky-50"
            >
              <ArchiveRestore className="size-3.5" />
              Pulihkan
            </Button>
          }
          title="Pulihkan dari arsip?"
          description={
            <>
              <strong>{title}</strong> akan kembali ke status Draft. Anda bisa
              meninjau lalu publish lagi jika perlu.
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
              size="sm"
              variant="outline"
              className="text-muted-foreground hover:bg-muted"
            >
              <Archive className="size-3.5" />
              Arsipkan
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

      {/* Edit */}
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

      {/* Delete */}
      {canWrite && (
        <ConfirmDialog
          trigger={
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-destructive hover:bg-destructive/5"
            >
              <Trash2 className="size-3.5" />
              Hapus
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
