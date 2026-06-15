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
import { useId, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  FormBanner,
  FormField,
  FormSection,
} from "@/components/admin/admin-form";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
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

  // Body is edited via the WYSIWYG RichTextEditor and posted as an HTML string
  // through a hidden input. Server still sanitizes on write; the public page
  // re-sanitizes on render (defense in depth) — unchanged.
  const [body, setBody] = useState(v?.body ?? initial.body);

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

      {/* Judul — penuh di atas, prominen (pola Notion/WordPress) */}
      <div className="grid gap-1.5">
        <label htmlFor={titleId} className="sr-only">
          Judul berita
        </label>
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
          placeholder="Judul berita…"
          className="h-auto border-0 bg-transparent px-0 py-1 font-display text-2xl font-bold text-ink-900 shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
        />
        {fe?.title?.[0] && (
          <p className="text-xs text-destructive" role="alert">{fe.title[0]}</p>
        )}
      </div>

      {/* Dua kolom: konten (kiri) + Publish Box (kanan) */}
      <div className="lg:grid lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-6">
        {/* ── Kolom kiri: konten utama ─────────────────────────────── */}
        <div className="space-y-6">
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
              label="Isi berita"
              htmlFor={bodyId}
              hint="Gunakan toolbar untuk memformat teks — tebal, judul, daftar, kutipan, dan tautan. Tidak perlu menulis HTML."
              required
              error={fe?.body?.[0]}
            >
              {/* Body dikirim sebagai HTML string lewat hidden input; server tetap
                  men-sanitize saat write + render. */}
              <input type="hidden" name="body" value={body} />
              <RichTextEditor
                value={body}
                onChange={setBody}
                ariaLabel="Isi berita"
                minHeightClass="min-h-[420px]"
              />
            </FormField>
          </FormSection>
        </div>

        {/* ── Kolom kanan: Publish Box (sticky) ────────────────────── */}
        <aside className="mt-6 space-y-4 lg:mt-0 lg:sticky lg:top-24">
          {/* Aksi publikasi */}
          <FormSection title="Publikasi" className="p-4">
            {mode === "create" && (
              <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-background p-3 text-sm">
                <input
                  id={publishImmediatelyId}
                  type="checkbox"
                  name="publishImmediately"
                  defaultChecked={v?.publishImmediately ?? initial.publishImmediately}
                  className="mt-0.5 size-4 rounded border-input"
                />
                <span>
                  <span className="font-medium text-ink-900">Langsung terbitkan</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Jika tidak dicentang, berita disimpan sebagai draft.
                  </span>
                </span>
              </label>
            )}
            <div className="flex flex-col gap-2">
              <SubmitButton mode={mode} />
              <Button
                type="button"
                variant="outline"
                render={<Link href="/admin/news" />}
                className="w-full"
              >
                Batal
              </Button>
            </div>
          </FormSection>

          {/* Cover image */}
          <FormSection title="Gambar sampul" className="p-4">
            <FormField
              label=""
              htmlFor="coverId"
              hint="Opsional tapi sangat disarankan. Tampil di kartu berita & bagian atas artikel."
              error={fe?.coverId?.[0]}
            >
              <MediaPicker
                name="coverId"
                defaultValue={v?.coverId ?? initial.coverId ?? undefined}
                assets={mediaAssets}
              />
            </FormField>
          </FormSection>

          {/* Detail / metadata */}
          <FormSection title="Detail" className="p-4">
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
              label="Penulis (opsional)"
              htmlFor={displayAuthorId}
              hint="Override byline, mis. 'Tim Komunikasi BMI'. Kosongkan untuk pakai nama akun Anda."
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

            <FormField
              label="URL Halaman"
              htmlFor={slugId}
              hint="Alamat publik: /berita/<slug>. Otomatis dari judul; ubah bila perlu."
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
                className="font-mono text-xs"
              />
            </FormField>
          </FormSection>
        </aside>
      </div>
    </form>
  );
}
