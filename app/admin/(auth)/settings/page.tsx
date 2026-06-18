/**
 * Settings CMS — /admin/settings
 */
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { FormBanner } from "@/components/admin/admin-form";
import { requirePermission } from "@/server/auth/guards";
import { getSiteSettings } from "@/lib/data/settings";
import { MediaService } from "@/server/services/media.service";
import { SettingsForm } from "./settings-form";
import { updateSettingsAction } from "./actions";

type SearchParams = Promise<{ updated?: string; error?: string }>;

const UPDATED_MAP: Record<string, string> = {
  edited: "Pengaturan situs berhasil disimpan.",
};

const ERROR_MAP: Record<string, string> = {
  unknown: "Terjadi kesalahan. Coba lagi.",
};

export default async function SettingsAdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePermission("content:read");
  const settings = await getSiteSettings();
  const { updated, error } = await searchParams;

  // settings is the merged shape; split back into the two JSON columns the
  // form needs as initial state.
  const { values, ...company } = settings;

  // Media assets for the Testimonials avatar picker (M10.1). Scope to the
  // `team` folder to keep the picker focused on portrait-style assets, plus
  // 120-row ceiling for parity with the news editor.
  const assets = await MediaService.list({ folder: "team", limit: 120 });
  const mediaAssets = assets.map((a) => ({
    id: a.id,
    url: a.url,
    alt: a.alt,
    title: a.title,
    folder: a.folder,
    tags: a.tags,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink-900">Pengaturan Situs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola semua pengaturan website BMI dengan mudah dan terstruktur. Pilih
          kategori di bawah; perubahan langsung dipakai di halaman publik.
        </p>
      </header>

      {updated && (
        <FormBanner
          variant="success"
          message={
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              {UPDATED_MAP[updated] ?? "Berhasil."}
            </span>
          }
        />
      )}
      {error && (
        <FormBanner
          variant="error"
          message={
            <span className="inline-flex items-center gap-2">
              <AlertTriangle className="size-4" />
              {ERROR_MAP[error] ?? ERROR_MAP.unknown}
            </span>
          }
        />
      )}

      <SettingsForm
        initialCompany={company}
        initialValues={values}
        mediaAssets={mediaAssets}
        action={updateSettingsAction}
      />
    </div>
  );
}
