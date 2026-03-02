import { translations, isValidLocale, type Locale } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }, { locale: "ca" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const t = translations[locale];

  return {
    title: t.meta.title,
    description: t.meta.description,
    other: { "theme-color": "#0a0a0a" },
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
