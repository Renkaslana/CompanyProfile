"use client";

/**
 * Two-step destructive-action confirmation.
 *
 * Used everywhere a destructive Server Action runs (delete, archive, disable
 * user, change role, etc.). Renders a trigger button; on click opens a
 * Base UI Dialog with a confirm form that posts the original action.
 *
 * Props let the caller declare:
 *  • the triggering label / variant
 *  • the dialog title + description
 *  • the action + hidden form fields
 *  • a danger/normal styling variant for the confirm button
 */
import { useState, useRef, useId, type ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  trigger: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  /** Server Action. */
  action: (formData: FormData) => void | Promise<void>;
  /** Hidden form fields passed to the action. */
  hiddenFields?: Record<string, string>;
};

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "danger",
  action,
  hiddenFields = {},
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const titleId = useId();

  return (
    <BaseDialog.Root open={open} onOpenChange={setOpen}>
      <BaseDialog.Trigger render={<>{trigger}</>} />
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-ink-950/40 backdrop-blur-sm" />
        <BaseDialog.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card p-6 shadow-2xl ring-1 ring-border",
          )}
          aria-labelledby={titleId}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "inline-flex size-10 shrink-0 items-center justify-center rounded-full",
                variant === "danger"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-brand-orange/10 text-brand-orange",
              )}
            >
              <AlertTriangle className="size-5" />
            </span>
            <div className="flex-1">
              <BaseDialog.Title
                id={titleId}
                className="font-display text-lg font-semibold text-ink-900"
              >
                {title}
              </BaseDialog.Title>
              {description && (
                <BaseDialog.Description className="mt-1.5 text-sm text-muted-foreground">
                  {description}
                </BaseDialog.Description>
              )}
            </div>
          </div>

          <form
            ref={formRef}
            action={action}
            onSubmit={() => setSubmitting(true)}
            className="mt-6 flex items-center justify-end gap-3"
          >
            {Object.entries(hiddenFields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className={cn(
                variant === "danger"
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : "bg-brand-orange text-white hover:bg-brand-orange-strong",
              )}
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {confirmLabel}
            </Button>
          </form>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
