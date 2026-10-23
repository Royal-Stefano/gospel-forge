import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isStaging =
    process.env.NEXT_PUBLIC_APP_URL?.includes("hostingersite.com") ||
    process.env.VERCEL_URL?.includes("hostingersite.com");

  if (isStaging) {
    // Strictly prevent search engines from indexing temporary staging deployments
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/browse", "/community", "/series", "/speakers", "/scripture", "/episodes"],
      disallow: [
        "/admin",
        "/admin/*",
        "/studio",
        "/studio/*",
        "/api/admin/*",
        "/api/media/upload-url",
        "/api/cron/*",
      ],
    },
    sitemap: "https://gospelforge.com/sitemap.xml",
  };
}
