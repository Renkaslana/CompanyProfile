"use client";

/**
 * Cloudinary signed direct-upload form.
 *
 * Flow:
 *   1. User picks a file + fills folder/alt/title/tags fields.
 *   2. We POST { folder } to /api/v1/admin/media/sign and receive a signed
 *      payload (cloudName, apiKey, timestamp, folder, signature).
 *   3. We POST the file directly to https://api.cloudinary.com/v1_1/{cloud}/image/upload
 *      with the signed params. Browser → Cloudinary, no Next server in the hop.
 *   4. We post the Cloudinary upload result + metadata to `persistUploadAction`
 *      via a hidden <form>. That action validates + writes the MediaAsset row
 *      and redirects back to /admin/media with a banner.
 *
 * The Dialog confines the multi-step state so a failed upload doesn't dirty
 * the list page. ConfirmDialog isn't used here because the user expects an
 * interactive form, not a confirm.
 */
import { useId, useRef, useState, useTransition, type FormEvent } from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MEDIA_FOLDERS } from "@/lib/validation/media";
import { persistUploadAction } from "./actions";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_PREFIX = "image/";

/**
 * Cloudinary's `format` field returns the *file extension* (e.g. `jpg`,
 * `svg`), not the canonical MIME subtype (`jpeg`, `svg+xml`). Normalize it
 * here so the persist payload carries a real IANA MIME type and passes
 * server-side validation.
 */
function cloudinaryFormatToMime(format: string): string {
  const f = format.toLowerCase();
  if (f === "jpg" || f === "jpeg") return "image/jpeg";
  if (f === "svg") return "image/svg+xml";
  return `image/${f}`;
}

type SignedPayload = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

type CloudinaryUploadResult = {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resource_type: string;
};

export function UploadFormDialog() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const formId = useId();
  const persistFormRef = useRef<HTMLFormElement>(null);

  // Persist-form hidden field values (populated after Cloudinary upload).
  const [persistFields, setPersistFields] = useState<{
    publicId: string;
    url: string;
    width: string;
    height: string;
    mimeType: string;
    folder: string;
    alt: string;
    title: string;
    tags: string;
  } | null>(null);

  function reset() {
    setBusy(false);
    setError(null);
    setProgress(null);
    setPersistFields(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setProgress(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get("file") as File | null;
    const folder = (fd.get("folder") as string | null) ?? "";
    const alt = ((fd.get("alt") as string | null) ?? "").trim();
    const title = ((fd.get("title") as string | null) ?? "").trim();
    const tags = ((fd.get("tags") as string | null) ?? "").trim();

    if (!file || file.size === 0) {
      setError("Pilih file terlebih dahulu.");
      return;
    }
    if (!file.type.startsWith(ALLOWED_MIME_PREFIX)) {
      setError("Hanya file gambar (image/*) yang diperbolehkan.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Ukuran file maksimum 10 MB.");
      return;
    }
    if (!MEDIA_FOLDERS.includes(folder as (typeof MEDIA_FOLDERS)[number])) {
      setError("Folder tidak valid.");
      return;
    }

    setBusy(true);
    try {
      // 1. Ask the server for a signed payload.
      setProgress("Menyiapkan tanda tangan…");
      const signRes = await fetch("/api/v1/admin/media/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });
      if (!signRes.ok) {
        const j = await signRes.json().catch(() => ({}));
        throw new Error(
          j?.error ??
            (signRes.status === 503
              ? "Cloudinary belum dikonfigurasi (.env)."
              : `Gagal mendapatkan tanda tangan (${signRes.status}).`),
        );
      }
      const payload = (await signRes.json()) as SignedPayload;

      // 2. Upload directly to Cloudinary.
      setProgress("Mengunggah ke Cloudinary…");
      const cloudFd = new FormData();
      cloudFd.set("file", file);
      cloudFd.set("api_key", payload.apiKey);
      cloudFd.set("timestamp", String(payload.timestamp));
      cloudFd.set("folder", payload.folder);
      cloudFd.set("signature", payload.signature);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${payload.cloudName}/image/upload`,
        { method: "POST", body: cloudFd },
      );
      if (!cloudRes.ok) {
        const j = await cloudRes.json().catch(() => ({}));
        throw new Error(
          (j?.error?.message as string | undefined) ??
            `Cloudinary menolak unggahan (${cloudRes.status}).`,
        );
      }
      const result = (await cloudRes.json()) as CloudinaryUploadResult;

      // 3. Stash fields and submit the persist form (Server Action).
      setProgress("Menyimpan ke database…");
      setPersistFields({
        publicId: result.public_id,
        url: result.secure_url,
        width: String(result.width ?? ""),
        height: String(result.height ?? ""),
        mimeType: cloudinaryFormatToMime(result.format),
        folder,
        alt,
        title,
        tags,
      });
      // Allow React to render the hidden inputs, then submit.
      startTransition(() => {
        // Use rAF to make sure the form has flushed.
        requestAnimationFrame(() => persistFormRef.current?.requestSubmit());
      });
    } catch (err) {
      setBusy(false);
      setProgress(null);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  }

  return (
    <BaseDialog.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <BaseDialog.Trigger
        render={
          <Button className="bg-brand-orange text-white hover:bg-brand-orange-strong">
            <Upload className="size-4" />
            Unggah media
          </Button>
        }
      />
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-ink-950/40 backdrop-blur-sm" />
        <BaseDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card p-6 shadow-2xl ring-1 ring-border">
          <div className="flex items-start justify-between">
            <div>
              <BaseDialog.Title className="font-display text-lg font-semibold text-ink-900">
                Unggah media
              </BaseDialog.Title>
              <BaseDialog.Description className="mt-1 text-sm text-muted-foreground">
                Gambar diunggah langsung ke Cloudinary, lalu metadatanya
                disimpan di database.
              </BaseDialog.Description>
            </div>
            <button
              type="button"
              aria-label="Tutup"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          <form id={formId} onSubmit={handleSubmit} className="mt-5 grid gap-4">
            <div className="grid gap-1.5">
              <label htmlFor={`${formId}-file`} className="text-sm font-medium">
                File gambar <span className="text-destructive">*</span>
              </label>
              <input
                id={`${formId}-file`}
                name="file"
                type="file"
                accept="image/*"
                required
                disabled={busy}
                className="block w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-orange/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-brand-orange-strong"
              />
              <p className="text-xs text-muted-foreground">
                JPG / PNG / WebP / AVIF. Maksimum 10 MB.
              </p>
            </div>

            <div className="grid gap-1.5">
              <label htmlFor={`${formId}-folder`} className="text-sm font-medium">
                Folder <span className="text-destructive">*</span>
              </label>
              <select
                id={`${formId}-folder`}
                name="folder"
                required
                defaultValue="gallery"
                disabled={busy}
                className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                {MEDIA_FOLDERS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1.5">
              <label htmlFor={`${formId}-alt`} className="text-sm font-medium">
                Alt text (deskripsi gambar)
              </label>
              <Input
                id={`${formId}-alt`}
                name="alt"
                disabled={busy}
                maxLength={500}
                placeholder="Truk BMI memuat kontainer di pelabuhan…"
              />
            </div>

            <div className="grid gap-1.5">
              <label htmlFor={`${formId}-title`} className="text-sm font-medium">
                Judul
              </label>
              <Input
                id={`${formId}-title`}
                name="title"
                disabled={busy}
                maxLength={120}
                placeholder="Operasional Tanjung Priok"
              />
            </div>

            <div className="grid gap-1.5">
              <label htmlFor={`${formId}-tags`} className="text-sm font-medium">
                Tag <span className="text-xs text-muted-foreground">(pisahkan dengan koma)</span>
              </label>
              <Input
                id={`${formId}-tags`}
                name="tags"
                disabled={busy}
                placeholder="armada, pelabuhan, operasional"
              />
            </div>

            {error && (
              <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            {progress && !error && (
              <p className="inline-flex items-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
                <Loader2 className="size-4 animate-spin" />
                {progress}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={busy || isPending}
                className="bg-brand-orange text-white hover:bg-brand-orange-strong"
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                Unggah
              </Button>
            </div>
          </form>

          {/* Hidden persist form — submits to the Server Action after the
              Cloudinary upload succeeds. Lives outside the visible form so
              the file input isn't replayed. */}
          <form
            ref={persistFormRef}
            action={persistUploadAction}
            className="hidden"
          >
            {persistFields &&
              Object.entries(persistFields).map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v} />
              ))}
          </form>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
