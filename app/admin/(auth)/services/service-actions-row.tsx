"use client";

/**
 * Per-row admin actions for the Services list page.
 *
 *  • Reorder ↑ / ↓ (visible when there's room to move)
 *  • Publish toggle (gated by content:publish in the action; UI hides for users
 *    without the permission via the canPublish prop)
 *  • Edit (Link)
 *  • Delete (ConfirmDialog)
 */
import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  deleteServiceAction,
  reorderServiceAction,
  togglePublishServiceAction,
} from "./actions";

type Props = {
  id: string;
  title: string;
  published: boolean;
  isFirst: boolean;
  isLast: boolean;
  canPublish: boolean;
  canWrite: boolean;
};

export function ServiceActionsRow({
  id,
  title,
  published,
  isFirst,
  isLast,
  canPublish,
  canWrite,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {canWrite && (
        <>
          <form action={reorderServiceAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="direction" value="up" />
            <Button
              type="submit"
              size="icon-sm"
              variant="outline"
              disabled={isFirst}
              aria-label="Pindah ke atas"
            >
              <ArrowUp className="size-3.5" />
            </Button>
          </form>
          <form action={reorderServiceAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="direction" value="down" />
            <Button
              type="submit"
              size="icon-sm"
              variant="outline"
              disabled={isLast}
              aria-label="Pindah ke bawah"
            >
              <ArrowDown className="size-3.5" />
            </Button>
          </form>
        </>
      )}

      {canPublish && (
        <ConfirmDialog
          trigger={
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={published ? "text-amber-700 hover:bg-amber-50" : "text-emerald-700 hover:bg-emerald-50"}
            >
              {published ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              {published ? "Unpublish" : "Publish"}
            </Button>
          }
          title={published ? "Unpublish layanan?" : "Publish layanan?"}
          description={
            published ? (
              <>
                Layanan <strong>{title}</strong> akan disembunyikan dari halaman publik. Halaman /layanan akan diperbarui otomatis.
              </>
            ) : (
              <>
                Layanan <strong>{title}</strong> akan tampil di halaman publik /layanan. Pastikan ringkasan & deskripsi sudah final.
              </>
            )
          }
          confirmLabel={published ? "Unpublish" : "Publish"}
          variant={published ? "danger" : "default"}
          action={togglePublishServiceAction}
          hiddenFields={{ id }}
        />
      )}

      {canWrite && (
        <Button
          size="sm"
          variant="outline"
          render={<Link href={`/admin/services/${id}/edit`} aria-label={`Edit ${title}`} />}
        >
          <Pencil className="size-3.5" />
          Edit
        </Button>
      )}

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
          title="Hapus layanan?"
          description={
            <>
              Layanan <strong>{title}</strong> akan dihapus permanen. Cover image di Media Library tidak ikut terhapus.
            </>
          }
          confirmLabel="Hapus"
          variant="danger"
          action={deleteServiceAction}
          hiddenFields={{ id }}
        />
      )}
    </div>
  );
}
