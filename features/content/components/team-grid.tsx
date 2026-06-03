import Image from "next/image";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import type { TeamMember } from "@/features/content/types";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function isCloudinary(src: string) {
  return src.startsWith("https://res.cloudinary.com");
}
function isLocal(src: string) {
  return src.startsWith("/");
}

export function TeamGrid({ members }: { members: TeamMember[] }) {
  return (
    <Stagger
      className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6"
      gap={0.06}
    >
      {members.map((m) => {
        const photoSrc = m.photo?.src;
        const photoAlt = m.photo?.alt ?? m.name;
        return (
          <StaggerItem key={m.id}>
            <div className="flex flex-col items-center text-center">
              <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-orange/15 to-brand-gold/15 font-display text-xl font-bold text-brand-orange-strong ring-1 ring-brand-orange/15">
                {photoSrc ? (
                  <Image
                    src={photoSrc}
                    alt={photoAlt}
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized={!isCloudinary(photoSrc) && !isLocal(photoSrc)}
                  />
                ) : (
                  initials(m.name)
                )}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-ink-900">{m.name}</h3>
              <p className="text-xs text-muted-foreground">{m.role}</p>
              {m.bio && (
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                  {m.bio}
                </p>
              )}
            </div>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
