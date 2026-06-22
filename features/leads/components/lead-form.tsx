"use client";

/**
 * Public lead form — used on /kontak (and any future surface that wants
 * a quote request). Submits via the `submitLeadAction` Server Action which
 * persists to the `Lead` table and writes an audit row.
 *
 * Anti-spam: honeypot field `website` is rendered but hidden via CSS —
 * real users can't see it; spam bots auto-fill it; server rejects any
 * non-empty value. Ditambah rate-limit per-IP (Upstash) + Cloudflare Turnstile
 * (opsional, aktif bila NEXT_PUBLIC_TURNSTILE_SITE_KEY di-set).
 */
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitLeadAction } from "@/features/leads/actions";
import { TurnstileField } from "@/features/leads/components/turnstile-field";
import type { LeadFormState } from "@/lib/validation/lead";

const SERVICE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Pilih layanan (opsional)" },
  { value: "LOGISTICS", label: "Jasa Logistik" },
  { value: "TRANSPORTATION", label: "Transportasi" },
  { value: "CAR_RENTAL", label: "Rental Mobil" },
  { value: "GENERAL_TRADING", label: "Perdagangan Umum" },
];

const labelCls = "text-sm font-medium text-ink-900";
const inputCls =
  "mt-1.5 h-10 border-input bg-card text-ink-900 placeholder:text-foreground/40 focus-visible:border-brand-orange focus-visible:ring-brand-orange/30";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      size="lg"
      className="w-full bg-brand-orange text-white shadow-md hover:bg-brand-orange-strong"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Mengirim…
        </>
      ) : (
        <>
          <Send className="size-4" />
          Kirim Permintaan
        </>
      )}
    </Button>
  );
}

type Props = {
  className?: string;
  /** Tag stored on the Lead.source column for analytics ("kontak" by default). */
  source?: string;
};

export function LeadForm({ className, source = "kontak" }: Props) {
  const [state, formAction] = useActionState<LeadFormState | null, FormData>(
    submitLeadAction,
    null,
  );

  // "Show fresh form" toggle: success card is hidden, blank form is shown.
  // The user clicks "Kirim permintaan lain" to flip this on after a success.
  const [showForm, setShowForm] = useState(true);

  // Derive collapse-on-success during render (React-19 set-state-in-effect-safe
  // pattern: only setState during render when the input changes).
  const [lastSeenState, setLastSeenState] = useState<LeadFormState | null>(state);
  if (state !== lastSeenState) {
    setLastSeenState(state);
    if (state?.ok) setShowForm(false);
  }

  // Toast is a side effect to an external system — that belongs in useEffect.
  useEffect(() => {
    if (state?.ok) {
      toast.success("Permintaan terkirim!", {
        description: "Tim BMI akan menghubungi Anda dalam waktu dekat.",
      });
    } else if (
      state &&
      !state.ok &&
      state.message &&
      Object.keys(state.fieldErrors).length === 0
    ) {
      toast.error(state.message);
    }
  }, [state]);

  if (state?.ok && !showForm) {
    return (
      <div
        role="status"
        className={cn(
          "flex flex-col items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900",
          className,
        )}
      >
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-emerald-500 text-white">
          <CheckCircle2 className="size-6" />
        </span>
        <div>
          <h3 className="font-display text-lg font-semibold text-ink-900">
            Terima kasih! Permintaan Anda terkirim.
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-foreground/70">
            Tim BMI akan menghubungi Anda secepatnya — biasanya dalam beberapa
            jam kerja. Nomor referensi:{" "}
            <span className="font-mono text-xs">{state.leadId.slice(0, 8)}…</span>
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowForm(true)}
          className="border-emerald-300 text-emerald-900 hover:bg-emerald-100"
        >
          Kirim permintaan lain
        </Button>
      </div>
    );
  }

  // Re-mount fresh form when the user clicks "Kirim permintaan lain"
  if (state?.ok && showForm) {
    // Render empty form (state already set ok:true but user wants to send another)
    return <FreshForm className={className} source={source} formAction={formAction} />;
  }

  const v = state && !state.ok ? state.values : undefined;
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  const fieldError = (k: string) => {
    const msg = fe?.[k as keyof typeof fe]?.[0];
    return msg ? (
      <p className="mt-1 text-xs font-medium text-destructive">{msg}</p>
    ) : null;
  };

  return (
    <form action={formAction} noValidate className={cn("space-y-4", className)}>
      <input type="hidden" name="source" value={source} />
      {/* Honeypot — invisible to humans (CSS hidden), attractive to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website-trap">Website (jangan diisi)</label>
        <input
          id="website-trap"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {fe && Object.keys(fe).length === 0 && state && !state.ok && (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name" className={labelCls}>
            Nama lengkap <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={v?.name ?? ""}
            placeholder="Nama Anda"
            className={inputCls}
            maxLength={120}
            aria-invalid={!!fe?.name}
            required
          />
          {fieldError("name")}
        </div>
        <div>
          <Label htmlFor="company" className={labelCls}>
            Perusahaan
          </Label>
          <Input
            id="company"
            name="company"
            defaultValue={v?.company ?? ""}
            placeholder="Nama perusahaan"
            className={inputCls}
            maxLength={160}
          />
          {fieldError("company")}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="email" className={labelCls}>
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={v?.email ?? ""}
            placeholder="nama@perusahaan.co.id"
            className={inputCls}
            maxLength={254}
            aria-invalid={!!fe?.email}
            required
          />
          {fieldError("email")}
        </div>
        <div>
          <Label htmlFor="phone" className={labelCls}>
            Telepon / WhatsApp
          </Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={v?.phone ?? ""}
            placeholder="08xx xxxx xxxx"
            className={inputCls}
            maxLength={40}
            aria-invalid={!!fe?.phone}
          />
          {fieldError("phone")}
        </div>
      </div>

      <div>
        <Label htmlFor="service" className={labelCls}>
          Layanan yang diminati
        </Label>
        <select
          id="service"
          name="service"
          defaultValue={v?.service ?? ""}
          className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-1 text-sm text-ink-900 outline-none focus-visible:border-brand-orange focus-visible:ring-[3px] focus-visible:ring-brand-orange/30"
        >
          {SERVICE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {fieldError("service")}
      </div>

      <div>
        <Label htmlFor="message" className={labelCls}>
          Kebutuhan Anda <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          defaultValue={v?.message ?? ""}
          placeholder="Ceritakan kebutuhan logistik atau transportasi Anda…"
          rows={4}
          maxLength={2000}
          className={cn(inputCls, "h-auto min-h-24 resize-none")}
          aria-invalid={!!fe?.message}
          required
        />
        {fieldError("message")}
      </div>

      <TurnstileField />
      <SubmitButton />
    </form>
  );
}

/**
 * Fresh-form variant rendered when the user clicks "Kirim permintaan lain"
 * after a previous success — empty defaults so they start over.
 */
function FreshForm({
  className,
  source,
  formAction,
}: {
  className?: string;
  source: string;
  formAction: (formData: FormData) => void;
}) {
  return (
    <form action={formAction} noValidate className={cn("space-y-4", className)}>
      <input type="hidden" name="source" value={source} />
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name2" className={labelCls}>
            Nama lengkap <span className="text-destructive">*</span>
          </Label>
          <Input id="name2" name="name" placeholder="Nama Anda" className={inputCls} maxLength={120} required />
        </div>
        <div>
          <Label htmlFor="company2" className={labelCls}>Perusahaan</Label>
          <Input id="company2" name="company" placeholder="Nama perusahaan" className={inputCls} maxLength={160} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="email2" className={labelCls}>
            Email <span className="text-destructive">*</span>
          </Label>
          <Input id="email2" name="email" type="email" placeholder="nama@perusahaan.co.id" className={inputCls} maxLength={254} required />
        </div>
        <div>
          <Label htmlFor="phone2" className={labelCls}>Telepon / WhatsApp</Label>
          <Input id="phone2" name="phone" placeholder="08xx xxxx xxxx" className={inputCls} maxLength={40} />
        </div>
      </div>
      <div>
        <Label htmlFor="service2" className={labelCls}>Layanan yang diminati</Label>
        <select
          id="service2"
          name="service"
          defaultValue=""
          className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-card px-3 py-1 text-sm text-ink-900 outline-none focus-visible:border-brand-orange focus-visible:ring-[3px] focus-visible:ring-brand-orange/30"
        >
          {SERVICE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="message2" className={labelCls}>
          Kebutuhan Anda <span className="text-destructive">*</span>
        </Label>
        <Textarea id="message2" name="message" placeholder="Ceritakan kebutuhan logistik atau transportasi Anda…" rows={4} maxLength={2000} className={cn(inputCls, "h-auto min-h-24 resize-none")} required />
      </div>
      <TurnstileField />
      <SubmitButton />
    </form>
  );
}
