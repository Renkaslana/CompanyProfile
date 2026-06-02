"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { deleteClientAction, reorderClientAction } from "./actions";

type Props = {
  id: string;
  name: string;
  isFirst: boolean;
  isLast: boolean;
  canWrite: boolean;
};

export function ClientActionsRow({ id, name, isFirst, isLast, canWrite }: Props) {
  if (!canWrite) {
    return (
      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Read-only
      </span>
    );
  }
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <form action={reorderClientAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="direction" value="up" />
        <Button type="submit" size="icon-sm" variant="outline" disabled={isFirst} aria-label="Pindah ke atas">
          <ArrowUp className="size-3.5" />
        </Button>
      </form>
      <form action={reorderClientAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="direction" value="down" />
        <Button type="submit" size="icon-sm" variant="outline" disabled={isLast} aria-label="Pindah ke bawah">
          <ArrowDown className="size-3.5" />
        </Button>
      </form>
      <Button
        size="sm"
        variant="outline"
        render={<Link href={`/admin/clients/${id}/edit`} aria-label={`Edit ${name}`} />}
      >
        <Pencil className="size-3.5" />
        Edit
      </Button>
      <ConfirmDialog
        trigger={
          <Button type="button" size="sm" variant="outline" className="text-destructive hover:bg-destructive/5">
            <Trash2 className="size-3.5" />
            Hapus
          </Button>
        }
        title="Hapus klien?"
        description={<><strong>{name}</strong> akan dihapus permanen. Logo di Media Library tidak ikut terhapus.</>}
        confirmLabel="Hapus"
        variant="danger"
        action={deleteClientAction}
        hiddenFields={{ id }}
      />
    </div>
  );
}
