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
import type { ClientFormState } from "@/lib/validation/client";

export type ClientFormInitial = {
  id?: string;
  name: string;
  sector: string;
  url: string;
  logoId: string | null;
  order: number;
};

type Props = {
  mode: "create" | "edit";
  initial: ClientFormInitial;
  mediaAssets: MediaPickerAsset[];
  action: (
    state: ClientFormState | null,
    formData: FormData,
  ) => Promise<ClientFormState | null>;
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
      {mode === "create" ? "Simpan klien" : "Simpan perubahan"}
    </Button>
  );
}

export function ClientForm({ mode, initial, mediaAssets, action }: Props) {
  const nameId = useId();
  const sectorId = useId();
  const urlId = useId();
  const orderId = useId();
  const [state, formAction] = useActionState<ClientFormState | null, FormData>(action, null);
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
        <FormField label="Nama klien" htmlFor={nameId} required error={fe?.name?.[0]}>
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
          label="Sektor (opsional)"
          htmlFor={sectorId}
          hint="Mis. Manufaktur, FMCG, Pertambangan, Distribusi."
          error={fe?.sector?.[0]}
        >
          <Input
            id={sectorId}
            name="sector"
            defaultValue={v?.sector ?? initial.sector}
            maxLength={60}
            aria-invalid={Boolean(fe?.sector)}
          />
        </FormField>
        <FormField
          label="URL klien (opsional)"
          htmlFor={urlId}
          hint="Tautan ke website klien. Awali dengan https://."
          error={fe?.url?.[0]}
        >
          <Input
            id={urlId}
            name="url"
            type="url"
            defaultValue={v?.url ?? initial.url}
            placeholder="https://contoh.co.id"
            maxLength={500}
            aria-invalid={Boolean(fe?.url)}
          />
        </FormField>
      </FormSection>

      <FormSection title="Logo">
        <FormField
          label="Logo (opsional)"
          htmlFor="logoId"
          hint="Kosongkan untuk pakai wordmark monokromatik otomatis."
          error={fe?.logoId?.[0]}
        >
          <MediaPicker
            name="logoId"
            defaultValue={v?.logoId ?? initial.logoId ?? undefined}
            assets={mediaAssets}
          />
        </FormField>
      </FormSection>

      <FormSection title="Tampilan">
        <FormField
          label="Urutan tampilan"
          htmlFor={orderId}
          hint="Angka lebih kecil tampil lebih dulu."
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
        <Button type="button" variant="outline" render={<Link href="/admin/clients" />}>Batal</Button>
        <SubmitButton mode={mode} />
      </FormActions>
    </form>
  );
}
