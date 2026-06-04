"use client";

/**
 * Shared Service form used by both create (`/admin/services/new`) and edit
 * (`/admin/services/[id]/edit`).
 *
 * Uses React 19 `useActionState` so the action can return a structured
 * `ServiceFormState` on validation failure. Field-level errors render inline
 * next to each input via `FormField`'s `error` prop. The top banner
 * summarises which fields failed.
 *
 * On success the action `redirect`s — the hook's state never observes the
 * success path, only failures.
 */
import { useId, useState, useActionState, useMemo } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  FormActions,
  FormBanner,
  FormField,
  FormSection,
} from "@/components/admin/admin-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  MediaPicker,
  type MediaPickerAsset,
} from "@/components/admin/media-picker";
import {
  SERVICE_CATEGORIES,
  CATEGORY_LABEL,
  type ServiceCategory,
  type ServiceFormState,
} from "@/lib/validation/service";

export type ServiceFormInitial = {
  id?: string;
  title: string;
  slug: string;
  category: ServiceCategory;
  summary: string;
  body: string;
  iconKey: string;
  coverId: string | null;
  highlights: string[];
  order: number;
  published: boolean;
};

type Props = {
  mode: "create" | "edit";
  initial: ServiceFormInitial;
  mediaAssets: MediaPickerAsset[];
  action: (
    state: ServiceFormState | null,
    formData: FormData,
  ) => Promise<ServiceFormState | null>;
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
      {mode === "create" ? "Simpan layanan" : "Simpan perubahan"}
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

export function ServiceForm({ mode, initial, mediaAssets, action }: Props) {
  const titleId = useId();
  const slugId = useId();
  const categoryId = useId();
  const summaryId = useId();
  const bodyId = useId();
  const iconId = useId();
  const highlightsId = useId();
  const orderId = useId();
  const publishedId = useId();

  const [state, formAction] = useActionState<ServiceFormState | null, FormData>(
    action,
    null,
  );

  // After a failed submit, prefer the echoed values from the state; otherwise
  // use initial. This preserves the user's input across the round-trip.
  const initialHighlightsText = useMemo(
    () => initial.highlights.join("\n"),
    [initial.highlights],
  );
  const v = state?.values;
  const fe = state?.fieldErrors;

  // Title/slug local state — title drives slug auto-derive until the user
  // hand-edits the slug field.
  const [title, setTitle] = useState(v?.title ?? initial.title);
  const [slug, setSlug] = useState(v?.slug ?? initial.slug);
  const [slugDirty, setSlugDirty] = useState(mode === "edit" || Boolean(v?.slug));

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

      <FormSection title="Identitas" description="Slug dipakai sebagai URL: /layanan/<slug>.">
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
          hint="Bagian akhir alamat halaman publik — contoh: /layanan/transportasi-logistik. Hanya huruf kecil, angka, dan tanda hubung. Otomatis dari judul; ubah jika perlu."
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

        <FormField label="Kategori" htmlFor={categoryId} required error={fe?.category?.[0]}>
          <select
            id={categoryId}
            name="category"
            defaultValue={v?.category || initial.category}
            required
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            aria-invalid={Boolean(fe?.category)}
          >
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </FormField>
      </FormSection>

      <FormSection title="Konten">
        <FormField
          label="Ringkasan"
          htmlFor={summaryId}
          hint="2 – 500 karakter. Tampil di kartu layanan + meta description."
          required
          error={fe?.summary?.[0]}
        >
          <textarea
            id={summaryId}
            name="summary"
            defaultValue={v?.summary ?? initial.summary}
            maxLength={500}
            required
            rows={3}
            aria-invalid={Boolean(fe?.summary)}
            className="min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </FormField>

        <FormField
          label="Deskripsi lengkap"
          htmlFor={bodyId}
          hint="Teks panjang. Akan ditampilkan di halaman detail layanan."
          required
          error={fe?.body?.[0]}
        >
          <textarea
            id={bodyId}
            name="body"
            defaultValue={v?.body ?? initial.body}
            maxLength={50000}
            required
            rows={10}
            aria-invalid={Boolean(fe?.body)}
            className="min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </FormField>

        <FormField
          label="Highlight"
          htmlFor={highlightsId}
          hint="Satu poin per baris ATAU pisahkan dengan koma. Maksimum 12 poin × 120 karakter."
          error={fe?.highlights?.[0]}
        >
          <textarea
            id={highlightsId}
            name="highlights"
            defaultValue={v?.highlights ?? initialHighlightsText}
            rows={5}
            aria-invalid={Boolean(fe?.highlights)}
            className="min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </FormField>
      </FormSection>

      <FormSection title="Visual">
        <FormField
          label="Icon (lucide-react)"
          htmlFor={iconId}
          hint="Contoh: Truck, Building2, Boxes, ShoppingCart. Lihat https://lucide.dev/icons."
          required
          error={fe?.iconKey?.[0]}
        >
          <Input
            id={iconId}
            name="iconKey"
            defaultValue={v?.iconKey ?? initial.iconKey}
            maxLength={60}
            required
            aria-invalid={Boolean(fe?.iconKey)}
          />
        </FormField>

        <FormField
          label="Cover image"
          htmlFor="coverId"
          hint="Opsional. Pilih dari Media Library."
          error={fe?.coverId?.[0]}
        >
          <MediaPicker
            name="coverId"
            defaultValue={v?.coverId ?? initial.coverId ?? undefined}
            assets={mediaAssets}
          />
        </FormField>
      </FormSection>

      <FormSection title="Publikasi">
        <FormField
          label="Urutan tampilan"
          htmlFor={orderId}
          hint="Angka lebih kecil tampil lebih dulu. Bisa juga digeser dari halaman daftar."
          error={fe?.order?.[0]}
        >
          <Input
            id={orderId}
            name="order"
            type="number"
            min={0}
            max={10000}
            defaultValue={v?.order ?? String(initial.order)}
            aria-invalid={Boolean(fe?.order)}
          />
        </FormField>

        {mode === "create" && (
          <FormField label="Status" htmlFor={publishedId}>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <input
                id={publishedId}
                type="checkbox"
                name="published"
                defaultChecked={v?.published ?? initial.published}
                className="size-4 rounded border-input"
              />
              Langsung publish setelah disimpan
            </label>
          </FormField>
        )}
      </FormSection>

      <FormActions>
        <Button type="button" variant="outline" render={<Link href="/admin/services" />}>
          Batal
        </Button>
        <SubmitButton mode={mode} />
      </FormActions>
    </form>
  );
}
