"use client";

import { useState, useEffect } from "react";
import SupplierShell from "@/components/supplier/SupplierShell";
import { Package, TrendingUp, Users, Plus, ChevronRight, Lock } from "lucide-react";

interface BundleCampaign {
  id: string;
  name: string;
  status: "active" | "paused" | "ended";
  supplier_ids: string[];
  bundle_price_eur: number;
  bundle_discount_percent: number;
  activation_fee_eur: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue_generated_eur: number;
  valid_until: string;
}

const DEMO_BUNDLES: BundleCampaign[] = [
  {
    id: "b1",
    name: "Bundle Petit-Déjeuner Premium",
    status: "active",
    supplier_ids: ["demo-nestle"],
    bundle_price_eur: 7.99,
    bundle_discount_percent: 55,
    activation_fee_eur: 299,
    impressions: 3240,
    clicks: 187,
    conversions: 34,
    revenue_generated_eur: 271.66,
    valid_until: new Date(Date.now() + 18 * 86400000).toISOString(),
  },
  {
    id: "b2",
    name: "Bundle Hygiène Famille",
    status: "active",
    supplier_ids: ["demo-nestle"],
    bundle_price_eur: 9.49,
    bundle_discount_percent: 48,
    activation_fee_eur: 299,
    impressions: 2180,
    clicks: 143,
    conversions: 22,
    revenue_generated_eur: 208.78,
    valid_until: new Date(Date.now() + 12 * 86400000).toISOString(),
  },
];

const CO_BRANDS = [
  { name: "Colgate", emoji: "🦷", desc: "Complémentaire à vos produits boissons" },
  { name: "Ariel",   emoji: "🧺", desc: "Affinité audience 72% — ménages actifs" },
  { name: "Dove",    emoji: "🕊️", desc: "Co-achat fréquent avec café & céréales" },
];

export default function BundlesPage() {
  const [bundles, setBundles]   = useState<BundleCampaign[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    discount: 40,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/bundles/create?supplierId=demo-nestle")
      .then((r) => r.json())
      .then((data) => {
        setBundles(Array.isArray(data) && data.length ? data : DEMO_BUNDLES);
      })
      .catch(() => setBundles(DEMO_BUNDLES))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name) return;
    setSubmitting(true);
    const res = await fetch("/api/bundles/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        supplierId: "demo-nestle",
        bundlePriceEur: 9.99,
        bundleDiscountPercent: form.discount,
      }),
    });
    const data = await res.json();
    if (!data.error) {
      setBundles((prev) => [data, ...prev]);
      setShowForm(false);
      setForm({ name: "", discount: 40 });
    }
    setSubmitting(false);
  };

  return (
    <SupplierShell>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Package size={22} className="text-[#10B981]" />
              <h1 className="text-2xl font-black text-white">Cross-Brand Bundles</h1>
              <span className="text-[10px] font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 px-2 py-0.5 rounded-full uppercase tracking-wide">
                Produit AdTech 4
              </span>
            </div>
            <p className="text-white/60 text-sm">
              Co-financez des bundles avec d&apos;autres marques. Partagez les coûts, multipliez la visibilité.
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 bg-[#10B981] text-[#1B4332] font-bold text-sm px-4 py-2 rounded-xl hover:bg-[#D1FAE5] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus size={15} />
            Nouveau bundle
          </button>
        </div>

        {/* ── Value prop card ────────────────────────────────────────────── */}
        <div className="bg-[#1B4332] rounded-2xl p-5 text-white">
          <p className="text-[#10B981] text-xs font-bold uppercase tracking-widest mb-3">Pourquoi les bundles ?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: "💸", text: "Coût partagé entre 2–3 marques → €99–150/marque au lieu de €299" },
              { icon: "🛒", text: "Panier moyen +40% vs produit seul" },
              { icon: "📊", text: "Données co-achat exclusives (qui achète Nescafé + Colgate ensemble ?)" },
              { icon: "👥", text: "Visibilité croisée sur les audiences des autres marques" },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-2">
                <span className="text-lg shrink-0">{item.icon}</span>
                <p className="text-white/80 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Create bundle form ─────────────────────────────────────────── */}
        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-bold text-sm">Proposer un nouveau bundle</h3>

            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wide block mb-1">
                Nom du bundle
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="ex: Bundle Petit-Déjeuner Signature"
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm placeholder:text-white/30 focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wide block mb-2">
                Remise bundle : {form.discount}%
              </label>
              <input
                type="range"
                min={30} max={70} step={5}
                value={form.discount}
                onChange={(e) => setForm((f) => ({ ...f, discount: Number(e.target.value) }))}
                className="w-full accent-[#10B981]"
              />
              <div className="flex justify-between text-white/30 text-xs mt-1">
                <span>30%</span><span>70%</span>
              </div>
            </div>

            {/* Co-brander search */}
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wide block mb-2">
                Chercher des co-brandeurs
              </label>
              <div className="space-y-2">
                {CO_BRANDS.map((brand) => (
                  <div key={brand.name} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <span className="text-2xl">{brand.emoji}</span>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{brand.name}</p>
                      <p className="text-white/40 text-xs">{brand.desc}</p>
                    </div>
                    <button className="text-[#10B981] text-xs font-bold border border-[#10B981]/30 px-3 py-1 rounded-lg hover:bg-[#10B981]/10 transition-colors">
                      Inviter →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-white/10">
              <div className="flex-1">
                <p className="text-white/50 text-xs">Budget total : <span className="text-white font-bold">€299</span></p>
                <p className="text-white/50 text-xs">Reach estimé : <span className="text-[#10B981] font-bold">~2 400 acheteurs potentiels</span></p>
              </div>
              <button
                onClick={handleCreate}
                disabled={submitting || !form.name}
                className="flex items-center gap-2 bg-[#10B981] text-[#1B4332] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#D1FAE5] transition-colors disabled:opacity-50"
              >
                <ChevronRight size={14} />
                {submitting ? "Envoi…" : "Proposer ce bundle"}
              </button>
            </div>
          </div>
        )}

        {/* ── Active bundles ─────────────────────────────────────────────── */}
        <div>
          <h2 className="text-white font-bold text-sm uppercase tracking-wide mb-3">Bundles actifs</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {bundles.map((b) => {
                const ctr   = b.impressions > 0 ? ((b.clicks / b.impressions) * 100).toFixed(1) : "0.0";
                const roi   = Number(b.activation_fee_eur) > 0 ? (Number(b.revenue_generated_eur) / Number(b.activation_fee_eur)).toFixed(1) : "—";
                const validDate = new Date(b.valid_until).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
                return (
                  <div key={b.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black bg-[#7C3AED] text-white px-2 py-0.5 rounded-full uppercase">
                            BUNDLE
                          </span>
                          <span className="text-[10px] font-bold text-[#10B981]">
                            -{b.bundle_discount_percent}%
                          </span>
                        </div>
                        <p className="text-white font-bold text-base">{b.name}</p>
                        <p className="text-white/40 text-xs mt-0.5">Valide jusqu&apos;au {validDate}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-white font-black text-xl">€{Number(b.bundle_price_eur).toFixed(2)}</p>
                        <p className="text-white/40 text-xs">prix bundle</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {[
                        { label: "Impressions", value: b.impressions.toLocaleString("fr-FR") },
                        { label: "Clics",       value: b.clicks.toLocaleString("fr-FR") },
                        { label: "Conversions", value: b.conversions },
                        { label: "Revenus",     value: `€${Number(b.revenue_generated_eur).toFixed(0)}` },
                      ].map((stat) => (
                        <div key={stat.label} className="text-center">
                          <p className="text-white font-black text-lg">{stat.value}</p>
                          <p className="text-white/40 text-[10px] uppercase tracking-wide">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 pt-3 border-t border-white/10 text-xs text-white/50">
                      <span>CTR : <span className="text-white font-semibold">{ctr}%</span></span>
                      <span>·</span>
                      <span>ROI : <span className="text-[#10B981] font-semibold">{roi}×</span></span>
                      <span>·</span>
                      <span className="text-white/40 text-xs">
                        68% des acheteurs de ce bundle achètent aussi un produit hygiène le même jour
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Co-achat insights (locked) ─────────────────────────────────── */}
        <div className="relative border border-dashed border-gray-600 rounded-2xl p-5 overflow-hidden">
          {/* Blurred content */}
          <div className="filter blur-sm pointer-events-none select-none">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-[#10B981]" />
              <h3 className="text-white font-bold text-sm">Intelligence Co-Achat — Données exclusives</h3>
            </div>
            <div className="space-y-2">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-white/80 text-sm">68% des acheteurs de Nescafé achètent aussi un produit hygiène le même jour</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-white/80 text-sm">Bundle Café + Dentifrice : panier moyen €8.40</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-white/80 text-sm">Top co-achat : Nescafé + Colgate (43%) · Nescafé + Ariel (31%) · Nescafé + Dove (22%)</p>
              </div>
            </div>
          </div>
          {/* Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f2d1e]/80 backdrop-blur-sm rounded-2xl">
            <Lock size={24} className="text-[#10B981] mb-2" />
            <p className="text-white font-bold text-sm mb-1">Intelligence Co-Achat</p>
            <p className="text-white/60 text-xs text-center mb-3 px-4">Données exclusives sur les habitudes d&apos;achat croisé</p>
            <button className="flex items-center gap-2 bg-[#10B981] text-[#1B4332] font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#D1FAE5] transition-colors">
              <Users size={12} />
              Débloquer avec Plan Analytics €499/mois →
            </button>
          </div>
        </div>

      </div>
    </SupplierShell>
  );
}
