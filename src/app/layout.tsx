import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { I18nProvider } from "@/lib/i18n";
import AlexAgent from "@/components/AlexAgent";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

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
      <body className="min-h-full flex flex-col antialiased">
        <I18nProvider><CartProvider>{children}</CartProvider></I18nProvider>
        <AlexAgent />
      </body>
    </html>
  );
}
