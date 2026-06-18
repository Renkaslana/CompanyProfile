# Screenshots untuk README

Folder ini menyimpan gambar yang dirujuk di [`README.md`](../../README.md) bagian
**Preview / Tampilan**. README sudah otomatis menampilkannya begitu file di bawah
ada di folder ini — tidak perlu mengubah README.

## File yang diharapkan

| Nama file (wajib persis) | Halaman | URL |
|---|---|---|
| `landing.png` | Landing page publik | `/` |
| `berita-list.png` | Halaman Berita publik (daftar berita) | `/berita` |
| `admin-dashboard.png` | Admin Dashboard (Action Center) | `/admin` |

> Opsional: tambah `admin-settings.png` (`/admin/settings`) atau `admin-galeri.png`
> dan tautkan di README bila perlu.

## Cara mengambil (±2 menit)

1. Jalankan aplikasi: `npm run dev`, buka `http://localhost:3000`.
2. Login admin di `/admin` untuk halaman bertanda `/admin/*`.
3. Set lebar jendela browser ~1440px (tampilan desktop penuh — sidebar terlihat).
4. Ambil screenshot tiap halaman:
   - **Windows:** `Win + Shift + S` (Snipping Tool), atau ekstensi "full page screenshot".
   - **Chrome DevTools (rekomendasi, full page):** buka DevTools (`F12`) →
     `Ctrl + Shift + P` → ketik **"Capture full size screenshot"** → Enter.
5. Simpan dengan nama persis seperti tabel di atas (format **`.png`**) ke folder ini
   (`DOCS/screenshots/`).
6. Commit: `git add DOCS/screenshots && git commit -m "docs: add app screenshots"`.

## Tips

- Untuk hasil rapi, pakai data contoh yang sudah ada (hasil `npm run db:seed`).
- Jika ingin rasio konsisten, gunakan lebar 1440px dan biarkan tinggi penuh
  (full-page) agar seluruh section dashboard ikut tertangkap.
- Boleh menambah screenshot lain (mis. `admin-galeri.png`) dan menautkannya di
  README bila perlu.
