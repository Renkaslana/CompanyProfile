import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import type { ClientLogo } from "@/features/content/types";

function isCloudinary(src: string) {
  return src.startsWith("https://res.cloudinary.com");
}
function isLocal(src: string) {
  return src.startsWith("/");
}

/**
 * Trust Section — Infinite Logo Marquee (social proof, B2B enterprise).
 *
 * Desktop: 2 baris berlawanan arah. Mobile: 1 baris. Hover: marquee pause +
 * logo grayscale→warna + scale halus. Logo hilang → fallback wordmark.
 * `prefers-reduced-motion` → marquee disembunyikan, fallback ke grid statis.
 *
 * Murni presentasional — render ulang data `clients` yang sudah ada (CMS),
 * tanpa perubahan skema/struktur data dan tanpa statistik baru.
 */
export function ClientsPartners({ clients }: { clients: ClientLogo[] }) {
  if (clients.length === 0) return null;

  const half = Math.ceil(clients.length / 2);
  const rowA = clients.slice(0, half);
  const rowB = clients.slice(half).length > 0 ? clients.slice(half) : clients;

  return (
    <section className="overflow-hidden border-y border-border bg-surface py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-center text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Dipercaya oleh perusahaan lintas industri
          </p>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground/80">
            Mitra dari ritel, manufaktur, FMCG, hingga konstruksi di seluruh Indonesia.
          </p>
        </Reveal>

        {/* Marquee (motion) — disembunyikan saat prefers-reduced-motion */}
        <div className="mt-10 motion-reduce:hidden">
          {/* Mobile: 1 baris (semua logo) */}
          <div className="md:hidden">
            <MarqueeRow items={clients} direction="left" />
          </div>
          {/* Desktop: 2 baris berlawanan arah */}
          <div className="hidden space-y-6 md:block">
            <MarqueeRow items={rowA} direction="left" />
            <MarqueeRow items={rowB} direction="right" />
          </div>
        </div>

        {/* Fallback grid statis — hanya saat prefers-reduced-motion */}
        <div className="mt-10 hidden grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border motion-reduce:grid sm:grid-cols-4">
          {clients.map((c) => (
            <div
              key={c.id}
              className="group/logo flex items-center justify-center bg-card px-4 py-7"
            >
              <Logo client={c} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Marquee row ───────────────────────────────────────────────────── */

function MarqueeRow({
  items,
  direction,
}: {
  items: ClientLogo[];
  direction: "left" | "right";
}) {
  // List digandakan agar loop translateX(-50%) mulus tanpa jeda.
  const doubled = [...items, ...items];
  return (
    <div className="group flex overflow-hidden py-1">
      <div
        className={cn(
          "flex w-max items-center group-hover:[animation-play-state:paused]",
          direction === "right" ? "marquee-right" : "marquee-left",
        )}
      >
        {doubled.map((c, i) => {
          const duplicate = i >= items.length;
          return (
            <ClientCell key={`${c.id}-${i}`} client={c} duplicate={duplicate} />
          );
        })}
      </div>
    </div>
  );
}

function ClientCell({
  client,
  duplicate,
}: {
  client: ClientLogo;
  duplicate: boolean;
}) {
  const interactive = Boolean(client.url) && !duplicate;
  const box = (
    <div
      className="group/logo flex items-center justify-center transition-transform duration-300 ease-bmi hover:scale-105"
      title={client.name}
    >
      <Logo client={client} ariaHidden={duplicate} />
    </div>
  );
  return (
    <div
      className="shrink-0 px-6 sm:px-8"
      aria-hidden={duplicate || undefined}
    >
      {interactive ? (
        <a
          href={client.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Buka situs ${client.name}`}
          className="block"
        >
          {box}
        </a>
      ) : (
        box
      )}
    </div>
  );
}

/**
 * Logo: gambar asli (grayscale→warna) bila tersedia; jika tidak, fallback
 * "logo placeholder" = badge monogram berwarna + wordmark (warna brand
 * deterministik dari nama). Placeholder yang jujur untuk demo — diganti logo
 * klien asli lewat CMS nanti tanpa mengubah layout.
 */
const LOGO_PALETTE = [
  "#0d9488", "#4f46e5", "#16a34a", "#d97706",
  "#ea580c", "#0284c7", "#7c3aed", "#65a30d",
];
function brandColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return LOGO_PALETTE[h % LOGO_PALETTE.length];
}
function initials(name: string): string {
  const w = name.trim().split(/\s+/);
  return ((w[0]?.[0] ?? "") + (w[1]?.[0] ?? "")).toUpperCase();
}

function Logo({
  client,
  ariaHidden,
}: {
  client: ClientLogo;
  ariaHidden?: boolean;
}) {
  const logoSrc = client.logo?.src;
  const logoAlt = client.logo?.alt ?? client.name;
  if (logoSrc) {
    return (
      <div className="relative h-10 w-32">
        <Image
          src={logoSrc}
          alt={ariaHidden ? "" : logoAlt}
          fill
          sizes="128px"
          className="object-contain opacity-60 grayscale transition duration-300 group-hover/logo:opacity-100 group-hover/logo:grayscale-0"
          unoptimized={
            logoSrc.endsWith(".svg") ||
            (!isCloudinary(logoSrc) && !isLocal(logoSrc))
          }
        />
      </div>
    );
  }
  // Fallback: badge monogram + wordmark (muted saat diam → berwarna saat hover).
  return (
    <div className="flex h-10 items-center gap-2.5 opacity-70 grayscale transition duration-300 group-hover/logo:opacity-100 group-hover/logo:grayscale-0">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
        style={{ backgroundColor: brandColor(client.name) }}
      >
        {initials(client.name)}
      </span>
      <span className="whitespace-nowrap font-display text-base font-bold tracking-tight text-ink-900">
        {client.name}
      </span>
    </div>
  );
}
