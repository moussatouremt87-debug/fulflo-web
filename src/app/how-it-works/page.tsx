"use client";

import { useState } from "react";
import Link from "next/link";

const CLIENT_STEPS = [
  {
    icon: "🔍",
    title: "Parcourez le catalogue",
    desc: "Filtrez par catégorie, marque ou niveau de réduction. Tous les prix incluent la date d'expiry.",
  },
  {
    icon: "🛒",
    title: "Ajoutez au panier",
    desc: "Votre panier calcule automatiquement vos économies vs la grande distribution en temps réel.",
  },
  {
    icon: "💳",
    title: "Payez en sécurité",
    desc: "Paiement Stripe SSL. Frais de service 5% ou 0% avec FulFlo Pass.",
  },
  {
    icon: "📦",
    title: "Recevez en 3-5 jours",
    desc: "Livraison directe depuis les entrepôts du fabricant. Suivi en temps réel.",
  },
  {
    icon: "🔄",
    title: "Rachetez au bon moment",
    desc: "Alex vous rappelle quand vos produits vont manquer. Ne ratez plus une bonne affaire.",
  },
];

const SUPPLIER_STEPS = [
  {
    icon: "📝",
    title: "Créez votre compte",
    desc: "Inscription en 5 minutes sur fulflo.app/supplier/login. Validation sous 48h.",
  },
  {
    icon: "📤",
    title: "Uploadez votre inventaire",
    desc: "CSV, Excel ou API directe. L'IA FulFlo complète les descriptions et optimise les prix.",
  },
  {
    icon: "🤖",
    title: "Alex analyse et propose",
    desc: "Notre agent IA analyse votre stock et propose les meilleurs créneaux de mise en vente.",
  },
  {
    icon: "💰",
    title: "Recevez vos paiements",
    desc: "Virement J+7 après chaque vente. Dashboard temps réel de vos revenus et performances.",
  },
  {
    icon: "📊",
    title: "Exploitez les données",
    desc: "Consumer insights, iROAS, Brand Lift, rapport RSE mensuel automatique.",
  },
];

export default function HowItWorksPage() {
  const [tab, setTab] = useState<"client" | "supplier">("client");
  const steps = tab === "client" ? CLIENT_STEPS : SUPPLIER_STEPS;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Nav */}
      <nav className="bg-[#1B4332] h-14 flex items-center px-6 gap-4">
        <Link href="/" className="text-xl font-black text-white tracking-tight shrink-0">
          fulflo<span className="text-[#10B981]">.</span>
        </Link>
        <div className="flex-1" />
        <Link href="/faq" className="text-white/70 hover:text-white text-sm transition-colors hidden sm:inline">
          FAQ
        </Link>
        <Link href="/deals" className="text-white/70 hover:text-white text-sm transition-colors">
          Voir les offres
        </Link>
      </nav>

      {/* Hero */}
      <div className="bg-[#1B4332] px-6 py-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
          Comment ça marche
        </h1>
        <p className="text-white/60 max-w-md mx-auto">
          FulFlo connecte fabricants et consommateurs en 5 étapes simples.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="flex bg-white border border-gray-100 rounded-2xl p-1.5 gap-1.5 mb-10 shadow-sm">
          {(["client", "supplier"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t
                  ? "bg-[#1B4332] text-white shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "client" ? "Pour les clients" : "Pour les Partenaires"}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={step.title} className="flex gap-5 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-black text-sm">
                  {i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-gray-100 mt-2" />
                )}
              </div>
              <div className="pt-1.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{step.icon}</span>
                  <h3 className="font-bold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/deals"
            className="block bg-[#1B4332] text-white font-bold text-center py-3.5 rounded-xl hover:bg-[#2d6a4f] transition-colors"
          >
            Voir les offres →
          </Link>
          <Link
            href="/membership"
            className="block bg-[#10B981] text-[#1B4332] font-bold text-center py-3.5 rounded-xl hover:bg-[#D1FAE5] transition-colors"
          >
            Découvrir FulFlo Pass →
          </Link>
        </div>
      </div>

      {/* Supplier CTA */}
      {tab === "supplier" && (
        <div className="bg-[#1B4332] px-6 py-12 text-center mt-4">
          <p className="text-white font-black text-xl mb-2">Prêt à rejoindre FulFlo ?</p>
          <p className="text-white/60 text-sm mb-6">Go-live en 48h · Commission 0% avec abonnement Business</p>
          <Link
            href="/supplier/login"
            className="inline-block bg-[#10B981] text-[#1B4332] font-black px-8 py-3 rounded-xl hover:bg-[#D1FAE5] transition-colors"
          >
            Devenir Partenaire →
          </Link>
        </div>
      )}
    </div>
  );
}
