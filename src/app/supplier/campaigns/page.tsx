"use client";

import { useState, useEffect } from "react";
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
    campaign_name: "Nescafé Gold - Boost Q1",
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
    campaign_name: "Maggi Bouillon Flash",
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
  { id: "1", name: "Nescafé Gold Blend", brand: "Nestlé" },
  { id: "2", name: "KitKat Chunky Box", brand: "Nestlé" },
  { id: "3", name: "Maggi Bouillon ×72", brand: "Nestlé" },
  { id: "4", name: "Nespresso Blend 12", brand: "Nestlé" },
  { id: "5", name: "Milo Activ-Go 400g", brand: "Nestlé" },
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

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEMO_CAMPAIGNS);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [form, setForm] = useState({
    campaign_name: "",
    product_id: DEMO_PRODUCTS[0].id,
    cpc_eur: "1.00",
    daily_budget_eur: "50.00",
  });

  const supplierId = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("fulflo_demo_supplier") ?? "{}").id ?? "demo-nestle"
    : "demo-nestle";

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
  const totalSpend      = campaigns.reduce((s, c) => s + Number(c.total_spend_eur), 0);
  const totalClicks     = campaigns.reduce((s, c) => s + Number(c.clicks), 0);
  const totalImpressions = campaigns.reduce((s, c) => s + Number(c.impressions), 0);
  const avgCtr          = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0.0";

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
                placeholder="Ex: Nescafé Gold - Boost Q2"
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
