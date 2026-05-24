import type { MediaRef } from "@/features/content/types";

export type FleetStatus = "ACTIVE" | "MAINTENANCE" | "RETIRED";

export interface FleetVehicle {
  id: string;
  name: string;
  type: string;
  capacity?: string;
  description?: string;
  status: FleetStatus;
  photo: MediaRef;
  specs: { label: string; value: string }[];
  order: number;
}
