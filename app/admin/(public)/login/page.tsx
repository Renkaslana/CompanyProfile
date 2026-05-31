import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "./actions";

type SearchParams = Promise<{ error?: string }>;

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Email atau password tidak valid.",
  ratelimit: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.",
  setup_required: "Akun ini perlu menyelesaikan setup password. Hubungi administrator.",
  forbidden: "Anda tidak memiliki izin untuk halaman tersebut.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error } = await searchParams;
  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
      <h1 className="font-display text-2xl font-bold text-ink-900">Masuk Admin</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Gunakan kredensial admin Anda untuk mengakses CMS.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {ERROR_MESSAGES[error] ?? "Terjadi kesalahan. Coba lagi."}
        </div>
      )}

      <form action={loginAction} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1.5"
            placeholder="admin@bintangmuliainvestama.co.id"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1.5"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="w-full bg-brand-orange text-white hover:bg-brand-orange-strong"
        >
          Masuk
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/admin/forgot-password" className="hover:text-brand-orange-strong">
          Lupa password?
        </Link>
      </div>
    </div>
  );
}
