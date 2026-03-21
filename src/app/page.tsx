"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = "fr" | "en" | "ar";

// ─── Copy ─────────────────────────────────────────────────────────────────────

const copy = {
  fr: {
    nav: {
      deals: "Deals",
      categories: "Catégories",
      brands: "Pour les Marques",
      cta: "Accès anticipé",
    },
    hero: {
      badge: "SURPLUS · ZÉRO GASPILLAGE",
      h1a: "Les grandes marques",
      h1b: "à -40% à -70%.",
      h1c: "Pour de vrai.",
      sub: "Colgate, Nestlé, Ariel, P&G — surplus fabriqué, livré chez vous. Pas de discount. Du vrai stock.",
      emailPlaceholder: "Votre email...",
      cta: "Rejoindre la liste d'attente",
      note: "Accès anticipé · France uniquement · Gratuit",
    },
    ticker: [
      "Colgate Total 75ml  —59%",
      "Nescafé Gold 100g  —51%",
      "Ariel Pods ×30  —52%",
      "Gillette Fusion  —48%",
      "Dove Gel douche  —44%",
      "Pampers Active  —57%",
      "Head & Shoulders  —46%",
      "Oral-B Pro  —61%",
    ],
    stats: [
      { value: "−55%", label: "économie moyenne" },
      { value: "20+", label: "marques partenaires" },
      { value: "0 kg", label: "gaspillés" },
      { value: "24h", label: "livraison France" },
    ],
    why: {
      title: "Pourquoi Fulflo ?",
      cards: [
        { icon: "🏭", title: "Directement du fabricant", desc: "Surplus d'usine, stocks fins de série. Aucun intermédiaire." },
        { icon: "✅", title: "100% authentiques", desc: "Produits originaux, emballage intact. Jamais de contrefaçon." },
        { icon: "🌱", title: "Zéro gaspillage", desc: "Chaque commande évite la destruction. Bon pour vous. Bon pour la planète." },
        { icon: "💶", title: "Économies réelles", desc: "Pas de faux barèmes. Prix validé contre le RRP fabricant." },
      ],
    },
    how: {
      title: "Comment ça marche ?",
      steps: [
        { n: "01", title: "Parcourez", desc: "Nouvelles offres chaque semaine. Stock limité par nature." },
        { n: "02", title: "Commandez", desc: "Paiement sécurisé. Carte, Apple Pay, PayPal." },
        { n: "03", title: "Livré en 24h", desc: "Colissimo, Mondial Relay ou livraison express." },
      ],
    },
    supplier: {
      badge: "POUR LES MARQUES",
      title: "Votre surplus mérite mieux que la destruction.",
      sub: "Fulflo est le canal de liquidation contrôlé que les grandes marques attendaient. Brand-safe. Données consommateurs. Commission transparente.",
      pills: ["Commission 15–20%", "Brand-safe", "Données consommateurs", "Go-live en 48h"],
      cta: "Parler à notre équipe",
    },
    footer: {
      links: ["Mentions légales", "CGV", "Confidentialité", "Contact"],
      copy: "© 2026 Fulflo SAS. France. Tous droits réservés.",
    },
  },
  en: {
    nav: {
      deals: "Deals",
      categories: "Categories",
      brands: "For Brands",
      cta: "Early access",
    },
    hero: {
      badge: "SURPLUS · ZERO WASTE",
      h1a: "Top brands",
      h1b: "at −40% to −70%.",
      h1c: "For real.",
      sub: "Colgate, Nestlé, Ariel, P&G — factory surplus, delivered to you. Not discount. Real stock.",
      emailPlaceholder: "Your email...",
      cta: "Join the waitlist",
      note: "Early access · France only · Free",
    },
    ticker: [
      "Colgate Total 75ml  −59%",
      "Nescafé Gold 100g  −51%",
      "Ariel Pods ×30  −52%",
      "Gillette Fusion  −48%",
      "Dove Shower Gel  −44%",
      "Pampers Active  −57%",
      "Head & Shoulders  −46%",
      "Oral-B Pro  −61%",
    ],
    stats: [
      { value: "−55%", label: "average saving" },
      { value: "20+", label: "brand partners" },
      { value: "0 kg", label: "wasted" },
      { value: "24h", label: "France delivery" },
    ],
    why: {
      title: "Why Fulflo?",
      cards: [
        { icon: "🏭", title: "Direct from manufacturer", desc: "Factory surplus, end-of-line stock. Zero middlemen." },
        { icon: "✅", title: "100% authentic", desc: "Original products, intact packaging. Never counterfeit." },
        { icon: "🌱", title: "Zero waste", desc: "Every order prevents destruction. Good for you. Good for the planet." },
        { icon: "💶", title: "Real savings", desc: "No fake markups. Prices validated against manufacturer RRP." },
      ],
    },
    how: {
      title: "How it works",
      steps: [
        { n: "01", title: "Browse", desc: "New deals every week. Limited stock by nature." },
        { n: "02", title: "Order", desc: "Secure payment. Card, Apple Pay, PayPal." },
        { n: "03", title: "Delivered in 24h", desc: "Colissimo, Mondial Relay or express delivery." },
      ],
    },
    supplier: {
      badge: "FOR BRANDS",
      title: "Your surplus deserves better than destruction.",
      sub: "Fulflo is the controlled liquidation channel top brands have been waiting for. Brand-safe. Consumer data. Transparent commission.",
      pills: ["15–20% commission", "Brand-safe", "Consumer data", "Go-live in 48h"],
      cta: "Talk to our team",
    },
    footer: {
      links: ["Legal", "Terms", "Privacy", "Contact"],
      copy: "© 2026 Fulflo SAS. France. All rights reserved.",
    },
  },
  ar: {
    nav: {
      deals: "العروض",
      categories: "الفئات",
      brands: "للعلامات التجارية",
      cta: "الوصول المبكر",
    },
    hero: {
      badge: "فائض · صفر هدر",
      h1a: "أكبر العلامات التجارية",
      h1b: "بخصم -٤٠٪ إلى -٧٠٪.",
      h1c: "بجدية تامة.",
      sub: "Colgate وNestlé وAriel وP&G — فائض المصنع يُسلَّم إليك مباشرة.",
      emailPlaceholder: "بريدك الإلكتروني...",
      cta: "انضم إلى قائمة الانتظار",
      note: "وصول مبكر · فرنسا فقط · مجاني",
    },
    ticker: [
      "Colgate Total 75ml  −٥٩٪",
      "Nescafé Gold 100g  −٥١٪",
      "Ariel Pods ×30  −٥٢٪",
      "Gillette Fusion  −٤٨٪",
      "Dove جل الاستحمام  −٤٤٪",
      "Pampers Active  −٥٧٪",
      "Head & Shoulders  −٤٦٪",
      "Oral-B Pro  −٦١٪",
    ],
    stats: [
      { value: "−٥٥٪", label: "متوسط التوفير" },
      { value: "+٢٠", label: "علامة تجارية شريكة" },
      { value: "٠ كغ", label: "مهدور" },
      { value: "٢٤س", label: "توصيل بفرنسا" },
    ],
    why: {
      title: "لماذا Fulflo؟",
      cards: [
        { icon: "🏭", title: "مباشرة من المصنع", desc: "فائض المصنع، مخزون نهاية السلسلة. بدون وسطاء." },
        { icon: "✅", title: "١٠٠٪ أصلية", desc: "منتجات أصلية، تغليف سليم. لا مزيف أبداً." },
        { icon: "🌱", title: "صفر هدر", desc: "كل طلب يمنع التدمير. جيد لك. جيد للكوكب." },
        { icon: "💶", title: "توفير حقيقي", desc: "لا أسعار مزيفة. أسعار مُتحقَّق منها مقابل RRP." },
      ],
    },
    how: {
      title: "كيف يعمل؟",
      steps: [
        { n: "٠١", title: "تصفّح", desc: "عروض جديدة كل أسبوع. مخزون محدود بطبيعته." },
        { n: "٠٢", title: "اطلب", desc: "دفع آمن. بطاقة، Apple Pay، PayPal." },
        { n: "٠٣", title: "توصيل خلال ٢٤ ساعة", desc: "Colissimo أو Mondial Relay أو توصيل سريع." },
      ],
    },
    supplier: {
      badge: "للعلامات التجارية",
      title: "فائضك يستحق أفضل من التدمير.",
      sub: "Fulflo هو قناة التصفية المنضبطة التي طال انتظارها. آمنة للعلامة التجارية. بيانات المستهلكين. عمولة شفافة.",
      pills: ["عمولة ١٥–٢٠٪", "آمنة للعلامة", "بيانات المستهلكين", "انطلق خلال ٤٨س"],
      cta: "تحدث إلى فريقنا",
    },
    footer: {
      links: ["قانوني", "الشروط", "الخصوصية", "اتصل بنا"],
      copy: "© 2026 Fulflo SAS. فرنسا. جميع الحقوق محفوظة.",
    },
  },
};

// ─── Product Cards Data ────────────────────────────────────────────────────────

const products = [
  {
    brand: "Colgate",
    name: "Total Advanced",
    size: "75 ml × 3",
    rrp: "€4.50",
    price: "€1.89",
    saving: "-58%",
    expiry: "08/2025",
    cardBg: "bg-red-50",
    dot: "bg-red-400",
  },
  {
    brand: "Nescafé",
    name: "Gold Blend",
    size: "100 g",
    rrp: "€6.90",
    price: "€3.29",
    saving: "-52%",
    expiry: "11/2025",
    cardBg: "bg-amber-50",
    dot: "bg-amber-400",
  },
  {
    brand: "Ariel",
    name: "Pods Color",
    size: "×30 lavages",
    rrp: "€9.80",
    price: "€4.69",
    saving: "-52%",
    expiry: "09/2025",
    cardBg: "bg-blue-50",
    dot: "bg-blue-400",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [lang, setLang] = useState<Lang>("fr");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const t = copy[lang];
  const isRtl = lang === "ar";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  const successMsg =
    lang === "fr"
      ? "Parfait\u00a0! On vous contacte bientôt."
      : lang === "en"
      ? "Perfect! We'll be in touch soon."
      : "رائع! سنتواصل معك قريباً.";

  return (
    <div className="min-h-screen bg-white" dir={isRtl ? "rtl" : "ltr"}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-mint-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <span className="text-2xl font-bold tracking-tight text-forest shrink-0">
            fulflo<span className="text-mint">.</span>
          </span>

          <div className="hidden md:flex items-center gap-8">
            {[t.nav.deals, t.nav.categories, t.nav.brands].map((label) => (
              <a
                key={label}
                href="#"
                className="text-sm font-medium text-text-dark hover:text-mint transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center bg-surface rounded-full p-1 gap-0.5">
              {(["fr", "en", "ar"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    lang === l
                      ? "bg-forest text-white shadow-sm"
                      : "text-text-dark hover:text-forest"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button className="hidden sm:block bg-forest text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-forest-mid transition-colors">
              {t.nav.cta}
            </button>
          </div>
        </div>
      </nav>

      {/* ── LIVE TICKER ─────────────────────────────────────────────────── */}
      <div className="bg-forest text-white overflow-hidden py-2.5">
        <div className="flex whitespace-nowrap ticker-track">
          {[...t.ticker, ...t.ticker].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 mx-8 text-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-mint inline-block shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="bg-surface pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-mint-light text-text-dark text-xs font-bold tracking-widest px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
              {t.hero.badge}
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-forest mb-6">
              {t.hero.h1a}
              <br />
              <span className="text-mint">{t.hero.h1b}</span>
              <br />
              {t.hero.h1c}
            </h1>

            <p className="text-lg text-text-mid mb-8 max-w-xl leading-relaxed">
              {t.hero.sub}
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.hero.emailPlaceholder}
                  className="flex-1 px-4 py-3 rounded-xl border border-mint-light bg-white text-forest placeholder:text-text-mid/50 focus:outline-none focus:ring-2 focus:ring-mint text-sm"
                />
                <button
                  type="submit"
                  className="bg-forest text-white font-semibold px-6 py-3 rounded-xl hover:bg-forest-mid transition-colors text-sm whitespace-nowrap"
                >
                  {t.hero.cta}
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3 bg-mint-light text-text-dark px-5 py-3 rounded-xl max-w-md">
                <span className="text-xl">✅</span>
                <span className="font-semibold text-sm">{successMsg}</span>
              </div>
            )}

            <p className="text-xs text-text-mid mt-3 opacity-60">{t.hero.note}</p>
          </div>

          {/* Product Cards */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
            {products.map((p) => (
              <div
                key={p.name}
                className={`${p.cardBg} rounded-2xl p-5 border border-white shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-text-dark uppercase tracking-wider">{p.brand}</span>
                  <span className="bg-forest text-white text-xs font-bold px-2.5 py-1 rounded-full">{p.saving}</span>
                </div>
                <p className="font-semibold text-forest text-base leading-snug mb-1">{p.name}</p>
                <p className="text-xs text-text-mid mb-4">{p.size}</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-forest">{p.price}</span>
                  <span className="text-sm text-text-mid line-through mb-0.5">{p.rrp}</span>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${p.dot} shrink-0`} />
                  <span className="text-xs text-text-mid">
                    {lang === "ar" ? `انتهاء ${p.expiry}` : `Exp. ${p.expiry}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────────────── */}
      <section className="bg-forest py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {t.stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-bold text-mint mb-1">{s.value}</p>
              <p className="text-sm text-white/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY FULFLO ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-forest text-center mb-12">{t.why.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.why.cards.map((c) => (
              <div
                key={c.title}
                className="bg-surface rounded-2xl p-6 hover:shadow-md transition-shadow border border-mint-pale"
              >
                <div className="text-4xl mb-4">{c.icon}</div>
                <h3 className="font-bold text-forest mb-2 text-lg leading-snug">{c.title}</h3>
                <p className="text-sm text-text-mid leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-forest text-center mb-14">{t.how.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {t.how.steps.map((s) => (
              <div key={s.n} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-forest flex items-center justify-center mb-5 shrink-0">
                  <span className="text-mint font-bold text-lg">{s.n}</span>
                </div>
                <h3 className="font-bold text-forest text-xl mb-2">{s.title}</h3>
                <p className="text-sm text-text-mid leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUPPLIER CTA ────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-forest">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-mint/30 text-mint text-xs font-bold tracking-widest px-4 py-1.5 rounded-full mb-6">
            {t.supplier.badge}
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            {t.supplier.title}
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t.supplier.sub}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {t.supplier.pills.map((pill) => (
              <span
                key={pill}
                className="bg-forest-mid text-mint-light text-sm font-medium px-4 py-1.5 rounded-full border border-mint/20"
              >
                {pill}
              </span>
            ))}
          </div>
          <button className="bg-mint text-forest font-bold px-8 py-4 rounded-full text-base hover:bg-mint-light transition-colors shadow-lg">
            {t.supplier.cta}
          </button>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-forest-dark py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-2xl font-bold text-white tracking-tight">
            fulflo<span className="text-mint">.</span>
          </span>
          <div className="flex items-center gap-6">
            {t.footer.links.map((l) => (
              <a key={l} href="#" className="text-xs text-white/50 hover:text-white/80 transition-colors">
                {l}
              </a>
            ))}
          </div>
          <p className="text-xs text-white/40">{t.footer.copy}</p>
        </div>
      </footer>
    </div>
  );
}
