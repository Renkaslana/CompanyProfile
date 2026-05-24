"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
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

export function LeadForm({ className }: { className?: string }) {
  const [values, setValues] = useState<LeadFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

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
  }

  const fieldError = (k: string) =>
    errors[k] ? (
      <p className="mt-1 text-xs text-destructive">{errors[k]}</p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} noValidate className={cn("space-y-4", className)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Nama lengkap *</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Nama Anda"
            className="mt-1.5"
            aria-invalid={!!errors.name}
          />
          {fieldError("name")}
        </div>
        <div>
          <Label htmlFor="company">Perusahaan</Label>
          <Input
            id="company"
            value={values.company ?? ""}
            onChange={(e) => update("company", e.target.value)}
            placeholder="Nama perusahaan"
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="nama@perusahaan.co.id"
            className="mt-1.5"
            aria-invalid={!!errors.email}
          />
          {fieldError("email")}
        </div>
        <div>
          <Label htmlFor="phone">Telepon / WhatsApp</Label>
          <Input
            id="phone"
            value={values.phone ?? ""}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="08xx xxxx xxxx"
            className="mt-1.5"
            aria-invalid={!!errors.phone}
          />
          {fieldError("phone")}
        </div>
      </div>

      <div>
        <Label htmlFor="service">Layanan yang diminati</Label>
        <select
          id="service"
          value={values.service ?? ""}
          onChange={(e) => update("service", e.target.value)}
          className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {SERVICE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="message">Kebutuhan Anda *</Label>
        <Textarea
          id="message"
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Ceritakan kebutuhan logistik atau transportasi Anda…"
          rows={4}
          className="mt-1.5 resize-none"
          aria-invalid={!!errors.message}
        />
        {fieldError("message")}
      </div>

      <Button
        type="submit"
        disabled={submitting}
        size="lg"
        className="w-full bg-brand-orange text-white hover:bg-brand-orange-strong"
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
