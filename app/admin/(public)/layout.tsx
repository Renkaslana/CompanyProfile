import Link from "next/link";
import { Logo } from "@/components/layout/logo";

/** Centered single-column shell for login / setup / forgot / reset pages. */
export default function PublicAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <Link href="/" className="opacity-80 transition-opacity hover:opacity-100">
        <Logo variant="onLight" showText />
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} PT. Bintang Mulia Investama
      </p>
    </div>
  );
}
