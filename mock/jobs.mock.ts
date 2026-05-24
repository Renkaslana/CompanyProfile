import type { JobOpening } from "@/features/content/types";

export const jobsMock: JobOpening[] = [
  {
    id: "job-driver",
    title: "Pengemudi Truk (B2 Umum)",
    department: "Operasional Armada",
    type: "Penuh Waktu",
    location: "Jakarta Utara",
    summary:
      "Mengoperasikan armada angkutan barang antar kota dengan standar keselamatan dan ketepatan waktu BMI.",
  },
  {
    id: "job-warehouse",
    title: "Staf Gudang & Inventory",
    department: "Logistik",
    type: "Penuh Waktu",
    location: "Jakarta Utara",
    summary:
      "Menangani penerimaan, penyimpanan, dan pengelolaan stok barang di fasilitas pergudangan.",
  },
  {
    id: "job-dispatcher",
    title: "Dispatcher / Koordinator Rute",
    department: "Operasional",
    type: "Penuh Waktu",
    location: "Jakarta Utara",
    summary:
      "Merencanakan dan memantau penjadwalan armada serta optimasi rute pengiriman harian.",
  },
  {
    id: "job-sales",
    title: "Account Executive (B2B)",
    department: "Komersial",
    type: "Penuh Waktu",
    location: "Jakarta",
    summary:
      "Membangun dan mengelola hubungan dengan klien korporat untuk layanan logistik & transportasi.",
  },
];
