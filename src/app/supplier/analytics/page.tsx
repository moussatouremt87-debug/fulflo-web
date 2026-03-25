"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Period = "7j" | "30j" | "90j";

interface Campaign {
  id: string;
  campaign_name: string;
  status: string;
  impressions: number;
  clicks: number;
  daily_spend_eur: number;
  total_spend_eur: number;
  cpc_eur: number;
}

// ─── Demo data ─────────────────────────────────────────────────────────────────

function generateVelocityData(days: number) {
  const data = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const label = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    const base = 22 + Math.round(Math.sin(i * 0.4) * 6);
    data.push({
      day: label,
      brand: base + Math.round(Math.random() * 4),
      category: Math.round(base * 0.83 + Math.random() * 3),
    });
  }
  return data;
}

const AGE_DATA = [
  { name: "25–34", value: 31, color: "#10B981" },
  { name: "35–44", value: 28, color: "#1B4332" },
  { name: "45–54", value: 22, color: "#34D399" },
  { name: "18–24", value: 12, color: "#6EE7B7" },
  { name: "55+",   value:  7, color: "#A7F3D0" },
];

const GEO_DATA = [
  { region: "Île-de-France", pct: 34 },
  { region: "Rhône-Alpes",   pct: 18 },
  { region: "PACA",          pct: 12 },
  { region: "Bretagne",      pct:  9 },
  { region: "Autres",        pct: 27 },
];

const PRODUCT_ROWS = [
  { name: "Crème de Riz Bio 400g",       units: 183, revenue: 456.17, discount: 58, days: 12, score: 94 },
  { name: "Muesli Croustillant Bio 1kg", units: 320, revenue: 508.80, discount: 53, days: 18, score: 88 },
  { name: "Galettes Riz Chocolat ×10",  units:  44, revenue: 144.76, discount: 52, days:  6, score: 82 },
  { name: "Granola Fruits Rouges 400g", units:  12, revenue:  35.88, discount: 54, days:  4, score: 71 },
];

const SCORE_METRICS = [
  { label: "Vitesse de clearance", value: 92, color: "#10B981" },
  { label: "Taux de conversion",   value: 78, color: "#1B4332" },
  { label: "Satisfaction client",  value: 89, color: "#34D399" },
  { label: "Compétitivité prix",   value: 74, color: "#6EE7B7" },
];

const fmt = (n: number, opts?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat("fr-FR", opts).format(n);

// ─── Sub-components ────────────────────────────────────────────────────────────

function ScoreDial({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#D1FAE5" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={r}
          fill="none"
          stroke="#10B981"
          strokeWidth="12"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-[#1B4332]">{score}</span>
        <span className="text-xs text-gray-400 font-semibold">/100</span>
      </div>
    </div>
  );
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="font-bold" style={{ color }}>{value}/100</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, highlight }: {
  label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${highlight ? "bg-[#ecfdf5] border-[#10B981]/30" : "bg-white border-gray-100 shadow-sm"}`}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-2xl font-black ${highlight ? "text-[#1B4332]" : "text-gray-900"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Attribution data ──────────────────────────────────────────────────────────

const ATTRIBUTION_DATA = {
  breakdown: [
    { channel: "Sponsored", revenue: 284, orders: 31, color: "#10B981" },
    { channel: "Organic",   revenue: 512, orders: 58, color: "#1B4332" },
    { channel: "Referral",  revenue: 97,  orders: 11, color: "#34D399" },
  ],
  funnel: [
    { stage: "Impressions", value: 12840, pct: 100 },
    { stage: "Clics",       value: 1026,  pct: 8.0  },
    { stage: "Ajout panier",value: 308,   pct: 2.4  },
    { stage: "Achats",      value: 100,   pct: 0.78 },
  ],
};

type AnalyticsTab = "performance" | "attribution";

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTab>("performance");
  const [period, setPeriod] = useState<Period>("30j");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [velData, setVelData] = useState(() => generateVelocityData(30));
  const [freshSecs, setFreshSecs] = useState(4 * 60);          // "4 minutes ago"
  const [nextSecs, setNextSecs]   = useState(56 * 60);

  // Tick the freshness clock
  useEffect(() => {
    const id = setInterval(() => {
      setFreshSecs((s) => s + 1);
      setNextSecs((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Regenerate velocity data when period changes
  useEffect(() => {
    const days = period === "7j" ? 7 : period === "90j" ? 90 : 30;
    setVelData(generateVelocityData(days));
  }, [period]);

  // TODO: replace with real Supabase query (filter by auth user's supplier_id)
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || key === "placeholder") return;

    import("@supabase/supabase-js").then(({ createClient }) => {
      const sb = createClient(url, key);
      Promise.resolve(
        sb.from("ad_campaigns")
          .select("id, campaign_name, status, impressions, clicks, daily_spend_eur, total_spend_eur, cpc_eur")
          .eq("supplier_id", "maison-favrichon")
          .order("created_at", { ascending: false })
      ).then(({ data }) => {
        if (data?.length) setCampaigns(data as Campaign[]);
      }).catch(() => {});
    });
  }, []);

  // Aggregate ROI stats from real campaigns (or demo)
  const adStats = campaigns.length > 0
    ? {
        impressions: campaigns.reduce((s, c) => s + Number(c.impressions), 0),
        clicks:      campaigns.reduce((s, c) => s + Number(c.clicks), 0),
        spend:       campaigns.reduce((s, c) => s + Number(c.total_spend_eur), 0),
      }
    : { impressions: 323, clicks: 30, spend: 45 };

  const adCtr     = adStats.impressions ? ((adStats.clicks / adStats.impressions) * 100).toFixed(1) : "0.0";
  const adRevenue = 284;  // TODO: sum(orders.amount) WHERE order came from ad click
  const adRoi     = adStats.spend > 0 ? Math.round((adRevenue / adStats.spend) * 100) : 0;

  function freshLabel() {
    const m = Math.floor(freshSecs / 60);
    return m < 1 ? "il y a quelques secondes" : `il y a ${m} minute${m > 1 ? "s" : ""}`;
  }
  function nextLabel() {
    const m = Math.ceil(nextSecs / 60);
    return `dans ${m} minute${m > 1 ? "s" : ""}`;
  }

  return (
    <div className="space-y-8 pb-12">

      {/* ── TABS ──────────────────────────────────────────────────────── */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1 w-fit">
        {([
          { key: "performance", label: "Performance Marque" },
          { key: "attribution", label: "Attribution Campagne" },
        ] as { key: AnalyticsTab; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setAnalyticsTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              analyticsTab === t.key
                ? "bg-white text-[#1B4332] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {analyticsTab === "attribution" ? (
        <div className="space-y-6">
          {/* Attribution breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Ventes par canal</h2>
            <p className="text-xs text-gray-400 mb-6">Sponsored · Organic · Referral</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {ATTRIBUTION_DATA.breakdown.map((ch) => {
                const total = ATTRIBUTION_DATA.breakdown.reduce((s, c) => s + c.revenue, 0);
                const pct = Math.round((ch.revenue / total) * 100);
                return (
                  <div key={ch.channel} className="rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: ch.color }} />
                      <span className="text-sm font-bold text-gray-700">{ch.channel}</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900 mb-0.5">€{ch.revenue}</p>
                    <p className="text-xs text-gray-400">{ch.orders} commandes · {pct}% du CA</p>
                    <div className="h-2 bg-gray-100 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: ch.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-[#ecfdf5] rounded-xl p-4 text-sm text-[#065F46]">
              <span className="font-bold">Insight :</span> le Sponsored Surplus génère{" "}
              <span className="font-black">31% du CA</span> avec seulement{" "}
              <span className="font-black">18% du budget</span> — votre meilleur levier de croissance incrémentale.
            </div>
          </div>

          {/* Conversion funnel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Funnel de conversion</h2>
            <p className="text-xs text-gray-400 mb-6">De l&apos;impression à l&apos;achat</p>
            <div className="space-y-3">
              {ATTRIBUTION_DATA.funnel.map((stage, i) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#1B4332] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm font-semibold text-gray-700">{stage.stage}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400">{stage.pct}%</span>
                      <span className="text-sm font-black text-gray-900 w-16 text-right">
                        {stage.value.toLocaleString("fr-FR")}
                      </span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden ml-9">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${stage.pct}%`,
                        background: `linear-gradient(90deg, #1B4332, #10B981)`,
                      }}
                    />
                  </div>
                  {i < ATTRIBUTION_DATA.funnel.length - 1 && (
                    <div className="ml-9 mt-1.5 text-[10px] text-gray-300 font-semibold">
                      ↓ taux{" "}
                      {(
                        (ATTRIBUTION_DATA.funnel[i + 1].value / stage.value) *
                        100
                      ).toFixed(1)}
                      % passent à l&apos;étape suivante
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm">
              <p className="font-bold text-amber-800 mb-1">💡 Opportunité identifiée</p>
              <p className="text-amber-700 text-xs leading-relaxed">
                Le taux clics→panier est de <span className="font-bold">30%</span> — dans la moyenne catégorie.
                Augmenter la remise de 5pts pourrait porter ce taux à <span className="font-bold">42%</span>{" "}
                et générer +€180/mois de CA incrémental.
              </p>
            </div>
          </div>
        </div>
      ) : (
      <>

      {/* ── 1. HEADER ROW ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Performance Marque</h1>
            <span className="bg-[#1B4332] text-[#10B981] text-xs font-bold px-2.5 py-1 rounded-full">
              Supplier Pro · Données temps réel
            </span>
          </div>
          <p className="text-sm text-gray-500">Maison Favrichon · Analytics avancées</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Period selector */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
            {(["7j", "30j", "90j"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  period === p ? "bg-white text-[#1B4332] shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          {/* Export buttons */}
          <button
            onClick={() => alert("Export PDF en cours de développement")}
            className="flex items-center gap-1.5 border border-gray-200 bg-white text-gray-700 text-sm font-semibold px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            📄 Exporter PDF
          </button>
          <button
            onClick={() => alert("Export CSV en cours de développement")}
            className="flex items-center gap-1.5 border border-gray-200 bg-white text-gray-700 text-sm font-semibold px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            📊 Exporter CSV
          </button>
        </div>
      </div>

      {/* ── 2. PERFORMANCE SCORE ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
          {/* Dial */}
          <div className="text-center shrink-0">
            <ScoreDial score={84} />
            <p className="text-sm font-bold text-gray-700 mt-3">Score FulFlo</p>
            <p className="text-xs text-[#10B981] font-semibold mt-1 bg-[#ecfdf5] px-3 py-1 rounded-full inline-block">
              vs Hygiène: +12 pts 🏆
            </p>
          </div>

          {/* Sub-metrics */}
          <div className="flex-1 w-full space-y-4">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Composantes du score</p>
            {SCORE_METRICS.map((m) => (
              <MetricBar key={m.label} label={m.label} value={m.value} color={m.color} />
            ))}
          </div>

          {/* Benchmark */}
          <div className="lg:w-56 bg-[#ecfdf5] rounded-2xl p-5 text-center shrink-0">
            <p className="text-xs text-[#047857] font-semibold uppercase tracking-wider mb-3">Benchmark catégorie</p>
            <p className="text-4xl font-black text-[#1B4332]">+12</p>
            <p className="text-sm text-[#065F46] font-semibold">points au-dessus</p>
            <p className="text-xs text-[#047857] mt-1">de la moyenne Hygiène</p>
            <div className="mt-4 border-t border-[#10B981]/20 pt-4 space-y-1 text-xs text-[#047857]">
              <p>Top 15% des fournisseurs</p>
              <p className="font-bold text-[#1B4332]">🏆 Statut: Excellence</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. CONSUMER INSIGHTS ──────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Insights Consommateurs
          <span className="ml-2 text-xs font-semibold text-[#10B981] bg-[#ecfdf5] px-2 py-0.5 rounded-full">
            Premium
          </span>
        </h2>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Acheteurs uniques ce mois" value={fmt(1247)} sub="↑ +8% vs mois préc." highlight />
          <KpiCard label="Panier moyen avec vos produits" value="€18,40" sub="vs €14,20 catégorie" highlight />
          <KpiCard label="Taux de réachat (30j)" value="34%" sub="Fidélité élevée" />
          <KpiCard label="Délai moyen avant rachat" value="18 jours" sub="Cycle consommation" />
        </div>

        {/* New vs Returning buyers — AdTech metric */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="font-bold text-gray-900">Acheteurs nouveaux vs récurrents</h3>
              <p className="text-xs text-gray-400 mt-0.5">Portée incrémentale de vos campagnes FulFlo</p>
            </div>
            <span className="text-xs font-bold bg-[#ecfdf5] text-[#065F46] px-3 py-1.5 rounded-full w-fit">
              62% nouveaux clients FulFlo
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch gap-4">
            {/* Visual bar */}
            <div className="flex-1">
              <div className="flex h-10 rounded-xl overflow-hidden mb-3">
                <div className="bg-[#10B981] flex items-center justify-center text-white text-xs font-black" style={{ width: "62%" }}>
                  62% Nouveaux
                </div>
                <div className="bg-[#D1FAE5] flex items-center justify-center text-[#065F46] text-xs font-bold" style={{ width: "38%" }}>
                  38% Récurrents
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#ecfdf5] p-4">
                  <p className="text-2xl font-black text-[#1B4332]">773</p>
                  <p className="text-xs text-[#047857] font-semibold mt-0.5">Nouveaux acheteurs</p>
                  <p className="text-[10px] text-[#6B7280] mt-1">Première commande ever sur FulFlo</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-2xl font-black text-gray-700">474</p>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">Acheteurs récurrents</p>
                  <p className="text-[10px] text-gray-400 mt-1">Ont déjà commandé sur FulFlo</p>
                </div>
              </div>
            </div>
            {/* Insight box */}
            <div className="sm:w-64 bg-[#1B4332] rounded-xl p-5 flex flex-col justify-center">
              <p className="text-[#10B981] text-xs font-bold uppercase tracking-wider mb-2">Portée incrémentale</p>
              <p className="text-white text-2xl font-black mb-1">62%</p>
              <p className="text-white/70 text-xs leading-relaxed mb-3">
                de vos acheteurs FulFlo ne vous auraient <span className="text-white font-bold">jamais achetés</span> en grande distribution ce mois-ci.
              </p>
              <div className="border-t border-white/10 pt-3">
                <p className="text-[#10B981] text-xs font-bold">vs retail media standard : 23%</p>
                <p className="text-white/50 text-[10px] mt-0.5">Source : Nielsen Retail Media 2025</p>
              </div>
            </div>
          </div>
        </div>

        {/* Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Age donut */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-sm font-bold text-gray-700 mb-4">Répartition par âge</p>
            <div className="flex items-center gap-4">
              <div className="h-52 w-52 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={AGE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {AGE_DATA.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex-1">
                {AGE_DATA.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-gray-600">{d.name}</span>
                    </span>
                    <span className="font-bold text-gray-900">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Geography */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-sm font-bold text-gray-700 mb-4">Top régions</p>
            <div className="space-y-3">
              {GEO_DATA.map((g) => (
                <div key={g.region}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{g.region}</span>
                    <span className="font-bold text-gray-900">{g.pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#10B981] rounded-full"
                      style={{ width: `${g.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. CLEARANCE VELOCITY ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Vitesse d&apos;écoulement vs Catégorie</h2>
            <p className="text-xs text-gray-400 mt-0.5">Unités vendues / jour — {period} glissants</p>
          </div>
          <div className="bg-[#ecfdf5] text-[#065F46] text-xs font-bold px-3 py-1.5 rounded-full">
            +15–20% vs catégorie
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={velData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                interval={Math.floor(velData.length / 6)}
              />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", fontSize: 12 }}
                formatter={(v, name) => [
                  `${v} unités/j`,
                  name === "brand" ? "Vos produits" : "Moy. Hygiène",
                ]}
              />
              <Legend
                formatter={(v) => v === "brand" ? "Vos produits" : "Moy. catégorie Hygiène"}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="brand"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="category"
                stroke="#9CA3AF"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 5. SPONSORED SURPLUS ROI ──────────────────────────────────── */}
      <div className={`rounded-2xl border p-6 ${adRoi > 400 ? "bg-[#ecfdf5] border-[#10B981]/30" : "bg-white border-gray-100 shadow-sm"}`}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Sponsored Surplus — ROI</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {campaigns.length > 0 ? `${campaigns.length} campagne${campaigns.length > 1 ? "s" : ""} active${campaigns.length > 1 ? "s" : ""}` : "Données agrégées"}
            </p>
          </div>
          {adRoi > 400 && (
            <span className="bg-[#10B981] text-white text-sm font-black px-4 py-1.5 rounded-full">
              ROI {fmt(adRoi)}% 🚀
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
          {[
            { label: "Impressions", value: fmt(adStats.impressions) },
            { label: "Clics",       value: fmt(adStats.clicks) },
            { label: "CTR",         value: `${adCtr}%` },
            { label: "Dépense",     value: `€${adStats.spend.toFixed(2)}` },
            { label: "Revenus générés", value: `€${fmt(adRevenue)}` },
            { label: "ROI",         value: `${fmt(adRoi)}%` },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className={`text-xl font-black ${s.label === "ROI" && adRoi > 400 ? "text-[#1B4332]" : "text-gray-900"}`}>
                {s.value}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <a
          href="/supplier/campaigns"
          className="inline-flex items-center gap-2 bg-[#1B4332] text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#2d6a4f] transition-colors"
        >
          Augmenter le budget →
        </a>
      </div>

      {/* ── 6. PRODUCT PERFORMANCE TABLE ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Performance Produits</h2>
          <span className="text-xs text-gray-400">Trié par score desc</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {["Produit", "Unités vendues", "Revenus", "Remise moy.", "Jours pour écouler", "Score"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRODUCT_ROWS.map((p) => (
                <tr key={p.name} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-800">{p.name}</td>
                  <td className="px-6 py-4 text-gray-600">{fmt(p.units)}</td>
                  <td className="px-6 py-4 text-gray-600">€{fmt(p.revenue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4">
                    <span className="bg-[#ecfdf5] text-[#065F46] text-xs font-bold px-2 py-0.5 rounded-full">
                      -{p.discount}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{p.days}j</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${p.score}%`,
                            background: p.score >= 90 ? "#10B981" : p.score >= 75 ? "#F59E0B" : "#EF4444",
                          }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${p.score >= 90 ? "text-[#10B981]" : p.score >= 75 ? "text-amber-500" : "text-red-500"}`}>
                        {p.score}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 7. COMPETITIVE INTELLIGENCE (locked) ──────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Intelligence Concurrentielle</h2>
            <p className="text-xs text-gray-400 mt-0.5">Vos concurrents dans la catégorie Hygiène</p>
          </div>
          <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">
            🔒 Plan Analytics
          </span>
        </div>

        {/* Blurred competitor rows */}
        <div className="relative">
          <div className="blur-sm pointer-events-none select-none">
            {[
              { brand: "Concurrent A", score: 76, clearance: "18j", units: 892 },
              { brand: "Concurrent B", score: 71, clearance: "24j", units: 640 },
              { brand: "Concurrent C", score: 68, clearance: "31j", units: 410 },
            ].map((c, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                    {c.brand[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{c.brand}</p>
                    <p className="text-xs text-gray-400">Hygiène · Actif sur FulFlo</p>
                  </div>
                </div>
                <div className="flex items-center gap-8 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-gray-800">{c.score}</p>
                    <p className="text-xs text-gray-400">Score</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-800">{c.clearance}</p>
                    <p className="text-xs text-gray-400">Clearance</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-800">{fmt(c.units)}</p>
                    <p className="text-xs text-gray-400">Unités/mois</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overlay CTA */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px]">
            <div className="text-center px-6">
              <p className="text-3xl mb-3">🔒</p>
              <p className="font-bold text-gray-900 text-lg mb-1">Débloquez l&apos;Intelligence Concurrentielle</p>
              <p className="text-sm text-gray-500 mb-5 max-w-sm">
                Voyez exactement comment vos concurrents performent, leurs prix, et leurs stratégies d&apos;écoulement.
              </p>
              <a
                href="mailto:karim@fulflo.app?subject=Plan Analytics €499"
                className="inline-flex items-center gap-2 bg-[#1B4332] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#2d6a4f] transition-colors text-sm"
              >
                Débloquer avec Plan Analytics €499/mois →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── 8. DATA FRESHNESS FOOTER ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>
            Données mises à jour <span className="font-semibold">{freshLabel()}</span>
            {" · "}Prochaine mise à jour <span className="font-semibold">{nextLabel()}</span>
          </span>
        </div>
        <p className="text-xs text-gray-400">
          🔒 Vos données sont protégées et ne sont jamais partagées avec vos concurrents
        </p>
      </div>

      </>
      )}

    </div>
  );
}
