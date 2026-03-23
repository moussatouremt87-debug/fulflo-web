"use client";

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Lang = "fr" | "en" | "de" | "ar";

// ─── Flat translations ──────────────────────────────────────────────────────────

const translations: Record<Lang, Record<string, string>> = {
  fr: {
    // Nav
    "nav.search":       "Rechercher parmi 1 200+ produits surplus…",
    "nav.categories":   "Catégories",
    "nav.how":          "Comment ça marche",
    "nav.pass":         "✦ FulFlo Pass",
    "nav.login":        "Connexion",
    "nav.cart":         "Panier",
    // Supplier nav
    "nav.dashboard":    "Tableau de bord",
    "nav.products":     "Produits",
    "nav.analytics":    "Analytics",
    "nav.campaigns":    "Campagnes",
    "nav.flash-sales":  "Flash Sales",
    "nav.impact":       "Impact RSE",
    "nav.settings":     "Paramètres",
    "nav.logout":       "Déconnexion",
    // Hero
    "hero.title":       "Les grandes marques à prix d'usine.",
    "hero.sub":         "Nestlé, Colgate, Ariel, P&G — stock surplus direct fabricant",
    "hero.cta":         "Voir les offres →",
    // Deals
    "deals.title":      "Toutes les offres surplus",
    "deals.add":        "Ajouter au panier",
    // Categories
    "cat.all":          "Tout",
    "cat.food":         "Alimentation",
    "cat.hygiene":      "Hygiène",
    "cat.home":         "Entretien",
    "cat.beauty":       "Beauté",
    "cat.drinks":       "Boissons",
    "cat.baby":         "Bébé",
    "cat.pets":         "Animaux",
    "cat.sport":        "Sport",
    "cat.pharma":       "Pharmacie",
    "cat.electro":      "Électroménager",
    // Flash sale
    "flash.label":      "VENTE FLASH",
    "flash.text":       "Jusqu'à -70% · Stock limité",
    "flash.expire":     "Expire dans",
    "flash.cta":        "Voir les offres",
    // Savings
    "savings.title":    "Économies du Jour",
    "savings.see":      "Tout voir →",
    // Announce bar
    "announce.text":    "Livraison offerte dès 49€ · Surplus fabricant certifié · Grandes marques à -70%",
    // Footer
    "footer.brand":     "Europe's surplus economy platform. Direct fabricant. Certifié.",
    // Supplier dashboard
    "dashboard.welcome": "Bonjour",
    "dashboard.subtitle": "Votre tableau de bord fournisseur",
    "dashboard.kpi.totalProducts": "Produits actifs",
    "dashboard.kpi.totalRevenue": "Revenus",
    "dashboard.kpi.clearanceRate": "Taux d'écoulement",
    "dashboard.kpi.activeOrders": "Commandes actives",
    // Products
    "products.add": "Ajouter un produit",
  },
  en: {
    "nav.search":       "Search 1,200+ surplus products…",
    "nav.categories":   "Categories",
    "nav.how":          "How it works",
    "nav.pass":         "✦ FulFlo Pass",
    "nav.login":        "Login",
    "nav.cart":         "Cart",
    "nav.dashboard":    "Dashboard",
    "nav.products":     "Products",
    "nav.analytics":    "Analytics",
    "nav.campaigns":    "Campaigns",
    "nav.flash-sales":  "Flash Sales",
    "nav.impact":       "ESG Impact",
    "nav.settings":     "Settings",
    "nav.logout":       "Log out",
    "hero.title":       "Brand names at factory prices.",
    "hero.sub":         "Nestlé, Colgate, Ariel, P&G — certified surplus direct from factory",
    "hero.cta":         "See deals →",
    "deals.title":      "All surplus deals",
    "deals.add":        "Add to cart",
    "cat.all":          "All",
    "cat.food":         "Food",
    "cat.hygiene":      "Hygiene",
    "cat.home":         "Home Care",
    "cat.beauty":       "Beauty",
    "cat.drinks":       "Drinks",
    "cat.baby":         "Baby",
    "cat.pets":         "Pets",
    "cat.sport":        "Sport",
    "cat.pharma":       "Pharmacy",
    "cat.electro":      "Appliances",
    "flash.label":      "FLASH SALE",
    "flash.text":       "Up to -70% · Limited stock",
    "flash.expire":     "Expires in",
    "flash.cta":        "See deals",
    "savings.title":    "Today's Savings",
    "savings.see":      "See all →",
    "announce.text":    "Free delivery from €49 · Certified factory surplus · Top brands up to -70%",
    "footer.brand":     "Europe's surplus economy platform. Direct from factory. Certified.",
    "dashboard.welcome": "Hello",
    "dashboard.subtitle": "Your supplier dashboard",
    "dashboard.kpi.totalProducts": "Active products",
    "dashboard.kpi.totalRevenue": "Revenue",
    "dashboard.kpi.clearanceRate": "Clearance rate",
    "dashboard.kpi.activeOrders": "Active orders",
    "products.add": "Add product",
  },
  de: {
    "nav.search":       "1.200+ Surplus-Produkte suchen…",
    "nav.categories":   "Kategorien",
    "nav.how":          "So funktioniert es",
    "nav.pass":         "✦ FulFlo Pass",
    "nav.login":        "Anmelden",
    "nav.cart":         "Warenkorb",
    "nav.dashboard":    "Dashboard",
    "nav.products":     "Produkte",
    "nav.analytics":    "Analytics",
    "nav.campaigns":    "Kampagnen",
    "nav.flash-sales":  "Flash Sales",
    "nav.impact":       "ESG Impact",
    "nav.settings":     "Einstellungen",
    "nav.logout":       "Abmelden",
    "hero.title":       "Markenprodukte zu Fabrikpreisen.",
    "hero.sub":         "Nestlé, Colgate, Ariel, P&G — zertifizierter Überschuss vom Hersteller",
    "hero.cta":         "Angebote ansehen →",
    "deals.title":      "Alle Überschussangebote",
    "deals.add":        "In den Warenkorb",
    "cat.all":          "Alle",
    "cat.food":         "Lebensmittel",
    "cat.hygiene":      "Hygiene",
    "cat.home":         "Haushalt",
    "cat.beauty":       "Beauty",
    "cat.drinks":       "Getränke",
    "cat.baby":         "Baby",
    "cat.pets":         "Haustiere",
    "cat.sport":        "Sport",
    "cat.pharma":       "Apotheke",
    "cat.electro":      "Elektrogeräte",
    "flash.label":      "FLASH SALE",
    "flash.text":       "Bis zu -70% · Begrenzter Bestand",
    "flash.expire":     "Läuft ab in",
    "flash.cta":        "Angebote ansehen",
    "savings.title":    "Heutige Ersparnisse",
    "savings.see":      "Alle ansehen →",
    "announce.text":    "Kostenlose Lieferung ab €49 · Zertifizierter Fabriküberschuss · Top-Marken bis -70%",
    "footer.brand":     "Europas Überschuss-Plattform. Direkt vom Hersteller. Zertifiziert.",
    "dashboard.welcome": "Hallo",
    "dashboard.subtitle": "Ihr Lieferanten-Dashboard",
    "dashboard.kpi.totalProducts": "Aktive Produkte",
    "dashboard.kpi.totalRevenue": "Umsatz",
    "dashboard.kpi.clearanceRate": "Clearance-Rate",
    "dashboard.kpi.activeOrders": "Aktive Bestellungen",
    "products.add": "Produkt hinzufügen",
  },
  ar: {
    "nav.search":       "ابحث في 1,200+ منتج فائض…",
    "nav.categories":   "الفئات",
    "nav.how":          "كيف يعمل",
    "nav.pass":         "✦ FulFlo Pass",
    "nav.login":        "تسجيل الدخول",
    "nav.cart":         "السلة",
    "nav.dashboard":    "لوحة التحكم",
    "nav.products":     "المنتجات",
    "nav.analytics":    "التحليلات",
    "nav.campaigns":    "الحملات",
    "nav.flash-sales":  "فلاش سيل",
    "nav.impact":       "تأثير ESG",
    "nav.settings":     "الإعدادات",
    "nav.logout":       "تسجيل الخروج",
    "hero.title":       "ماركات عالمية بأسعار المصنع.",
    "hero.sub":         "نستله، كولجيت، أريال، P&G — فائض مباشر من المصنع",
    "hero.cta":         "عرض العروض →",
    "deals.title":      "جميع عروض الفائض",
    "deals.add":        "أضف إلى السلة",
    "cat.all":          "الكل",
    "cat.food":         "الغذاء",
    "cat.hygiene":      "النظافة",
    "cat.home":         "المنزل",
    "cat.beauty":       "الجمال",
    "cat.drinks":       "المشروبات",
    "cat.baby":         "الأطفال",
    "cat.pets":         "الحيوانات",
    "cat.sport":        "الرياضة",
    "cat.pharma":       "الصيدلية",
    "cat.electro":      "الأجهزة",
    "flash.label":      "تخفيضات فلاش",
    "flash.text":       "حتى -70% · مخزون محدود",
    "flash.expire":     "ينتهي في",
    "flash.cta":        "عرض العروض",
    "savings.title":    "توفيرات اليوم",
    "savings.see":      "عرض الكل →",
    "announce.text":    "شحن مجاني من €49 · فائض مصنع معتمد · ماركات عالمية حتى -70%",
    "footer.brand":     "منصة اقتصاد الفائض الأوروبية. مباشرة من المصنع. معتمدة.",
    "dashboard.welcome": "مرحباً",
    "dashboard.subtitle": "لوحة تحكم المورد",
    "dashboard.kpi.totalProducts": "المنتجات النشطة",
    "dashboard.kpi.totalRevenue": "الإيرادات",
    "dashboard.kpi.clearanceRate": "معدل التصفية",
    "dashboard.kpi.activeOrders": "الطلبات النشطة",
    "products.add": "إضافة منتج",
  },
};

// ─── Context ────────────────────────────────────────────────────────────────────

type I18nContextType = {
  // Primary API
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  // Backward-compat aliases (used by Sidebar, SupplierShell, etc.)
  locale: Lang;
  setLocale: (l: Lang) => void;
  dir: "ltr" | "rtl";
};

const I18nContext = createContext<I18nContextType>({
  lang: "fr",
  setLang: () => {},
  t: (key) => key,
  locale: "fr",
  setLocale: () => {},
  dir: "ltr",
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const saved = (localStorage.getItem("fulflo_lang") || localStorage.getItem("fulflo_locale")) as Lang | null;
    if (saved && (saved in translations)) setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("fulflo_lang", l);
    localStorage.setItem("fulflo_locale", l);
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  };

  // Memoize so context consumers only re-render when lang actually changes
  const ctx = useMemo<I18nContextType>(() => ({
    lang,
    setLang,
    t: (key: string) => translations[lang][key] ?? translations.fr[key] ?? key,
    // Backward compat aliases
    locale: lang,
    setLocale: setLang,
    dir: lang === "ar" ? "rtl" : "ltr",
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [lang]);

  return (
    <I18nContext.Provider value={ctx}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

// Fix 2 — 🇸🇦 for Arabic (was 🇲🇦)
export const LOCALES: { key: Lang; label: string; flag: string }[] = [
  { key: "fr", label: "Français", flag: "🇫🇷" },
  { key: "en", label: "English",  flag: "🇬🇧" },
  { key: "de", label: "Deutsch",  flag: "🇩🇪" },
  { key: "ar", label: "العربية",  flag: "🇸🇦" },
];
