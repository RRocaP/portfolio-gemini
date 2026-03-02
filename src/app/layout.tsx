import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ramon Roca Pinilla — Biomedical Engineer",
  description:
    "Combating antimicrobial resistance and advancing gene therapy through computational design and experimental validation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
