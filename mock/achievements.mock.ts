import type { Achievement } from "@/features/content/types";

export const achievementsMock: Achievement[] = [
  {
    id: "ach-ontime",
    iconKey: "Clock",
    title: "Tepat Waktu",
    description: "Penjadwalan disiplin dan rute teroptimasi menjaga pengiriman sesuai komitmen.",
  },
  {
    id: "ach-safe",
    iconKey: "ShieldCheck",
    title: "Aman & Terjamin",
    description: "Penanganan terkontrol, APD lengkap, dan inspeksi armada berkala.",
  },
  {
    id: "ach-monitoring",
    iconKey: "Radar",
    title: "Monitoring Real-time",
    description: "Visibilitas pergerakan muatan dari titik asal hingga tujuan akhir.",
  },
  {
    id: "ach-fast",
    iconKey: "Zap",
    title: "Layanan Cepat",
    description: "Respons sigap dan koordinasi operasional 24/7 sepanjang tahun.",
  },
];
