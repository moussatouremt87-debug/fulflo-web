"use client";

import { useState } from "react";
import Link from "next/link";

const SECTIONS = [
  {
    title: "Les produits",
    items: [
      {
        q: "Est-ce que les produits sont périmés ?",
        a: "Non. Tous nos produits ont une date de consommation optimale (DDO) valide à la livraison. La date est affichée sur chaque fiche produit. Le surplus CPG concerne des produits parfaitement consommables dont les fabricants ont produit en excès.",
      },
      {
        q: "D'où viennent les produits ?",
        a: "Directement des fabricants (Nestlé, Colgate, P&G, etc.) ou de leurs distributeurs officiels. Aucun produit ne transite par des circuits gris ou non officiels. FulFlo est un partenaire de liquidation certifié.",
      },
      {
        q: "Les produits sont-ils authentiques ?",
        a: "100% authentiques. Chaque lot est vérifié avant publication. Vous achetez les mêmes produits qu'en grande surface, à prix réduit parce qu'il y en a trop.",
      },
    ],
  },
  {
    title: "Livraison",
    items: [
      {
        q: "Quels sont les délais de livraison ?",
        a: "Livraison en 24-48h en France métropolitaine via Colissimo ou Mondial Relay. Livraison offerte dès €40 d'achat.",
      },
      {
        q: "Livrez-vous en dehors de France ?",
        a: "Actuellement France et Suisse uniquement. L'Allemagne sera disponible en 2026.",
      },
    ],
  },
  {
    title: "Paiement & retours",
    items: [
      {
        q: "Puis-je retourner un produit ?",
        a: "Oui, dans les 14 jours suivant la réception (droit de rétractation légal UE). Les produits alimentaires dont l'emballage a été ouvert sont exclus. Contactez nous@fulflo.app pour initier un retour.",
      },
      {
        q: "Quels moyens de paiement acceptez-vous ?",
        a: "Carte bancaire (Visa, Mastercard, American Express) via Stripe. Paiement 100% sécurisé SSL 256-bit.",
      },
    ],
  },
  {
    title: "FulFlo Pass",
    items: [
      {
        q: "Qu'est-ce que le FulFlo Pass ?",
        a: "Un abonnement mensuel ou annuel qui vous donne accès aux prix fabricants directs, sans commission. Comme Costco mais pour les marques du quotidien. À partir de €4.99/mois, rentabilisé dès la première commande de €10.",
      },
      {
        q: "Puis-je annuler mon Pass ?",
        a: "Oui, à tout moment depuis votre compte. Aucun engagement, aucune pénalité.",
      },
    ],
  },
  {
    title: "Pour les marques",
    items: [
      {
        q: "Comment mettre mon surplus en vente sur FulFlo ?",
        a: "Créez un compte fournisseur sur fulflo.app/supplier/login. Uploadez vos produits en CSV ou via notre API. Vos produits sont en ligne en moins de 48h. Commission 8-12% ou 0% avec un abonnement Business.",
      },
      {
        q: "FulFlo est-il conforme à la loi AGEC ?",
        a: "Oui. FulFlo documente chaque transaction et génère automatiquement un rapport RSE pour vos équipes Sustainability. Vendre via FulFlo = conformité AGEC garantie.",
      },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left"
      >
        <span className="font-semibold text-gray-900 text-sm sm:text-base">{q}</span>
        <span className={`text-[#10B981] font-black text-lg shrink-0 transition-transform ${open ? "rotate-45" : ""}`}>
          +
        </span>
      </button>
      {open && (
        <p className="text-sm text-gray-500 leading-relaxed pb-4 pr-8">{a}</p>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Nav */}
      <nav className="bg-[#1B4332] h-14 flex items-center px-6 gap-4">
        <Link href="/" className="text-xl font-black text-white tracking-tight shrink-0">
          fulflo<span className="text-[#10B981]">.</span>
        </Link>
        <div className="flex-1" />
        <Link href="/how-it-works" className="text-white/70 hover:text-white text-sm transition-colors hidden sm:inline">
          Comment ça marche
        </Link>
        <Link href="/deals" className="text-white/70 hover:text-white text-sm transition-colors">
          Voir les offres
        </Link>
      </nav>

      {/* Hero */}
      <div className="bg-[#1B4332] px-6 py-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
          Questions fréquentes
        </h1>
        <p className="text-white/60">
          Tout ce que vous vouliez savoir sur FulFlo.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-black text-[#10B981] uppercase tracking-widest mb-3">
              {section.title}
            </h2>
            <div className="bg-white rounded-2xl px-6 shadow-sm border border-gray-100">
              {section.items.map((item) => (
                <AccordionItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div className="bg-[#1B4332] rounded-2xl p-8 text-center">
          <p className="text-white font-bold text-lg mb-2">Une question sans réponse ?</p>
          <p className="text-white/60 text-sm mb-5">Notre équipe répond sous 2h en semaine.</p>
          <a
            href="mailto:nous@fulflo.app"
            className="inline-block bg-[#10B981] text-[#1B4332] font-black px-6 py-2.5 rounded-xl hover:bg-[#D1FAE5] transition-colors"
          >
            Contacter le support →
          </a>
        </div>
      </div>
    </div>
  );
}
