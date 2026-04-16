import {
  translations,
  isValidLocale,
  locales,
  type Locale,
} from "@/lib/i18n";
import type { Metadata } from "next";

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
      title: t.meta.title,
      description: t.meta.description,
      locale,
      url: `/${locale}`,
    },
    twitter: {
      title: t.meta.title,
      description: t.meta.description,
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
  const { locale } = await params;

  return (
    <div lang={isValidLocale(locale) ? locale : "en"}>
      {children}
    </div>
  );
}
