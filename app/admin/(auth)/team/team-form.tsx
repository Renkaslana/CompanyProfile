"use client";

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
import type { TeamFormState } from "@/lib/validation/team";

export type TeamFormInitial = {
  id?: string;
  name: string;
  role: string;
  photoId: string | null;
  order: number;
};

type Props = {
  mode: "create" | "edit";
  initial: TeamFormInitial;
  mediaAssets: MediaPickerAsset[];
  action: (
    state: TeamFormState | null,
    formData: FormData,
  ) => Promise<TeamFormState | null>;
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
      {mode === "create" ? "Simpan anggota tim" : "Simpan perubahan"}
    </Button>
  );
}

export function TeamForm({ mode, initial, mediaAssets, action }: Props) {
  const nameId = useId();
  const roleId = useId();
  const orderId = useId();
  const [state, formAction] = useActionState<TeamFormState | null, FormData>(action, null);
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

      <FormSection title="Identitas">
        <FormField label="Nama" htmlFor={nameId} required error={fe?.name?.[0]}>
          <Input
            id={nameId}
            name="name"
            defaultValue={v?.name ?? initial.name}
            maxLength={120}
            required
            aria-invalid={Boolean(fe?.name)}
          />
        </FormField>
        <FormField
          label="Jabatan"
          htmlFor={roleId}
          hint="Mis. Direktur Utama, Kepala Operasional, Manajer Logistik."
          required
          error={fe?.role?.[0]}
        >
          <Input
            id={roleId}
            name="role"
            defaultValue={v?.role ?? initial.role}
            maxLength={120}
            required
            aria-invalid={Boolean(fe?.role)}
          />
        </FormField>
      </FormSection>

      <FormSection title="Foto">
        <FormField
          label="Foto (opsional)"
          htmlFor="photoId"
          hint="Kosongkan untuk pakai avatar inisial otomatis."
          error={fe?.photoId?.[0]}
        >
          <MediaPicker
            name="photoId"
            defaultValue={v?.photoId ?? initial.photoId ?? undefined}
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
        <Button type="button" variant="outline" render={<Link href="/admin/team" />}>Batal</Button>
        <SubmitButton mode={mode} />
      </FormActions>
    </form>
  );
}
