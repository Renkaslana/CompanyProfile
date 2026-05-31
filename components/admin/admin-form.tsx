/**
 * Form scaffolding primitives for admin CMS forms. Composable building
 * blocks; per-module pages assemble them inside their own `<form action>`.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-6 shadow-sm", className)}>
      {(title || description) && (
        <header className="mb-5">
          {title && (
            <h2 className="font-display text-lg font-semibold text-ink-900">{title}</h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </header>
      )}
      <div className="grid gap-5">{children}</div>
    </section>
  );
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 border-t border-border pt-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Server-rendered alert banner. Use with searchParam-driven errors:
 *   <FormError message={searchParams.error ? ERR[searchParams.error] : null} />
 */
export function FormBanner({
  variant = "info",
  message,
}: {
  variant?: "info" | "success" | "error";
  message: ReactNode | null;
}) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        variant === "info" && "border-sky-200 bg-sky-50 text-sky-900",
        variant === "success" && "border-emerald-200 bg-emerald-50 text-emerald-900",
        variant === "error" && "border-destructive/40 bg-destructive/5 text-destructive",
      )}
    >
      {message}
    </div>
  );
}
