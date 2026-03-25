import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { I18nProvider } from "@/lib/i18n";
import ClientAlexAgent from "@/components/ClientAlexAgent";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FulFlo — Marques premium en surplus à -40% à -70%",
  description: "Achetez les surplus certifiés de marques françaises (Favrichon, Michel et Augustin, Coslys...) à prix réduits. Livraison 3-5 jours. Zéro artifice.",
  openGraph: {
    title: "Découvrez les surplus premium des vraies marques françaises",
    description: "-40% à -70% sur produits de longue conservation certifiés. Favrichon, Michel et Augustin, Coslys, et plus. Livraison rapide et transparente.",
    locale: "fr_FR",
    siteName: "FulFlo",
    type: "website",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "FulFlo",
              url: "https://fulflo.app",
              description: "Marketplace de surplus de marques premium françaises à -40% à -70%",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://fulflo.app/deals?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "FulFlo",
              url: "https://fulflo.app",
              description: "Première marketplace française de surplus CPG. Marques premium à prix réduits, zéro gaspillage.",
              foundingDate: "2026",
              areaServed: { "@type": "Country", name: "France" },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <I18nProvider><CartProvider>{children}</CartProvider></I18nProvider>
        <ClientAlexAgent />
      </body>
    </html>
  );
}
