import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pannelli Fotovoltaici Padova | GFS Solution 2026",
  description:
    "Impianti fotovoltaici a Padova: progettazione, installazione e gestione incentivi. Riduci la bolletta fino all'85% con soluzioni su misura.",
  keywords: [
    "pannelli fotovoltaici Padova",
    "impianto fotovoltaico",
    "energia solare",
    "risparmio bolletta",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        {children}
      </body>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-BYWDE7RZG2"
        strategy="afterInteractive"
      />
      <Script id="ga4-base" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-BYWDE7RZG2');
        `}
      </Script>
    </html>
  );
}
