import type { FleetVehicle } from "@/features/fleet/types";

export const fleetMock: FleetVehicle[] = [
  {
    id: "flt-box",
    name: "Box Truck (CDD)",
    type: "Angkutan Barang",
    capacity: "± 4 Ton",
    description:
      "Unit serbaguna untuk distribusi dalam dan antar kota dengan muatan terlindungi penuh.",
    status: "ACTIVE",
    photo: { src: "/images/fleet/box-truck.jpg", alt: "Box truck armada BMI" },
    specs: [
      { label: "Kapasitas", value: "± 4 Ton" },
      { label: "Dimensi Bak", value: "4.3 × 2.0 × 2.2 m" },
      { label: "Tipe", value: "Colt Diesel Double" },
    ],
    order: 1,
  },
  {
    id: "flt-tronton",
    name: "Tronton",
    type: "Angkutan Berat",
    capacity: "± 15 Ton",
    description:
      "Untuk volume besar dan rute jarak jauh antar pulau dengan keandalan tinggi.",
    status: "ACTIVE",
    photo: { src: "/images/fleet/tronton.jpg", alt: "Truk tronton armada BMI" },
    specs: [
      { label: "Kapasitas", value: "± 15 Ton" },
      { label: "Konfigurasi", value: "6×2 / 6×4" },
      { label: "Jangkauan", value: "Antar Pulau" },
    ],
    order: 2,
  },
  {
    id: "flt-trailer",
    name: "Trailer 40 ft",
    type: "Angkutan Kontainer",
    capacity: "± 30 Ton",
    description:
      "Pengangkutan kontainer dan muatan oversize dengan penanganan profesional.",
    status: "ACTIVE",
    photo: { src: "/images/fleet/trailer.jpg", alt: "Trailer kontainer armada BMI" },
    specs: [
      { label: "Kapasitas", value: "± 30 Ton" },
      { label: "Ukuran", value: "20 ft / 40 ft" },
      { label: "Tipe", value: "Head + Chassis" },
    ],
    order: 3,
  },
  {
    id: "flt-pickup",
    name: "Pickup Niaga",
    type: "Last-mile",
    capacity: "± 1 Ton",
    description:
      "Gesit untuk pengiriman last-mile dan akses area perkotaan yang padat.",
    status: "ACTIVE",
    photo: { src: "/images/fleet/pickup.jpg", alt: "Pickup niaga armada BMI" },
    specs: [
      { label: "Kapasitas", value: "± 1 Ton" },
      { label: "Tipe", value: "Pickup Bak" },
      { label: "Ideal", value: "Area Perkotaan" },
    ],
    order: 4,
  },
  {
    id: "flt-van",
    name: "Delivery Van",
    type: "Kargo Ringan",
    capacity: "± 1.5 Ton",
    description:
      "Muatan tertutup untuk barang bernilai dan sensitif cuaca.",
    status: "ACTIVE",
    photo: { src: "/images/fleet/van.jpg", alt: "Delivery van armada BMI" },
    specs: [
      { label: "Kapasitas", value: "± 1.5 Ton" },
      { label: "Ruang", value: "Tertutup" },
      { label: "Ideal", value: "Barang Sensitif" },
    ],
    order: 5,
  },
  {
    id: "flt-sedan",
    name: "Sedan & MPV Operasional",
    type: "Rental Korporat",
    capacity: "4–7 Penumpang",
    description:
      "Mobilitas eksekutif dan operasional dengan kenyamanan dan kerapian premium.",
    status: "ACTIVE",
    photo: { src: "/images/fleet/sedan.jpg", alt: "Sedan operasional rental BMI" },
    specs: [
      { label: "Kapasitas", value: "4–7 Penumpang" },
      { label: "Opsi", value: "± / Tanpa Sopir" },
      { label: "Skema", value: "Harian–Kontrak" },
    ],
    order: 6,
  },
];
