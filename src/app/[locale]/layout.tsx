import {
  translations,
  isValidLocale,
  locales,
  type Locale,
} from "@/lib/i18n";
import type { Metadata } from "next";
import {
  Instrument_Serif,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.rrocap.com";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const t = translations[locale];

  const languages = Object.fromEntries(
    locales.map((l) => [l, `/${l}`]),
  ) as Record<Locale, string>;

  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { ...languages, "x-default": "/en" },
    },
    openGraph: {
      // Re-declare image/type/siteName here: Next replaces (not deep-merges) the
      // parent layout's openGraph object when a child defines its own.
      type: "website",
      siteName: "Ramon Roca Pinilla",
      title: t.meta.title,
      description: t.meta.description,
      locale,
      url: `/${locale}`,
      images: [{ url: "/poster.jpg", width: 1200, height: 630, alt: t.meta.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
      images: ["/poster.jpg"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Ramon Roca Pinilla",
    jobTitle: "Biomedical Engineer",
    affiliation: {
      "@type": "Organization",
      name: "Children's Medical Research Institute",
    },
    url: `${siteUrl}/${locale}/`,
    sameAs: [
      "https://scholar.google.com/citations?user=jYIZGT0AAAAJ&hl=en",
      "https://orcid.org/0000-0002-7393-6200",
      "https://github.com/RRocaP",
      "https://www.linkedin.com/in/ramonrocapinilla/",
    ],
  };

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
