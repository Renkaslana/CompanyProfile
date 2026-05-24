# Product Requirements Document (PRD)
## Platform Company Profile & CMS — PT. Bintang Mulia Investama (BMI)

| Field | Value |
|---|---|
| **Dokumen** | PRD — BMI Digital Platform |
| **Versi** | 0.1 (Draft Arsitektur) |
| **Status** | Phase 1 — Planning & Architecture |
| **Skup versi ini** | Company Profile Premium + CMS Scalable + Fondasi Arsitektur |
| **Tanggal** | _isi saat finalisasi_ |
| **Owner / PIC** | _isi_ |
| **Tech stack** | Next.js (App Router) · TypeScript · PostgreSQL · Prisma · Tailwind CSS · shadcn/ui · Framer Motion |

> **Catatan penting tentang skup.** Dokumen ini mendesain *fondasi penuh* untuk platform jangka panjang (sampai attendance & AI), tetapi yang **dibangun sekarang hanya** company profile premium + CMS scalable. Modul attendance/face recognition **dirancang arsitekturnya saja** (Bagian 14), tidak diimplementasikan. Prinsip pemandu di seluruh dokumen: *bangun yang dibutuhkan sekarang, tapi jangan menutup pintu untuk yang dibutuhkan nanti.*

---

## Daftar Isi

1. [Product Vision](#1-product-vision)
2. [Business Goals](#2-business-goals)
3. [Branding & Visual Direction](#3-branding--visual-direction)
4. [UI/UX Direction](#4-uiux-direction)
5. [Struktur Landing Page](#5-struktur-landing-page)
6. [Analisis CMS Dashboard](#6-analisis-cms-dashboard)
7. [Analisis Kebutuhan Sistem](#7-analisis-kebutuhan-sistem)
8. [Analisis Frontend Architecture](#8-analisis-frontend-architecture)
9. [Analisis Backend Architecture](#9-analisis-backend-architecture)
10. [Perencanaan Database](#10-perencanaan-database)
11. [Perencanaan API](#11-perencanaan-api)
12. [Authentication Strategy](#12-authentication-strategy)
13. [Media Management Strategy](#13-media-management-strategy)
14. [Future Attendance Scalability](#14-future-attendance-scalability)
15. [Production Readiness Strategy](#15-production-readiness-strategy)
16. [Lampiran A — Struktur Folder Project](#lampiran-a--struktur-folder-project)
17. [Lampiran B — Strategi Dokumentasi](#lampiran-b--strategi-dokumentasi)
18. [Lampiran C — Mock Data & Placeholder Strategy](#lampiran-c--mock-data--placeholder-strategy)
19. [Lampiran D — Development Workflow (6 Phase)](#lampiran-d--development-workflow-6-phase)

---

## 1. Product Vision

BMI Digital Platform adalah sistem digital perusahaan yang **dimulai sebagai company profile premium**, namun dirancang sejak awal untuk berevolusi menjadi **platform operasional internal** (CMS, manajemen karyawan, absensi, hingga face recognition dan analytics).

Visi produk versi ini: menghadirkan **representasi digital BMI yang terasa enterprise-level dan operasional yang hidup** — bukan template company profile biasa. Pengunjung harus, dalam lima detik pertama, menangkap bahwa BMI adalah perusahaan logistik **nyata, mapan, berskala, dan aktif beroperasi** di Indonesia.

**Positioning produk:**
- Bukan brosur statis, melainkan *etalase operasional* yang menampilkan armada, kegiatan harian, dan jangkauan secara kredibel.
- Bukan situs sekali pakai, melainkan *fondasi platform* yang akan menumbuhkan modul internal di atas arsitektur yang sama.

**Prinsip produk:**
1. **Trust melalui bukti, bukan klaim** — angka, foto nyata, legalitas, jangkauan.
2. **Premium melalui keterkendalian visual** — disiplin, ruang, presisi; bukan glossy berlebihan.
3. **Scalable by design** — setiap keputusan teknis menjaga jalur ke fase operasional.
4. **Maintainable for the next developer** — kode dan dokumentasi dibuat agar mudah dilanjutkan tim lain.

---

## 2. Business Goals

| Tujuan | Indikator Keberhasilan |
|---|---|
| Meningkatkan kredibilitas & kepercayaan calon klien B2B | Penurunan friksi "apakah perusahaan ini nyata & mampu?" — terukur dari kualitas lead masuk |
| Menghasilkan lead/permintaan penawaran | Volume submission form *Hubungi Kami* / *Minta Penawaran* per bulan |
| Memperkuat citra premium & enterprise | Konsistensi visual, performa (Core Web Vitals), feedback kualitatif klien |
| Menjadi fondasi platform internal masa depan | Arsitektur tervalidasi siap menampung CMS, HR, attendance tanpa rewrite |
| Memudahkan tim non-teknis mengelola konten | Staf dapat update layanan, berita, armada via CMS tanpa developer |

**Audience utama:**
- **Primary:** pengambil keputusan B2B (procurement, operations manager) yang menilai BMI sebagai partner logistik/transportasi/rental/trading.
- **Secondary:** kandidat (halaman Karir), partner, dan publik umum.
- **Internal (fase nanti):** admin konten, HR, dan manajemen operasional.

**Layanan inti yang dikomunikasikan:** Jasa Logistik · Transportasi · Rental Mobil · Perdagangan Umum.

---

## 3. Branding & Visual Direction

### 3.1 Identitas Inti

Logo BMI sudah menetapkan sistem yang kuat: **wordmark hitam tebal** (solid, mapan), **bintang emas dengan motion swoosh** (ambisi, premium, nuansa kebanggaan nasional), dan **elips merah + garis kecepatan** (gerak, jalan, logistik). Brand sudah memiliki sistem warna **Merah + Emas + Hitam**, dan emas inilah pembeda yang membuat BMI bisa tampil *premium*, bukan sekadar *industrial*.

### 3.2 Emosi yang Direkayasa (berurutan)

1. **Trust** — keandalan, kontrol operasional yang terlihat.
2. **Scale** — perusahaan besar, berlapis, mampu menangani volume.
3. **Momentum** — bergerak, modern, ambisius.

### 3.3 Arah Identitas: "Cinematic-Corporate"

Kerangka **clean-corporate yang disiplin** (grid presisi, ruang lega, struktur tenang = kompetensi) yang **dipunktuasi momen cinematic** (hero hangat, foto full-bleed, reveal statistik percaya diri = ambisi). Ketegangan dua hal inilah kepribadian BMI. Menghindari dua jebakan: terlalu *cinematic* (seperti film, kurang dipercaya) dan terlalu *industrial* (seperti vendor murah).

### 3.4 Color System

Mockup desain mengonfirmasi arah **basis gelap dengan aksen orange-amber hangat** (selaras golden-hour pada foto operasional), dengan merah & emas brand sebagai aksen identitas.

| Token | Hex (kalibrasi awal) | Peran |
|---|---|---|
| `brand/orange` (primary accent) | `#E8842B` | CTA utama, highlight headline, aksen aktif — *aksen kerja* dominan |
| `brand/red` | `#C41E2A` | Momen brand/logo, aksen energi terbatas |
| `brand/gold` | `#DDA017` | Statistik besar, divider tipis, sentuhan premium — sangat hemat |
| `ink/900` (base gelap) | `#141414` / `#0F1620` | Hero, section gelap cinematic, headline |
| `surface/white` | `#FAF8F4` | Basis terang, section konten — tenang & premium |
| `steel/slate` | `#39414F` | Kredibilitas industrial, surface sekunder |
| `neutral/*` | skala abu hangat | Teks, border, background sekunder |

**Aturan disiplin warna:** aksen (orange/red/gold) menutupi **±10% layar**, bukan 50%. Emas dipakai paling hemat (paling kuat pada angka statistik besar & garis pembatas tipis). Neutral + dark/white memikul ±90% permukaan.

### 3.5 Dark vs Light

**Basis terang + section cinematic gelap secara strategis.** Mayoritas situs warm-white (premium, ringan, mudah dijaga keterbacaannya); lalu masuk ke section **ink-black penuh** untuk hero, band statistik, dan CTA akhir — tempat emas/orange paling memukau. Dark mode total tidak diperlukan untuk situs marketing.

### 3.6 Tipografi

| Peran | Rekomendasi (open-source, bebas lisensi) |
|---|---|
| Display / headline | **Archivo** atau **Space Grotesk** (geometris, percaya diri, "ter-engineer") |
| Body / UI | **Inter** atau **Manrope** (netral, sangat terbaca) |
| Angka statistik besar | bobot tebal/ketat untuk menggemakan huruf BMI yang heavy |

Hindari font bulat/playful — kepercayaan logistik datang dari bentuk huruf persegi dan terstruktur.

### 3.7 Gaya Fotografi / Dokumentasi

Tetapkan **satu resep grading** dan terapkan ke *semua* foto: white balance hangat (selaras golden-hour hero), shadow sedikit diangkat, kontras terkendali, **rasio crop seragam**. Selalu tampilkan **manusia bekerja dengan APD terlihat** (helm, rompi = sinyal profesionalisme & keselamatan), gunakan **kedalaman berlapis** (depan-tengah-belakang), utamakan kesan *candid*.

**Shot list operasional:** wide hero, detail (clipboard, ban truk, segel kontainer), potret pekerja, barisan armada, aktivitas loading gudang, beberapa night/dusk shot untuk drama cinematic.

---

## 4. UI/UX Direction

### 4.1 Prinsip UX Enterprise

- **Clarity & scannability** — pengunjung paham "siapa, apa, sebesar apa, apakah nyata" dalam lima detik.
- **Mobile-first** — pengguna Indonesia sangat mobile; desain dari layar HP dulu.
- **Trust-first IA** — bukti (angka, foto, legalitas, jangkauan, klien) ditempatkan strategis.
- **Funnel ke konversi** — *Hubungi Kami / Minta Penawaran* terjangkau dari mana saja dalam dua tap.
- **Aksesibilitas** — kontras memadai, fokus keyboard, `prefers-reduced-motion`, alt text.

### 4.2 Sistem Komponen

Dibangun di atas **shadcn/ui** (komponen primitif yang dapat di-*own* di codebase, bukan dependency tertutup) + Tailwind. Token desain (warna, radius, spacing, tipografi) didefinisikan terpusat di konfigurasi Tailwind/CSS variables agar tema konsisten dan mudah diubah.

### 4.3 Gaya Interaksi & Animasi

Filosofi: **ter-engineer, bukan memantul.** Dengan **Framer Motion**:
- *Reveal-on-scroll* (fade + slide lembut), *stagger* pada anak elemen.
- Parallax halus pada hero / media.
- **Angka statistik count-up** sekali saat masuk viewport.
- Peta jangkauan yang "menggambar" rute.
- Transisi gambar & hover yang halus.

**Aturan teknis animasi:** easing custom cubic-bezier, durasi 0.4–0.8s (berbobot, bukan elastis), **hanya animasikan `transform` & `opacity`** (60fps), hormati `prefers-reduced-motion`, jangan berlebihan. Di situs premium, *sedikit animasi sangat halus* mengalahkan banyak animasi ramai.

### 4.4 Referensi

- Bahasa logistik enterprise: Maersk, DSV, Kuehne+Nagel.
- Standar poles premium modern: Stripe, Linear, Vercel.

---

## 5. Struktur Landing Page

Urutan dirancang agar terasa **operasional & hidup**, memuncak pada konversi. (Sesuai mockup yang disetujui.)

| # | Section | Tujuan | Konten kunci |
|---|---|---|---|
| 1 | **Navbar** | Navigasi + CTA persisten | Logo + nama PT, menu (Beranda, Tentang, Layanan, Galeri, Karir, Berita, Kontak), CTA *Hubungi Kami* |
| 2 | **Hero (cinematic, dark)** | Kesan pertama + 1 CTA utama | Eyebrow "LOGISTICS · TRANSPORTATION · RENTAL · TRADING", headline besar (aksen orange pada frasa kunci), subteks singkat, CTA primer + sekunder, **stats bar** (50+ Armada · 1000+ Pengiriman · 24/7 Operasional · 100+ Klien) |
| 3 | **Tentang Kami** | Membangun kepercayaan | Narasi singkat + foto + 4 nilai (Profesional, Aman, Terpercaya, Berkualitas) |
| 4 | **Layanan Kami (dark)** | Empat pilar bisnis | 4 kartu: Logistics, Transportation, Car Rental, General Trading — masing-masing "Pelajari Selengkapnya →" (link ke halaman detail) |
| 5 | **Dokumentasi Kegiatan Operasional** | Bukti "aktif beroperasi" | Galeri foto: Briefing Pagi, Proses Loading, Pengiriman, Warehouse Activity, Fleet Ready |
| 6 | **Armada Kami + Pencapaian** | Skala & keandalan | Showcase armada + panel statistik gelap (Tepat Waktu, Aman & Terjamin, Monitoring Real-time, Layanan Cepat) |
| 7 | **Peta Jangkauan** *(disarankan)* | Trust visual logistik | Peta Indonesia menyalakan rute/kota layanan |
| 8 | **Klien & Partner** *(jika tersedia)* | Social proof | Deretan logo |
| 9 | **Sertifikasi & Legalitas** *(disarankan)* | Kredibilitas formal | Badan hukum (PT), izin, ISO bila ada |
| 10 | **Berita / Update** | Kesan "aktif", bukan mati | 3 berita terbaru |
| 11 | **CTA Penawaran / Kontak** | Konversi | Form *Minta Penawaran* + kontak |
| 12 | **Footer** | Info perusahaan | Alamat, kontak, sitemap, sosial, legal |

**Halaman lain (multi-page):** Tentang, Layanan (+ 4 detail), Galeri, Karir, Berita (+ detail), Kontak.

---

## 6. Analisis CMS Dashboard

### 6.1 Filosofi

CMS dirancang **kecil & terfokus untuk sekarang**, tetapi dengan **RBAC dan audit log sejak hari pertama**, karena akan tumbuh menjadi platform internal. Pemisahan tegas: **"manajemen konten" (situs publik)** vs **"manajemen operasional" (HR/attendance, fase nanti)** — idealnya app berbeda yang berbagi lapisan auth, bukan satu app raksasa.

### 6.2 Modul CMS (versi ini)

| Modul | Fungsi |
|---|---|
| **Dashboard** | Ringkasan: jumlah lead baru, konten terbaru, status sistem |
| **Layanan** | CRUD konten 4 pilar layanan + halaman detail |
| **Armada (Fleet)** | CRUD kendaraan: tipe, kapasitas, foto, status |
| **Galeri / Dokumentasi** | Kelola foto kegiatan operasional + kategori |
| **Berita** | CRUD artikel + draft/publish + featured |
| **Tim** | CRUD anggota tim / struktur |
| **Klien & Partner** | CRUD logo & nama |
| **Leads / Penawaran** | Lihat & kelola submission form (read + status, **tanpa** kirim/forward otomatis) |
| **Media Library** | Manajemen aset terpusat |
| **Pengaturan & Users** | Profil perusahaan, manajemen user, peran (RBAC) |

### 6.3 Strategi Build CMS

Pilihan (akan difinalisasi di Phase 3):
- **Custom admin di Next.js** (App Router route group `(admin)`) — kontrol penuh, selaras stack, paling mudah berevolusi ke modul internal. **Rekomendasi default** karena CMS akan menyatu dengan platform.
- **Payload CMS** — TypeScript-native, berjalan berdampingan Next.js, memakai PostgreSQL, memberi admin UI + API otomatis. Kandidat kuat bila ingin mempercepat.
- **Sanity** — editor sangat baik untuk staf non-teknis, tapi hosted/terpisah.

### 6.4 Evolusi Masa Depan

CMS → menambah modul **Employee Management** → **Attendance** → **Operational Analytics**. Fondasi yang harus benar sekarang: **RBAC, audit log, struktur data extensible, dan auth terpusat.**

---

## 7. Analisis Kebutuhan Sistem

### 7.1 Functional Requirements (versi ini)

- Menyajikan halaman publik (landing + multi-page) dengan SEO & performa tinggi.
- Form *Hubungi Kami / Minta Penawaran* → tersimpan sebagai lead + notifikasi.
- CMS terautentikasi untuk mengelola seluruh konten publik.
- Media management (upload, optimasi, penyimpanan).
- RBAC untuk membatasi akses admin.

### 7.2 Non-Functional Requirements

| Aspek | Target |
|---|---|
| **Performa** | Core Web Vitals "Good"; LCP < 2.5s pada koneksi mobile Indonesia |
| **SEO** | SSR/SSG/ISR, metadata lengkap, sitemap, schema.org Organization/LocalBusiness |
| **Aksesibilitas** | WCAG AA sebisa mungkin |
| **Keamanan** | HTTPS, security headers, proteksi form, secrets server-side, RBAC |
| **Skalabilitas** | Arsitektur siap modul operasional tanpa rewrite frontend |
| **Maintainability** | Separation of concerns, TypeScript strict, dokumentasi dev |
| **Observability** | Error tracking & logging (fase production readiness) |

### 7.3 Constraint & Asumsi

- Aset nyata tersedia (truk, foto operasional, gudang, logo) — keunggulan vs kompetitor berbasis stock photo.
- Pengguna mayoritas mobile.
- Data sensitif biometrik (fase nanti) tunduk pada UU PDP — *bukan nasihat hukum*, tetapi diperlakukan sebagai constraint arsitektur.

---

## 8. Analisis Frontend Architecture

### 8.1 Stack & Justifikasi

| Teknologi | Alasan |
|---|---|
| **Next.js App Router** | SSR/SSG/ISR (SEO + first paint), optimasi gambar (`next/image`) krusial untuk situs berat foto, satu codebase |
| **TypeScript (strict)** | Kontrak tipe end-to-end, mengurangi bug, mempermudah developer baru |
| **Tailwind CSS** | Konsistensi desain via token, kecepatan styling, tree-shaking |
| **shadcn/ui** | Komponen yang di-*own* di repo (bukan black box), mudah dikustomisasi premium |
| **Framer Motion** | Animasi cinematic terkendali |

### 8.2 Model App Router

- **Server Components sebagai default** — fetch data di server, nol JS ke browser.
- **Client Components hanya untuk interaksi** (`"use client"`) — animasi, form, state lokal.
- **Server Actions** untuk mutasi (submit form, tulis CMS).
- **Route Handlers** (`app/api`) untuk API publik/webhook/konsumen eksternal.
- **Validasi di batas masuk dengan Zod**; Prisma tidak pernah menyentuh client.

### 8.3 Pembagian Tanggung Jawab (Layering)

```
Client (browser)        → UI · interaksi · Framer Motion
   ↓
Next.js App Router      → Server Components + Server Actions
   ↓
Service layer           → logika bisnis + validasi (Zod)
   ↓
Repository layer        → akses data
   ↓
Prisma ORM → PostgreSQL → penyimpanan
```

> Komponen **tidak pernah** query DB langsung. Akses data dipusatkan di service/repository layer. Ini kunci maintainability dan kemudahan onboarding.

### 8.4 Reusable Component Strategy

- `components/ui/` — primitif (Button, Card, Input) — *dumb*, tanpa logika bisnis.
- `components/sections/` — section landing (Hero, ServicesGrid, OperationalGallery) — komposisi dari primitif.
- `features/*/components/` — komponen spesifik domain.
- **Feature-based architecture**: setiap domain (content, leads, fleet) berdiri sebagai modul mandiri berisi komponen + hooks + types + logic-nya.

---

## 9. Analisis Backend Architecture

### 9.1 Strategi Inti

Next.js diperlakukan sebagai **web + content layer**, bukan backend untuk kerja berat. **Seam (sambungan) disiapkan sejak awal** agar service operasional/ML terpisah dapat ditambahkan nanti **tanpa menulis ulang frontend**.

```
SEKARANG: Next.js Fullstack (web + CMS + content API) → PostgreSQL

FASE NANTI (terpisah, berbagi PostgreSQL):
  Ops Service (NestJS/Express)        → HR, attendance, analytics berat
  ML Service (FastAPI / Python)       → face recognition (ekosistem ML matang)
```

**Alasan:** serverless function Next.js punya timeout & cold start, tidak ideal untuk inferensi ML, batch analytics, cron, queue, atau real-time. Kerja berat hidup di service-nya sendiri.

### 9.2 Lapisan Backend Internal

- **Service layer** — orkestrasi logika bisnis (mis. `LeadService.create()`).
- **Repository layer** — abstraksi akses data via Prisma (mis. `LeadRepository`).
- **Validation** — Zod schema di setiap batas input.
- **Auth & RBAC** — middleware + guard di server.
- **Audit log** — mencatat aksi penting pada CMS sejak awal.

### 9.3 Tradeoff yang Diterima

- Monorepo (Turborepo) **tidak** dipakai sekarang (over-engineering untuk satu app). Tetapi struktur internal dirancang agar pemecahan ke monorepo nanti (web + admin + ops + shared) terasa natural.

---

## 10. Perencanaan Database

### 10.1 Pilihan: PostgreSQL (terkelola)

Alasan kuat: data HR/attendance sangat relasional; **pgvector** untuk embedding face recognition (similarity search native — MySQL tidak bisa bersih); **TimescaleDB** + window functions untuk analytics; integrasi mulus dengan Prisma. Hosting: **Neon** (serverless, branching) atau **Supabase** (Postgres + auth + storage), region **Singapore/Jakarta** untuk latensi.

### 10.2 Skema Awal (versi ini) — sketsa Prisma

```prisma
// ----- Konten Publik -----
model Service {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  category    ServiceCategory
  summary     String
  body        String   // rich text / MDX
  iconKey     String?
  coverId     String?
  cover       MediaAsset? @relation(fields: [coverId], references: [id])
  order       Int      @default(0)
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum ServiceCategory { LOGISTICS TRANSPORTATION CAR_RENTAL GENERAL_TRADING }

model FleetVehicle {
  id          String   @id @default(cuid())
  name        String
  type        String
  capacity    String?
  description String?
  status      FleetStatus @default(ACTIVE)
  photos      MediaAsset[]
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum FleetStatus { ACTIVE MAINTENANCE RETIRED }

model NewsPost {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  excerpt     String
  body        String
  coverId     String?
  cover       MediaAsset? @relation(fields: [coverId], references: [id])
  status      PostStatus @default(DRAFT)
  publishedAt DateTime?
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum PostStatus { DRAFT PUBLISHED ARCHIVED }

model GalleryItem {
  id        String   @id @default(cuid())
  title     String
  category  String   // Briefing, Loading, Pengiriman, Warehouse, Fleet
  mediaId   String
  media     MediaAsset @relation(fields: [mediaId], references: [id])
  order     Int      @default(0)
  createdAt DateTime @default(now())
}

model TeamMember {
  id        String   @id @default(cuid())
  name      String
  role      String
  photoId   String?
  photo     MediaAsset? @relation(fields: [photoId], references: [id])
  order     Int      @default(0)
}

model ClientLogo {
  id        String   @id @default(cuid())
  name      String
  logoId    String
  logo      MediaAsset @relation(fields: [logoId], references: [id])
  url       String?
  order     Int      @default(0)
}

// ----- Leads -----
model Lead {
  id        String   @id @default(cuid())
  name      String
  company   String?
  email     String
  phone     String?
  service   ServiceCategory?
  message   String
  status    LeadStatus @default(NEW)
  source    String?  // utm / halaman asal
  createdAt DateTime @default(now())
}

enum LeadStatus { NEW CONTACTED QUALIFIED CLOSED }

// ----- Media -----
model MediaAsset {
  id        String   @id @default(cuid())
  key       String   // object storage key
  url       String
  alt       String?
  width     Int?
  height    Int?
  mimeType  String
  createdAt DateTime @default(now())
}

// ----- Auth & RBAC -----
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  roleId    String
  role      Role     @relation(fields: [roleId], references: [id])
  posts     NewsPost[]
  createdAt DateTime @default(now())
}

model Role {
  id          String  @id @default(cuid())
  name        String  @unique   // SUPER_ADMIN, EDITOR, VIEWER
  permissions Json               // daftar permission granular
  users       User[]
}

model AuditLog {
  id        String   @id @default(cuid())
  actorId   String
  action    String   // CREATE/UPDATE/DELETE + entity
  entity    String
  entityId  String?
  meta      Json?
  createdAt DateTime @default(now())
}
```

### 10.3 Model Masa Depan (dirancang, tidak diimplementasikan)

```prisma
// FASE NANTI — attendance & biometrik
// model Employee { ... }
// model Shift { ... }
// model AttendanceRecord { employeeId, checkIn, checkOut, method, ... }
// model FaceEmbedding { employeeId, vector  Unsupported("vector(512)") }  // pgvector
```

> Embedding wajah disimpan sebagai **vektor terenkripsi**, **bukan foto mentah**. Detail di Bagian 14.

---

## 11. Perencanaan API

### 11.1 Konvensi

- **Mutasi internal (CMS, form):** Server Actions (type-safe, sederhana).
- **API publik / konsumsi eksternal / webhook:** Route Handlers `app/api/v1/*` — REST, ber-versi (`/v1`).
- **Validasi:** Zod di setiap endpoint; error format konsisten `{ error, code, details }`.
- **Response sukses:** `{ data, meta }` dengan pagination `{ page, pageSize, total }`.

### 11.2 Contoh Endpoint (ilustratif)

| Method | Path | Fungsi | Auth |
|---|---|---|---|
| `GET` | `/api/v1/services` | List layanan published | Publik |
| `GET` | `/api/v1/news` | List berita (paginated) | Publik |
| `POST` | `/api/v1/leads` | Buat lead dari form | Publik + rate limit + Turnstile |
| `GET` | `/api/v1/admin/leads` | List leads | Admin (RBAC) |
| `PATCH` | `/api/v1/admin/leads/:id` | Update status lead | Admin |
| `POST` | `/api/v1/admin/media` | Upload media (signed URL) | Admin |

### 11.3 Dokumentasi API

OpenAPI/Swagger digenerate (atau ditulis) saat backend stabil (Phase 3+). Untuk sekarang, kontrak didefinisikan via tipe TypeScript + Zod sebagai *single source of truth*.

---

## 12. Authentication Strategy

### 12.1 Versi Ini (admin CMS)

- **Auth.js (NextAuth)** atau **Lucia** untuk session-based auth. Credential admin + (opsional) email magic link.
- **RBAC**: `Role` → `permissions` granular; guard di middleware (route group `(admin)`) dan di service layer.
- **MFA** untuk akun admin (disarankan saat production readiness).
- **Audit log** untuk aksi sensitif.
- **Keamanan kredensial:** password di-hash (argon2/bcrypt), tidak ada secret di bundle client, session aman (httpOnly, secure, sameSite).

### 12.2 Masa Depan

Auth terpusat (mis. dapat dijadikan **Identity layer** bersama) agar Ops Service & ML Service berbagi sesi/izin. Pertimbangkan SSO/OAuth untuk login karyawan saat modul HR hadir. **Tidak membuat akun atas nama user**; flow biometrik adalah verifikasi, bukan pengganti auth admin.

---

## 13. Media Management Strategy

- **Penyimpanan:** object storage — **Supabase Storage** atau **Cloudflare R2** + CDN (bukan disimpan di DB).
- **Upload:** via signed URL dari server; validasi tipe & ukuran; tidak menerima file dari sumber tak tepercaya tanpa pemindaian.
- **Optimasi:** `next/image` (resize, format modern AVIF/WebP, lazy-load) — kritis untuk situs berat foto.
- **Metadata:** tabel `MediaAsset` menyimpan key, url, alt, dimensi, mime.
- **Grading konsisten:** pipeline editing foto operasional mengikuti resep grading (Bagian 3.7) sebelum upload.
- **Konvensi penamaan & alt text** wajib untuk SEO & aksesibilitas.

---

## 14. Future Attendance Scalability

> **Dirancang, TIDAK diimplementasikan sekarang.** Diskusi arsitektur untuk memastikan fondasi tidak menutup pintu.

### 14.1 Arsitektur Target

```
Web/CMS (Next.js)  ──┐
                     ├── PostgreSQL (+ pgvector)  ←─ shared data layer
Ops Service ─────────┤        ▲
(HR, attendance,     │        │
 analytics)          │   ML Service (FastAPI/Python + OpenCV/face model)
                     └────────┘   inferensi embedding wajah
```

### 14.2 Alur Face Recognition (konsep)

1. **Enrollment:** wajah karyawan → ML service menghasilkan **embedding (vektor)** → disimpan terenkripsi di `FaceEmbedding` (pgvector).
2. **Absensi:** capture → embedding → **similarity search** (cosine) terhadap karyawan terdaftar → cocok di atas threshold → catat `AttendanceRecord`.
3. **Tidak menyimpan foto wajah mentah** lebih lama dari perlu; simpan embedding, bukan gambar.

### 14.3 Pertimbangan Skalabilitas AI

- ML service terpisah (Python) karena ekosistem & performa inferensi; dapat di-scale horizontal terpisah dari web.
- Queue untuk proses batch/berat; caching embedding aktif.
- Threshold & anti-spoofing (liveness) sebagai modul terpisah.

### 14.4 Privasi & Kepatuhan

Data biometrik = **data pribadi spesifik** (UU PDP). Implikasi arsitektur: **enkripsi at-rest & in-transit, kontrol akses ketat, audit trail, consent eksplisit karyawan, data residency** (hosting region Indonesia/regional, terpisah dari situs marketing). *Catatan: ini bukan nasihat hukum; perlu konsultasi hukum saat fase ini tiba.* Pemisahan stack (web vs ops/ML) yang dirancang sejak awal adalah yang membuat kepatuhan ini bersih nanti.

---

## 15. Production Readiness Strategy

> *Production readiness = siap deploy secara arsitektur & development, meski belum langsung di-deploy.*

| Area | Strategi |
|---|---|
| **Environment config** | `.env` per environment (dev/staging/prod), `.env.example` lengkap, validasi env saat boot (Zod) |
| **Security review** | HTTPS, security headers (HSTS, CSP, X-Frame-Options), proteksi form (rate limit + **Turnstile**), **RLS jika Supabase**, secrets hanya server-side, RBAC + MFA admin, dependency audit (Dependabot) |
| **Performa** | Performance budget, Core Web Vitals, image optimization, code splitting, caching/ISR |
| **Observability** | Error tracking (**Sentry**), structured logging, uptime monitoring |
| **CI/CD** | Pipeline: lint → typecheck → test → build → preview deploy; migrasi Prisma terkontrol |
| **Hosting** | Frontend: **Vercel/Cloudflare**; DB: **Neon/Supabase** (region Singapore); media: object storage + CDN |
| **Backup & DR** | Backup DB terjadwal; strategi restore terdokumentasi |
| **SEO/analytics** | Sitemap, robots, schema.org, analytics privacy-friendly |
| **Deployment docs** | Runbook deploy, rollback, env setup (dibuat saat stabil) |

---

## Lampiran A — Struktur Folder Project

Struktur **feature-based**, scalable, dan enterprise-oriented. Disusun agar mudah dipecah ke monorepo di masa depan.

```
bmi-platform/
├─ app/                              # App Router (routing + halaman)
│  ├─ (marketing)/                   # ZONA PUBLIK (route group)
│  │  ├─ page.tsx                    # homepage / landing
│  │  ├─ tentang/page.tsx
│  │  ├─ layanan/
│  │  │  ├─ page.tsx
│  │  │  └─ [slug]/page.tsx          # detail layanan
│  │  ├─ galeri/page.tsx
│  │  ├─ karir/page.tsx
│  │  ├─ berita/
│  │  │  ├─ page.tsx
│  │  │  └─ [slug]/page.tsx
│  │  ├─ kontak/page.tsx
│  │  └─ layout.tsx                  # layout publik (navbar/footer)
│  ├─ (admin)/                       # ZONA TERLINDUNGI (route group)
│  │  ├─ dashboard/page.tsx
│  │  ├─ layanan/...
│  │  ├─ armada/...
│  │  ├─ galeri/...
│  │  ├─ berita/...
│  │  ├─ leads/...
│  │  ├─ media/...
│  │  ├─ users/...
│  │  └─ layout.tsx                  # layout admin + guard auth
│  ├─ api/                           # Route Handlers
│  │  └─ v1/
│  │     ├─ services/route.ts
│  │     ├─ news/route.ts
│  │     ├─ leads/route.ts
│  │     └─ admin/...
│  ├─ layout.tsx                     # root layout
│  ├─ globals.css
│  ├─ sitemap.ts
│  └─ robots.ts
│
├─ components/
│  ├─ ui/                            # primitif (shadcn/ui) — dumb
│  │  ├─ button.tsx
│  │  ├─ card.tsx
│  │  └─ ...
│  ├─ sections/                      # section landing
│  │  ├─ hero.tsx
│  │  ├─ services-grid.tsx
│  │  ├─ operational-gallery.tsx
│  │  ├─ fleet-showcase.tsx
│  │  ├─ stats-bar.tsx
│  │  └─ cta-quote.tsx
│  ├─ layout/                        # navbar, footer, admin-shell
│  └─ motion/                        # wrapper Framer Motion reusable
│
├─ features/                         # MODUL PER DOMAIN
│  ├─ content/                       # layanan, berita, galeri, tim
│  │  ├─ components/
│  │  ├─ hooks/
│  │  ├─ types.ts
│  │  └─ index.ts
│  ├─ leads/
│  ├─ fleet/
│  └─ media/
│
├─ server/                           # KODE SERVER-ONLY
│  ├─ services/                      # logika bisnis
│  │  ├─ lead.service.ts
│  │  ├─ content.service.ts
│  │  └─ media.service.ts
│  ├─ repositories/                  # akses data via Prisma
│  │  ├─ lead.repository.ts
│  │  └─ content.repository.ts
│  ├─ auth/                          # autentikasi + RBAC + guard
│  └─ audit/                         # audit log
│
├─ lib/
│  ├─ db.ts                          # Prisma client (singleton)
│  ├─ validation/                    # skema Zod
│  ├─ utils/                         # helper umum
│  ├─ config/                        # env + konstanta (env divalidasi Zod)
│  └─ constants.ts
│
├─ hooks/                            # React hooks global
├─ types/                            # shared types (cross-feature)
├─ mock/                             # MOCK DATA (Phase 2)
│  ├─ services.mock.ts
│  ├─ fleet.mock.ts
│  ├─ news.mock.ts
│  └─ gallery.mock.ts
│
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts
│
├─ public/                           # aset statis
│  ├─ images/
│  └─ icons/
│
├─ styles/                           # token tema bila perlu di luar Tailwind
│
├─ docs/                             # DOKUMENTASI DEVELOPMENT
│  ├─ ARCHITECTURE.md
│  ├─ CONVENTIONS.md
│  ├─ adr/                           # Architecture Decision Records
│  └─ onboarding.md
│
├─ .env.example
├─ .eslintrc / eslint.config.mjs
├─ prettier.config.mjs
├─ tailwind.config.ts
├─ tsconfig.json
├─ CONTRIBUTING.md
└─ README.md
```

**Prinsip kunci:**
- `components` (tampilan) vs `features` (domain) vs `server` (logika+data) dipisah tegas.
- `mock/` mencerminkan bentuk data API masa depan, sehingga swap mock → API mulus (lihat Lampiran C).
- Zona `(marketing)` & `(admin)` terpisah sejak awal.

---

## Lampiran B — Strategi Dokumentasi

### B.1 Dokumentasi Selama Development (fokus sekarang)

| Dokumen | Isi |
|---|---|
| `README.md` | Cara setup, run, struktur singkat, perintah utama |
| `docs/ARCHITECTURE.md` | Gambaran arsitektur, layering, alur data, seam masa depan |
| `docs/CONVENTIONS.md` | Coding standards & naming conventions |
| `docs/adr/*` | **Architecture Decision Records** — catat keputusan penting + alasan + tradeoff |
| `docs/onboarding.md` | Panduan developer baru: cara mulai, di mana mencari apa |
| `CONTRIBUTING.md` | Alur kontribusi, branch strategy, commit convention, PR checklist |
| `.env.example` | Semua env var yang dibutuhkan |

### B.2 Coding Standards & Conventions

- **TypeScript strict mode**; hindari `any`.
- **Naming:** komponen `PascalCase`, file komponen `kebab-case.tsx`, fungsi/variabel `camelCase`, konstanta `UPPER_SNAKE_CASE`, tipe/interface `PascalCase`.
- **Folder:** `kebab-case`; modul domain di `features/<domain>`.
- **Commit:** Conventional Commits (`feat:`, `fix:`, `refactor:`...).
- **Linting/format:** ESLint + Prettier wajib (pre-commit hook via Husky/lint-staged disarankan).
- **Komponen:** primitif tanpa logika bisnis; logika di hooks/services.

### B.3 Dokumentasi Final (dibuat saat stabil)

API documentation (OpenAPI), deployment runbook, architecture documentation final, dan user guide CMS — **baru dibuat ketika arsitektur & fitur sudah stabil** (Phase 4–6), sesuai arahan.

---

## Lampiran C — Mock Data & Placeholder Strategy

Untuk **Phase 2 (Frontend First)**, seluruh konten memakai mock/dummy yang **tetap terasa premium, enterprise, dan logistics-focused**.

**Prinsip:**
1. **Mock mencerminkan bentuk data API masa depan** — letakkan di `mock/*.mock.ts` dengan tipe yang sama persis dengan tipe domain (`features/*/types.ts`). Saat backend siap, ganti sumber data tanpa mengubah komponen.
2. **Konten dummy realistis & kontekstual** — nama layanan nyata (Logistik, Transportasi, Rental Mobil, General Trading), statistik masuk akal (50+ Armada, 1000+ Pengiriman, 100+ Klien, 24/7), nama kegiatan operasional (Briefing Pagi, Proses Loading, Pengiriman, Warehouse Activity, Fleet Ready).
3. **Placeholder image** — gunakan foto operasional asli yang sudah ada (di-grading), atau placeholder bertema logistik dengan rasio crop final; **jangan** placeholder generik abu-abu yang merusak kesan premium.
4. **Satu adaptor data** — komponen memanggil fungsi seperti `getServices()` yang di Phase 2 mengembalikan mock, di Phase 3 mengembalikan data Prisma. Swap satu titik.

---

## Lampiran D — Development Workflow (6 Phase)

| Phase | Fokus | Output utama |
|---|---|---|
| **1. Planning & Architecture** | Analisis kebutuhan, branding, UI/UX, struktur landing, arsitektur dashboard, folder, desain DB, scalability | **Dokumen ini (PRD)** |
| **2. Frontend First** | Landing page + multi-page dengan **mock data**, aesthetic, cinematic visuals, operational storytelling, animasi premium, responsive | Frontend yang dapat diiterasi visual hingga sesuai konsep |
| **3. Backend & CMS Integration** | Backend logic, database, auth, CMS dashboard, CRUD, media management, API/data layer | Platform fullstack terhubung |
| **4. Testing & Stabilization** | Test auth, dashboard, CMS workflow, responsive, upload media, performa; perbaikan bug; maintainability | Sistem stabil |
| **5. Future Attendance Planning** | Brainstorming arsitektur absensi, alur face recognition, OpenCV/service architecture, scalability AI, persiapan modul (**tanpa implementasi**) | Blueprint attendance |
| **6. Production Readiness** | Analisis kesiapan, optimasi, security review, deployment strategy, env config, finalisasi dokumentasi | Siap deploy secara arsitektur |

> **Aturan emas workflow:** Phase 2 **wajib** selesai & disetujui secara visual sebelum Phase 3. Frontend memimpin; backend mengikuti struktur frontend secara profesional & scalable. Face recognition **tidak** diimplementasikan sebelum company profile stabil.

---

### Catatan Penutup

PRD ini adalah **draft hidup** (versi 0.1). Dua langkah teknis berikutnya yang paling bernilai untuk memulai Phase 2: **(1)** finalisasi token desain (warna/tipografi) ke `tailwind.config.ts`, dan **(2)** menyusun `mock/*.mock.ts` + tipe domain agar frontend bisa langsung dibangun di atas data yang berbentuk sama dengan API masa depan. Skema Prisma di Bagian 10 menjadi acuan bentuk tipe tersebut sejak sekarang, meski database baru dibangun di Phase 3.
