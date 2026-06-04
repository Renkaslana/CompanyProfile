/**
 * Admin Users list — /admin/users
 * M10.2/3: search + pagination via shared primitives.
 */
import Link from "next/link";
import { CheckCircle2, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { FormBanner } from "@/components/admin/admin-form";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { EmptyState } from "@/components/admin/empty-state";
import {
  Pagination,
  paginationFromSearchParam,
} from "@/components/admin/pagination";
import { requirePermission } from "@/server/auth/guards";
import { UserService } from "@/server/services/user.service";
import { UserActionsRow } from "./user-actions-row";
import { ROLE_LABEL } from "@/lib/admin-i18n";
import type { RoleName } from "@/server/auth/permissions";

const PAGE_SIZE = 20;

type SearchParams = Promise<{
  created?: string;
  setupLink?: string;
  updated?: string;
  error?: string;
  q?: string;
  page?: string;
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
  const { created, setupLink, updated, error, q, page } = await searchParams;

  const query = q?.trim() || undefined;
  const [total, roles] = await Promise.all([
    UserService.count({ q: query }),
    UserService.listRoles(),
  ]);
  const { page: currentPage, skip, take } = paginationFromSearchParam(page, total, PAGE_SIZE);
  const users = await UserService.list({ q: query, skip, take });

  function buildHref(nextPage: number): string {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/users?${qs}` : "/admin/users";
  }

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

      <ListToolbar placeholder="Cari nama / email / peran…" />

      {users.length === 0 && !query ? (
        <EmptyState
          icon={Users}
          title="Belum ada pengguna admin"
          description="Setelah Anda mengundang admin, mereka akan menerima link satu-kali untuk mengatur kata sandi."
          action={{ label: "Undang admin baru", href: "/admin/users/new" }}
        />
      ) : users.length === 0 ? (
        <EmptyState
          mode="no-match"
          icon={Users}
          title={`Tidak ada pengguna cocok dengan "${query}".`}
          reset={{ label: "Bersihkan pencarian", href: "/admin/users" }}
        />
      ) : (
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
                  ? "ARCHIVED"
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
                      <span className="rounded-full bg-brand-orange/12 px-2 py-0.5 text-xs font-semibold text-brand-orange-strong" title={u.role.name}>
                        {ROLE_LABEL[u.role.name as RoleName] ?? u.role.name}
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
      )}

      <Pagination
        page={currentPage}
        pageSize={PAGE_SIZE}
        total={total}
        buildHref={buildHref}
      />
    </div>
  );
}
