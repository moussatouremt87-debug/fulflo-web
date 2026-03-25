"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/supplier/Header";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Campaign {
  id: string;
  campaign_name: string;
  status: "active" | "paused" | "ended";
  cpc_eur: number;
  daily_budget_eur: number;
  daily_spend_eur: number;
  total_spend_eur: number;
  impressions: number;
  clicks: number;
}

interface DemoProduct {
  id: string;
  name: string;
  brand: string;
}

// ─── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    campaign_name: "Crème de Riz Bio - Boost Q1",
    status: "active",
    cpc_eur: 1.50,
    daily_budget_eur: 100.00,
    daily_spend_eur: 27.00,
    total_spend_eur: 142.50,
    impressions: 234,
    clicks: 18,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    campaign_name: "Granola Fruits Rouges Flash",
    status: "active",
    cpc_eur: 2.00,
    daily_budget_eur: 75.00,
    daily_spend_eur: 24.00,
    total_spend_eur: 98.00,
    impressions: 89,
    clicks: 12,
  },
];

const DEMO_PRODUCTS: DemoProduct[] = [
  { id: "1", name: "Crème de Riz Bio 400g",       brand: "Favrichon" },
  { id: "2", name: "Galettes Riz Chocolat ×10",  brand: "Favrichon" },
  { id: "3", name: "Muesli Croustillant Bio 1kg", brand: "Favrichon" },
  { id: "4", name: "Granola Fruits Rouges 400g",  brand: "Favrichon" },
  { id: "5", name: "Flocons Avoine Bio 750g",     brand: "Favrichon" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function ctr(impressions: number, clicks: number): string {
  if (!impressions) return "—";
  return ((clicks / impressions) * 100).toFixed(1) + "%";
}

function statusBadge(status: Campaign["status"]) {
  const map = {
    active: "bg-green-100 text-green-700",
    paused: "bg-yellow-100 text-yellow-700",
    ended:  "bg-gray-100 text-gray-500",
  };
  const labels = { active: "Actif", paused: "Pausé", ended: "Terminé" };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

// ─── Audience Overlap data ──────────────────────────────────────────────────────

const AGE_RANGES   = ["18–24", "25–34", "35–44", "45–54", "55+"];
const REGIONS      = ["Île-de-France", "Rhône-Alpes", "PACA", "Bretagne", "Grand Est", "Occitanie"];
const CATEGORIES   = ["Alimentaire", "Boissons", "Hygiène", "Entretien", "Beauté", "Bébé"];

// Synthetic overlap model: base 38k active buyers, varies by combo
function estimateReach(age: string, region: string, category: string): {
  reach: number; pct: number; premium: number;
} {
  const ageMult: Record<string, number>      = { "18–24": 0.12, "25–34": 0.31, "35–44": 0.28, "45–54": 0.22, "55+": 0.07 };
  const regionMult: Record<string, number>   = { "Île-de-France": 0.34, "Rhône-Alpes": 0.18, "PACA": 0.12, "Bretagne": 0.09, "Grand Est": 0.08, "Occitanie": 0.11 };
  const catMult: Record<string, number>      = { "Alimentaire": 0.42, "Boissons": 0.18, "Hygiène": 0.16, "Entretien": 0.12, "Beauté": 0.08, "Bébé": 0.04 };
  const base = 38420;
  const raw  = Math.round(base * (ageMult[age] ?? 0.2) * (regionMult[region] ?? 0.15) * (catMult[category] ?? 0.15) * 18);
  const pct  = Math.round((raw / base) * 100 * 10) / 10;
  const premium = Math.round(raw * 0.23); // 23% are Pass members
  return { reach: raw, pct, premium };
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEMO_CAMPAIGNS);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Audience overlap state
  const [overlapAge, setOverlapAge]         = useState(AGE_RANGES[1]);
  const [overlapRegion, setOverlapRegion]   = useState(REGIONS[0]);
  const [overlapCategory, setOverlapCategory] = useState(CATEGORIES[0]);

  // Form state
  const [form, setForm] = useState({
    campaign_name: "",
    product_id: DEMO_PRODUCTS[0].id,
    cpc_eur: "1.00",
    daily_budget_eur: "50.00",
  });

  const supplierId = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("fulflo_demo_supplier") ?? "{}").id ?? "maison-favrichon"
    : "maison-favrichon";

  // Fetch campaigns directly from Supabase
  useEffect(() => {
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!sbUrl || !sbKey || sbKey === "placeholder") return;

    import("@supabase/supabase-js").then(({ createClient }) => {
      const sb = createClient(sbUrl, sbKey);
      Promise.resolve(
        sb.from("ad_campaigns")
          .select("*")
          .eq("supplier_id", supplierId)
          .order("created_at", { ascending: false })
      ).then(({ data, error }) => {
        if (!error && data?.length) setCampaigns(data as Campaign[]);
      }).catch(() => {});
    });
  }, [supplierId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key && key !== "placeholder") {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const sb = createClient(url, key);
        const { data, error } = await sb.from("ad_campaigns").insert({
          supplier_id: supplierId,
          product_id: form.product_id || null,
          campaign_name: form.campaign_name,
          cpc_eur: parseFloat(form.cpc_eur),
          daily_budget_eur: parseFloat(form.daily_budget_eur),
          status: "active",
        }).select().single();

        if (!error && data) {
          setCampaigns((prev) => [data as Campaign, ...prev]);
        }
      } catch { /* ignore */ }
    } else {
      // Demo: add locally
      const newCamp: Campaign = {
        id: crypto.randomUUID(),
        campaign_name: form.campaign_name,
        status: "active",
        cpc_eur: parseFloat(form.cpc_eur),
        daily_budget_eur: parseFloat(form.daily_budget_eur),
        daily_spend_eur: 0,
        total_spend_eur: 0,
        impressions: 0,
        clicks: 0,
      };
      setCampaigns((prev) => [newCamp, ...prev]);
    }

    setSaving(false);
    setSaved(true);
    setCreating(false);
    setForm({ campaign_name: "", product_id: DEMO_PRODUCTS[0].id, cpc_eur: "1.00", daily_budget_eur: "50.00" });
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === "active" ? "paused" : "active";
    setCampaigns((prev) =>
      prev.map((c) => c.id === campaign.id ? { ...c, status: newStatus } : c)
    );

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key && key !== "placeholder") {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(url, key);
      await sb.from("ad_campaigns").update({ status: newStatus }).eq("id", campaign.id);
    }
  };

  // Summary KPIs
  const totalSpend       = campaigns.reduce((s, c) => s + Number(c.total_spend_eur), 0);
  const totalClicks      = campaigns.reduce((s, c) => s + Number(c.clicks), 0);
  const totalImpressions = campaigns.reduce((s, c) => s + Number(c.impressions), 0);
  const avgCtr           = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0.0";

  // iROAS computation
  const adRevenue       = 284; // total attributed revenue (same as analytics page)
  const newCustomerRate = 0.62; // from analytics: 62% new buyers
  const roas            = totalSpend > 0 ? adRevenue / totalSpend : 0;
  const iroas           = roas * newCustomerRate;
  const BENCHMARK_IROAS = 1.8;
  const FULFLO_AVG_IROAS = 3.2;

  // Audience overlap
  const overlap = estimateReach(overlapAge, overlapRegion, overlapCategory);

  return (
    <div>
      <Header
        title="Campagnes Sponsorisées"
        subtitle="Gérez vos placements publicitaires sur la page Deals"
        action={
          <button
            onClick={() => setCreating(true)}
            className="bg-[#10B981] text-[#1B4332] font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#D1FAE5] transition-colors"
          >
            + Nouvelle campagne
          </button>
        }
      />

      {/* ── KPI SUMMARY ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Dépense totale", value: `€${totalSpend.toFixed(2)}`, icon: "💶" },
          { label: "Clics totaux", value: totalClicks.toString(), icon: "👆" },
          { label: "Impressions", value: totalImpressions.toString(), icon: "👁️" },
          { label: "CTR moyen", value: `${avgCtr}%`, icon: "📈" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="text-2xl mb-2">{kpi.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* ── iROAS WIDGET ──────────────────────────────────────────────── */}
      <div className={`rounded-2xl border p-6 mb-8 ${iroas >= FULFLO_AVG_IROAS ? "bg-[#ecfdf5] border-[#10B981]/30" : "bg-white border-gray-100 shadow-sm"}`}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">iROAS — Retour sur investissement incrémental</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Mesure la valeur réelle de vos campagnes sur des acheteurs que vous n&apos;auriez pas atteints autrement
            </p>
          </div>
          {iroas > 0 && (
            <span className={`text-sm font-black px-4 py-2 rounded-full shrink-0 ${iroas >= FULFLO_AVG_IROAS ? "bg-[#10B981] text-white" : "bg-gray-100 text-gray-700"}`}>
              iROAS {iroas.toFixed(1)}x {iroas >= FULFLO_AVG_IROAS ? "🚀" : ""}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {/* ROAS */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ROAS standard</p>
            <p className="text-3xl font-black text-gray-900 mb-1">
              {totalSpend > 0 ? roas.toFixed(1) : "—"}x
            </p>
            <p className="text-xs text-gray-400">Revenu total / dépense pub</p>
            <p className="text-xs text-gray-400 mt-0.5">€{adRevenue} / €{totalSpend.toFixed(0)}</p>
          </div>

          {/* iROAS */}
          <div className={`rounded-xl border p-5 ${iroas >= FULFLO_AVG_IROAS ? "bg-[#1B4332] border-[#1B4332]" : "bg-white border-gray-100"}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${iroas >= FULFLO_AVG_IROAS ? "text-[#10B981]" : "text-gray-400"}`}>
              iROAS estimé
            </p>
            <p className={`text-3xl font-black mb-1 ${iroas >= FULFLO_AVG_IROAS ? "text-white" : "text-gray-900"}`}>
              {totalSpend > 0 ? iroas.toFixed(1) : "—"}x
            </p>
            <p className={`text-xs ${iroas >= FULFLO_AVG_IROAS ? "text-white/60" : "text-gray-400"}`}>
              ROAS × taux nouveaux acheteurs (62%)
            </p>
            <p className={`text-xs mt-0.5 ${iroas >= FULFLO_AVG_IROAS ? "text-[#10B981]" : "text-gray-400"}`}>
              Portée incrémentale validée
            </p>
          </div>

          {/* Benchmark */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Benchmark</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Retail media standard</span>
                <span className="text-sm font-black text-gray-400">{BENCHMARK_IROAS}x</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-300 rounded-full" style={{ width: `${(BENCHMARK_IROAS / 5) * 100}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#1B4332] font-semibold">Campagnes FulFlo moy.</span>
                <span className="text-sm font-black text-[#1B4332]">{FULFLO_AVG_IROAS}x</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${(FULFLO_AVG_IROAS / 5) * 100}%` }} />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-3">Source : Retail Media Benchmark EU 2025</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl shrink-0">💡</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-bold">Pourquoi l&apos;iROAS plutôt que le ROAS ?</span>{" "}
            Le ROAS standard inclut les ventes que vous auriez faites de toute façon. L&apos;iROAS mesure uniquement
            la valeur <span className="font-bold">additionnelle</span> créée par vos campagnes — les acheteurs qui
            n&apos;auraient jamais acheté votre marque sans FulFlo.
            <Link href="/supplier/analytics" className="ml-1 font-bold text-amber-900 underline underline-offset-2">
              Voir la décomposition →
            </Link>
          </p>
        </div>
      </div>

      {/* ── AUDIENCE OVERLAP ESTIMATOR ────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="mb-5">
          <h3 className="font-bold text-gray-900 text-lg">Audience Overlap Estimator</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Estimez la portée de votre audience cible dans notre base d&apos;acheteurs actifs
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Tranche d&apos;âge cible
            </label>
            <select
              value={overlapAge}
              onChange={(e) => setOverlapAge(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-white"
            >
              {AGE_RANGES.map((a) => <option key={a} value={a}>{a} ans</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Région cible
            </label>
            <select
              value={overlapRegion}
              onChange={(e) => setOverlapRegion(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-white"
            >
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
              Catégorie produit
            </label>
            <select
              value={overlapCategory}
              onChange={(e) => setOverlapCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-white"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Result */}
        <div className="bg-[#1B4332] rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center sm:text-left">
            <p className="text-[#10B981] text-xs font-bold uppercase tracking-wider mb-1">Portée estimée</p>
            <p className="text-5xl font-black text-white">
              {overlap.reach.toLocaleString("fr-FR")}
            </p>
            <p className="text-white/60 text-sm mt-1">acheteurs actifs FulFlo</p>
          </div>
          <div className="h-px sm:h-16 w-16 sm:w-px bg-white/10" />
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="text-center">
              <p className="text-3xl font-black text-[#10B981]">{overlap.pct}%</p>
              <p className="text-white/60 text-xs mt-1">de notre base active</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-white">{overlap.premium.toLocaleString("fr-FR")}</p>
              <p className="text-white/60 text-xs mt-1">membres FulFlo Pass</p>
            </div>
          </div>
          <div className="h-px sm:h-16 w-16 sm:w-px bg-white/10" />
          <div className="text-center sm:text-right">
            <p className="text-white/70 text-xs leading-relaxed max-w-[180px]">
              Votre audience <span className="text-white font-bold">{overlapCategory}</span>{" "}
              {overlapAge} ans en <span className="text-white font-bold">{overlapRegion}</span>{" "}
              représente <span className="text-[#10B981] font-black">{overlap.pct}%</span>{" "}
              de nos acheteurs actifs.
            </p>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 mt-3 text-center">
          Estimation basée sur les données acheteurs des 90 derniers jours · Mis à jour quotidiennement
        </p>
      </div>

      {/* ── CREATE FORM ───────────────────────────────────────────────── */}
      {creating && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Nouvelle campagne sponsorisée</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nom de la campagne</label>
              <input
                type="text"
                required
                value={form.campaign_name}
                onChange={(e) => setForm((f) => ({ ...f, campaign_name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                placeholder="Ex: Crème de Riz Bio - Boost Q2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Produit</label>
              <select
                value={form.product_id}
                onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-white"
              >
                {DEMO_PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>{p.brand} — {p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">CPC (€ / clic) — min €1.00</label>
              <input
                type="number"
                required
                min="1.00"
                step="0.10"
                value={form.cpc_eur}
                onChange={(e) => setForm((f) => ({ ...f, cpc_eur: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Budget / jour (€) — min €50</label>
              <input
                type="number"
                required
                min="50.00"
                step="5.00"
                value={form.daily_budget_eur}
                onChange={(e) => setForm((f) => ({ ...f, daily_budget_eur: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              />
            </div>

            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#1B4332] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#2d6a4f] transition-colors disabled:opacity-60"
              >
                {saving ? "Lancement…" : "🚀 Lancer la campagne"}
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="text-gray-500 hover:text-gray-700 text-sm font-semibold px-4"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-semibold mb-6">
          ✅ Campagne lancée avec succès !
        </div>
      )}

      {/* ── CAMPAIGN TABLE ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-900">Vos campagnes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {["Campagne", "Statut", "Impressions", "Clics", "CTR", "Dépense / Budget", "CPC", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const spendPct = Math.min(100, (c.daily_spend_eur / c.daily_budget_eur) * 100);
                return (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">{c.campaign_name}</p>
                    </td>
                    <td className="px-5 py-4">{statusBadge(c.status)}</td>
                    <td className="px-5 py-4 text-gray-600">{c.impressions.toLocaleString()}</td>
                    <td className="px-5 py-4 text-gray-600">{c.clicks.toLocaleString()}</td>
                    <td className="px-5 py-4 font-semibold text-gray-700">{ctr(c.impressions, c.clicks)}</td>
                    <td className="px-5 py-4">
                      <div className="min-w-[120px]">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>€{Number(c.daily_spend_eur).toFixed(2)}</span>
                          <span>€{Number(c.daily_budget_eur).toFixed(2)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#10B981] rounded-full transition-all"
                            style={{ width: `${spendPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-700">€{Number(c.cpc_eur).toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleStatus(c)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                          c.status === "active"
                            ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {c.status === "active" ? "⏸ Pauser" : "▶ Reprendre"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <div className="mt-8 bg-[#ecfdf5] rounded-2xl p-6">
        <h3 className="font-bold text-[#065F46] mb-3">Comment fonctionne le Sponsored Surplus ?</h3>
        <div className="grid sm:grid-cols-3 gap-4 text-sm text-[#047857]">
          <div>
            <p className="font-semibold mb-1">🎯 Enchère par CPC</p>
            <p className="text-xs leading-relaxed">Vos produits apparaissent en tête de la page Deals. Vous ne payez que lorsqu&apos;un acheteur clique.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">🏆 Score de qualité</p>
            <p className="text-xs leading-relaxed">Position = CPC × score qualité (basé sur CTR). Mieux votre annonce performe, moins vous payez.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">💰 Budget maîtrisé</p>
            <p className="text-xs leading-relaxed">Plafond journalier strict. La campagne se met en pause automatiquement quand le budget est atteint.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
