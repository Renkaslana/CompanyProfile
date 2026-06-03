import Image from "next/image";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { CorporateAvatar } from "@/components/ui/corporate-avatar";
import type { TeamMember } from "@/features/content/types";

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
              {photoSrc ? (
                <div className="relative size-20 overflow-hidden rounded-2xl ring-1 ring-brand-orange/15">
                  <Image
                    src={photoSrc}
                    alt={photoAlt}
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized={!isCloudinary(photoSrc) && !isLocal(photoSrc)}
                  />
                </div>
              ) : (
                <CorporateAvatar name={m.name} size={80} />
              )}
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
