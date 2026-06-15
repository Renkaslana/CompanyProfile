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
 */
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useId } from "react";
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

export function RichTextEditor({
  value,
  onChange,
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
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none px-3.5 py-3 focus:outline-none",
          minHeightClass,
        ),
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
        role: "textbox",
        "aria-multiline": "true",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Tiptap mengembalikan "<p></p>" untuk dokumen kosong — normalkan ke "".
      onChange(html === "<p></p>" ? "" : html);
    },
  });

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

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-1.5 py-1">
      <Btn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label="Tebal"
      >
        <Bold className="size-4" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label="Miring"
      >
        <Italic className="size-4" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        label="Garis bawah"
      >
        <UnderlineIcon className="size-4" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        label="Coret"
      >
        <Strikethrough className="size-4" />
      </Btn>

      <Sep />

      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        label="Judul besar (H2)"
      >
        <Heading2 className="size-4" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        label="Subjudul (H3)"
      >
        <Heading3 className="size-4" />
      </Btn>

      <Sep />

      <Btn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label="Daftar poin"
      >
        <List className="size-4" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label="Daftar bernomor"
      >
        <ListOrdered className="size-4" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        label="Kutipan"
      >
        <Quote className="size-4" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        label="Kode"
      >
        <Code className="size-4" />
      </Btn>

      <Sep />

      <Btn onClick={() => setLink(editor)} active={editor.isActive("link")} label="Tautan">
        <Link2 className="size-4" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().unsetLink().run()}
        active={false}
        disabled={!editor.isActive("link")}
        label="Hapus tautan"
      >
        <Link2Off className="size-4" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        active={false}
        label="Garis pemisah"
      >
        <Minus className="size-4" />
      </Btn>

      <Sep />

      <Btn
        onClick={() => editor.chain().focus().undo().run()}
        active={false}
        disabled={!editor.can().undo()}
        label="Urungkan"
      >
        <Undo2 className="size-4" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().redo().run()}
        active={false}
        disabled={!editor.can().redo()}
        label="Ulangi"
      >
        <Redo2 className="size-4" />
      </Btn>
    </div>
  );
}

/** Prompt sederhana untuk menyisipkan/mengubah tautan. */
function setLink(editor: Editor) {
  const prev = editor.getAttributes("link").href as string | undefined;
  const url = window.prompt("Masukkan URL (kosongkan untuk menghapus):", prev ?? "https://");
  if (url === null) return; // batal
  if (url.trim() === "") {
    editor.chain().focus().unsetLink().run();
    return;
  }
  editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
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
  const id = useId();
  return (
    <button
      key={id}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md transition-colors",
        "disabled:pointer-events-none disabled:opacity-40",
        active
          ? "bg-brand-orange/15 text-brand-orange-strong"
          : "text-foreground/70 hover:bg-muted hover:text-ink-900",
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden="true" />;
}
