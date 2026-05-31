import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requirePermission } from "@/server/auth/guards";
import { UserService } from "@/server/services/user.service";
import { inviteUserAction } from "../actions";

type SearchParams = Promise<{ error?: string }>;

export default async function NewUserPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePermission("users:manage");
  const roles = await UserService.listRoles();
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink-900">
          Undang admin baru
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pengguna akan menerima link satu-kali untuk membuat password.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {decodeURIComponent(error)}
        </div>
      )}

      <form
        action={inviteUserAction}
        className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <div>
          <Label htmlFor="name">Nama lengkap</Label>
          <Input id="name" name="name" required minLength={2} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="roleId">Peran</Label>
          <select
            id="roleId"
            name="roleId"
            required
            className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">— Pilih peran —</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between pt-2">
          <Link href="/admin/users" className="text-sm text-muted-foreground hover:underline">
            ← Batal
          </Link>
          <Button
            type="submit"
            className="bg-brand-orange text-white hover:bg-brand-orange-strong"
          >
            Undang
          </Button>
        </div>
      </form>
    </div>
  );
}
