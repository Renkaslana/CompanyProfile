import type { MetadataRoute } from "next";
import { getNews, getServices } from "@/lib/data";

const baseUrl = "https://bintangmuliainvestama.co.id";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, news] = await Promise.all([getServices(), getNews()]);

  const staticRoutes = [
    "",
    "/tentang",
    "/layanan",
    "/galeri",
    "/karir",
    "/berita",
    "/kontak",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const serviceRoutes = services.map((s) => ({
    url: `${baseUrl}/layanan/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const newsRoutes = news.map((n) => ({
    url: `${baseUrl}/berita/${n.slug}`,
    lastModified: new Date(n.publishedAt),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...serviceRoutes, ...newsRoutes];
}
