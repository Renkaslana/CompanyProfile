"use client";

/**
 * Tanya BMI — guided information panel.
 *
 * Triggered from a header button (Navbar). NOT customer support, NOT AI
 * chatbot, NOT live chat — this is an interactive **information panel** that
 * helps first-time visitors understand BMI's services before contacting the
 * company. Click-only: user selects a predefined question chip, the panel
 * shows a brief "thinking" indicator (400-700 ms), then renders the answer
 * with a small set of related-question chips for further exploration.
 *
 * Content source: `settings.faq[]`, grouped by `topic`. Visitor-facing topic
 * labels use the question-form `SUPPORT_TOPIC_QUESTION` map so the panel
 * reads as a conversation, not a category list.
 *
 * Layout: right-anchored 28rem panel on desktop, full-screen takeover on
 * mobile.
 *
 * Animations are intentionally subtle (fade + small slide, ≤300 ms) — no
 * bounce, no spring, no flashy motion. This is a B2B logistics company
 * profile, not a consumer app.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import {
  ChevronLeft,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  Send,
  MessageSquareText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SUPPORT_TOPICS,
  SUPPORT_TOPIC_CTA,
  SUPPORT_TOPIC_QUESTION,
  SUPPORT_TOPIC_RELATED,
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
};

/** "Thinking" delay between user selection and answer reveal. Middle of the
 *  approved 400–700 ms window — long enough to feel alive, short enough not
 *  to feel like waiting. */
const TYPING_MS = 550;

/** Header subtitle — short and scannable; fits ~2 lines in the panel header. */
const PANEL_SUBTITLE =
  "Jawaban cepat seputar layanan, armada, dan kerja sama bisnis BMI.";

const BOT_GREETING = "Halo! Apa yang ingin Anda ketahui tentang BMI?";

type View =
  | { kind: "topics" }
  | { kind: "questions"; topic: SupportTopic }
  | { kind: "thinking"; topic: SupportTopic; itemIndex: number }
  | { kind: "answer"; topic: SupportTopic; itemIndex: number };

export function CustomerSupportPanel({
  faq,
  whatsapp,
  phone,
  email,
  triggerClassName,
  triggerLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>({ kind: "topics" });
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll the conversation to the latest bubble whenever the view changes.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);
    return () => window.clearTimeout(id);
  }, [view, open]);

  // Transition from "thinking" → "answer" after TYPING_MS.
  useEffect(() => {
    if (view.kind !== "thinking") return;
    const id = window.setTimeout(() => {
      setView({ kind: "answer", topic: view.topic, itemIndex: view.itemIndex });
    }, TYPING_MS);
    return () => window.clearTimeout(id);
  }, [view]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setView({ kind: "topics" });
  }

  function pickTopic(topic: SupportTopic) {
    const items = grouped.get(topic) ?? [];
    if (items.length === 1) {
      setView({ kind: "thinking", topic, itemIndex: 0 });
    } else if (items.length > 1) {
      setView({ kind: "questions", topic });
    }
  }

  function pickQuestion(topic: SupportTopic, itemIndex: number) {
    setView({ kind: "thinking", topic, itemIndex });
  }

  function reset() {
    setView({ kind: "topics" });
  }

  // Resolve the currently-selected item for the answer view.
  const currentItem =
    view.kind === "answer" || view.kind === "thinking"
      ? grouped.get(view.topic)?.[view.itemIndex]
      : undefined;

  const currentTopicQuestion =
    view.kind !== "topics" ? SUPPORT_TOPIC_QUESTION[view.topic] : null;

  // For the user-bubble text: if the topic has 1 item we show the topic
  // question; if it has multiple, we show the actual question the user picked.
  const userBubbleText = (() => {
    if (view.kind === "topics") return null;
    if (view.kind === "questions") return currentTopicQuestion;
    const itemsForTopic = grouped.get(view.topic) ?? [];
    if (itemsForTopic.length > 1 && currentItem) return currentItem.question;
    return currentTopicQuestion;
  })();

  // Build WhatsApp deep-link with topic-aware prefilled context.
  const waDigits = whatsapp.replace(/\D/g, "");
  const waPrefilled = encodeURIComponent(
    currentTopicQuestion
      ? `Halo BMI, saya ingin bertanya: ${currentTopicQuestion}`
      : "Halo BMI, saya ingin bertanya seputar layanan Anda.",
  );
  const waHref = waDigits ? `https://wa.me/${waDigits}?text=${waPrefilled}` : "";
  const telHref = phone ? `tel:${phone.replace(/\s/g, "")}` : "";
  const emailHref = email
    ? `mailto:${email}?subject=${encodeURIComponent(
        currentTopicQuestion
          ? `Pertanyaan: ${currentTopicQuestion}`
          : "Pertanyaan untuk BMI",
      )}`
    : "";

  // Related-topic chips shown under the answer.
  const relatedTopics =
    view.kind === "answer"
      ? SUPPORT_TOPIC_RELATED[view.topic].filter(
          (t) => grouped.has(t) && t !== view.topic,
        )
      : [];

  return (
    <BaseDialog.Root open={open} onOpenChange={handleOpenChange}>
      <BaseDialog.Trigger
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          triggerClassName,
        )}
        aria-label="Buka panel Tanya BMI"
      >
        {triggerLabel ?? (
          <>
            <MessageSquareText className="size-4" />
            Tanya BMI
          </>
        )}
      </BaseDialog.Trigger>

      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-ink-950/40 backdrop-blur-sm",
            "data-[open]:animate-in data-[open]:fade-in data-[open]:duration-200",
            "data-[closed]:animate-out data-[closed]:fade-out data-[closed]:duration-150",
          )}
        />
        <BaseDialog.Popup
          className={cn(
            "fixed inset-0 z-50 flex flex-col bg-card shadow-2xl",
            "sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[28rem] sm:max-w-full",
            "sm:border-l sm:border-border",
            "data-[open]:animate-in data-[open]:duration-300 data-[open]:fade-in",
            "sm:data-[open]:slide-in-from-right-4",
            "data-[closed]:animate-out data-[closed]:duration-200 data-[closed]:fade-out",
            "sm:data-[closed]:slide-out-to-right-4",
          )}
          aria-labelledby="tanya-bmi-title"
        >
          {/* Header — compact density to keep visual focus on the conversation */}
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border bg-ink-950 px-5 py-3 text-white">
            <div className="flex items-start gap-2.5">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white">
                <MessageSquareText className="size-3.5" />
              </span>
              <div className="min-w-0">
                <BaseDialog.Title
                  id="tanya-bmi-title"
                  className="font-display text-base font-semibold leading-tight"
                >
                  Tanya BMI
                </BaseDialog.Title>
                <p className="mt-0.5 text-[11px] leading-snug text-white/65">
                  {PANEL_SUBTITLE}
                </p>
              </div>
            </div>
            <BaseDialog.Close
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Tutup panel Tanya BMI"
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
                {/* Greeting bubble — always visible at top */}
                <BotBubble>{BOT_GREETING}</BotBubble>

                {/* Initial topic grid */}
                {view.kind === "topics" && (
                  <TopicGrid topics={visibleTopics} onPick={pickTopic} />
                )}

                {/* User bubble (after any selection) */}
                {userBubbleText && (
                  <UserBubble key={`u-${view.kind}-${currentTopicQuestion}`}>
                    {userBubbleText}
                  </UserBubble>
                )}

                {/* Multi-question picker for topics with >1 FAQ entry */}
                {view.kind === "questions" && (
                  <>
                    <BotBubble>Pilih pertanyaan yang paling sesuai:</BotBubble>
                    <div className="mt-3 grid gap-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300">
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

                {/* Typing indicator */}
                {view.kind === "thinking" && (
                  <TypingBubble key={`t-${view.topic}-${view.itemIndex}`} />
                )}

                {/* Answer + related questions + terminal CTAs */}
                {view.kind === "answer" && currentItem && (
                  <>
                    <BotBubble key={`a-${view.topic}-${view.itemIndex}`}>
                      {renderAnswer(currentItem.answer)}
                    </BotBubble>

                    {/* Related questions */}
                    {relatedTopics.length > 0 && (
                      <div className="mt-5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:delay-100">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          Pertanyaan lain yang sering ditanyakan
                        </p>
                        <div className="mt-2 grid gap-1.5">
                          {relatedTopics.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => pickTopic(t)}
                              className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-left text-xs font-medium text-ink-900 transition-colors hover:border-brand-orange/40 hover:bg-brand-orange/5"
                            >
                              <span>{SUPPORT_TOPIC_QUESTION[t]}</span>
                              <ChevronLeft className="size-3.5 -rotate-180 text-muted-foreground" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contextual CTA + terminal channels card */}
                    <div className="mt-5 rounded-xl border border-border bg-card p-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 motion-safe:delay-150">
                      {/* Contextual primary action — routes to relevant page */}
                      {SUPPORT_TOPIC_CTA[view.topic] && (
                        <>
                          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            Langkah selanjutnya
                          </p>
                          <Link
                            href={SUPPORT_TOPIC_CTA[view.topic]!.href}
                            onClick={() => handleOpenChange(false)}
                            className="mt-1.5 flex items-center justify-between gap-2 rounded-lg border border-brand-orange/30 bg-brand-orange/5 px-3 py-2.5 text-sm font-semibold text-brand-orange-strong transition-colors hover:border-brand-orange/60 hover:bg-brand-orange/10"
                          >
                            <span>{SUPPORT_TOPIC_CTA[view.topic]!.label}</span>
                            <ChevronLeft className="size-4 -rotate-180" />
                          </Link>
                          <div className="my-3 border-t border-dashed border-border" />
                        </>
                      )}

                      <p className="text-xs font-medium text-muted-foreground">
                        Atau diskusi langsung dengan tim kami:
                      </p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-3">
                        {waHref && (
                          <a
                            href={waHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-100"
                          >
                            <MessageCircle className="size-3.5" />
                            WhatsApp
                          </a>
                        )}
                        {telHref && (
                          <a
                            href={telHref}
                            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-ink-900 transition-colors hover:bg-muted"
                          >
                            <Phone className="size-3.5" />
                            Telepon
                          </a>
                        )}
                        {emailHref && (
                          <a
                            href={emailHref}
                            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-ink-900 transition-colors hover:bg-muted"
                          >
                            <Mail className="size-3.5" />
                            Email
                          </a>
                        )}
                      </div>
                      <Link
                        href="/kontak"
                        onClick={() => handleOpenChange(false)}
                        className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-ink-900"
                      >
                        <Send className="size-3.5" />
                        Kirim permintaan via formulir
                      </Link>
                    </div>
                  </>
                )}

                {/* Scroll anchor */}
                <div ref={scrollAnchorRef} aria-hidden="true" className="h-1" />
              </>
            )}
          </div>

          {/* Footer: reset link */}
          {view.kind !== "topics" && visibleTopics.length > 0 && (
            <footer className="shrink-0 border-t border-border bg-card px-5 py-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-orange-strong transition-colors hover:text-brand-orange"
              >
                <ChevronLeft className="size-3.5" />
                Pilih pertanyaan lain
              </button>
            </footer>
          )}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

/* ─── Internal sub-components ──────────────────────────────────────── */

function TopicGrid({
  topics,
  onPick,
}: {
  topics: SupportTopic[];
  onPick: (t: SupportTopic) => void;
}) {
  return (
    <div className="mt-3 grid gap-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300">
      {topics.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onPick(t)}
          className="group rounded-xl border border-border bg-card px-3.5 py-3 text-left text-sm font-medium text-ink-900 transition-all duration-200 hover:border-brand-orange/50 hover:bg-brand-orange/5 hover:shadow-sm"
        >
          <span className="flex items-center justify-between gap-3">
            <span>{SUPPORT_TOPIC_QUESTION[t]}</span>
            <ChevronLeft className="size-3.5 -rotate-180 shrink-0 text-muted-foreground/60 transition-transform group-hover:-translate-x-0 group-hover:translate-x-0.5 group-hover:text-brand-orange-strong" />
          </span>
        </button>
      ))}
    </div>
  );
}

function BotBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex items-start gap-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange-strong">
        <MessageSquareText className="size-3.5" />
      </span>
      <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-card px-3.5 py-2.5 text-sm leading-relaxed text-foreground/85 shadow-sm ring-1 ring-border">
        {children}
      </div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex justify-end motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-orange px-3.5 py-2 text-sm font-medium text-white shadow-sm">
        {children}
      </div>
    </div>
  );
}

/**
 * Typing indicator — three dots fading in sequence to suggest the panel is
 * "preparing" the answer. Uses opacity-pulse (not bounce) to stay calm and
 * professional. Hidden under `prefers-reduced-motion`.
 */
function TypingBubble() {
  return (
    <div
      role="status"
      aria-label="Sedang menyiapkan jawaban"
      className="mt-3 flex items-start gap-2 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
    >
      <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange-strong">
        <MessageSquareText className="size-3.5" />
      </span>
      <div className="rounded-2xl rounded-tl-sm bg-card px-3.5 py-3 shadow-sm ring-1 ring-border">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-foreground/40 motion-safe:animate-typing-dot" />
          <span
            className="size-1.5 rounded-full bg-foreground/40 motion-safe:animate-typing-dot"
            style={{ animationDelay: "180ms" }}
          />
          <span
            className="size-1.5 rounded-full bg-foreground/40 motion-safe:animate-typing-dot"
            style={{ animationDelay: "360ms" }}
          />
        </span>
      </div>
    </div>
  );
}

/**
 * Render an answer string with light structure. Splits on blank lines into
 * paragraph blocks. Lines starting with `• `, `- ` or `* ` are treated as
 * bullets and grouped into a `<ul>` with a brand-orange dot — but ONLY when
 * every line in the block is a bullet line. Mixed blocks fall back to a
 * `<p whitespace-pre-wrap>` so existing CMS content without bullet markers
 * still renders without regression.
 */
function renderAnswer(text: string): React.ReactNode {
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className="space-y-3 text-sm leading-relaxed text-foreground/85">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split("\n").filter((l) => l.trim().length > 0);
        if (lines.length === 0) return null;
        const isAllBullets =
          lines.length >= 2 && lines.every((l) => /^\s*[•\-*]\s+/.test(l));
        if (isAllBullets) {
          return (
            <ul key={pIdx} className="grid gap-1.5">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-orange"
                  />
                  <span>{line.replace(/^\s*[•\-*]\s+/, "")}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={pIdx} className="whitespace-pre-wrap">
            {para}
          </p>
        );
      })}
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
        Belum ada informasi tersedia.
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Silakan hubungi kami via WhatsApp, telepon, atau email — tim kami siap
        membantu.
      </p>
    </div>
  );
}
