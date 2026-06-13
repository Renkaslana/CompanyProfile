import { Logo } from "@/components/layout/logo";

/** Centered single-column shell for login / setup / forgot / reset pages. */
export default function PublicAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      {/* Logo already renders its own <Link href="/"> — do NOT wrap it again
          (nested <a> causes a hydration error). */}
      <Logo
        variant="onLight"
        showText
        className="opacity-80 transition-opacity hover:opacity-100"
      />
      <div className="w-full max-w-md">{children}</div>
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} PT. Bintang Mulia Investama
      </p>
    </div>
  );
}
