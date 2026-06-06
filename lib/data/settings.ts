/**
 * Hybrid SiteSettings reader (Phase 4 M9).
 *
 * Layers the DB JSON over the static `COMPANY` + `VALUES` constants in
 * `lib/constants.ts` so:
 *   • Pages that haven't been migrated yet keep working from the
 *     constants (no regression).
 *   • Pages migrated to read settings get DB-backed values when the admin
 *     has filled them, and constants as a sensible fallback when empty.
 *
 * Server-only.
 */
import "server-only";
import { SettingsRepository } from "@/server/repositories/settings.repository";
import { COMPANY, VALUES } from "@/lib/constants";
import type { CompanyJson, ValueItem } from "@/lib/validation/settings";

type Testimonial = NonNullable<CompanyJson["testimonials"]>[number];
type FaqItem = NonNullable<CompanyJson["faq"]>[number];

/**
 * Final shape consumed by marketing pages. All keys are guaranteed to be
 * present (constants are the floor); admin edits override them.
 */
export type SiteSettingsResolved = CompanyJson & {
  values: ValueItem[];
};

const DEFAULT_STORY = {
  headline: "Dari armada pertama hingga jaringan nasional",
  paragraphs: [
    `Berdiri sejak ${COMPANY.foundedYear}, ${COMPANY.legalName} tumbuh dari layanan transportasi sederhana menjadi mitra logistik terintegrasi. Fokus kami tak pernah berubah: menggerakkan barang dengan tepat waktu, aman, dan terpantau.`,
    "Kami melayani perusahaan lintas industri ritel, manufaktur, FMCG, hingga konstruksi dengan kombinasi armada yang andal, tim profesional, dan proses yang disiplin. Setiap pengiriman adalah komitmen yang kami jaga.",
  ],
};

const DEFAULT_VISI =
  "Menjadi mitra logistik dan distribusi B2B paling tepercaya di Indonesia, didukung armada modern, tim profesional, dan teknologi yang menjaga setiap muatan terpantau dari ujung ke ujung.";

const DEFAULT_MISI = [
  "Menggerakkan barang pelanggan dengan tepat waktu, aman, dan transparan di setiap rute.",
  "Berinvestasi pada armada modern dan teknologi pemantauan real-time.",
  "Membangun tim profesional yang disiplin, bersertifikat, dan menjunjung keselamatan kerja.",
  "Tumbuh bersama pelanggan dengan kemitraan jangka panjang dan layanan yang konsisten.",
];

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Kerjasama dengan BMI sangat membantu rantai distribusi kami — pengiriman selalu tepat waktu dan komunikasinya transparan.",
    name: "Budi Hartono",
    role: "Supply Chain Manager",
    company: "PT Nusantara Retail",
    avatarMediaId: "",
  },
  {
    quote:
      "Tim BMI profesional dan responsif. Kami mempercayakan distribusi nasional kami dan tidak pernah kecewa.",
    name: "Sarah Wijaya",
    role: "Direktur Operasional",
    company: "PT Sentosa Manufaktur",
    avatarMediaId: "",
  },
];

const DEFAULT_PRIVACY_POLICY =
  '<p>Kebijakan privasi ini menjelaskan bagaimana PT. Bintang Mulia Investama (selanjutnya "kami") mengumpulkan, menggunakan, dan melindungi informasi Anda saat menggunakan situs web ini.</p>' +
  "<h2>Informasi yang kami kumpulkan</h2>" +
  "<p>Kami mengumpulkan informasi yang Anda berikan secara sukarela melalui formulir kontak, termasuk nama, email, nomor telepon, dan pesan permintaan layanan.</p>" +
  "<h2>Penggunaan informasi</h2>" +
  "<p>Informasi yang kami kumpulkan digunakan untuk merespons permintaan Anda, memberikan layanan yang diminta, dan meningkatkan kualitas layanan kami.</p>" +
  "<h2>Perlindungan data</h2>" +
  "<p>Kami menerapkan langkah-langkah keamanan teknis dan organisasi untuk melindungi data Anda dari akses tidak sah.</p>" +
  "<h2>Kontak</h2>" +
  "<p>Untuk pertanyaan terkait kebijakan privasi, hubungi kami melalui kanal kontak resmi.</p>" +
  "<p><em>Versi awal — akan dilengkapi oleh tim legal.</em></p>";

const DEFAULT_FAQ: FaqItem[] = [
  {
    topic: "CARA_MEMESAN",
    question: "Bagaimana cara memesan layanan BMI?",
    answer:
      "Cukup tiga langkah: (1) sampaikan kebutuhan Anda lewat WhatsApp, telepon, atau formulir di halaman Kontak; (2) tim kami menghubungi balik dalam beberapa jam kerja dengan estimasi harga & jadwal; (3) setelah disepakati, pengiriman dijadwalkan dan Anda menerima konfirmasi. Tidak ada akun atau registrasi yang perlu dibuat — cukup ceritakan kebutuhan Anda.",
  },
  {
    topic: "LAYANAN",
    question: "Layanan apa saja yang tersedia di BMI?",
    answer:
      "Empat lini utama: Jasa Logistik (distribusi & gudang), Transportasi (armada darat seluruh Indonesia), Rental Kendaraan (operasional & dinas), serta Perdagangan Umum. Detail tiap layanan ada di halaman Layanan.",
  },
  {
    topic: "WILAYAH_OPERASIONAL",
    question: "Wilayah operasional BMI mencakup mana saja?",
    answer:
      "BMI melayani pengiriman dan distribusi di seluruh Indonesia dengan jaringan armada tetap di kota-kota besar (Jabodetabek, Bandung, Semarang, Surabaya, Medan, Makassar, dan lainnya). Sampaikan rute spesifik Anda lewat WhatsApp atau formulir kontak untuk estimasi lebih akurat.",
  },
  {
    topic: "HARGA_PENAWARAN",
    question: "Bagaimana cara mendapatkan penawaran harga?",
    answer:
      "Harga sangat bergantung pada rute, volume, jenis muatan, dan tingkat layanan yang Anda butuhkan. Untuk mendapat penawaran resmi, mohon sampaikan detail berikut: titik asal & tujuan, perkiraan volume/tonase, jenis muatan, dan frekuensi pengiriman. Tim sales kami akan kembali dalam jam kerja yang sama.",
  },
  {
    topic: "ARMADA_TRANSPORTASI",
    question: "Armada seperti apa yang dimiliki BMI?",
    answer:
      "Armada BMI terdiri dari pickup, CDD, CDE, tronton, hingga fuso, semua dengan dokumen resmi, pengemudi bersertifikat, dan sistem pemantauan operasional. Untuk muatan khusus (suhu terkontrol, berbahaya, oversize), kami siapkan armada yang sesuai.",
  },
  {
    topic: "RENTAL_KENDARAAN",
    question: "Apakah BMI menyewakan kendaraan untuk operasional perusahaan?",
    answer:
      "Ya. Layanan rental kami mencakup kendaraan operasional (Avanza/Innova/Hilux), kendaraan eksekutif (Fortuner/Pajero/Alphard), serta armada angkutan harian/mingguan/bulanan, dengan opsi sopir. Cocok untuk dinas luar kota, antar-jemput tamu perusahaan, atau penggantian armada sementara.",
  },
  {
    topic: "KERJA_SAMA_BISNIS",
    question: "Apakah BMI terbuka untuk kerja sama bisnis (B2B)?",
    answer:
      "Tentu. Kami terbuka untuk kontrak distribusi jangka panjang, kerja sama pergudangan, kemitraan armada, dan pengadaan rutin. Untuk diskusi lebih lanjut, mohon hubungi kami via WhatsApp atau kirim profil singkat perusahaan Anda lewat formulir kontak — tim Business Development akan menindaklanjuti.",
  },
  {
    topic: "KARIR",
    question: "Bagaimana cara melamar pekerjaan di BMI?",
    answer:
      "Seluruh lowongan aktif kami tersedia di halaman Karir. Anda dapat melihat detail posisi, kualifikasi, dan tata cara melamar di sana. Kami menerima lamaran sopir, helper, admin operasional, sales, hingga posisi manajerial.",
  },
  {
    topic: "KONTAK_PERUSAHAAN",
    question: "Bagaimana cara menghubungi BMI?",
    answer:
      "WhatsApp adalah kanal tercepat. Anda juga bisa menelepon di jam kantor atau mengirim email untuk kebutuhan yang memerlukan dokumen tertulis. Alamat kantor dan detail lengkap tersedia di halaman Kontak.",
  },
];

const DEFAULT_SUPPORT_HOURS = "Senin–Sabtu 08.00–17.00 WIB";

const DEFAULT_TERMS =
  "<p>Syarat dan ketentuan ini mengatur penggunaan situs web PT. Bintang Mulia Investama.</p>" +
  "<h2>Penggunaan situs</h2>" +
  "<p>Dengan mengakses situs ini, Anda menyetujui untuk menggunakannya sesuai dengan ketentuan yang berlaku.</p>" +
  "<h2>Konten</h2>" +
  "<p>Seluruh konten di situs ini adalah milik PT. Bintang Mulia Investama dan dilindungi oleh hak cipta yang berlaku.</p>" +
  "<h2>Layanan</h2>" +
  "<p>Permintaan layanan yang dikirim melalui situs ini akan ditindaklanjuti oleh tim kami sesuai dengan kapasitas operasional.</p>" +
  "<h2>Perubahan</h2>" +
  "<p>Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diumumkan melalui situs ini.</p>" +
  "<p><em>Versi awal — akan dilengkapi oleh tim legal.</em></p>";

/** Maps the existing VALUES constant to the new ValueItem shape. */
function valuesAsItems(): ValueItem[] {
  return VALUES.map((v) => ({
    title: v.title,
    description: v.description,
    iconKey: "CheckCircle2",
  }));
}

function withFallbacks(): SiteSettingsResolved {
  return {
    legalName: COMPANY.legalName,
    shortName: COMPANY.shortName,
    tagline: COMPANY.tagline,
    foundedYear: COMPANY.foundedYear,
    story: DEFAULT_STORY,
    visi: DEFAULT_VISI,
    misi: DEFAULT_MISI,
    address: COMPANY.address,
    city: COMPANY.city,
    province: COMPANY.province,
    postalCode: COMPANY.postalCode,
    country: COMPANY.country,
    phone: COMPANY.phone,
    whatsapp: COMPANY.whatsapp,
    email: COMPANY.email,
    operationalHours: COMPANY.operationalHours,
    mapEmbedUrl: "",
    legal: {
      entity: COMPANY.legal.entity,
      nib: COMPANY.legal.nib,
      npwp: COMPANY.legal.npwp,
    },
    socials: {
      instagram: COMPANY.socials.instagram,
      linkedin: COMPANY.socials.linkedin,
      facebook: COMPANY.socials.facebook,
      youtube: "",
      tiktok: "",
    },
    testimonials: DEFAULT_TESTIMONIALS,
    privacyPolicy: DEFAULT_PRIVACY_POLICY,
    termsAndConditions: DEFAULT_TERMS,
    faq: DEFAULT_FAQ,
    supportHours: DEFAULT_SUPPORT_HOURS,
    values: valuesAsItems(),
  };
}

/**
 * Resolved settings = constants (floor) deep-overlayed with DB JSON.
 * Top-level keys are merged shallowly; nested `legal` and `socials`
 * objects are merged one level deep so partial admin edits don't blow
 * away other keys.
 */
export async function getSiteSettings(): Promise<SiteSettingsResolved> {
  const row = await SettingsRepository.findSiteSettings();
  const fallback = withFallbacks();
  if (!row) return fallback;

  const company = (row.company as Partial<CompanyJson> | null) ?? {};
  const valuesRaw = row.values as ValueItem[] | null;
  const values =
    Array.isArray(valuesRaw) && valuesRaw.length >= 1 ? valuesRaw : fallback.values;

  const testimonials =
    Array.isArray(company.testimonials) && company.testimonials.length > 0
      ? company.testimonials
      : fallback.testimonials;
  const privacyPolicy =
    company.privacyPolicy && company.privacyPolicy.trim() !== ""
      ? company.privacyPolicy
      : fallback.privacyPolicy;
  const termsAndConditions =
    company.termsAndConditions && company.termsAndConditions.trim() !== ""
      ? company.termsAndConditions
      : fallback.termsAndConditions;
  const faq =
    Array.isArray(company.faq) && company.faq.length > 0
      ? company.faq
      : fallback.faq;
  const supportHours =
    company.supportHours && company.supportHours.trim() !== ""
      ? company.supportHours
      : fallback.supportHours;

  return {
    ...fallback,
    ...company,
    legal: { ...fallback.legal, ...(company.legal ?? {}) },
    socials: { ...fallback.socials, ...(company.socials ?? {}) },
    story: company.story && company.story.paragraphs?.length ? company.story : fallback.story,
    misi: company.misi && company.misi.length ? company.misi : fallback.misi,
    visi: company.visi && company.visi.trim() !== "" ? company.visi : fallback.visi,
    testimonials,
    privacyPolicy,
    termsAndConditions,
    faq,
    supportHours,
    values,
  };
}
