"use client";

/**
 * Shared Gallery form used by both `/admin/gallery/new` and `[id]/edit`.
 *
 * Reuses the M5/M6 useActionState pattern:
 *   - title (free text)
 *   - category (free text with datalist of canonical suggestions)
 *   - mediaId (required, via MediaPicker)
 *   - order (number)
 */
import { useId, useActionState } from "react";
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
  GALLERY_CATEGORIES,
  type GalleryFormState,
} from "@/lib/validation/gallery";

export type GalleryFormInitial = {
  id?: string;
  title: string;
  category: string;
  mediaId: string | null;
  order: number;
};

type Props = {
  mode: "create" | "edit";
  initial: GalleryFormInitial;
  mediaAssets: MediaPickerAsset[];
  action: (
    state: GalleryFormState | null,
    formData: FormData,
  ) => Promise<GalleryFormState | null>;
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
      {mode === "create" ? "Simpan item galeri" : "Simpan perubahan"}
    </Button>
  );
}

export function GalleryForm({ mode, initial, mediaAssets, action }: Props) {
  const titleId = useId();
  const categoryId = useId();
  const categoryListId = useId();
  const orderId = useId();

  const [state, formAction] = useActionState<GalleryFormState | null, FormData>(
    action,
    null,
  );

  const v = state?.values;
  const fe = state?.fieldErrors;

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

      <FormSection title="Detail">
        <FormField label="Judul" htmlFor={titleId} required error={fe?.title?.[0]}>
          <Input
            id={titleId}
            name="title"
            defaultValue={v?.title ?? initial.title}
            maxLength={200}
            required
            aria-invalid={Boolean(fe?.title)}
          />
        </FormField>

        <FormField
          label="Kategori"
          htmlFor={categoryId}
          hint={`Pilih dari saran (${GALLERY_CATEGORIES.join(", ")}) atau isi bebas.`}
          required
          error={fe?.category?.[0]}
        >
          <Input
            id={categoryId}
            name="category"
            list={categoryListId}
            defaultValue={v?.category ?? initial.category}
            maxLength={60}
            required
            aria-invalid={Boolean(fe?.category)}
          />
          <datalist id={categoryListId}>
            {GALLERY_CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </FormField>
      </FormSection>

      <FormSection title="Media">
        <FormField
          label="Gambar"
          htmlFor="mediaId"
          hint="Wajib. Pilih dari Media Library."
          required
          error={fe?.mediaId?.[0]}
        >
          <MediaPicker
            name="mediaId"
            defaultValue={v?.mediaId ?? initial.mediaId ?? undefined}
            assets={mediaAssets}
          />
        </FormField>
      </FormSection>

      <FormSection title="Tampilan">
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
      </FormSection>

      <FormActions>
        <Button type="button" variant="outline" render={<Link href="/admin/gallery" />}>
          Batal
        </Button>
        <SubmitButton mode={mode} />
      </FormActions>
    </form>
  );
}
