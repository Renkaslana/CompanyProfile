"use client";

/**
 * Customer Support guided panel.
 *
 * Triggered from a header button (Navbar). Renders a Base UI Dialog that
 * **looks** like a chat conversation but is fully click-only — no typing,
 * no AI, no live chat. User picks a predefined topic chip → sees a
 * predefined answer → ends with WhatsApp/Phone/Email terminal CTAs that
 * deep-link out to direct contact channels.
 *
 * Content source: `settings.faq[]` (extended in this band with a `topic`
 * field). Topics with multiple FAQ entries show a question-picker step
 * first (still max 2 clicks inside the panel).
 *
 * Mobile: full-screen takeover. Desktop: right-anchored slide-in panel
 * (480px wide), backdrop dimmed.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import {
  ChevronLeft,
  Headphones,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  Send,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SUPPORT_TOPICS,
  SUPPORT_TOPIC_LABEL,
  type SupportTopic,
} from "@/lib/validation/settings";

type FaqItem = {
  topic: SupportTopic;
  question: string;
  answer: string;
};

type Props = {
  faq: FaqItem[];
  whatsapp: string;
  phone: string;
  email: string;
  /** Trigger render variant — caller passes their own button styling. */
  triggerClassName?: string;
  /** Trigger label/icon contents. */
  triggerLabel?: React.ReactNode;
  /** Optional support hours line shown in header. */
  supportHours?: string;
};

type View =
  | { kind: "topics" }
  | { kind: "questions"; topic: SupportTopic }
  | { kind: "answer"; topic: SupportTopic; itemIndex: number };

const TOPIC_INTRO = "Halo! Apa yang ingin Anda tanyakan?";

export function CustomerSupportPanel({
  faq,
  whatsapp,
  phone,
  email,
  triggerClassName,
  triggerLabel,
  supportHours,
}: Props) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>({ kind: "topics" });

  // Group FAQ by topic. Topics without any entry are hidden (no orphan chips).
  const grouped = useMemo(() => {
    const map = new Map<SupportTopic, FaqItem[]>();
    for (const item of faq) {
      const arr = map.get(item.topic) ?? [];
      arr.push(item);
      map.set(item.topic, arr);
    }
    return map;
  }, [faq]);

  const visibleTopics = SUPPORT_TOPICS.filter((t) => grouped.has(t));

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      // Reset to topics view when closing so re-opens start at the top.
      setView({ kind: "topics" });
    }
  }

  function pickTopic(topic: SupportTopic) {
    const items = grouped.get(topic) ?? [];
    if (items.length === 1) {
      setView({ kind: "answer", topic, itemIndex: 0 });
    } else {
      setView({ kind: "questions", topic });
    }
  }

  function pickQuestion(topic: SupportTopic, itemIndex: number) {
    setView({ kind: "answer", topic, itemIndex });
  }

  function reset() {
    setView({ kind: "topics" });
  }

  // Resolve the currently-selected item for the answer view.
  const currentItem =
    view.kind === "answer" ? grouped.get(view.topic)?.[view.itemIndex] : undefined;
  const currentTopicLabel =
    view.kind !== "topics" ? SUPPORT_TOPIC_LABEL[view.topic] : null;

  // Build WhatsApp deep-link with topic-aware prefilled context.
  const waDigits = whatsapp.replace(/\D/g, "");
  const waPrefilled = encodeURIComponent(
    currentTopicLabel
      ? `Halo BMI, saya ingin bertanya seputar ${currentTopicLabel}.`
      : "Halo BMI, saya ingin bertanya seputar layanan Anda.",
  );
  const waHref = waDigits ? `https://wa.me/${waDigits}?text=${waPrefilled}` : "";
  const telHref = phone ? `tel:${phone.replace(/\s/g, "")}` : "";
  const emailHref = email
    ? `mailto:${email}?subject=${encodeURIComponent(
        currentTopicLabel ? `Pertanyaan: ${currentTopicLabel}` : "Pertanyaan untuk BMI",
      )}`
    : "";

  return (
    <BaseDialog.Root open={open} onOpenChange={handleOpenChange}>
      <BaseDialog.Trigger
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          triggerClassName,
        )}
        aria-label="Buka panel bantuan"
      >
        {triggerLabel ?? (
          <>
            <Headphones className="size-4" />
            Bantuan
          </>
        )}
      </BaseDialog.Trigger>

      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-ink-950/40 backdrop-blur-sm" />
        <BaseDialog.Popup
          className={cn(
            "fixed inset-0 z-50 flex flex-col bg-card shadow-2xl",
            // Mobile: full-screen takeover
            // Desktop: right-anchored panel
            "sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[28rem] sm:max-w-full",
            "sm:border-l sm:border-border",
          )}
          aria-labelledby="customer-support-title"
        >
          {/* Header */}
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border bg-ink-950 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-brand-orange text-white">
                <Headphones className="size-4" />
              </span>
              <div>
                <BaseDialog.Title
                  id="customer-support-title"
                  className="font-display text-base font-semibold"
                >
                  Bantuan BMI
                </BaseDialog.Title>
                {supportHours && (
                  <p className="text-[11px] text-white/65">{supportHours}</p>
                )}
              </div>
            </div>
            <BaseDialog.Close
              className="inline-flex size-8 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Tutup panel bantuan"
            >
              <X className="size-4" />
            </BaseDialog.Close>
          </header>

          {/* Conversation body */}
          <div className="flex-1 overflow-y-auto bg-background px-4 py-5 sm:px-5">
            {visibleTopics.length === 0 ? (
              <EmptyPanel />
            ) : (
              <>
                {/* Bot greeting bubble — always visible */}
                <BotBubble>{TOPIC_INTRO}</BotBubble>

                {/* Topic chip grid — always visible at top */}
                {view.kind === "topics" && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {visibleTopics.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => pickTopic(t)}
                        className="rounded-xl border border-border bg-card px-3 py-3 text-left text-sm font-medium text-ink-900 transition-colors hover:border-brand-orange/40 hover:bg-brand-orange/5"
                      >
                        {SUPPORT_TOPIC_LABEL[t]}
                      </button>
                    ))}
                  </div>
                )}

                {/* User bubble showing topic pick */}
                {view.kind !== "topics" && currentTopicLabel && (
                  <UserBubble>{currentTopicLabel}</UserBubble>
                )}

                {/* Question picker — only when topic has >1 entries */}
                {view.kind === "questions" && (
                  <>
                    <BotBubble>
                      Pilih pertanyaan yang paling sesuai:
                    </BotBubble>
                    <div className="mt-3 grid gap-2">
                      {(grouped.get(view.topic) ?? []).map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => pickQuestion(view.topic, idx)}
                          className="rounded-xl border border-border bg-card px-3 py-2.5 text-left text-sm font-medium text-ink-900 transition-colors hover:border-brand-orange/40 hover:bg-brand-orange/5"
                        >
                          {item.question}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* User bubble showing question pick (only when question step was used) */}
                {view.kind === "answer" &&
                  (grouped.get(view.topic) ?? []).length > 1 &&
                  currentItem && <UserBubble>{currentItem.question}</UserBubble>}

                {/* Answer + terminal CTAs */}
                {view.kind === "answer" && currentItem && (
                  <>
                    <BotBubble>
                      <p className="whitespace-pre-wrap">{currentItem.answer}</p>
                    </BotBubble>

                    <div className="mt-4 rounded-xl border border-border bg-card p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Butuh diskusi langsung dengan tim kami?
                      </p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-3">
                        {waHref && (
                          <a
                            href={waHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
                          >
                            <MessageCircle className="size-3.5" />
                            WhatsApp
                          </a>
                        )}
                        {telHref && (
                          <a
                            href={telHref}
                            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-ink-900 hover:bg-muted"
                          >
                            <Phone className="size-3.5" />
                            Telepon
                          </a>
                        )}
                        {emailHref && (
                          <a
                            href={emailHref}
                            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-ink-900 hover:bg-muted"
                          >
                            <Mail className="size-3.5" />
                            Email
                          </a>
                        )}
                      </div>
                      <Link
                        href="/kontak"
                        onClick={() => handleOpenChange(false)}
                        className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-ink-900"
                      >
                        <Send className="size-3.5" />
                        Kirim permintaan via formulir
                      </Link>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Footer: reset / back button */}
          {view.kind !== "topics" && (
            <footer className="shrink-0 border-t border-border bg-card px-5 py-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-orange-strong hover:underline"
              >
                <ChevronLeft className="size-3.5" />
                Pilih topik lain
              </button>
            </footer>
          )}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

/* ─── Internal bubble components ───────────────────────────────────── */

function BotBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange-strong">
        <Headphones className="size-3.5" />
      </span>
      <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-card px-3.5 py-2.5 text-sm leading-relaxed text-foreground/85 shadow-sm ring-1 ring-border">
        {children}
      </div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-orange px-3.5 py-2 text-sm font-medium text-white shadow-sm">
        {children}
      </div>
    </div>
  );
}

function EmptyPanel() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <HelpCircle className="size-6" />
      </span>
      <p className="mt-3 text-sm font-medium text-ink-900">
        Belum ada panduan tersedia.
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Silakan hubungi kami via WhatsApp, telepon, atau email — tim kami siap
        membantu.
      </p>
    </div>
  );
}
