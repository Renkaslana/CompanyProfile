import Link from "next/link";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { FormBanner } from "@/components/admin/admin-form";
import { requirePermission } from "@/server/auth/guards";
import { UserService } from "@/server/services/user.service";
import { UserActionsRow } from "./user-actions-row";

type SearchParams = Promise<{
  created?: string;
  setupLink?: string;
  updated?: string;
  error?: string;
}>;

const ERROR_MAP: Record<string, string> = {
  self: "Anda tidak dapat melakukan aksi tersebut pada akun Anda sendiri.",
  super_admin_floor:
    "Sistem harus selalu memiliki minimal satu SUPER_ADMIN aktif. Aksi ditolak.",
  missing: "Data form tidak lengkap.",
  unknown: "Terjadi kesalahan. Coba lagi.",
};

const UPDATED_MAP: Record<string, string> = {
  role: "Peran berhasil diperbarui. Sesi pengguna telah di-invalidate.",
  disabled: "Pengguna berhasil dinonaktifkan.",
  reactivated: "Pengguna berhasil diaktifkan kembali.",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requirePermission("users:manage");
  const [users, roles] = await Promise.all([
    UserService.list(),
    UserService.listRoles(),
  ]);
  const { created, setupLink, updated, error } = await searchParams;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">
            Pengguna Admin
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola admin, perubahan peran, dan status aktif. Semua aksi tercatat di Audit Log.
          </p>
        </div>
        <Button
          render={<Link href="/admin/users/new" />}
          className="bg-brand-orange text-white hover:bg-brand-orange-strong"
        >
          Undang admin baru
        </Button>
      </header>

      {created && setupLink && (
        <div className="rounded-2xl border border-brand-orange/40 bg-brand-orange/5 p-4 text-sm">
          <p className="font-medium text-ink-900">
            Pengguna dibuat. Bagikan link satu-kali berikut (berlaku 1 jam):
          </p>
          <code className="mt-2 block break-all rounded bg-card p-3 font-mono text-xs">
            {setupLink}
          </code>
          <p className="mt-2 text-xs text-muted-foreground">
            Link single-use; jangan disimpan setelah dibagikan.
          </p>
        </div>
      )}

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
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Peran</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => {
              const isSelf = u.id === session.id;
              const isDisabled = u.disabledAt !== null;
              const status = isDisabled
                ? "ARCHIVED" // visually reuses our archived style for "Dinonaktifkan"
                : u.mustChangePassword
                ? "DRAFT"
                : "ACTIVE";
              const statusLabel = isDisabled
                ? "Dinonaktifkan"
                : u.mustChangePassword
                ? "Setup pending"
                : "Aktif";
              return (
                <tr key={u.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {u.name}
                    {isSelf && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                        (Anda)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-brand-orange/12 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-brand-orange-strong">
                      {u.role.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <StatusBadge status={status} />
                      <span className="text-xs text-muted-foreground">
                        {statusLabel}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <UserActionsRow
                      userId={u.id}
                      currentRoleId={u.roleId}
                      currentRoleName={u.role.name}
                      isSelf={isSelf}
                      isDisabled={isDisabled}
                      roles={roles}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
