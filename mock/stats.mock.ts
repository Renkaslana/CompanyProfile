import type { Stat } from "@/features/content/types";

export const statsMock: Stat[] = [
  { id: "stat-fleet", value: 50, suffix: "+", label: "Unit Armada" },
  { id: "stat-deliveries", value: 1000, suffix: "+", label: "Pengiriman" },
  { id: "stat-ops", value: 24, suffix: "/7", label: "Operasional" },
  { id: "stat-clients", value: 100, suffix: "+", label: "Klien" },
];
