import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setupPasswordAction } from "./actions";

type SearchParams = Promise<{ token?: string; error?: string }>;

const ERROR_MESSAGES: Record<string, string> = {
  invalid_token: "Link setup tidak valid atau sudah kedaluwarsa. Mintalah link baru.",
  weak: "Password terlalu lemah. Minimal 12 karakter dengan campuran huruf besar, kecil, angka, dan simbol.",
  mismatch: "Konfirmasi password tidak cocok.",
};

export default async function SetupPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token, error } = await searchParams;

  if (!token) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
        <h1 className="font-display text-xl font-bold text-ink-900">
          Link setup diperlukan
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Buka link satu-kali yang Anda terima dari administrator.
        </p>
        <Link
          href="/admin/login"
          className="mt-6 inline-block text-sm text-brand-orange-strong hover:underline"
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
      <h1 className="font-display text-2xl font-bold text-ink-900">Setup Password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Buat password yang kuat untuk akun admin Anda.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {ERROR_MESSAGES[error] ?? "Terjadi kesalahan. Coba lagi."}
        </div>
      )}

      <form action={setupPasswordAction} className="mt-6 space-y-4">
        <input type="hidden" name="token" value={token} />
        <div>
          <Label htmlFor="password">Password baru</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            className="mt-1.5"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Minimal 12 karakter; campur huruf besar/kecil, angka, simbol.
          </p>
        </div>
        <div>
          <Label htmlFor="confirm">Konfirmasi password</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            className="mt-1.5"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="w-full bg-brand-orange text-white hover:bg-brand-orange-strong"
        >
          Simpan password
        </Button>
      </form>
    </div>
  );
}
