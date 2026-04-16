import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";

export const dynamic = "force-static";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  `https://rrocap.github.io${basePath || "/portfolio-gemini"}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${siteUrl}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    ...locales.map((locale) => ({
      url: `${siteUrl}/${locale}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
