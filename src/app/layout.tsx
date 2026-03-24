import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { I18nProvider } from "@/lib/i18n";
import ClientAlexAgent from "@/components/ClientAlexAgent";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fulflo — Les grandes marques à -40% à -70%",
  description: "Fulflo est la première plateforme européenne de surplus CPG. Colgate, Nestlé, Ariel, P&G — directement du fabricant, sans gaspillage.",
  openGraph: {
    title: "Fulflo — Surplus. Zéro gaspillage. Vraies économies.",
    description: "Les grandes marques jusqu'à -70%. Livraison 24h. France.",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geist.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <I18nProvider><CartProvider>{children}</CartProvider></I18nProvider>
        <ClientAlexAgent />
      </body>
    </html>
  );
}
