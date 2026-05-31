/**
 * Renders trusted-after-sanitization HTML. The CMS sanitizes on write; this
 * component re-sanitizes on render as defense in depth (per SECURITY.md).
 *
 * Allowlist policy: basic block + inline tags + safe links. NO `<script>`,
 * NO inline event handlers, NO `javascript:` URLs. Phase 8 hardening can
 * extend the allowlist further if rich-text needs grow.
 */
import sanitizeHtml from "sanitize-html";
import { cn } from "@/lib/utils";

export const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "em", "u", "s",
    "h2", "h3", "h4",
    "ul", "ol", "li",
    "blockquote", "code", "pre",
    "a",
    "hr",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href"],
  disallowedTagsMode: "discard",
  // Force safe link behaviour.
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      target: "_blank",
      rel: "noopener noreferrer nofollow",
    }),
  },
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

export function SanitizedHtml({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const clean = sanitizeRichText(html);
  return (
    <div
      className={cn("prose prose-sm max-w-none", className)}
      // sanitize-html guarantees the input has been allowlisted.
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
