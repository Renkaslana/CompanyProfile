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

export function TeamGrid({ members }: { members: TeamMember[] }) {
  return (
    <Stagger
      className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6"
      gap={0.06}
    >
      {members.map((m) => (
        <StaggerItem key={m.id}>
          <div className="flex flex-col items-center text-center">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-orange/15 to-brand-gold/15 font-display text-xl font-bold text-brand-orange-strong ring-1 ring-brand-orange/15">
              {initials(m.name)}
            </div>
            <h3 className="mt-3 text-sm font-semibold text-ink-900">{m.name}</h3>
            <p className="text-xs text-muted-foreground">{m.role}</p>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
