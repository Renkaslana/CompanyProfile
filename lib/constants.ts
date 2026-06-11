export const COMPANY = {
  legalName: "PT. Bintang Mulia Investama",
  shortName: "BMI",
  tagline:
    "Mitra logistik, transportasi, rental, dan perdagangan umum yang andal — bergerak tepat waktu, aman, dan terpantau di seluruh Indonesia.",
  foundedYear: 2014,
  address: "Jl. Raya Industri Blok C No. 12, Kawasan Pergudangan",
  city: "Jakarta Utara",
  province: "DKI Jakarta",
  postalCode: "14140",
  country: "Indonesia",
  phone: "+62 21 5000 8888",
  whatsapp: "+62 812 1000 8888",
  email: "halo@bintangmuliainvestama.co.id",
  operationalHours: "Operasional 24/7 · Kantor Senin–Sabtu 08.00–15.00 WIB",
  legal: {
    entity: "Perseroan Terbatas (PT)",
    nib: "1234-5678-9012-3456",
    npwp: "01.234.567.8-901.000",
  },
  socials: {
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    facebook: "https://facebook.com",
  },
} as const;

export type NavItem = { label: string; href: string };

export const NAV_ITEMS: NavItem[] = [
  { label: "Beranda", href: "/" },
  { label: "Tentang", href: "/tentang" },
  { label: "Layanan", href: "/layanan" },
  { label: "Galeri", href: "/galeri" },
  { label: "Karir", href: "/karir" },
  { label: "Berita", href: "/berita" },
  { label: "Kontak", href: "/kontak" },
];

/** Core values surfaced in About + Tentang (PRD §5 row 3). */
export const VALUES = [
  {
    title: "Profesional",
    description:
      "Prosedur operasional terstandar, tim bersertifikat, dan eksekusi yang disiplin di setiap pengiriman.",
  },
  {
    title: "Aman",
    description:
      "Keselamatan muatan dan pengemudi adalah prioritas — APD, inspeksi armada, dan penanganan terkontrol.",
  },
  {
    title: "Terpercaya",
    description:
      "Komitmen tepat waktu dengan rekam jejak ribuan pengiriman yang terdokumentasi dan transparan.",
  },
  {
    title: "Berkualitas",
    description:
      "Investasi pada armada modern, pemantauan real-time, dan layanan yang konsisten dari ujung ke ujung.",
  },
] as const;

/**
 * Gallery filter categories shown as chips on the public `/galeri` page.
 * "Semua" is the default (show-all) filter; the rest must match the
 * `category` values stored on GalleryItem rows. Kept here (not in seed data)
 * because it is UI configuration consumed at runtime, not seed content.
 */
export const GALLERY_CATEGORIES = [
  "Semua",
  "Briefing",
  "Loading",
  "Pengiriman",
  "Warehouse",
  "Fleet",
] as const;
