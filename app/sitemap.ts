import { CATEGORIES, MOCK_WALNUTS } from "@/constants";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://hetaozhi.com";
  const currentDate = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/upload`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Category pages (if you add them later)
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.filter(
    (cat) => cat.id !== "all",
  ).map((category) => ({
    url: `${baseUrl}/category/${category.id}`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Individual walnut pages (for future detail pages)
  const walnutPages: MetadataRoute.Sitemap = MOCK_WALNUTS.map((walnut) => ({
    url: `${baseUrl}/walnut/${walnut.id}`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...walnutPages];
}
