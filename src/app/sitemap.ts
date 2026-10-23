import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://gospelforge.com";

  const staticRoutes = [
    "",
    "/browse",
    "/community",
    "/series",
    "/speakers",
    "/scripture",
    "/artist/apply",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  return staticRoutes;
}
