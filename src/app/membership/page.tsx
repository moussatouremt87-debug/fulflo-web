"use client";

import { useState } from "react";
import Link from "next/link";

const PLANS = [
  {
    name: "Gratuit",
    tag: "Pour découvrir",
    tagColor: "bg-gray-100 text-gray-600",
    priceMonthly: 0,
    priceAnnual: 0,
    featured: false,
    cta: "Commencer gratuitement →",
    ctaHref: "/deals",
    ctaStyle: "bg-gray-900 text-white hover:bg-gray-700",
    features: [
      { ok: true,  text: "Accès au catalogue surplus" },
      { ok: true,  text: "Livraison offerte dès €40" },
      { ok: true,  text: "Frais de service 5%" },
      { ok: false, text: "Prix fabricant direct" },
      { ok: false, text: "Accès anticipé flash sales" },
      { ok: false, text: "Alex vocal" },
    ],
  },
  {
    name: "Pass Essentiel",
    tag: "Le plus populaire",
    tagColor: "bg-[#D1FAE5] text-[#065F46]",
    priceMonthly: 4.99,
    priceAnnual: 39,
    featured: true,
    cta: "Commencer l'essai →",
    ctaHref: "/signup",
    ctaStyle: "bg-[#1B4332] text-white hover:bg-[#2d6a4f]",
    features: [
      { ok: true,  text: "Tout du plan Gratuit" },
      { ok: true,  text: "Prix fabricant direct (0% commission)" },
      { ok: true,  text: "Accès anticipé flash sales (+24h)" },
      { ok: true,  text: "Panier intelligent + rappels" },
      { ok: true,  text: "Rapport économies mensuel" },
      { ok: false, text: "Alex vocal" },
    ],
  },
  {
    name: "Pass Premium",
    tag: "Tout inclus",
    tagColor: "bg-gray-900 text-white",
    priceMonthly: 9.99,
    priceAnnual: 79,
    featured: false,
    cta: "Commencer l'essai →",
    ctaHref: "/signup",
    ctaStyle: "bg-[#1B4332] text-white hover:bg-[#2d6a4f]",
    features: [
      { ok: true, text: "Tout du Pass Essentiel" },
      { ok: true, text: "Alex assistant vocal 24/7" },
      { ok: true, text: "Accès Early aux nouveaux fournisseurs" },
      { ok: true, text: "Support prioritaire WhatsApp" },
      { ok: true, text: "Rapport RSE personnel" },
    ],
  },
];

const TRUST = [
  {
    icon: "🔄",
    title: "Annulez à tout moment",
    desc: "Sans engagement, sans pénalité. Annulation en un clic depuis votre compte.",
  },
  {
    icon: "🎁",
    title: "1ère semaine offerte",
    desc: "Testez gratuitement pendant 7 jours. Aucune carte requise pour commencer.",
  },
  {
    icon: "🔒",
    title: "Données sécurisées RGPD",
    desc: "Hébergement EU. Vos données ne sont jamais vendues ni partagées avec des tiers.",
  },
];

export default function MembershipPage() {
  const [spend, setSpend]     = useState(150);
  const [annual, setAnnual]   = useState(false);

  const withFulflo    = Math.round(spend * 0.5);
  const savings       = spend - withFulflo;
  const annualSavings = savings * 12;
  const passMonthly   = 4.99;
  const ordersToROI   = Math.ceil((passMonthly * 12) / savings);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Nav */}
      <nav className="bg-[#1B4332] h-14 flex items-center px-6 gap-4">
        <Link href="/" className="text-xl font-black text-white tracking-tight shrink-0">
          fulflo<span className="text-[#10B981]">.</span>
        </Link>
        <div className="flex-1" />
        <Link href="/deals" className="text-white/70 hover:text-white text-sm transition-colors">
          Voir les offres
        </Link>
        <Link href="/login" className="text-white/70 hover:text-white text-sm transition-colors">
          Connexion
        </Link>
      </nav>

      {/* Hero */}
      <div className="bg-[#1B4332] px-6 py-16 text-center">
        <span className="inline-block bg-[#10B981]/20 text-[#10B981] text-xs font-bold px-3 py-1 rounded-full mb-5 tracking-wide uppercase">
          Inspiré du modèle Costco
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
          Payez l&apos;accès.<br />Pas la commission.
        </h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          Les membres FulFlo Pass achètent au prix fabricant — sans frais cachés.
        </p>
      </div>

      {/* Savings calculator */}
      <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <p className="font-bold text-gray-900 text-center mb-6">
            Je dépense combien par mois en produits du quotidien ?
          </p>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm text-gray-400 shrink-0">€50</span>
            <input
              type="range" min={50} max={500} step={10}
              value={spend}
              onChange={(e) => setSpend(Number(e.target.value))}
              className="flex-1 accent-[#10B981]"
            />
            <span className="text-sm text-gray-400 shrink-0">€500</span>
          </div>
          <p className="text-center text-2xl font-black text-[#1B4332] mb-6">€{spend}/mois</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">Sans FulFlo</p>
              <p className="text-2xl font-black text-gray-400">€{spend}/mois</p>
            </div>
            <div className="bg-[#D1FAE5] rounded-xl p-4 text-center">
              <p className="text-xs text-[#065F46] font-semibold mb-1">Avec FulFlo Pass</p>
              <p className="text-2xl font-black text-[#1B4332]">€{withFulflo}/mois</p>
            </div>
          </div>

          <div className="bg-[#1B4332] rounded-xl p-4 text-center mb-3">
            <p className="text-[#10B981] text-xs font-bold uppercase tracking-wide mb-1">Économies annuelles</p>
            <p className="text-3xl font-black text-white">€{annualSavings.toLocaleString("fr-FR")}/an</p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">ROI du Pass</span>
            <span className="font-bold text-[#1B4332]">
              Rentabilisé en {ordersToROI <= 1 ? "1 commande" : `${ordersToROI} commandes`}
            </span>
          </div>
          <div className="mt-3 bg-[#D1FAE5] rounded-lg px-4 py-2.5 text-center">
            <span className="text-[#065F46] text-sm font-bold">
              ✅ Rentabilisé dès la 1ère commande de €10
            </span>
          </div>
        </div>
      </div>

      {/* Plan toggle + cards */}
      <div className="max-w-5xl mx-auto px-4 mt-16">
        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setAnnual(false)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              !annual ? "bg-[#1B4332] text-white" : "text-gray-400 hover:text-gray-700"
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              annual ? "bg-[#1B4332] text-white" : "text-gray-400 hover:text-gray-700"
            }`}
          >
            Annuel
            <span className="bg-[#10B981] text-[#1B4332] text-[10px] font-black px-1.5 py-0.5 rounded-full">
              -34%
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl p-6 flex flex-col ${
                plan.featured
                  ? "border-2 border-[#10B981] shadow-lg ring-2 ring-[#10B981]/10"
                  : "border border-gray-100 shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <p className="font-black text-gray-900 text-lg">{plan.name}</p>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${plan.tagColor}`}>
                  {plan.tag}
                </span>
              </div>

              <div className="mb-6">
                {plan.priceMonthly === 0 ? (
                  <p className="text-4xl font-black text-gray-900">€0</p>
                ) : (
                  <>
                    <p className="text-4xl font-black text-gray-900">
                      €{annual ? plan.priceAnnual : plan.priceMonthly.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {annual ? "/an" : "/mois"} · sans engagement
                    </p>
                  </>
                )}
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2">
                    <span className={`text-sm shrink-0 mt-0.5 ${f.ok ? "text-[#10B981]" : "text-gray-300"}`}>
                      {f.ok ? "✓" : "✗"}
                    </span>
                    <span className={`text-sm ${f.ok ? "text-gray-700" : "text-gray-300"}`}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`block text-center font-bold py-3 rounded-xl text-sm transition-colors ${plan.ctaStyle}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Trust section */}
      <div className="max-w-4xl mx-auto px-4 mt-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TRUST.map((t) => (
            <div key={t.title} className="text-center">
              <span className="text-4xl block mb-3">{t.icon}</span>
              <p className="font-bold text-gray-900 mb-1">{t.title}</p>
              <p className="text-sm text-gray-400">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Supplier section */}
      <div className="mt-16 bg-[#1B4332] px-6 py-12 text-center">
        <p className="text-[#10B981] text-xs font-bold uppercase tracking-widest mb-3">Pour les marques</p>
        <h2 className="text-2xl font-black text-white mb-2">Vous êtes une marque ?</h2>
        <p className="text-white/60 mb-6">
          Rejoignez FulFlo Business — Commission 0% · À partir de €199/mois
        </p>
        <Link
          href="/supplier/login"
          className="inline-block bg-[#10B981] text-[#1B4332] font-black px-8 py-3 rounded-xl hover:bg-[#D1FAE5] transition-colors"
        >
          Devenir partenaire →
        </Link>
      </div>

      {/* Footer mini */}
      <div className="py-6 text-center text-xs text-gray-400">
        fulflo. · <Link href="/faq" className="hover:text-gray-600">FAQ</Link>
        {" · "}<Link href="/how-it-works" className="hover:text-gray-600">Comment ça marche</Link>
        {" · "}<a href="mailto:nous@fulflo.app" className="hover:text-gray-600">nous@fulflo.app</a>
      </div>
    </div>
  );
}
