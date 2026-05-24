import type { Service } from "@/features/content/types";

export const servicesMock: Service[] = [
  {
    id: "svc-logistics",
    slug: "jasa-logistik",
    title: "Jasa Logistik",
    category: "LOGISTICS",
    summary:
      "Manajemen rantai pasok ujung ke ujung — pergudangan, distribusi, dan pengiriman terjadwal dengan pemantauan real-time.",
    body: "BMI mengelola alur barang Anda dari titik asal hingga tujuan akhir. Mulai dari penerimaan, penyimpanan di gudang terstandar, konsolidasi muatan, hingga distribusi last-mile ke seluruh Indonesia. Setiap tahap terdokumentasi dan dapat dipantau, sehingga Anda memiliki kendali penuh atas pergerakan barang tanpa kehilangan visibilitas.",
    iconKey: "PackageSearch",
    cover: { src: "/brand/jasa-logistik.png", alt: "Jasa logistik BMI" },
    highlights: [
      "Pergudangan & inventory management",
      "Distribusi nasional terjadwal",
      "Tracking pengiriman real-time",
      "Konsolidasi & cross-docking",
    ],
    order: 1,
    published: true,
  },
  {
    id: "svc-transportation",
    slug: "transportasi",
    title: "Transportasi",
    category: "TRANSPORTATION",
    summary:
      "Armada beragam untuk angkutan barang antar kota dan antar pulau — andal, aman, dan tepat waktu.",
    body: "Didukung armada mulai dari pickup, box, hingga tronton dan trailer, layanan transportasi BMI menjangkau rute antar kota dan antar pulau. Pengemudi berpengalaman, perawatan armada berkala, dan rute teroptimasi memastikan muatan tiba sesuai jadwal dengan tingkat keamanan tertinggi.",
    iconKey: "Truck",
    cover: { src: "/brand/jasa-transportasi.png", alt: "Jasa transportasi BMI" },
    highlights: [
      "Angkutan antar kota & antar pulau",
      "Beragam tipe & kapasitas armada",
      "Pengemudi tersertifikasi",
      "Penjadwalan & optimasi rute",
    ],
    order: 2,
    published: true,
  },
  {
    id: "svc-car-rental",
    slug: "rental-mobil",
    title: "Rental Mobil",
    category: "CAR_RENTAL",
    summary:
      "Penyewaan kendaraan operasional dan penumpang untuk kebutuhan korporat — harian, bulanan, hingga kontrak jangka panjang.",
    body: "Layanan rental BMI menyediakan kendaraan operasional siap pakai untuk perusahaan: dari sedan dan MPV untuk mobilitas eksekutif hingga kendaraan niaga ringan untuk operasional lapangan. Tersedia opsi dengan atau tanpa pengemudi, lengkap dengan perawatan dan dukungan penggantian unit.",
    iconKey: "CarFront",
    cover: { src: "/brand/jasa-rental.png", alt: "Jasa rental mobil BMI" },
    highlights: [
      "Sewa harian, bulanan & kontrak",
      "Dengan atau tanpa pengemudi",
      "Perawatan unit termasuk",
      "Dukungan penggantian unit",
    ],
    order: 3,
    published: true,
  },
  {
    id: "svc-general-trading",
    slug: "perdagangan-umum",
    title: "Perdagangan Umum",
    category: "GENERAL_TRADING",
    summary:
      "Pengadaan dan distribusi barang lintas sektor dengan jaringan pemasok yang luas dan tepercaya.",
    body: "Lini perdagangan umum BMI menghubungkan kebutuhan pengadaan perusahaan dengan jaringan pemasok yang terverifikasi. Kami menangani sourcing, negosiasi, dan distribusi barang industri maupun kebutuhan operasional, dengan transparansi harga dan kepatuhan dokumen yang terjaga.",
    iconKey: "Boxes",
    cover: { src: "/brand/jasa-perdagangan.png", alt: "Jasa perdagangan umum BMI" },
    highlights: [
      "Pengadaan lintas sektor",
      "Jaringan pemasok tepercaya",
      "Distribusi terintegrasi",
      "Transparansi & kepatuhan dokumen",
    ],
    order: 4,
    published: true,
  },
];
