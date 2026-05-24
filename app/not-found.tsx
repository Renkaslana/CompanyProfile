import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <main className="section-ink relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.05]" />
      <div className="relative">
        <Logo variant="onDark" className="justify-center" />
        <p className="mt-10 font-display text-7xl font-bold text-brand-orange">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-white">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-3 max-w-md text-white/60">
          Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Button
          render={<Link href="/" />}
          size="lg"
          className="mt-8 bg-brand-orange text-white hover:bg-brand-orange-strong"
        >
          Kembali ke Beranda
        </Button>
      </div>
    </main>
  );
}
