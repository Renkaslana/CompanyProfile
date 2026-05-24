import {
  BadgeCheck,
  Boxes,
  CarFront,
  Clock,
  FileCheck2,
  HardHat,
  Landmark,
  PackageSearch,
  Radar,
  ShieldCheck,
  Truck,
  Zap,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  PackageSearch,
  Truck,
  CarFront,
  Boxes,
  Clock,
  ShieldCheck,
  Radar,
  Zap,
  Landmark,
  FileCheck2,
  HardHat,
  BadgeCheck,
};

export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Cmp = MAP[name] ?? Boxes;
  return <Cmp className={className} aria-hidden />;
}
