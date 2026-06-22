import type { NewsPost } from "@/features/content/types";

export const newsMock: NewsPost[] = [
  {
    id: "news-1",
    slug: "ekspansi-pemantauan-armada-real-time",
    title: "BMI Perluas Sistem Pemantauan Armada Real-Time",
    excerpt:
      "Seluruh armada kini terhubung pelacakan langsung, meningkatkan transparansi dan ketepatan estimasi waktu tiba bagi klien.",
    body: "PT. Bintang Mulia Investama menyelesaikan tahap perluasan sistem pemantauan armada berbasis pelacakan langsung. Dengan integrasi ini, klien dapat memperoleh visibilitas pergerakan muatan secara menyeluruh, dari titik penjemputan hingga tujuan akhir. Inisiatif ini merupakan bagian dari komitmen BMI untuk menghadirkan layanan logistik yang transparan dan dapat dipertanggungjawabkan.",
    cover: { src: "/images/news/news-1.jpg", alt: "Teknologi pemantauan logistik BMI" },
    status: "PUBLISHED",
    publishedAt: "2026-05-12",
    author: "Tim Komunikasi BMI",
    category: "Teknologi",
  },
  {
    id: "news-2",
    slug: "penambahan-kapasitas-gudang-distribusi",
    title: "Penambahan Kapasitas Gudang Distribusi Baru",
    excerpt:
      "Fasilitas pergudangan baru memperkuat jaringan distribusi nasional dan mempersingkat waktu konsolidasi muatan.",
    body: "Sebagai respons atas pertumbuhan volume pengiriman, BMI meresmikan fasilitas pergudangan tambahan untuk memperkuat jaringan distribusi. Kapasitas baru ini memungkinkan konsolidasi muatan yang lebih cepat dan penanganan barang yang lebih tertata, mendukung pertumbuhan kebutuhan klien di berbagai wilayah.",
    cover: { src: "/images/news/news-2.jpg", alt: "Fasilitas gudang distribusi baru BMI" },
    status: "PUBLISHED",
    publishedAt: "2026-04-28",
    author: "Tim Operasional BMI",
    category: "Operasional",
  },
  {
    id: "news-3",
    slug: "peremajaan-armada-tahun-ini",
    title: "Peremajaan Armada untuk Keandalan & Efisiensi",
    excerpt:
      "Sejumlah unit baru bergabung dalam armada BMI, menekan emisi dan meningkatkan keandalan operasional.",
    body: "Program peremajaan armada tahun ini menambahkan sejumlah unit baru yang lebih efisien bahan bakar dan andal. Selain meningkatkan kualitas layanan, langkah ini mendukung upaya BMI menekan jejak emisi operasional sekaligus menjaga ketepatan waktu pengiriman.",
    cover: { src: "/images/news/news-3.jpg", alt: "Peremajaan armada BMI" },
    status: "PUBLISHED",
    publishedAt: "2026-04-10",
    author: "Tim Komunikasi BMI",
    category: "Armada",
  },
  {
    id: "news-4",
    slug: "kemitraan-distribusi-antar-pulau",
    title: "Kemitraan Baru Perkuat Distribusi Antar Pulau",
    excerpt:
      "Kolaborasi strategis memperluas jangkauan layanan BMI ke koridor pengiriman antar pulau yang lebih luas.",
    body: "BMI menjalin kemitraan strategis untuk memperluas koridor distribusi antar pulau. Kerja sama ini membuka jangkauan layanan ke lebih banyak titik tujuan, sekaligus menjaga standar keamanan dan ketepatan waktu yang menjadi ciri layanan BMI.",
    cover: { src: "/images/news/news-4.jpg", alt: "Kemitraan distribusi antar pulau BMI" },
    status: "PUBLISHED",
    publishedAt: "2026-03-22",
    author: "Tim Komunikasi BMI",
    category: "Perusahaan",
  },
];
