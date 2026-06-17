"use client";

/**
 * RichTextEditor — WYSIWYG editor untuk admin (Berita + halaman legal).
 *
 * Menggantikan textarea HTML mentah. Output tetap HTML string yang HANYA
 * memakai tag di dalam `SANITIZE_OPTIONS.allowedTags`
 * (`components/admin/sanitized-html.tsx`), sehingga pipeline keamanan tidak
 * berubah: server tetap men-sanitize saat write, dan `<SanitizedHtml>` tetap
 * men-sanitize saat render publik. Editor ini hanya mengubah CARA input.
 *
 * Dibangun di atas Tiptap v3 (StarterKit) — kompatibel React 19 / Next 16.
 * `immediatelyRender: false` wajib di Next App Router agar tidak hydration
 * mismatch (render editor setelah mount).
 *
 * Tipografi memakai `.prose-bmi` (app/globals.css) — kelas yang sama dengan
 * render publik via <SanitizedHtml>, jadi tampilan editor = hasil akhir.
 */
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Popover } from "@base-ui/react/popover";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Link2Off,
  Minus,
  Undo2,
  Redo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  /** Initial HTML (dipakai sekali saat mount; tidak di-reset tiap render). */
  value: string;
  /** Dipanggil tiap konten berubah dengan HTML terbaru. */
  onChange: (html: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  /** Tinggi minimum area edit (Tailwind class), mis. "min-h-[420px]". */
  minHeightClass?: string;
};

/**
 * Bersihkan HTML yang ditempel dari Word/Google Docs sebelum Tiptap mem-parse:
 * buang komentar (termasuk conditional MSO), inline style/class, dan pembungkus
 * span/font/o:p. Schema Tiptap lalu hanya menyisakan node di allowlist — ini
 * jaminan tambahan agar tempelan kaya gaya jadi bersih, bukan berantakan.
 */
function cleanPastedHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?o:p>/gi, "")
    .replace(/\s(style|class|lang|align|dir)="[^"]*"/gi, "")
    .replace(/<\/?(span|font)\b[^>]*>/gi, "");
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className,
  minHeightClass = "min-h-[360px]",
}: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Batasi heading hanya h2–h4 (allowlist; h1 dicadangkan untuk judul halaman).
        heading: { levels: [2, 3, 4] },
        // Link bawaan StarterKit v3 — jangan buka tab saat klik di editor;
        // atribut keamanan (target/rel) tetap dipaksa oleh sanitize saat render.
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Mulai menulis…",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        // `prose-bmi` = brand typography source of truth (app/globals.css),
        // identik dgn render publik via <SanitizedHtml> → WYSIWYG sungguhan.
        class: cn(
          "prose prose-bmi max-w-none px-3.5 py-3 focus:outline-none",
          minHeightClass,
        ),
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
        role: "textbox",
        "aria-multiline": "true",
      },
      transformPastedHTML: cleanPastedHtml,
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Tiptap mengembalikan "<p></p>" untuk dokumen kosong — normalkan ke "".
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Sinkronkan perubahan `value` dari LUAR (mis. pulihkan draft / reset form)
  // ke dalam editor. Diguard: saat user mengetik normal, value === HTML editor
  // sehingga setContent tidak terpanggil (tanpa lompat kursor). `emitUpdate:
  // false` mencegah loop onChange.
  useEffect(() => {
    if (!editor) return;
    const raw = editor.getHTML();
    const currentHtml = raw === "<p></p>" ? "" : raw;
    if ((value || "") !== currentHtml) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div
        className={cn(
          "rounded-lg border border-input bg-card",
          minHeightClass,
          className,
        )}
        aria-busy="true"
      />
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-input bg-card focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        className,
      )}
    >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

/* ─── Toolbar ──────────────────────────────────────────────────────── */

/** Ambil tombol toolbar yang aktif (tidak disabled) untuk navigasi panah. */
function enabledButtons(root: HTMLElement | null): HTMLButtonElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLButtonElement>("button")).filter(
    (b) => !b.disabled,
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const ref = useRef<HTMLDivElement>(null);

  // Roving tabindex: toolbar hanya 1 tab-stop; panah pindah antar tombol
  // (pola WAI-ARIA toolbar). Tabindex di-set lewat DOM agar tetap stabil saat
  // Tiptap memicu re-render dari perubahan selection.
  const setRoving = useCallback((focusEl?: HTMLElement) => {
    const btns = enabledButtons(ref.current);
    btns.forEach((b, i) => {
      b.tabIndex = (focusEl ? b === focusEl : i === 0) ? 0 : -1;
    });
  }, []);

  useEffect(() => {
    setRoving();
  }, [setRoving]);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    const btns = enabledButtons(ref.current);
    if (btns.length === 0) return;
    e.preventDefault();
    const cur = document.activeElement as HTMLElement;
    let idx = btns.indexOf(cur as HTMLButtonElement);
    if (idx === -1) idx = 0;
    let next = idx;
    if (e.key === "ArrowRight") next = (idx + 1) % btns.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + btns.length) % btns.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = btns.length - 1;
    const el = btns[next];
    setRoving(el);
    el.focus();
  }

  function onFocus(e: React.FocusEvent<HTMLDivElement>) {
    const t = e.target as HTMLElement;
    if (t.tagName === "BUTTON") setRoving(t);
  }

  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label="Format teks"
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-1.5 py-1"
    >
      <Btn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label="Tebal"
      >
        <Bold className="size-[18px]" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label="Miring"
      >
        <Italic className="size-[18px]" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        label="Garis bawah"
      >
        <UnderlineIcon className="size-[18px]" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        label="Coret"
      >
        <Strikethrough className="size-[18px]" />
      </Btn>

      <Sep />

      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        label="Judul besar (H2)"
      >
        <Heading2 className="size-[18px]" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        label="Subjudul (H3)"
      >
        <Heading3 className="size-[18px]" />
      </Btn>

      <Sep />

      <Btn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label="Daftar poin"
      >
        <List className="size-[18px]" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label="Daftar bernomor"
      >
        <ListOrdered className="size-[18px]" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        label="Kutipan"
      >
        <Quote className="size-[18px]" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        label="Kode"
      >
        <Code className="size-[18px]" />
      </Btn>

      <Sep />

      <LinkPopover editor={editor} />
      <Btn
        onClick={() => editor.chain().focus().unsetLink().run()}
        active={false}
        disabled={!editor.isActive("link")}
        label="Hapus tautan"
      >
        <Link2Off className="size-[18px]" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        active={false}
        label="Garis pemisah"
      >
        <Minus className="size-[18px]" />
      </Btn>

      <Sep />

      <Btn
        onClick={() => editor.chain().focus().undo().run()}
        active={false}
        disabled={!editor.can().undo()}
        label="Urungkan"
      >
        <Undo2 className="size-[18px]" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().redo().run()}
        active={false}
        disabled={!editor.can().redo()}
        label="Ulangi"
      >
        <Redo2 className="size-[18px]" />
      </Btn>
    </div>
  );
}

/* ─── Link popover (pengganti window.prompt) ───────────────────────── */

function LinkPopover({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isLink = editor.isActive("link");

  function onOpenChange(next: boolean) {
    if (next) {
      const prev = editor.getAttributes("link").href as string | undefined;
      setUrl(prev ?? "");
    }
    setOpen(next);
  }

  function apply() {
    const href = url.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (href === "") chain.unsetLink().run();
    else chain.setLink({ href }).run();
    setOpen(false);
  }

  function remove() {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setOpen(false);
  }

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger
        render={
          <button
            type="button"
            aria-label="Tautan"
            title="Tautan"
            className={btnClass(isLink)}
          />
        }
      >
        <Link2 className="size-[18px]" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} align="start">
          <Popover.Popup
            initialFocus={inputRef}
            className="z-50 w-72 rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-lg outline-none"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                apply();
              }}
              className="flex flex-col gap-2"
            >
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://contoh.com"
                aria-label="URL tautan"
                className="min-w-0 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={remove}
                  disabled={!isLink}
                >
                  Hapus
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-brand-orange text-white hover:bg-brand-orange-strong"
                >
                  Terapkan
                </Button>
              </div>
            </form>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

/* ─── Tombol toolbar ───────────────────────────────────────────────── */

/** Kelas tombol toolbar (dipakai bersama Btn + trigger popover). */
function btnClass(active: boolean) {
  return cn(
    "inline-flex size-10 items-center justify-center rounded-md transition-colors",
    "disabled:pointer-events-none disabled:opacity-40",
    active
      ? "bg-brand-orange/15 text-brand-orange-strong"
      : "text-foreground/70 hover:bg-muted hover:text-ink-900",
  );
}

function Btn({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={btnClass(active)}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden="true" />;
}
