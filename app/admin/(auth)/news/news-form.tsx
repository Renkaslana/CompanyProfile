"use client";

/**
 * Shared News form — used by both `/admin/news/new` and `/admin/news/[id]/edit`.
 *
 * Follows the M5 ServiceForm pattern:
 *   • useActionState for round-tripped field errors + value echo.
 *   • Auto slug derivation from title until manually edited.
 *   • MediaPicker for cover (folder filter optional — defaults to all).
 *
 * Body field is an HTML textarea + live sanitized preview pane (defense in
 * depth on top of server-side sanitization in `NewsCmsService.create/update`).
 */
import { useId, useState, useActionState, useMemo } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertTriangle, Eye, Loader2 } from "lucide-react";
import {
  FormActions,
  FormBanner,
  FormField,
  FormSection,
} from "@/components/admin/admin-form";
import {
  SanitizedHtml,
  SANITIZE_OPTIONS,
} from "@/components/admin/sanitized-html";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  MediaPicker,
  type MediaPickerAsset,
} from "@/components/admin/media-picker";
import type { NewsFormState } from "@/lib/validation/news";

export type NewsFormInitial = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  displayAuthor: string;
  coverId: string | null;
  publishImmediately: boolean;
};

type Props = {
  mode: "create" | "edit";
  initial: NewsFormInitial;
  mediaAssets: MediaPickerAsset[];
  action: (
    state: NewsFormState | null,
    formData: FormData,
  ) => Promise<NewsFormState | null>;
};

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-brand-orange text-white hover:bg-brand-orange-strong"
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {mode === "create" ? "Simpan berita" : "Simpan perubahan"}
    </Button>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Render-time hint listing the same tags `SANITIZE_OPTIONS.allowedTags` permits. */
function allowedTagsLabel(): string {
  const tags = SANITIZE_OPTIONS.allowedTags;
  return Array.isArray(tags)
    ? tags.join(", ")
    : "p, h2, h3, strong, em, ul, ol, li, a";
}

export function NewsForm({ mode, initial, mediaAssets, action }: Props) {
  const titleId = useId();
  const slugId = useId();
  const excerptId = useId();
  const bodyId = useId();
  const categoryId = useId();
  const displayAuthorId = useId();
  const publishImmediatelyId = useId();

  const [state, formAction] = useActionState<NewsFormState | null, FormData>(
    action,
    null,
  );

  const v = state?.values;
  const fe = state?.fieldErrors;

  const [title, setTitle] = useState(v?.title ?? initial.title);
  const [slug, setSlug] = useState(v?.slug ?? initial.slug);
  const [slugDirty, setSlugDirty] = useState(mode === "edit" || Boolean(v?.slug));

  // Live body preview — uses the SanitizedHtml component which re-sanitizes
  // on render so we mirror exactly what the public page will show.
  const [body, setBody] = useState(v?.body ?? initial.body);

  const initialPreview = useMemo(() => body, [body]);

  return (
    <form action={formAction} className="space-y-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      {state && (
        <FormBanner
          variant="error"
          message={
            <span className="inline-flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                <span className="font-medium">{state.message}</span>
                {Object.keys(state.fieldErrors).length > 0 && (
                  <ul className="mt-1 list-inside list-disc text-xs">
                    {Object.entries(state.fieldErrors).map(([k, msgs]) =>
                      msgs?.[0] ? <li key={k}>{msgs[0]}</li> : null,
                    )}
                  </ul>
                )}
              </span>
            </span>
          }
        />
      )}

      <FormSection title="Identitas" description="Slug dipakai sebagai URL: /berita/<slug>.">
        <FormField label="Judul" htmlFor={titleId} required error={fe?.title?.[0]}>
          <Input
            id={titleId}
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugDirty) setSlug(slugify(e.target.value));
            }}
            maxLength={200}
            required
            aria-invalid={Boolean(fe?.title)}
          />
        </FormField>

        <FormField
          label="URL Halaman (slug)"
          htmlFor={slugId}
          hint="Bagian akhir alamat halaman publik — contoh: /berita/peluncuran-armada-baru. Hanya huruf kecil, angka, dan tanda hubung. Otomatis dari judul; ubah jika perlu."
          required
          error={fe?.slug?.[0]}
        >
          <Input
            id={slugId}
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugDirty(true);
            }}
            maxLength={80}
            required
            aria-invalid={Boolean(fe?.slug)}
          />
        </FormField>

        <FormField
          label="Kategori"
          htmlFor={categoryId}
          hint="Mis. Armada, Operasional, Teknologi, Kemitraan."
          required
          error={fe?.category?.[0]}
        >
          <Input
            id={categoryId}
            name="category"
            defaultValue={v?.category ?? initial.category}
            maxLength={60}
            required
            aria-invalid={Boolean(fe?.category)}
          />
        </FormField>

        <FormField
          label="Penulis (display)"
          htmlFor={displayAuthorId}
          hint="Opsional. Override byline (mis. 'Tim Komunikasi BMI'). Kosongkan untuk pakai nama pemilik akun."
          error={fe?.displayAuthor?.[0]}
        >
          <Input
            id={displayAuthorId}
            name="displayAuthor"
            defaultValue={v?.displayAuthor ?? initial.displayAuthor}
            maxLength={120}
            aria-invalid={Boolean(fe?.displayAuthor)}
          />
        </FormField>
      </FormSection>

      <FormSection title="Konten">
        <FormField
          label="Ringkasan singkat"
          htmlFor={excerptId}
          hint="2 – 500 karakter. Tampil di kartu daftar berita + sebagai meta description halaman."
          required
          error={fe?.excerpt?.[0]}
        >
          <textarea
            id={excerptId}
            name="excerpt"
            defaultValue={v?.excerpt ?? initial.excerpt}
            maxLength={500}
            required
            rows={3}
            aria-invalid={Boolean(fe?.excerpt)}
            className="min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </FormField>

        <FormField
          label="Isi berita (HTML)"
          htmlFor={bodyId}
          hint={`Tag yang diizinkan: ${allowedTagsLabel()}. HTML disanitasi otomatis saat disimpan & saat ditampilkan.`}
          required
          error={fe?.body?.[0]}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <textarea
              id={bodyId}
              name="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={50000}
              required
              rows={20}
              aria-invalid={Boolean(fe?.body)}
              className="min-w-0 font-mono text-xs rounded-lg border border-input bg-transparent px-2.5 py-1.5 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder="<p>Paragraf pertama…</p>&#10;<h2>Sub-judul</h2>&#10;<p>Paragraf <strong>dengan penekanan</strong>.</p>"
            />
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Eye className="size-3.5" />
                Pratinjau sanitized
              </div>
              {body.trim() ? (
                <SanitizedHtml html={body} className="max-h-[420px] overflow-auto" />
              ) : (
                <p className="text-xs italic text-muted-foreground">
                  (Ketik HTML di kiri untuk melihat pratinjau.)
                </p>
              )}
              {/* Hidden so the previewed value matches what was first rendered; preview re-sanitizes every keystroke */}
              <span className="hidden">{initialPreview}</span>
            </div>
          </div>
        </FormField>
      </FormSection>

      <FormSection title="Visual">
        <FormField
          label="Cover image"
          htmlFor="coverId"
          hint="Opsional tapi sangat disarankan. Pilih dari Media Library."
          error={fe?.coverId?.[0]}
        >
          <MediaPicker
            name="coverId"
            defaultValue={v?.coverId ?? initial.coverId ?? undefined}
            assets={mediaAssets}
          />
        </FormField>
      </FormSection>

      {mode === "create" && (
        <FormSection title="Publikasi">
          <FormField label="Status" htmlFor={publishImmediatelyId}>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <input
                id={publishImmediatelyId}
                type="checkbox"
                name="publishImmediately"
                defaultChecked={v?.publishImmediately ?? initial.publishImmediately}
                className="size-4 rounded border-input"
              />
              Langsung publish setelah disimpan
            </label>
          </FormField>
        </FormSection>
      )}

      <FormActions>
        <Button type="button" variant="outline" render={<Link href="/admin/news" />}>
          Batal
        </Button>
        <SubmitButton mode={mode} />
      </FormActions>
    </form>
  );
}
