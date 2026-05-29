import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.rrocap.com";

const title = "Ramon Roca Pinilla — Biomedical Engineer";
const description =
  "Combating antimicrobial resistance and advancing gene therapy through computational design and experimental validation.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: "%s — Ramon Roca Pinilla" },
  description,
  applicationName: "Ramon Roca Pinilla",
  authors: [{ name: "Ramon Roca Pinilla" }],
  creator: "Ramon Roca Pinilla",
  keywords: [
    "biomedical engineering",
    "protein engineering",
    "antimicrobial peptides",
    "gene therapy",
    "AAV capsid",
    "protein language models",
    "computational biology",
  ],
  openGraph: {
    type: "website",
    siteName: "Ramon Roca Pinilla",
    title,
    description,
    url: "/",
    images: [{ url: "/poster.jpg", width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/poster.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f4f5f3",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
