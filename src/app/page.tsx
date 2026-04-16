import type { Metadata } from "next";
import { locales } from "@/lib/i18n";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  alternates: {
    canonical: "/en",
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, `/${l}`])),
      "x-default": "/en",
    },
  },
  robots: { index: false, follow: true },
};

export default function RootPage() {
  const target = `${basePath}/en/`;
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${target}`} />
      <link rel="canonical" href={target} />
      {locales.map((l) => (
        <link
          key={l}
          rel="alternate"
          hrefLang={l}
          href={`${basePath}/${l}/`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${basePath}/en/`} />
      <p style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        Redirecting to <a href={target}>{target}</a>…
      </p>
    </>
  );
}
