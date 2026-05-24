import Image from "next/image";
import { cn } from "@/lib/utils";
import type { MediaRef } from "@/features/content/types";

type ImageFrameProps = {
  media: MediaRef;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  overlay?: boolean;
  rounded?: string;
};

/**
 * Wraps next/image (fill) with the shared golden-hour grade overlay so every
 * operational photo reads with one consistent look (PRD §3.7).
 * Parent controls aspect ratio via className.
 */
export function ImageFrame({
  media,
  className,
  imgClassName,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  overlay = true,
  rounded = "rounded-2xl",
}: ImageFrameProps) {
  return (
    <div className={cn("relative overflow-hidden bg-muted", rounded, className)}>
      <Image
        src={media.src}
        alt={media.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", imgClassName)}
      />
      {overlay && <div className="grade-warm pointer-events-none absolute inset-0" />}
    </div>
  );
}
