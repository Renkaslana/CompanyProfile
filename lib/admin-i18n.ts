/**
 * Indonesian labels + role descriptions for the admin UI (UX pass).
 *
 * Centralized so non-technical admins see consistent terminology across the
 * dashboard, sidebar, audit log, and form helper text. Keep this file
 * framework-agnostic (no `server-only`, no Prisma imports) — it's loaded from
 * both server and client components.
 */
import type { RoleName } from "@/server/auth/permissions";

/** Friendly Indonesian label for each role. */
export const ROLE_LABEL: Record<RoleName, string> = {
  SUPER_ADMIN: "Administrator",
  EDITOR: "Editor Konten",
  SUPPORT_AGENT: "Agen Support",
  VIEWER: "Pembaca",
};

/** One-sentence description shown on the dashboard. */
export const ROLE_DESCRIPTION: Record<RoleName, string> = {
  SUPER_ADMIN:
    "Akses penuh: kelola konten, media, pengaturan situs, pengguna admin, dan riwayat aktivitas.",
  EDITOR:
    "Kelola konten (Layanan, Berita, Galeri, Tim, Klien), media, dan lead. Tidak dapat mengubah pengguna atau pengaturan situs.",
  SUPPORT_AGENT:
    "Kelola FAQ, tiket support, dan lead. Hanya melihat konten — tidak dapat mengedit.",
  VIEWER: "Hanya membaca konten dan dashboard. Tidak dapat mengedit apa pun.",
};

/**
 * Map of audit `entity` strings (used by writeAudit) → human Indonesian label.
 * Keep in sync with the literal strings in `server/services/*.service.ts`.
 */
export const ENTITY_LABEL: Record<string, string> = {
  User: "Pengguna",
  Auth: "Autentikasi",
  Service: "Layanan",
  NewsPost: "Berita",
  GalleryItem: "Galeri",
  TeamMember: "Anggota tim",
  ClientLogo: "Klien",
  Stat: "Statistik",
  SiteSettings: "Pengaturan situs",
  MediaAsset: "Media",
  Lead: "Permintaan calon pelanggan",
};

/**
 * Map of audit `action` enum values → human Indonesian description.
 * Used when an audit row's `meta` doesn't already carry a readable summary.
 */
export const ACTION_LABEL: Record<string, string> = {
  // Authentication
  LOGIN_SUCCESS: "Login berhasil",
  LOGIN_FAIL: "Login gagal",
  LOGIN_LOCKOUT: "Akun dikunci sementara",
  LOGOUT: "Logout",

  // Password lifecycle
  PASSWORD_SET: "Mengatur kata sandi",
  PASSWORD_RESET: "Mereset kata sandi",
  PASSWORD_RESET_REQUEST: "Meminta reset kata sandi",

  // MFA
  MFA_ENABLE: "Mengaktifkan MFA",
  MFA_DISABLE: "Menonaktifkan MFA",

  // User management
  USER_CREATE: "Membuat pengguna",
  USER_DISABLE: "Menonaktifkan pengguna",
  USER_REACTIVATE: "Mengaktifkan kembali pengguna",
  ROLE_CHANGE: "Mengubah peran pengguna",

  // Authorization
  ACCESS_DENIED: "Akses ditolak",

  // Infrastructure
  RATE_LIMIT_UNAVAILABLE: "Rate limit tidak tersedia",

  // Media
  MEDIA_CREATE: "Mengunggah media",
  MEDIA_UPDATE: "Memperbarui metadata media",
  MEDIA_DELETE: "Menghapus media",

  // Content
  SERVICE_CREATE: "Membuat layanan",
  SERVICE_UPDATE: "Memperbarui layanan",
  SERVICE_DELETE: "Menghapus layanan",
  SERVICE_PUBLISH_TOGGLE: "Mengubah status publikasi layanan",
  NEWS_CREATE: "Membuat berita",
  NEWS_UPDATE: "Memperbarui berita",
  NEWS_PUBLISH: "Mempublikasikan berita",
  NEWS_UNPUBLISH: "Membatalkan publikasi berita",
  NEWS_ARCHIVE: "Mengarsipkan berita",
  NEWS_RESTORE: "Memulihkan berita",
  NEWS_DELETE: "Menghapus berita",
  GALLERY_CREATE: "Menambahkan item galeri",
  GALLERY_UPDATE: "Memperbarui item galeri",
  GALLERY_DELETE: "Menghapus item galeri",
  TEAM_CREATE: "Menambahkan anggota tim",
  TEAM_UPDATE: "Memperbarui anggota tim",
  TEAM_DELETE: "Menghapus anggota tim",
  CLIENT_CREATE: "Menambahkan klien",
  CLIENT_UPDATE: "Memperbarui klien",
  CLIENT_DELETE: "Menghapus klien",
  STAT_UPDATE: "Memperbarui statistik",
  SETTINGS_UPDATE: "Memperbarui pengaturan situs",

  // Leads
  LEAD_CREATE: "Permintaan baru masuk",
  LEAD_STATUS_CHANGE: "Mengubah status permintaan",
  LEAD_DELETE: "Menghapus permintaan",
};

/**
 * Render a short, human-readable summary of an audit row's `meta` field. Keeps
 * the readable string short (≤120 chars) so the table doesn't overflow; falls
 * back to "—" when `meta` is empty.
 */
export function summarizeAuditMeta(meta: unknown): string {
  if (!meta || typeof meta !== "object") return "—";
  const m = meta as Record<string, unknown>;

  // Common patterns we recognize: title/slug, name, from→to.
  const parts: string[] = [];

  if (typeof m.title === "string" && m.title) {
    parts.push(`"${truncate(m.title, 40)}"`);
  } else if (typeof m.name === "string" && m.name) {
    parts.push(`"${truncate(m.name, 40)}"`);
  } else if (typeof m.slug === "string" && m.slug) {
    parts.push(`/${m.slug}`);
  } else if (typeof m.email === "string" && m.email) {
    parts.push(m.email);
  }

  if ("from" in m && "to" in m) {
    parts.push(`${formatScalar(m.from)} → ${formatScalar(m.to)}`);
  }
  if (typeof m.reorder === "string") {
    parts.push(m.reorder === "up" ? "naik" : "turun");
  }
  if (typeof m.published === "boolean") {
    parts.push(m.published ? "dipublikasikan" : "draft");
  }
  if (typeof m.role === "string") {
    parts.push(`peran ${m.role}`);
  }
  if (typeof m.reason === "string") {
    parts.push(`(${m.reason})`);
  }

  if (parts.length === 0) return "—";
  return truncate(parts.join(" · "), 120);
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

function formatScalar(v: unknown): string {
  if (v === null || v === undefined) return "kosong";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "string") return v.length > 30 ? `${v.slice(0, 29)}…` : v;
  if (typeof v === "number") return String(v);
  return JSON.stringify(v).slice(0, 30);
}
