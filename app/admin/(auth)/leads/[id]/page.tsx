/**
 * Lead detail / status change / delete — /admin/leads/[id]
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle2, Mail, MessageCircle, Phone, Trash2 } from "lucide-react";
import { FormBanner } from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { cn } from "@/lib/utils";
import { requirePermission } from "@/server/auth/guards";
import { LeadService } from "@/server/services/lead.service";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
  type LeadStatusValue,
} from "@/lib/validation/lead";
import { getSiteSettings } from "@/lib/data/settings";
import { deleteLeadAction, updateLeadStatusAction } from "../actions";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ updated?: string; error?: string }>;

const UPDATED_MAP: Record<string, string> = {
  status: "Status berhasil diperbarui.",
};
const ERROR_MAP: Record<string, string> = {
  not_found: "Permintaan tidak ditemukan.",
  validation: "Data tidak valid.",
  unknown: "Terjadi kesalahan. Coba lagi.",
};

export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const session = await requirePermission("lead:read");
  const { id } = await params;
  const { updated, error } = await searchParams;
  const canUpdate = session.permissions.includes("lead:update");

  const [lead, settings] = await Promise.all([
    LeadService.findById(id),
    getSiteSettings(),
  ]);
  if (!lead) notFound();

  const waDigits = (lead.phone ?? settings.whatsapp).replace(/\D/g, "");
  const waMessage = encodeURIComponent(
    `Halo ${lead.name}, terima kasih atas permintaan Anda ke BMI. Apa kami bisa bantu lebih lanjut?`,
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="size-4" />
        Kembali ke daftar permintaan
      </Link>

      {updated && (
        <FormBanner
          variant="success"
          message={
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              {UPDATED_MAP[updated] ?? "Berhasil."}
            </span>
          }
        />
      )}
      {error && (
        <FormBanner
          variant="error"
          message={
            <span className="inline-flex items-center gap-2">
              <AlertTriangle className="size-4" />
              {ERROR_MAP[error] ?? ERROR_MAP.unknown}
            </span>
          }
        />
      )}

      <header className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900">
              {lead.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {lead.company ?? "—"} · diterima{" "}
              <time dateTime={lead.createdAt.toISOString()}>
                {lead.createdAt.toLocaleString("id-ID", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </time>
            </p>
          </div>
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-xs font-medium",
              lead.status === "NEW" && "bg-brand-orange/10 text-brand-orange-strong",
              lead.status === "CONTACTED" && "bg-sky-100 text-sky-800",
              lead.status === "QUALIFIED" && "bg-emerald-100 text-emerald-800",
              lead.status === "CLOSED" && "bg-muted text-muted-foreground",
            )}
          >
            {LEAD_STATUS_LABEL[lead.status as LeadStatusValue]}
          </span>
        </div>

        {/* Quick contact channels */}
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={`mailto:${lead.email}?subject=${encodeURIComponent("Tanggapan permintaan Anda ke BMI")}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-ink-900 hover:bg-muted"
          >
            <Mail className="size-3.5" />
            {lead.email}
          </a>
          {lead.phone && (
            <>
              <a
                href={`tel:${lead.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-ink-900 hover:bg-muted"
              >
                <Phone className="size-3.5" />
                {lead.phone}
              </a>
              <a
                href={`https://wa.me/${waDigits}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
              >
                <MessageCircle className="size-3.5" />
                WhatsApp
              </a>
            </>
          )}
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Pesan calon pelanggan
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/85">
          {lead.message}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-4">
          <div>
            <dt className="font-medium uppercase tracking-wider">Layanan</dt>
            <dd className="mt-0.5 text-ink-900">
              {lead.service ? lead.service.replaceAll("_", " ") : "—"}
            </dd>
          </div>
          <div>
            <dt className="font-medium uppercase tracking-wider">Sumber</dt>
            <dd className="mt-0.5 text-ink-900">{lead.source ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium uppercase tracking-wider">ID</dt>
            <dd className="mt-0.5 font-mono text-ink-900">{lead.id.slice(0, 12)}…</dd>
          </div>
        </dl>
      </section>

      {/* Status change + delete */}
      {canUpdate && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Ubah status
          </h2>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Update status setelah Anda menindaklanjuti permintaan ini.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {LEAD_STATUSES.map((s) => (
              <form key={s} action={updateLeadStatusAction}>
                <input type="hidden" name="id" value={lead.id} />
                <input type="hidden" name="status" value={s} />
                <Button
                  type="submit"
                  size="sm"
                  variant={lead.status === s ? "default" : "outline"}
                  disabled={lead.status === s}
                  className={cn(
                    lead.status === s &&
                      "bg-brand-orange text-white hover:bg-brand-orange-strong",
                  )}
                >
                  {LEAD_STATUS_LABEL[s]}
                </Button>
              </form>
            ))}
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-destructive">
              Zona berbahaya
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Menghapus permintaan ini bersifat permanen. Riwayat tetap di
              Riwayat Aktivitas untuk keperluan audit.
            </p>
            <div className="mt-3">
              <ConfirmDialog
                trigger={
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/5"
                  >
                    <Trash2 className="size-3.5" />
                    Hapus permintaan
                  </Button>
                }
                title="Hapus permintaan?"
                description={
                  <>
                    Permintaan dari <strong>{lead.name}</strong> ({lead.email})
                    akan dihapus permanen.
                  </>
                }
                confirmLabel="Hapus"
                variant="danger"
                action={deleteLeadAction}
                hiddenFields={{ id: lead.id }}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
