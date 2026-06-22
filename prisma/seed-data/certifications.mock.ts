import type { Certification } from "@/features/content/types";

export const certificationsMock: Certification[] = [
  {
    id: "cert-pt",
    title: "Badan Hukum PT",
    issuer: "Kemenkumham RI",
    iconKey: "Landmark",
  },
  {
    id: "cert-nib",
    title: "NIB & Izin Usaha",
    issuer: "OSS / Lembaga OSS",
    iconKey: "FileCheck2",
  },
  {
    id: "cert-k3",
    title: "Komitmen K3",
    issuer: "Standar Keselamatan Kerja",
    iconKey: "HardHat",
  },
  {
    id: "cert-iso",
    title: "Orientasi Mutu",
    issuer: "Praktik Manajemen Mutu",
    iconKey: "BadgeCheck",
  },
];
