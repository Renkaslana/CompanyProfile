export function formatDateID(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Tanggal ringkas: "17 Jun 2025". */
export function formatDateShortID(input: string | Date): string {
  return new Date(input).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Waktu relatif berbahasa Indonesia untuk feed aktivitas/konten:
 * "Baru saja" · "5 menit lalu" · "3 jam lalu" · "Kemarin" · "4 hari lalu" ·
 * lalu jatuh ke tanggal ringkas untuk yang lebih lama dari ~seminggu.
 */
export function formatRelativeID(input: string | Date): string {
  const then = new Date(input).getTime();
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 45) return "Baru saja";
  const min = Math.round(diffSec / 60);
  if (min < 60) return `${min} menit lalu`;
  const hour = Math.round(min / 60);
  if (hour < 24) return `${hour} jam lalu`;
  const day = Math.round(hour / 24);
  if (day === 1) return "Kemarin";
  if (day < 7) return `${day} hari lalu`;
  return formatDateShortID(input);
}
