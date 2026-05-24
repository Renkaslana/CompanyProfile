import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { ServicesGrid } from "@/components/sections/services-grid";
import { OperationalGallery } from "@/components/sections/operational-gallery";
import { FleetShowcase } from "@/components/sections/fleet-showcase";
import { CoverageMap } from "@/components/sections/coverage-map";
import { ClientsPartners } from "@/components/sections/clients-partners";
import { Certifications } from "@/components/sections/certifications";
import { NewsPreview } from "@/components/sections/news-preview";
import { CtaQuote } from "@/components/sections/cta-quote";
import {
  getAchievements,
  getCertifications,
  getClients,
  getCoverage,
  getFleet,
  getGallery,
  getLatestNews,
  getServices,
  getStats,
} from "@/lib/data";

export default async function HomePage() {
  const [
    stats,
    services,
    gallery,
    fleet,
    achievements,
    coverage,
    clients,
    certifications,
    latestNews,
  ] = await Promise.all([
    getStats(),
    getServices(),
    getGallery(),
    getFleet(),
    getAchievements(),
    getCoverage(),
    getClients(),
    getCertifications(),
    getLatestNews(3),
  ]);

  return (
    <>
      <Hero stats={stats} />
      <About />
      <ServicesGrid services={services} />
      <OperationalGallery items={gallery} />
      <FleetShowcase fleet={fleet} achievements={achievements} />
      <CoverageMap regions={coverage} />
      <ClientsPartners clients={clients} />
      <Certifications items={certifications} />
      <NewsPreview posts={latestNews} />
      <CtaQuote />
    </>
  );
}
