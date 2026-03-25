"use client";

import { useState, useEffect } from "react";
import SupplierShell from "@/components/supplier/SupplierShell";
import { Share2, TrendingUp, Users, Zap, Plus, Pause, Play, ChevronRight } from "lucide-react";

interface RippleCampaign {
  id: string;
  campaign_name: string;
  status: "active" | "paused" | "ended" | "budget_exhausted";
  sharer_voucher_eur: number;
  friend_voucher_eur: number;
  cost_per_conversion: number;
  total_budget_eur: number;
  total_spent_eur: number;
  total_shares: number;
  total_conversions: number;
  created_at: string;
}

const DEMO: RippleCampaign[] = [
  {
    id: "demo-1",
    campaign_name: "Crème de Riz Bio — Programme Ambassadeur",
    status: "active",
    sharer_voucher_eur: 3,
    friend_voucher_eur: 2,
    cost_per_conversion: 1.5,
    total_budget_eur: 500,
    total_spent_eur: 18,
    total_shares: 47,
    total_conversions: 12,
    created_at: new Date().toISOString(),
  },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:           "bg-emerald-100 text-emerald-800",
    paused:           "bg-yellow-100 text-yellow-800",
    ended:            "bg-gray-100 text-gray-600",
    budget_exhausted: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    active: "Actif", paused: "Pausé", ended: "Terminé", budget_exhausted: "Budget épuisé",
  };
  return (
    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status === "active" && <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse" />}
      {labels[status] ?? status}
    </span>
  );
}

export default function RipplePage() {
  const [campaigns, setCampaigns] = useState<RippleCampaign[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm] = useState({
    campaignName: "",
    totalBudget: "500",
    sharerVoucher: "3",
    friendVoucher: "2",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/ripple/campaigns?supplierId=maison-favrichon")
      .then((r) => r.json())
      .then((data) => {
        setCampaigns(Array.isArray(data) && data.length ? data : DEMO);
      })
      .catch(() => setCampaigns(DEMO))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.campaignName) return;
    setSubmitting(true);
    const res = await fetch("/api/ripple/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplierId: "maison-favrichon",
        campaignName: form.campaignName,
        totalBudget: form.totalBudget,
        sharerVoucher: form.sharerVoucher,
        friendVoucher: form.friendVoucher,
      }),
    });
    const data = await res.json();
    if (!data.error) {
      setCampaigns((prev) => [data, ...prev]);
      setShowForm(false);
      setForm({ campaignName: "", totalBudget: "500", sharerVoucher: "3", friendVoucher: "2" });
    }
    setSubmitting(false);
  };

  const estConversions = Math.floor(Number(form.totalBudget) / 6.5);

  return (
    <SupplierShell>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Share2 size={22} className="text-[#10B981]" />
              <h1 className="text-2xl font-black text-gray-900">FulFlo Ripple</h1>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
                Produit AdTech 5 · Social Commerce
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Vos clients deviennent vos ambassadeurs. Vous payez uniquement les conversions.
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 bg-[#1B4332] text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-[#2d6a4f] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus size={15} />
            Nouvelle campagne
          </button>
        </div>

        {/* ── Pricing card ──────────────────────────────────────────────── */}
        <div className="bg-[#1B4332] rounded-2xl p-5">
          <p className="text-[#10B981] text-xs font-bold uppercase tracking-widest mb-4">
            Structure tarifaire Ripple
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Activation", value: "€199", sub: "par campagne" },
              { label: "Coût/conversion", value: "€1.50", sub: "pay-per-conversion" },
              { label: "Voucher partageur", value: "€3.00", sub: "payé par vous" },
              { label: "Voucher ami", value: "€2.00", sub: "payé par vous" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-2xl font-black text-white">{item.value}</p>
                <p className="text-[10px] text-[#10B981] font-semibold">{item.label}</p>
                <p className="text-[10px] text-white/50">{item.sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
            <TrendingUp size={14} className="text-[#10B981]" />
            <p className="text-sm text-white/80">
              <span className="font-bold text-[#10B981]">Coût d&apos;acquisition Ripple : ~€6.50</span>
              {" "}vs €15–40 canal classique — soit 4× moins cher
            </p>
          </div>
        </div>

        {/* ── Create campaign form ───────────────────────────────────────── */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-gray-900 font-bold text-sm">Créer une campagne Ripple</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide block mb-1">
                  Nom de la campagne
                </label>
                <input
                  value={form.campaignName}
                  onChange={(e) => setForm((f) => ({ ...f, campaignName: e.target.value }))}
                  placeholder="ex: Crème de Riz Bio — Ambassadeurs Printemps"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#10B981]"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide block mb-1">
                  Budget total (€)
                </label>
                <input
                  type="number"
                  value={form.totalBudget}
                  onChange={(e) => setForm((f) => ({ ...f, totalBudget: e.target.value }))}
                  min="199"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#10B981]"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide block mb-1">
                  Conversions estimées
                </label>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-emerald-700 font-bold text-sm">
                  ~{estConversions} conversions
                </div>
              </div>
              <div>
                <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide block mb-1">
                  Voucher partageur (€)
                </label>
                <input
                  type="number"
                  value={form.sharerVoucher}
                  onChange={(e) => setForm((f) => ({ ...f, sharerVoucher: e.target.value }))}
                  min="1" max="10" step="0.5"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#10B981]"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide block mb-1">
                  Voucher ami (€)
                </label>
                <input
                  type="number"
                  value={form.friendVoucher}
                  onChange={(e) => setForm((f) => ({ ...f, friendVoucher: e.target.value }))}
                  min="1" max="10" step="0.5"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#10B981]"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCreate}
                disabled={submitting || !form.campaignName}
                className="flex items-center gap-2 bg-[#1B4332] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#2d6a4f] transition-colors disabled:opacity-50"
              >
                <Zap size={14} />
                {submitting ? "Activation…" : "Activer pour €199 d'activation"}
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* ── Active campaigns ───────────────────────────────────────────── */}
        <div>
          <h2 className="text-gray-900 font-bold text-sm uppercase tracking-wide mb-3">
            Campagnes actives
          </h2>
          {loading ? (
            <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ) : (
            <div className="space-y-4">
              {campaigns.map((c) => {
                const pct      = (Number(c.total_spent_eur) / Number(c.total_budget_eur)) * 100;
                const convRate = c.total_shares > 0 ? ((c.total_conversions / c.total_shares) * 100).toFixed(1) : "0.0";
                const cpa      = c.total_conversions > 0
                  ? (Number(c.total_spent_eur) / c.total_conversions).toFixed(2)
                  : "—";
                const roi      = Number(c.total_spent_eur) > 0
                  ? ((c.total_conversions * 12) / Number(c.total_spent_eur)).toFixed(1)
                  : "—";

                return (
                  <div key={c.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-gray-900 font-bold text-base">{c.campaign_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={c.status} />
                          <span className="text-gray-500 text-xs">
                            Vouchers: €{Number(c.sharer_voucher_eur).toFixed(0)} partageur · €{Number(c.friend_voucher_eur).toFixed(0)} ami
                          </span>
                        </div>
                      </div>
                      <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-xs transition-colors border border-gray-200 rounded-lg px-2.5 py-1.5">
                        {c.status === "active" ? <Pause size={12} /> : <Play size={12} />}
                        {c.status === "active" ? "Pauser" : "Relancer"}
                      </button>
                    </div>

                    {/* Budget progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>Budget consommé</span>
                        <span>€{Number(c.total_spent_eur).toFixed(2)} / €{Number(c.total_budget_eur).toFixed(0)}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#10B981] rounded-full transition-all"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {[
                        { label: "Partages",    value: c.total_shares },
                        { label: "Conversions", value: c.total_conversions },
                        { label: "Taux conv.",  value: `${convRate}%` },
                        { label: "Dépensé",     value: `€${Number(c.total_spent_eur).toFixed(2)}` },
                      ].map((stat) => (
                        <div key={stat.label} className="text-center bg-gray-50 rounded-xl py-3">
                          <p className="text-gray-900 font-black text-lg">{stat.value}</p>
                          <p className="text-gray-500 text-[10px] uppercase tracking-wide mt-0.5">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                      <span>
                        CPA : <span className="text-gray-900 font-semibold">€{cpa}</span>
                      </span>
                      <span>·</span>
                      <span>
                        ROI estimé : <span className="text-[#10B981] font-semibold">{roi}×</span>
                        {" "}pour chaque €1 investi
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Gamification ──────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-[#10B981]" />
            <h3 className="text-gray-900 font-bold text-sm">Classement Ambassadeurs</h3>
          </div>
          <div className="space-y-3">
            {[
              { tier: "🥉 Bronze", range: "1–5 conversions",  reward: "Vouchers standards (€3 + €2)" },
              { tier: "🥈 Silver", range: "6–15 conversions", reward: "Vouchers +€1 bonus" },
              { tier: "🥇 Gold",   range: "16+ conversions",  reward: "Early access flash sales + vouchers +€2 bonus" },
            ].map((tier) => (
              <div key={tier.tier} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl">
                <span className="text-2xl shrink-0">{tier.tier.split(" ")[0]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-semibold text-sm">{tier.tier.split(" ").slice(1).join(" ")}</p>
                  <p className="text-gray-500 text-xs">{tier.range}</p>
                </div>
                <p className="text-gray-600 text-xs text-right shrink-0 max-w-[180px]">{tier.reward}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </SupplierShell>
  );
}
