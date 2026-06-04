"use client";

/**
 * Per-row admin actions for the Users page.
 *
 * Combines:
 *  • Role-change select + Save (opens ConfirmDialog before submitting)
 *  • Disable button (opens ConfirmDialog → calls disableUserAction)
 *  • Reactivate button (opens ConfirmDialog → calls reactivateUserAction)
 *
 * Self-row: actions are hidden because the service layer rejects them
 * (SelfActionError); we hide here too so the UI doesn't invite the failure.
 */
import { useState } from "react";
import { Power, RotateCcw } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  changeRoleAction,
  disableUserAction,
  reactivateUserAction,
} from "./actions";
import { ROLE_LABEL } from "@/lib/admin-i18n";
import type { RoleName } from "@/server/auth/permissions";

type Role = { id: string; name: string };

function friendlyRoleName(name: string): string {
  return ROLE_LABEL[name as RoleName] ?? name;
}

export function UserActionsRow({
  userId,
  currentRoleId,
  currentRoleName,
  isSelf,
  isDisabled,
  roles,
}: {
  userId: string;
  currentRoleId: string;
  currentRoleName: string;
  isSelf: boolean;
  isDisabled: boolean;
  roles: Role[];
}) {
  const [pendingRoleId, setPendingRoleId] = useState(currentRoleId);
  const pendingRole = roles.find((r) => r.id === pendingRoleId);

  if (isSelf) {
    return (
      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Anda
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {/* Role change */}
      {!isDisabled && (
        <div className="inline-flex items-center gap-2">
          <select
            value={pendingRoleId}
            onChange={(e) => setPendingRoleId(e.target.value)}
            className="rounded-md border border-input bg-card px-2 py-1 text-xs"
            aria-label="Pilih peran baru"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id} title={r.name}>
                {friendlyRoleName(r.name)}
              </option>
            ))}
          </select>
          {pendingRoleId !== currentRoleId ? (
            <ConfirmDialog
              trigger={
                <Button
                  type="button"
                  size="sm"
                  className="bg-brand-orange text-white hover:bg-brand-orange-strong"
                >
                  Simpan
                </Button>
              }
              title="Ubah peran pengguna?"
              description={
                <>
                  Peran akan berubah dari{" "}
                  <strong>{currentRoleName}</strong> ke{" "}
                  <strong>{pendingRole?.name ?? "?"}</strong>. Sesi pengguna
                  akan otomatis di-invalidate dan mereka harus login ulang.
                </>
              }
              confirmLabel="Ubah peran"
              variant="default"
              action={changeRoleAction}
              hiddenFields={{ userId, roleId: pendingRoleId }}
            />
          ) : (
            <Button type="button" size="sm" variant="outline" disabled>
              Simpan
            </Button>
          )}
        </div>
      )}

      {/* Disable / Reactivate */}
      {isDisabled ? (
        <ConfirmDialog
          trigger={
            <Button type="button" size="sm" variant="outline">
              <RotateCcw className="size-3.5" />
              Aktifkan
            </Button>
          }
          title="Aktifkan kembali pengguna?"
          description="Pengguna akan dapat login kembali dengan password mereka yang lama."
          confirmLabel="Aktifkan"
          variant="default"
          action={reactivateUserAction}
          hiddenFields={{ userId }}
        />
      ) : (
        <ConfirmDialog
          trigger={
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-destructive hover:bg-destructive/5"
            >
              <Power className="size-3.5" />
              Nonaktifkan
            </Button>
          }
          title="Nonaktifkan pengguna?"
          description={
            <>
              Pengguna tidak akan dapat login. Audit log tetap utuh. Anda dapat
              mengaktifkan kembali kapan saja. Sistem akan menolak jika ini
              adalah SUPER_ADMIN aktif terakhir.
            </>
          }
          confirmLabel="Nonaktifkan"
          variant="danger"
          action={disableUserAction}
          hiddenFields={{ userId }}
        />
      )}
    </div>
  );
}
