import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";

export const dynamic = "force-static";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.rrocap.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  // Trailing slashes to match trailingSlash:true + the canonical/hreflang URLs
  // (otherwise the sitemap lists URLs that 308-redirect to the canonical).
  const languages = Object.fromEntries(
    locales.map((l) => [l, `${siteUrl}/${l}/`]),
  );

  return locales.map((locale) => ({
    url: `${siteUrl}/${locale}/`,
    lastModified,
    changeFrequency: "monthly",
    priority: locale === "en" ? 1 : 0.8,
    alternates: { languages },
  }));
}
