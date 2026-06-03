"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { leadFormSchema, type LeadFormValues } from "@/features/leads/types";

const SERVICE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Pilih layanan (opsional)" },
  { value: "LOGISTICS", label: "Jasa Logistik" },
  { value: "TRANSPORTATION", label: "Transportasi" },
  { value: "CAR_RENTAL", label: "Rental Mobil" },
  { value: "GENERAL_TRADING", label: "Perdagangan Umum" },
];

const EMPTY: LeadFormValues = {
  name: "",
  company: "",
  email: "",
  phone: "",
  message: "",
};

// Phase 4 M10: standardize input + label styling for readability
const labelCls = "text-sm font-medium text-ink-900";
const inputCls =
  "mt-1.5 h-10 border-input bg-card text-ink-900 placeholder:text-foreground/40 focus-visible:border-brand-orange focus-visible:ring-brand-orange/30";

export function LeadForm({ className }: { className?: string }) {
  const [values, setValues] = useState<LeadFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof LeadFormValues>(key: K, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = leadFormSchema.safeParse({
      ...values,
      service: values.service || undefined,
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    // Phase 2: no backend — simulate a successful submission.
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    toast.success("Permintaan terkirim!", {
      description: "Tim BMI akan menghubungi Anda dalam waktu dekat.",
    });
    setValues(EMPTY);
    setErrors({});
    setSubmitted(true);
  }

  const fieldError = (k: string) =>
    errors[k] ? (
      <p className="mt-1 text-xs font-medium text-destructive">{errors[k]}</p>
    ) : null;

  if (submitted) {
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
            Terima kasih! Pesan Anda terkirim.
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-foreground/70">
            Tim BMI akan menghubungi Anda secepatnya — biasanya dalam
            beberapa jam kerja.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setSubmitted(false)}
          className="border-emerald-300 text-emerald-900 hover:bg-emerald-100"
        >
          Kirim permintaan lain
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={cn("space-y-4", className)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name" className={labelCls}>
            Nama lengkap <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Nama Anda"
            className={inputCls}
            aria-invalid={!!errors.name}
          />
          {fieldError("name")}
        </div>
        <div>
          <Label htmlFor="company" className={labelCls}>
            Perusahaan
          </Label>
          <Input
            id="company"
            value={values.company ?? ""}
            onChange={(e) => update("company", e.target.value)}
            placeholder="Nama perusahaan"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="email" className={labelCls}>
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="nama@perusahaan.co.id"
            className={inputCls}
            aria-invalid={!!errors.email}
          />
          {fieldError("email")}
        </div>
        <div>
          <Label htmlFor="phone" className={labelCls}>
            Telepon / WhatsApp
          </Label>
          <Input
            id="phone"
            value={values.phone ?? ""}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="08xx xxxx xxxx"
            className={inputCls}
            aria-invalid={!!errors.phone}
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
          value={values.service ?? ""}
          onChange={(e) => update("service", e.target.value)}
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
        <Label htmlFor="message" className={labelCls}>
          Kebutuhan Anda <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="message"
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Ceritakan kebutuhan logistik atau transportasi Anda…"
          rows={4}
          className={cn(inputCls, "h-auto min-h-24 resize-none")}
          aria-invalid={!!errors.message}
        />
        {fieldError("message")}
      </div>

      <Button
        type="submit"
        disabled={submitting}
        size="lg"
        className="w-full bg-brand-orange text-white shadow-md hover:bg-brand-orange-strong"
      >
        {submitting ? (
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
    </form>
  );
}
