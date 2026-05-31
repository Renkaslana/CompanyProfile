import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction } from "./actions";

type SearchParams = Promise<{ sent?: string }>;

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { sent } = await searchParams;

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
      <h1 className="font-display text-2xl font-bold text-ink-900">Lupa password</h1>

      {sent ? (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            Jika email tersebut terdaftar, link reset akan dikirim. Periksa kotak
            masuk Anda — link berlaku 1 jam.
          </p>
          <Link
            href="/admin/login"
            className="mt-6 inline-block text-sm text-brand-orange-strong hover:underline"
          >
            Kembali ke halaman masuk
          </Link>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted-foreground">
            Masukkan email akun admin Anda untuk menerima link reset.
          </p>
          <form action={forgotPasswordAction} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1.5"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full bg-brand-orange text-white hover:bg-brand-orange-strong"
            >
              Kirim link reset
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
