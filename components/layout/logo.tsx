import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { COMPANY } from "@/lib/constants";

type LogoProps = {
  variant?: "onLight" | "onDark";
  showText?: boolean;
  className?: string;
  /** plate size in px */
  size?: number;
};

export function Logo({
  variant = "onLight",
  showText = true,
  className,
  size = 40,
}: LogoProps) {
  const onDark = variant === "onDark";
  return (
    <Link
      href="/"
      aria-label={`${COMPANY.legalName} — Beranda`}
      className={cn("group flex items-center gap-3", className)}
    >
      <span
        className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5"
        style={{ width: size, height: size }}
      >
        <Image
          src="/brand/logo.png"
          alt=""
          width={size}
          height={size}
          priority
          className="object-contain"
          style={{ width: size * 0.82, height: size * 0.82 }}
        />
      </span>
      {showText && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-lg font-bold tracking-tight",
              onDark ? "text-white" : "text-ink-900",
            )}
          >
            BMI
          </span>
          <span
            className={cn(
              "mt-1 text-[10px] font-medium uppercase tracking-[0.18em]",
              onDark ? "text-white/60" : "text-muted-foreground",
            )}
          >
            Bintang Mulia Investama
          </span>
        </span>
      )}
    </Link>
  );
}
