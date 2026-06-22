# Launch Checklist — BMI Company Profile (Vercel + Domain)

Panduan go-live komersial. Urutan disarankan: **konten → aktivasi hardening →
provisioning → domain → verifikasi**. Centang tiap item sebelum publik.

> Status kode: hardening situs publik sudah TERPASANG (security headers + CSP,
> rate-limit form, Turnstile captcha) — semuanya **fail-open/opsional**, jadi
> proteksi penuh AKTIF begitu key produksi di-set (lihat §2).

---

## 1. Konten — ganti semua placeholder → asli (via CMS `/admin`)
Situs komersial tidak boleh menampilkan data fiktif. Isi/verifikasi via
**Pengaturan** & modul terkait:

- [ ] **Statistik** (`/admin/stats`) — angka asli & akurat (armada, pengiriman, klien). Tahun pengalaman dihitung otomatis dari `foundedYear`.
- [ ] **Identitas & Kontak** (`/admin/settings` → Identitas / Kontak & Lokasi) — nama legal, `foundedYear` (saat ini 2006), alamat, telepon, WhatsApp, email **asli**.
- [ ] **Privasi & Syarat-Ketentuan** (`/admin/settings` → Legal) — ganti copy placeholder ("Versi awal — akan dilengkapi tim legal") dengan **copy legal asli/ditinjau**.
- [ ] **Client/Mitra** (`/admin/clients`) — isi klien **asli (dengan izin) + logo asli**, ATAU kosongkan agar section tak menampilkan placeholder fiktif. (Tanpa logo → tampil monogram placeholder.)
- [ ] **Testimoni** (`/admin/settings` → Testimoni) — testimoni **asli**, ATAU kosongkan.
- [ ] **Cerita & Visi/Misi/Nilai** (`/admin/settings`) — tinjau agar sesuai narasi resmi.
- [ ] **Layanan** (`/admin/services`) — deskripsi & status publish benar.
- [ ] **Foto** Galeri/Tim/Armada/Berita — ganti placeholder dengan dokumentasi asli (boleh bertahap setelah live).
- [ ] Hapus data uji bila ada (mis. lead "Uji Hardening" di `/admin/leads`).

## 2. Aktivasi hardening (set key produksi)
- [ ] **Rotasi password admin** (kredensial dev pernah ter-expose). Pakai `npm run admin:setup-link -- --email=...` untuk set ulang, atau via `/admin/users`.
- [ ] **`AUTH_SECRET`** & **`MFA_ENCRYPTION_KEY`** produksi BARU (jangan reuse dev). Generate acak kuat.
- [ ] **Upstash Redis** (rate-limit aktif): set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`. Tanpa ini, rate-limit fail-open (tak aktif).
- [ ] **Cloudflare Turnstile** (captcha aktif): buat widget di dashboard Cloudflare → set `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. Tanpa ini, captcha dilewati.
- [ ] (Opsional) **Sentry**: `npm i @sentry/nextjs`, set DSN untuk monitoring error produksi.

## 3. Provisioning
- [ ] **Neon — branch produksi**: ambil `DATABASE_URL` (pooled) + `DIRECT_DATABASE_URL` (direct, untuk migrate).
- [ ] **Cloudinary produksi**: `CLOUDINARY_CLOUD_NAME` + `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET`.
- [ ] **Vercel**: import repo `Renkaslana/CompanyProfile`, set SEMUA env produksi (lihat `.env.example`), `AUTH_URL` = URL domain final.
- [ ] **Migrasi & seed** (sekali, terhadap DB prod): `npm run db:deploy` lalu `npm run db:seed` (seed idempotent; isi konten asli via CMS setelahnya). ⚠️ `db:seed` me-reset SiteSettings ke konstanta — jalankan SEBELUM mengisi konten CMS produksi.

## 4. Domain
- [ ] Beli **`.com`** (primer, langsung aktif). `.co.id` opsional/menyusul (butuh dokumen PT — NPWP/akta).
- [ ] Arahkan **DNS ke Vercel** (A/CNAME sesuai instruksi Vercel) + tambahkan domain di project Vercel.
- [ ] Bila beli dua domain: pilih **1 canonical** + **301 redirect** domain kedua.
- [ ] Set `AUTH_URL` (Vercel env) = origin domain final, lalu redeploy.

## 5. Verifikasi pasca-deploy
- [ ] Buka domain → halaman publik tampil, gambar/font OK, **tidak ada CSP violation** di console (CSP produksi lebih ketat dari dev — tanpa `unsafe-eval`).
- [ ] Cek header keamanan ada (DevTools → Network → Response Headers: `Content-Security-Policy`, `Strict-Transport-Security`, dll.).
- [ ] **Form kontak**: kirim uji → masuk ke `/admin/leads`; widget Turnstile tampil (bila key di-set); rate-limit aktif (coba >3x cepat → ditolak sementara).
- [ ] Login `/admin` dengan kredensial baru; rotasi berhasil.
- [ ] `sitemap.xml`, `robots.txt`, metadata, favicon tampil benar.

## Ditunda (boleh setelah live)
Automated tests · Fleet CMS · MFA UI · append-only audit · kompresi gambar
`public/` · GA4 analytics (slot dashboard sudah siap) · gambar in-body artikel.

---
Referensi: [`README.md`](../README.md) · [`DOCS/DEPLOYMENT.md`](DEPLOYMENT.md) ·
[`DOCS/SECURITY.md`](SECURITY.md) · `.env.example`.
