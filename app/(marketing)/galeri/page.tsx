import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CtaBand } from "@/components/sections/cta-band";
import { GalleryGrid } from "@/features/content/components/gallery-grid";
import { getGallery } from "@/lib/data";
import { GALLERY_CATEGORIES } from "@/lib/constants";

// Phase 4 M7: render fresh on every request so newly-added items appear
// immediately on the public gallery.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galeri Operasional",
  description:
    "Dokumentasi kegiatan operasional BMI — briefing, loading, pengiriman, aktivitas gudang, dan kesiapan armada.",
};

export default async function GaleriPage() {
  const items = await getGallery();

  return (
    <>
      <PageHeader
        eyebrow="Dokumentasi Operasional"
        title="Galeri kegiatan di lapangan"
        description="Potret nyata operasional harian kami bukti bahwa BMI aktif bergerak, bukan sekadar klaim."
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Galeri" }]}
      />

      <section className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <GalleryGrid items={items} categories={GALLERY_CATEGORIES} />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
