import type { GalleryItem } from "@/features/content/types";

export const galleryMock: GalleryItem[] = [
  {
    id: "gal-briefing",
    title: "Briefing Pagi",
    category: "Briefing",
    media: { src: "/images/gallery/briefing.jpg", alt: "Briefing pagi tim operasional BMI" },
    order: 1,
  },
  {
    id: "gal-loading",
    title: "Proses Loading",
    category: "Loading",
    media: { src: "/images/gallery/loading.jpg", alt: "Proses loading barang dengan forklift" },
    order: 2,
  },
  {
    id: "gal-pengiriman",
    title: "Pengiriman",
    category: "Pengiriman",
    media: { src: "/images/gallery/pengiriman.jpg", alt: "Truk BMI dalam pengiriman" },
    order: 3,
  },
  {
    id: "gal-warehouse",
    title: "Warehouse Activity",
    category: "Warehouse",
    media: { src: "/images/gallery/warehouse.jpg", alt: "Aktivitas pergudangan BMI" },
    order: 4,
  },
  {
    id: "gal-fleet-ready",
    title: "Fleet Ready",
    category: "Fleet",
    media: { src: "/images/gallery/fleet-ready.jpg", alt: "Armada BMI siap berangkat" },
    order: 5,
  },
  {
    id: "gal-container",
    title: "Container Yard",
    category: "Pengiriman",
    media: { src: "/images/gallery/container-yard.jpg", alt: "Penanganan kontainer di yard" },
    order: 6,
  },
  {
    id: "gal-night",
    title: "Operasi Malam",
    category: "Pengiriman",
    media: { src: "/images/gallery/night-ops.jpg", alt: "Operasi pengiriman malam hari" },
    order: 7,
  },
  {
    id: "gal-inspection",
    title: "Inspeksi Armada",
    category: "Fleet",
    media: { src: "/images/gallery/inspection.jpg", alt: "Inspeksi dan perawatan armada" },
    order: 8,
  },
];

export const galleryCategories = [
  "Semua",
  "Briefing",
  "Loading",
  "Pengiriman",
  "Warehouse",
  "Fleet",
] as const;
