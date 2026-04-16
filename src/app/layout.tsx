import type { Metadata } from "next";
import {
  Instrument_Serif,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  Space_Grotesk,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

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

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ramon Roca Pinilla — Biomedical Engineer",
  description:
    "Combating antimicrobial resistance and advancing gene therapy through computational design and experimental validation.",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Ramon Roca Pinilla",
  url: "https://rrocap.github.io/portfolio-gemini/",
  jobTitle: "Biomedical Engineer / Research Officer",
  affiliation: {
    "@type": "Organization",
    name: "Children's Medical Research Institute (CMRI)",
  },
  sameAs: [
    "https://scholar.google.com/citations?user=jYIZGT0AAAAJ&hl=en",
    "https://orcid.org/0000-0002-7393-6200",
    "https://github.com/RRocaP",
    "https://www.linkedin.com/in/ramonrocapinilla/",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}
    >
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
