/**
 * /admin/media/[id]/edit
 *
 * Edits alt / title / tags on an existing MediaAsset row. The Cloudinary
 * binary itself is not editable here — re-upload + delete is the workflow
 * for replacing an image (the old row is reference-guarded against deletion).
 */
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import {
  FormActions,
  FormBanner,
  FormField,
  FormSection,
} from "@/components/admin/admin-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/server/auth/guards";
import { MediaService } from "@/server/services/media.service";
import { updateMediaAction } from "../../actions";

const ERROR_MAP: Record<string, string> = {
  validation: "Form tidak valid. Periksa kembali isiannya.",
  in_use: "Media masih dipakai oleh konten lain.",
  not_configured: "Cloudinary belum dikonfigurasi.",
  missing: "Data form tidak lengkap.",
  unknown: "Terjadi kesalahan. Coba lagi.",
};

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ error?: string }>;

export default async function MediaEditPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  await requirePermission("media:create");
  const { id } = await params;
  const { error } = await searchParams;
  const asset = await MediaService.findById(id);
  if (!asset) notFound();

  const isCloudinary = asset.url.startsWith("https://res.cloudinary.com");
  const isLocal = asset.url.startsWith("/");
  const unoptimized = !isCloudinary && !isLocal;
  const tagString = asset.tags.join(", ");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/media"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Media Library
      </Link>

      <header>
        <h1 className="font-display text-2xl font-bold text-ink-900">
          Edit metadata media
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Memperbarui alt text, judul, dan tag tidak mengubah file gambar di
          Cloudinary. Ganti file dengan mengunggah ulang lalu menghapus yang
          lama (jika sudah tidak dipakai).
        </p>
      </header>

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

      <form action={updateMediaAction} className="space-y-6">
        <input type="hidden" name="id" value={asset.id} />

        <FormSection title="Pratinjau">
          <div className="grid gap-4 sm:grid-cols-[200px_1fr] sm:items-start">
            <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-muted">
              <Image
                src={asset.url}
                alt={asset.alt ?? asset.title ?? ""}
                fill
                sizes="200px"
                className="object-cover"
                unoptimized={unoptimized}
              />
            </div>
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-xs">
              <dt className="font-medium text-muted-foreground">Public ID</dt>
              <dd className="font-mono break-all">{asset.publicId}</dd>
              <dt className="font-medium text-muted-foreground">Folder</dt>
              <dd>{asset.folder ?? "—"}</dd>
              <dt className="font-medium text-muted-foreground">Dimensi</dt>
              <dd>
                {asset.width && asset.height
                  ? `${asset.width} × ${asset.height}px`
                  : "—"}
              </dd>
              <dt className="font-medium text-muted-foreground">MIME</dt>
              <dd>{asset.mimeType ?? "—"}</dd>
              <dt className="font-medium text-muted-foreground">URL</dt>
              <dd className="break-all">
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-orange-strong underline-offset-2 hover:underline"
                >
                  Buka asli ↗
                </a>
              </dd>
            </dl>
          </div>
        </FormSection>

        <FormSection title="Metadata">
          <FormField
            label="Alt text"
            htmlFor="alt"
            hint="Deskripsi singkat gambar untuk aksesibilitas + SEO. Maksimum 500 karakter."
          >
            <Input
              id="alt"
              name="alt"
              defaultValue={asset.alt ?? ""}
              maxLength={500}
            />
          </FormField>

          <FormField
            label="Judul"
            htmlFor="title"
            hint="Nama tampilan di Media Library. Maksimum 120 karakter."
          >
            <Input
              id="title"
              name="title"
              defaultValue={asset.title ?? ""}
              maxLength={120}
            />
          </FormField>

          <FormField
            label="Tag"
            htmlFor="tags"
            hint="Pisahkan dengan koma. Membantu pencarian. Maksimum 20 tag."
          >
            <Input
              id="tags"
              name="tags"
              defaultValue={tagString}
              placeholder="armada, pelabuhan, operasional"
            />
          </FormField>
        </FormSection>

        <FormActions>
          <Button type="button" variant="outline" render={<Link href="/admin/media" />}>
            Batal
          </Button>
          <Button
            type="submit"
            className="bg-brand-orange text-white hover:bg-brand-orange-strong"
          >
            Simpan perubahan
          </Button>
        </FormActions>
      </form>
    </div>
  );
}
