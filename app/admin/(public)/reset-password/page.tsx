import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction } from "./actions";

type SearchParams = Promise<{ token?: string; error?: string }>;

const ERROR_MESSAGES: Record<string, string> = {
  invalid_token: "Link reset tidak valid atau sudah kedaluwarsa.",
  weak: "Password terlalu lemah. Minimal 12 karakter dengan campuran huruf besar, kecil, angka, dan simbol.",
  mismatch: "Konfirmasi password tidak cocok.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token, error } = await searchParams;

  if (!token) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
        <h1 className="font-display text-xl font-bold text-ink-900">
          Link reset tidak ditemukan
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gunakan link satu-kali yang dikirim ke email Anda.
        </p>
        <Link
          href="/admin/forgot-password"
          className="mt-6 inline-block text-sm text-brand-orange-strong hover:underline"
        >
          Minta link baru
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
      <h1 className="font-display text-2xl font-bold text-ink-900">Reset Password</h1>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {ERROR_MESSAGES[error] ?? "Terjadi kesalahan. Coba lagi."}
        </div>
      )}

      <form action={resetPasswordAction} className="mt-6 space-y-4">
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
          Simpan password baru
        </Button>
      </form>
    </div>
  );
}
