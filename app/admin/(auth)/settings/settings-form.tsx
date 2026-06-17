"use client";

/**
 * SiteSettings tabbed form (Phase 4 M9 → M10.1).
 *
 * The form is a single React-state object mirroring the full company JSON
 * shape + the values array. Each tab is an in-page anchor with its own
 * FormSection of inputs. On submit, the full state is serialized into two
 * hidden inputs (`companyJson` + `valuesJson`) that the Server Action
 * parses and validates with Zod.
 *
 * M10.1 additions:
 *   • Testimonials repeater (max 6) — homepage trust band
 *   • Kebijakan Privasi — HTML textarea + live sanitized preview → /privasi
 *   • Syarat & Ketentuan — HTML textarea + live sanitized preview → /syarat-ketentuan
 *   • Sticky in-page section nav (lg+) so the long form is navigable
 */
import { useActionState, useState, useId, useMemo } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle, Loader2, Plus, Trash2 } from "lucide-react";
import {
  FormActions,
  FormBanner,
  FormField,
  FormSection,
} from "@/components/admin/admin-form";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  MediaPicker,
  type MediaPickerAsset,
} from "@/components/admin/media-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SUPPORT_TOPICS,
  SUPPORT_TOPIC_LABEL,
  type CompanyJson,
  type SettingsFormState,
  type ValueItem,
} from "@/lib/validation/settings";

type Testimonial = NonNullable<CompanyJson["testimonials"]>[number];

type Props = {
  initialCompany: CompanyJson;
  initialValues: ValueItem[];
  /** MediaAssets available for the testimonial avatar picker. */
  mediaAssets: MediaPickerAsset[];
  action: (
    state: SettingsFormState | null,
    formData: FormData,
  ) => Promise<SettingsFormState | null>;
};

/**
 * Tab grouping (UX 5). Each tab shows only its own sections; the others stay
 * mounted (display:none) so React state + scroll position survive switches.
 * Single save button submits the whole form regardless of active tab.
 */
const TABS = [
  {
    id: "identitas",
    label: "Identitas & Cerita",
    sections: ["identitas", "cerita", "visi-misi", "nilai"],
  },
  {
    id: "kontak",
    label: "Kontak & Lokasi",
    sections: ["alamat", "kontak"],
  },
  {
    id: "testimoni",
    label: "Testimoni",
    sections: ["testimoni"],
  },
  {
    id: "layanan-pelanggan",
    label: "Layanan Pelanggan",
    sections: ["support-hours", "faq"],
  },
  {
    id: "legal",
    label: "Legal & Halaman Kebijakan",
    sections: ["legal", "privasi", "syarat"],
  },
  {
    id: "sosial",
    label: "Sosial Media",
    sections: ["sosial"],
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-brand-orange text-white hover:bg-brand-orange-strong"
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      Simpan semua pengaturan
    </Button>
  );
}

function fieldErr(fe: Record<string, string[]> | undefined, path: string): string | undefined {
  return fe?.[path]?.[0];
}

export function SettingsForm({
  initialCompany,
  initialValues,
  mediaAssets,
  action,
}: Props) {
  const [state, formAction] = useActionState<SettingsFormState | null, FormData>(action, null);
  const [company, setCompany] = useState<CompanyJson>(initialCompany);
  const [values, setValues] = useState<ValueItem[]>(initialValues);
  const [activeTab, setActiveTab] = useState<TabId>("identitas");
  const visibleSections = new Set(
    TABS.find((t) => t.id === activeTab)?.sections ?? [],
  );

  const fe = state?.fieldErrors;
  const companyJson = useMemo(() => JSON.stringify(company), [company]);
  const valuesJson = useMemo(() => JSON.stringify(values), [values]);

  const ids = {
    legalName: useId(),
    shortName: useId(),
    tagline: useId(),
    foundedYear: useId(),
    storyHeadline: useId(),
    visi: useId(),
    address: useId(),
    city: useId(),
    province: useId(),
    postalCode: useId(),
    country: useId(),
    phone: useId(),
    whatsapp: useId(),
    email: useId(),
    operationalHours: useId(),
    mapEmbedUrl: useId(),
    legalEntity: useId(),
    nib: useId(),
    npwp: useId(),
    instagram: useId(),
    linkedin: useId(),
    facebook: useId(),
    youtube: useId(),
    tiktok: useId(),
    privacyPolicy: useId(),
    termsAndConditions: useId(),
  };

  const setField = <K extends keyof CompanyJson>(key: K, value: CompanyJson[K]) =>
    setCompany((prev) => ({ ...prev, [key]: value }));

  const setSocial = (key: keyof CompanyJson["socials"], val: string) =>
    setCompany((p) => ({ ...p, socials: { ...p.socials, [key]: val } }));

  const setLegal = (key: keyof CompanyJson["legal"], val: string) =>
    setCompany((p) => ({ ...p, legal: { ...p.legal, [key]: val } }));

  const updateParagraph = (i: number, v: string) => {
    setCompany((p) => {
      const paras = [...p.story.paragraphs];
      paras[i] = v;
      return { ...p, story: { ...p.story, paragraphs: paras } };
    });
  };
  const addParagraph = () => setCompany((p) => ({ ...p, story: { ...p.story, paragraphs: [...p.story.paragraphs, ""] } }));
  const removeParagraph = (i: number) =>
    setCompany((p) => ({ ...p, story: { ...p.story, paragraphs: p.story.paragraphs.filter((_, idx) => idx !== i) } }));

  const updateMisi = (i: number, v: string) =>
    setCompany((p) => {
      const m = [...p.misi];
      m[i] = v;
      return { ...p, misi: m };
    });
  const addMisi = () => setCompany((p) => ({ ...p, misi: [...p.misi, ""] }));
  const removeMisi = (i: number) =>
    setCompany((p) => ({ ...p, misi: p.misi.filter((_, idx) => idx !== i) }));

  const updateValue = (i: number, key: keyof ValueItem, v: string) => {
    setValues((arr) => {
      const next = [...arr];
      next[i] = { ...next[i], [key]: v };
      return next;
    });
  };
  const addValue = () => setValues((arr) => [...arr, { title: "", description: "", iconKey: "CheckCircle2" }]);
  const removeValue = (i: number) => setValues((arr) => arr.filter((_, idx) => idx !== i));

  // ── Testimonials (M10.1) ─────────────────────────────────────────────
  const testimonials: Testimonial[] = company.testimonials ?? [];
  const updateTestimonial = <K extends keyof Testimonial>(
    i: number,
    key: K,
    v: Testimonial[K],
  ) =>
    setCompany((p) => {
      const arr = [...(p.testimonials ?? [])];
      arr[i] = { ...arr[i], [key]: v };
      return { ...p, testimonials: arr };
    });
  const addTestimonial = () =>
    setCompany((p) => ({
      ...p,
      testimonials: [
        ...(p.testimonials ?? []),
        { quote: "", name: "", role: "", company: "", avatarMediaId: "" },
      ],
    }));
  const removeTestimonial = (i: number) =>
    setCompany((p) => ({
      ...p,
      testimonials: (p.testimonials ?? []).filter((_, idx) => idx !== i),
    }));

  // ── FAQ helpers (support cleanup) ──────────────────────────────────
  type FaqItemValue = NonNullable<CompanyJson["faq"]>[number];
  const faqItems: FaqItemValue[] = company.faq ?? [];
  const updateFaq = <K extends keyof FaqItemValue>(
    i: number,
    key: K,
    v: FaqItemValue[K],
  ) =>
    setCompany((p) => {
      const arr = [...(p.faq ?? [])];
      arr[i] = { ...arr[i], [key]: v };
      return { ...p, faq: arr };
    });
  const addFaq = () =>
    setCompany((p) => ({
      ...p,
      faq: [
        ...(p.faq ?? []),
        { topic: "KONTAK_PERUSAHAAN", question: "", answer: "" },
      ],
    }));
  const removeFaq = (i: number) =>
    setCompany((p) => ({
      ...p,
      faq: (p.faq ?? []).filter((_, idx) => idx !== i),
    }));

  const textareaCls =
    "min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

  const privacyHtml = company.privacyPolicy ?? "";
  const termsHtml = company.termsAndConditions ?? "";

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="companyJson" value={companyJson} />
      <input type="hidden" name="valuesJson" value={valuesJson} />

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
                      msgs?.[0] ? <li key={k}>{`${k}: ${msgs[0]}`}</li> : null,
                    )}
                  </ul>
                )}
              </span>
            </span>
          }
        />
      )}

      {/* Tab bar (UX 5) — choose which category of settings to edit. Single save
          applies to all tabs at once. */}
      <div
        role="tablist"
        aria-label="Kategori pengaturan"
        className="-mx-1 flex flex-wrap gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1 shadow-sm"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={activeTab === t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-colors sm:text-sm",
              activeTab === t.id
                ? "bg-brand-orange text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-ink-900",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        <div className="space-y-6">
          {/* ── Identitas ────────────────────────────────────────────── */}
          <div id="identitas" className={cn("scroll-mt-24", !visibleSections.has("identitas") && "hidden")}>
            <FormSection title="Identitas perusahaan">
              <FormField label="Nama legal" htmlFor={ids.legalName} required error={fieldErr(fe, "company.legalName")}>
                <Input id={ids.legalName} value={company.legalName} onChange={(e) => setField("legalName", e.target.value)} maxLength={200} />
              </FormField>
              <FormField label="Nama pendek" htmlFor={ids.shortName} required error={fieldErr(fe, "company.shortName")}>
                <Input id={ids.shortName} value={company.shortName} onChange={(e) => setField("shortName", e.target.value)} maxLength={60} />
              </FormField>
              <FormField label="Tagline" htmlFor={ids.tagline} required error={fieldErr(fe, "company.tagline")}>
                <textarea id={ids.tagline} value={company.tagline} onChange={(e) => setField("tagline", e.target.value)} rows={2} maxLength={300} className={textareaCls} />
              </FormField>
              <FormField label="Tahun berdiri" htmlFor={ids.foundedYear} required error={fieldErr(fe, "company.foundedYear")}>
                <Input id={ids.foundedYear} type="number" value={company.foundedYear} onChange={(e) => setField("foundedYear", Number(e.target.value) || 0)} min={1900} max={new Date().getFullYear() + 1} />
              </FormField>
            </FormSection>
          </div>

          {/* ── Cerita ─────────────────────────────────────────────── */}
          <div id="cerita" className={cn("scroll-mt-24", !visibleSections.has("cerita") && "hidden")}>
            <FormSection title="Cerita perusahaan" description="Tampil di halaman /tentang.">
              <FormField label="Judul cerita" htmlFor={ids.storyHeadline} required error={fieldErr(fe, "company.story.headline")}>
                <Input id={ids.storyHeadline} value={company.story.headline} onChange={(e) => setCompany((p) => ({ ...p, story: { ...p.story, headline: e.target.value } }))} maxLength={200} />
              </FormField>
              <div className="grid gap-3">
                <label className="text-sm font-medium">Paragraf cerita</label>
                {company.story.paragraphs.map((para, i) => (
                  <div key={i} className="flex gap-2">
                    <textarea value={para} onChange={(e) => updateParagraph(i, e.target.value)} rows={3} maxLength={1000} className={`flex-1 ${textareaCls}`} />
                    {company.story.paragraphs.length > 1 && (
                      <Button type="button" size="icon-sm" variant="outline" onClick={() => removeParagraph(i)} aria-label="Hapus paragraf" className="self-start text-destructive">
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
                {company.story.paragraphs.length < 4 && (
                  <Button type="button" size="sm" variant="outline" onClick={addParagraph} className="w-fit">
                    <Plus className="size-3.5" />
                    Tambah paragraf
                  </Button>
                )}
                {fieldErr(fe, "company.story.paragraphs") && (
                  <p className="text-xs text-destructive">{fieldErr(fe, "company.story.paragraphs")}</p>
                )}
              </div>
            </FormSection>
          </div>

          {/* ── Visi & Misi ────────────────────────────────────────── */}
          <div id="visi-misi" className={cn("scroll-mt-24", !visibleSections.has("visi-misi") && "hidden")}>
            <FormSection title="Visi & Misi">
              <FormField label="Visi" htmlFor="visi" hint="Satu kalimat ringkas (≤500 karakter)." required error={fieldErr(fe, "company.visi")}>
                <textarea id="visi" value={company.visi} onChange={(e) => setField("visi", e.target.value)} rows={3} maxLength={500} className={textareaCls} />
              </FormField>
              <div className="grid gap-3">
                <label className="text-sm font-medium">Misi</label>
                {company.misi.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={m} onChange={(e) => updateMisi(i, e.target.value)} maxLength={200} className="flex-1" />
                    {company.misi.length > 1 && (
                      <Button type="button" size="icon-sm" variant="outline" onClick={() => removeMisi(i)} aria-label="Hapus misi" className="text-destructive">
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
                {company.misi.length < 6 && (
                  <Button type="button" size="sm" variant="outline" onClick={addMisi} className="w-fit">
                    <Plus className="size-3.5" />
                    Tambah misi
                  </Button>
                )}
                {fieldErr(fe, "company.misi") && <p className="text-xs text-destructive">{fieldErr(fe, "company.misi")}</p>}
              </div>
            </FormSection>
          </div>

          {/* ── Nilai Inti (Core Values) ───────────────────────────── */}
          <div id="nilai" className={cn("scroll-mt-24", !visibleSections.has("nilai") && "hidden")}>
            <FormSection title="Nilai Inti" description="Kartu nilai di halaman beranda + /tentang.">
              <div className="grid gap-3">
                {values.map((v, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nilai #{i + 1}</span>
                      {values.length > 2 && (
                        <Button type="button" size="icon-sm" variant="outline" onClick={() => removeValue(i)} aria-label="Hapus nilai" className="text-destructive">
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Input placeholder="Judul (mis. Profesional)" value={v.title} onChange={(e) => updateValue(i, "title", e.target.value)} maxLength={40} />
                      <textarea placeholder="Deskripsi singkat" value={v.description} onChange={(e) => updateValue(i, "description", e.target.value)} rows={2} maxLength={300} className={textareaCls} />
                      <Input placeholder="Icon (lucide, mis. CheckCircle2)" value={v.iconKey ?? ""} onChange={(e) => updateValue(i, "iconKey", e.target.value)} maxLength={60} />
                    </div>
                  </div>
                ))}
                {values.length < 6 && (
                  <Button type="button" size="sm" variant="outline" onClick={addValue} className="w-fit">
                    <Plus className="size-3.5" />
                    Tambah nilai
                  </Button>
                )}
              </div>
            </FormSection>
          </div>

          {/* ── Alamat ─────────────────────────────────────────────── */}
          <div id="alamat" className={cn("scroll-mt-24", !visibleSections.has("alamat") && "hidden")}>
            <FormSection title="Alamat">
              <FormField label="Alamat" htmlFor={ids.address} required error={fieldErr(fe, "company.address")}>
                <Input id={ids.address} value={company.address} onChange={(e) => setField("address", e.target.value)} maxLength={300} />
              </FormField>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Kota" htmlFor={ids.city} required error={fieldErr(fe, "company.city")}>
                  <Input id={ids.city} value={company.city} onChange={(e) => setField("city", e.target.value)} maxLength={100} />
                </FormField>
                <FormField label="Provinsi" htmlFor={ids.province} required error={fieldErr(fe, "company.province")}>
                  <Input id={ids.province} value={company.province} onChange={(e) => setField("province", e.target.value)} maxLength={100} />
                </FormField>
                <FormField label="Kode pos" htmlFor={ids.postalCode} required error={fieldErr(fe, "company.postalCode")}>
                  <Input id={ids.postalCode} value={company.postalCode} onChange={(e) => setField("postalCode", e.target.value)} maxLength={20} />
                </FormField>
                <FormField label="Negara" htmlFor={ids.country} required error={fieldErr(fe, "company.country")}>
                  <Input id={ids.country} value={company.country} onChange={(e) => setField("country", e.target.value)} maxLength={100} />
                </FormField>
              </div>
            </FormSection>
          </div>

          {/* ── Kontak & Jam ───────────────────────────────────────── */}
          <div id="kontak" className={cn("scroll-mt-24", !visibleSections.has("kontak") && "hidden")}>
            <FormSection title="Kontak & Jam operasional">
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Telepon" htmlFor={ids.phone} required error={fieldErr(fe, "company.phone")}>
                  <Input id={ids.phone} value={company.phone} onChange={(e) => setField("phone", e.target.value)} maxLength={40} />
                </FormField>
                <FormField label="WhatsApp" htmlFor={ids.whatsapp} required error={fieldErr(fe, "company.whatsapp")}>
                  <Input id={ids.whatsapp} value={company.whatsapp} onChange={(e) => setField("whatsapp", e.target.value)} maxLength={40} />
                </FormField>
                <FormField label="Email" htmlFor={ids.email} required error={fieldErr(fe, "company.email")}>
                  <Input id={ids.email} type="email" value={company.email} onChange={(e) => setField("email", e.target.value)} maxLength={254} />
                </FormField>
                <FormField label="Jam operasional" htmlFor={ids.operationalHours} required error={fieldErr(fe, "company.operationalHours")}>
                  <Input id={ids.operationalHours} value={company.operationalHours} onChange={(e) => setField("operationalHours", e.target.value)} maxLength={200} />
                </FormField>
              </div>
              <FormField
                label="Google Maps embed URL (opsional)"
                htmlFor={ids.mapEmbedUrl}
                hint='Tempel URL dari Google Maps → Share → "Embed a map" → salin nilai src dari iframe. Kosongkan untuk pakai placeholder + link Google Maps Search.'
                error={fieldErr(fe, "company.mapEmbedUrl")}
              >
                <Input
                  id={ids.mapEmbedUrl}
                  type="url"
                  value={company.mapEmbedUrl ?? ""}
                  onChange={(e) => setField("mapEmbedUrl", e.target.value)}
                  placeholder="https://www.google.com/maps/embed?pb=…"
                  maxLength={2000}
                />
              </FormField>
            </FormSection>
          </div>

          {/* ── Legal ──────────────────────────────────────────────── */}
          <div id="legal" className={cn("scroll-mt-24", !visibleSections.has("legal") && "hidden")}>
            <FormSection title="Legal">
              <div className="grid gap-3 sm:grid-cols-3">
                <FormField label="Bentuk badan" htmlFor={ids.legalEntity} required error={fieldErr(fe, "company.legal.entity")}>
                  <Input id={ids.legalEntity} value={company.legal.entity} onChange={(e) => setLegal("entity", e.target.value)} maxLength={100} />
                </FormField>
                <FormField label="NIB" htmlFor={ids.nib} required error={fieldErr(fe, "company.legal.nib")}>
                  <Input id={ids.nib} value={company.legal.nib} onChange={(e) => setLegal("nib", e.target.value)} maxLength={60} />
                </FormField>
                <FormField label="NPWP" htmlFor={ids.npwp} required error={fieldErr(fe, "company.legal.npwp")}>
                  <Input id={ids.npwp} value={company.legal.npwp} onChange={(e) => setLegal("npwp", e.target.value)} maxLength={60} />
                </FormField>
              </div>
            </FormSection>
          </div>

          {/* ── Testimonials (M10.1) ───────────────────────────────── */}
          <div id="testimoni" className={cn("scroll-mt-24", !visibleSections.has("testimoni") && "hidden")}>
            <FormSection
              title="Testimoni klien"
              description="Tampil di halaman beranda antara bagian Klien dan Sertifikasi. Maksimum 6 testimoni."
            >
              <div className="grid gap-3">
                {testimonials.length === 0 && (
                  <p className="text-sm italic text-muted-foreground">
                    Belum ada testimoni. Tambahkan untuk menampilkan band kepercayaan di beranda.
                  </p>
                )}
                {testimonials.map((t, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Testimoni #{i + 1}
                      </span>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        onClick={() => removeTestimonial(i)}
                        aria-label="Hapus testimoni"
                        className="text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    <div className="grid gap-3">
                      <textarea
                        placeholder="Kutipan singkat (10 – 500 karakter)"
                        value={t.quote}
                        onChange={(e) => updateTestimonial(i, "quote", e.target.value)}
                        rows={3}
                        maxLength={500}
                        className={textareaCls}
                      />
                      {fieldErr(fe, `company.testimonials.${i}.quote`) && (
                        <p className="text-xs text-destructive">
                          {fieldErr(fe, `company.testimonials.${i}.quote`)}
                        </p>
                      )}
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Input
                          placeholder="Nama"
                          value={t.name}
                          onChange={(e) => updateTestimonial(i, "name", e.target.value)}
                          maxLength={80}
                        />
                        <Input
                          placeholder="Jabatan"
                          value={t.role}
                          onChange={(e) => updateTestimonial(i, "role", e.target.value)}
                          maxLength={100}
                        />
                        <Input
                          placeholder="Perusahaan (opsional)"
                          value={t.company ?? ""}
                          onChange={(e) => updateTestimonial(i, "company", e.target.value)}
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                          Foto avatar (opsional — gunakan inisial jika kosong)
                        </p>
                        <MediaPicker
                          name={`__testimonial_${i}_avatar`}
                          defaultValue={t.avatarMediaId ?? undefined}
                          assets={mediaAssets}
                          onSelect={(id) =>
                            updateTestimonial(i, "avatarMediaId", id ?? "")
                          }
                          triggerLabel={
                            t.avatarMediaId
                              ? "Ganti foto avatar"
                              : "Pilih foto dari Media Library"
                          }
                        />
                        {/* Power-user manual fallback for pointing at a seed
                            media ID (e.g. `media:team/…`) that isn't browsable
                            via the Media Library yet. */}
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-ink-900">
                            Edit ID avatar manual
                          </summary>
                          <Input
                            value={t.avatarMediaId ?? ""}
                            onChange={(e) =>
                              updateTestimonial(i, "avatarMediaId", e.target.value)
                            }
                            placeholder="MediaAsset ID (mis. media:team/…) — kosongkan untuk pakai inisial"
                            className="mt-1.5"
                            maxLength={200}
                          />
                        </details>
                      </div>
                    </div>
                  </div>
                ))}
                {testimonials.length < 6 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addTestimonial}
                    className="w-fit"
                  >
                    <Plus className="size-3.5" />
                    Tambah testimoni
                  </Button>
                )}
                {fieldErr(fe, "company.testimonials") && (
                  <p className="text-xs text-destructive">
                    {fieldErr(fe, "company.testimonials")}
                  </p>
                )}
              </div>
            </FormSection>
          </div>

          {/* ── Layanan Pelanggan: support hours (support cleanup) ─── */}
          <div id="support-hours" className={cn("scroll-mt-24", !visibleSections.has("support-hours") && "hidden")}>
            <FormSection
              title="Jam Layanan Pelanggan"
              description="Tampil di header Support Widget (tombol mengambang). Kosongkan untuk pakai Jam Operasional umum."
            >
              <FormField
                label="Jam support (opsional)"
                htmlFor="supportHours"
                hint="Contoh: Senin–Sabtu 08.00–17.00 WIB"
                error={fieldErr(fe, "company.supportHours")}
              >
                <Input
                  id="supportHours"
                  value={company.supportHours ?? ""}
                  onChange={(e) => setField("supportHours", e.target.value)}
                  placeholder="Senin–Sabtu 08.00–17.00 WIB"
                  maxLength={160}
                />
              </FormField>
            </FormSection>
          </div>

          {/* ── Layanan Pelanggan: FAQ repeater (support cleanup) ──── */}
          <div id="faq" className={cn("scroll-mt-24", !visibleSections.has("faq") && "hidden")}>
            <FormSection
              title="Pertanyaan Umum (FAQ)"
              description="Tampil di halaman /kontak (anchor #faq) dan di-link dari Support Widget. Maksimum 15 pertanyaan."
            >
              <div className="grid gap-3">
                {faqItems.length === 0 && (
                  <p className="text-sm italic text-muted-foreground">
                    Belum ada FAQ. Tambahkan agar calon pelanggan dapat menemukan
                    jawaban sebelum menghubungi tim Anda.
                  </p>
                )}
                {faqItems.map((item, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        FAQ #{i + 1}
                      </span>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        onClick={() => removeFaq(i)}
                        aria-label="Hapus FAQ"
                        className="text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    <div className="grid gap-3">
                      <div className="grid gap-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Topik
                        </label>
                        <select
                          value={item.topic ?? "KONTAK_PERUSAHAAN"}
                          onChange={(e) =>
                            updateFaq(i, "topic", e.target.value as typeof SUPPORT_TOPICS[number])
                          }
                          className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                        >
                          {SUPPORT_TOPICS.map((t) => (
                            <option key={t} value={t}>
                              {SUPPORT_TOPIC_LABEL[t]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Input
                        placeholder="Pertanyaan (mis. Bagaimana cara meminta penawaran?)"
                        value={item.question}
                        onChange={(e) => updateFaq(i, "question", e.target.value)}
                        maxLength={200}
                      />
                      {fieldErr(fe, `company.faq.${i}.question`) && (
                        <p className="text-xs text-destructive">
                          {fieldErr(fe, `company.faq.${i}.question`)}
                        </p>
                      )}
                      <textarea
                        placeholder="Jawaban singkat (10 – 2000 karakter). Boleh beberapa paragraf."
                        value={item.answer}
                        onChange={(e) => updateFaq(i, "answer", e.target.value)}
                        rows={4}
                        maxLength={2000}
                        className={textareaCls}
                      />
                      {fieldErr(fe, `company.faq.${i}.answer`) && (
                        <p className="text-xs text-destructive">
                          {fieldErr(fe, `company.faq.${i}.answer`)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {faqItems.length < 15 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addFaq}
                    className="w-fit"
                  >
                    <Plus className="size-3.5" />
                    Tambah FAQ
                  </Button>
                )}
                {fieldErr(fe, "company.faq") && (
                  <p className="text-xs text-destructive">
                    {fieldErr(fe, "company.faq")}
                  </p>
                )}
              </div>
            </FormSection>
          </div>

          {/* ── Kebijakan Privasi (M10.1) ──────────────────────────── */}
          <div id="privasi" className={cn("scroll-mt-24", !visibleSections.has("privasi") && "hidden")}>
            <FormSection
              title="Kebijakan Privasi"
              description="Konten halaman /privasi. HTML disanitasi otomatis. Kosongkan untuk pakai versi placeholder."
            >
              <FormField
                label="Isi kebijakan"
                htmlFor={ids.privacyPolicy}
                hint="Gunakan toolbar untuk memformat — judul, paragraf, daftar. Kosongkan untuk pakai teks placeholder bawaan."
                error={fieldErr(fe, "company.privacyPolicy")}
              >
                <RichTextEditor
                  value={privacyHtml}
                  onChange={(html) => setField("privacyPolicy", html)}
                  ariaLabel="Isi kebijakan privasi"
                  placeholder="Tulis isi kebijakan privasi…"
                  minHeightClass="min-h-[320px]"
                />
              </FormField>
            </FormSection>
          </div>

          {/* ── Syarat & Ketentuan (M10.1) ────────────────────────── */}
          <div id="syarat" className={cn("scroll-mt-24", !visibleSections.has("syarat") && "hidden")}>
            <FormSection
              title="Syarat & Ketentuan"
              description="Konten halaman /syarat-ketentuan. HTML disanitasi otomatis. Kosongkan untuk pakai versi placeholder."
            >
              <FormField
                label="Isi syarat & ketentuan"
                htmlFor={ids.termsAndConditions}
                hint="Gunakan toolbar untuk memformat — judul, paragraf, daftar. Kosongkan untuk pakai teks placeholder bawaan."
                error={fieldErr(fe, "company.termsAndConditions")}
              >
                <RichTextEditor
                  value={termsHtml}
                  onChange={(html) => setField("termsAndConditions", html)}
                  ariaLabel="Isi syarat & ketentuan"
                  placeholder="Tulis isi syarat & ketentuan…"
                  minHeightClass="min-h-[320px]"
                />
              </FormField>
            </FormSection>
          </div>

          {/* ── Sosial Media ───────────────────────────────────────── */}
          <div id="sosial" className={cn("scroll-mt-24", !visibleSections.has("sosial") && "hidden")}>
            <FormSection title="Sosial media" description="Opsional. Awali dengan https://. Kosongkan jika tidak dipakai.">
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Instagram" htmlFor={ids.instagram} error={fieldErr(fe, "company.socials.instagram")}>
                  <Input id={ids.instagram} type="url" value={company.socials.instagram ?? ""} onChange={(e) => setSocial("instagram", e.target.value)} placeholder="https://instagram.com/…" />
                </FormField>
                <FormField label="LinkedIn" htmlFor={ids.linkedin} error={fieldErr(fe, "company.socials.linkedin")}>
                  <Input id={ids.linkedin} type="url" value={company.socials.linkedin ?? ""} onChange={(e) => setSocial("linkedin", e.target.value)} placeholder="https://linkedin.com/company/…" />
                </FormField>
                <FormField label="Facebook" htmlFor={ids.facebook} error={fieldErr(fe, "company.socials.facebook")}>
                  <Input id={ids.facebook} type="url" value={company.socials.facebook ?? ""} onChange={(e) => setSocial("facebook", e.target.value)} placeholder="https://facebook.com/…" />
                </FormField>
                <FormField label="YouTube" htmlFor={ids.youtube} error={fieldErr(fe, "company.socials.youtube")}>
                  <Input id={ids.youtube} type="url" value={company.socials.youtube ?? ""} onChange={(e) => setSocial("youtube", e.target.value)} placeholder="https://youtube.com/@…" />
                </FormField>
                <FormField label="TikTok" htmlFor={ids.tiktok} error={fieldErr(fe, "company.socials.tiktok")}>
                  <Input id={ids.tiktok} type="url" value={company.socials.tiktok ?? ""} onChange={(e) => setSocial("tiktok", e.target.value)} placeholder="https://tiktok.com/@…" />
                </FormField>
              </div>
            </FormSection>
          </div>

          <FormActions>
            <SubmitButton />
          </FormActions>
        </div>
      </div>
    </form>
  );
}
