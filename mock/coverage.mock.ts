import type { CoverageRegion } from "@/features/content/types";

/** Approximate positions (% of viewBox) over a stylized Indonesia map. */
export const coverageMock: CoverageRegion[] = [
  { id: "cov-medan", name: "Medan", x: 11, y: 27 },
  { id: "cov-pekanbaru", name: "Pekanbaru", x: 16, y: 39 },
  { id: "cov-palembang", name: "Palembang", x: 23, y: 54 },
  { id: "cov-jakarta", name: "Jakarta", x: 30, y: 64, hub: true },
  { id: "cov-bandung", name: "Bandung", x: 33, y: 68 },
  { id: "cov-semarang", name: "Semarang", x: 38, y: 65 },
  { id: "cov-surabaya", name: "Surabaya", x: 43, y: 67, hub: true },
  { id: "cov-denpasar", name: "Denpasar", x: 48, y: 73 },
  { id: "cov-pontianak", name: "Pontianak", x: 40, y: 45 },
  { id: "cov-banjarmasin", name: "Banjarmasin", x: 46, y: 56 },
  { id: "cov-balikpapan", name: "Balikpapan", x: 52, y: 47, hub: true },
  { id: "cov-makassar", name: "Makassar", x: 58, y: 61, hub: true },
  { id: "cov-manado", name: "Manado", x: 64, y: 36 },
  { id: "cov-ambon", name: "Ambon", x: 74, y: 57 },
  { id: "cov-jayapura", name: "Jayapura", x: 90, y: 50 },
];
