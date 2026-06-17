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
import { AlertTriangle, Check, Cloud, Eye, History, Loader2, X } from "lucide-react";
import {
  FormBanner,
  FormField,
  FormSection,
} from "@/components/admin/admin-form";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { useNewsDraft } from "./use-news-draft";
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

function AutosaveIndicator({
  status,
  savedAt,
}: {
  status: "idle" | "saving" | "saved";
  savedAt: number | null;
}) {
  if (status === "idle") return null;
  const time = savedAt
    ? new Date(savedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : null;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
      title="Tersimpan otomatis di perangkat ini (browser) — bukan pengganti tombol Simpan"
      aria-live="polite"
    >
      {status === "saving" ? (
        <>
          <Cloud className="size-3.5 animate-pulse" />
          Menyimpan draf…
        </>
      ) : (
        <>
          <Check className="size-3.5 text-emerald-600" />
          Draf tersimpan otomatis{time ? ` · ${time}` : ""}
        </>
      )}
    </span>
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

  // Controlled agar bisa di-autosave + dipulihkan secara seragam.
  const [excerpt, setExcerpt] = useState(v?.excerpt ?? initial.excerpt);
  const [category, setCategory] = useState(v?.category ?? initial.category);
  const [displayAuthor, setDisplayAuthor] = useState(
    v?.displayAuthor ?? initial.displayAuthor,
  );

  // Autosave + recovery (localStorage, per-perangkat). Lihat use-news-draft.ts.
  const snapshot = { title, slug, excerpt, body, category, displayAuthor };
  const draft = useNewsDraft(initial.id, snapshot, {
    title: initial.title,
    slug: initial.slug,
    excerpt: initial.excerpt,
    body: initial.body,
    category: initial.category,
    displayAuthor: initial.displayAuthor,
  });

  function recoverDraft() {
    const s = draft.recoverable;
    if (!s) return;
    setTitle(s.title);
    setSlug(s.slug);
    setSlugDirty(true);
    setExcerpt(s.excerpt);
    setBody(s.body);
    setCategory(s.category);
    setDisplayAuthor(s.displayAuthor);
    draft.dismissRecovery();
  }

  return (
    <form
      action={formAction}
      onSubmit={() => draft.clear()}
      className="space-y-6"
    >
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

      {/* Banner pemulihan draft (localStorage) */}
      {draft.recoverable && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-brand-orange/40 bg-brand-orange/5 px-3 py-2 text-sm"
        >
          <span className="inline-flex items-center gap-2 text-ink-900">
            <History className="size-4 shrink-0 text-brand-orange-strong" />
            Ada tulisan yang belum tersimpan dari sesi sebelumnya di perangkat ini.
          </span>
          <span className="flex items-center gap-2">
            <Button type="button" size="sm" onClick={recoverDraft} className="bg-brand-orange text-white hover:bg-brand-orange-strong">
              Pulihkan
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => draft.clear()}>
              <X className="size-3.5" />
              Abaikan
            </Button>
          </span>
        </div>
      )}

      {/* Judul — penuh di atas, prominen (pola Notion/WordPress) */}
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor={titleId} className="sr-only">
            Judul berita
          </label>
          <AutosaveIndicator status={draft.status} savedAt={draft.savedAt} />
        </div>
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
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
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
                placeholder="Mulai menulis isi berita…"
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
              {mode === "edit" && initial.id ? (
                <Button
                  type="button"
                  variant="outline"
                  render={
                    <Link
                      href={`/berita/preview/${initial.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                  className="w-full"
                >
                  <Eye className="size-4" />
                  Pratinjau
                </Button>
              ) : (
                // Mode create: belum ada id → belum bisa pratinjau (pratinjau
                // membaca versi tersimpan di DB). Tampilkan tombol nonaktif +
                // alasan, supaya aksinya tetap dapat ditemukan.
                <Button
                  type="button"
                  variant="outline"
                  disabled
                  title="Simpan berita dulu untuk membuka pratinjau sebagai pengunjung."
                  className="w-full"
                >
                  <Eye className="size-4" />
                  Pratinjau
                </Button>
              )}
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
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
                value={displayAuthor}
                onChange={(e) => setDisplayAuthor(e.target.value)}
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
