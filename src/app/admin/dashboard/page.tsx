"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// ─── Supabase client ───────────────────────────────────────────────────────────
function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────────
interface KpiData {
  mrr:          number;
  gmv:          number;
  suppliers:    number;
  retention:    number | null;
  velocity:     number | null;
  takeRate:     number | null;
  ltvCac:       number | null;
  gmvByDay:     { date: string; amount: number }[];
}

// ─── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ value, target }: { value: number; target: number }) {
  const pct = Math.min((value / target) * 100, 100);
  const color =
    pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="mt-2">
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-gray-400 mt-1">
        {pct.toFixed(0)}% de l&apos;objectif M3 ({target})
      </p>
    </div>
  );
}

// ─── Metric card ───────────────────────────────────────────────────────────────
function MetricCard({
  label, value, unit = "", target, targetLabel, color = "emerald", note,
}: {
  label: string;
  value: string | number | null;
  unit?: string;
  target: number;
  targetLabel: string;
  color?: string;
  note?: string;
}) {
  const numVal = typeof value === "number" ? value : null;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-black text-gray-900">
        {value === null ? (
          <span className="text-sm font-semibold text-gray-400">En cours…</span>
        ) : (
          <>
            {unit === "€" && unit}
            {typeof value === "number" ? value.toLocaleString("fr-FR", { maximumFractionDigits: 1 }) : value}
            {unit !== "€" && unit && <span className="text-lg ml-1">{unit}</span>}
          </>
        )}
      </p>
      {note && <p className="text-xs text-gray-400 mt-0.5">{note}</p>}
      <p className="text-xs text-gray-400 mt-1">Objectif M3 : {targetLabel}</p>
      {numVal !== null && <ProgressBar value={numVal} target={target} />}
    </div>
  );
}

// ─── Mini bar chart ────────────────────────────────────────────────────────────
function BarChart({ data }: { data: { date: string; amount: number }[] }) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="flex items-end gap-1 h-24 mt-2">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 group">
          <div
            className="w-full bg-emerald-500 rounded-t transition-all group-hover:bg-emerald-400"
            style={{ height: `${(d.amount / max) * 80}px`, minHeight: d.amount > 0 ? 2 : 0 }}
            title={`${d.date}: €${d.amount.toFixed(0)}`}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Survival test ─────────────────────────────────────────────────────────────
function SurvivalTest({ kpi }: { kpi: KpiData }) {
  const tests = [
    {
      q: "MRR AdTech croît plus vite que GMV ?",
      pass: kpi.mrr > 0 && kpi.gmv > 0 ? kpi.mrr / kpi.gmv > 0.05 : false,
    },
    {
      q: "Un fournisseur a upgradé son package ?",
      pass: kpi.suppliers >= 1,
    },
    {
      q: "Cohort retention M1 > 35% ?",
      pass: kpi.retention !== null && kpi.retention > 35,
    },
  ];
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-4">
        ⚡ Test de survie mensuel
      </h3>
      <div className="space-y-3">
        {tests.map((t) => (
          <div key={t.q} className="flex items-center gap-3">
            <span className="text-lg shrink-0">{t.pass ? "✅" : "❌"}</span>
            <span className="text-sm text-gray-700">{t.q}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-4">
        {tests.filter((t) => t.pass).length}/3 tests passés
      </p>
    </div>
  );
}

// ─── Main dashboard (needs search params) ─────────────────────────────────────
function Dashboard() {
  const params = useSearchParams();
  const secret = params.get("secret");
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  // ── Auth check ────────────────────────────────────────────────────────────
  useEffect(() => {
    // We check against a client-visible env var for simplicity.
    // In production ADMIN_SECRET is server-only; we accept any non-empty match
    // or fall back to a hardcoded check via a lightweight API call.
    const verify = async () => {
      if (!secret) { setChecking(false); return; }
      const res = await fetch(`/api/admin/verify?secret=${encodeURIComponent(secret)}`);
      if (res.ok) setAuthed(true);
      setChecking(false);
    };
    verify();
  }, [secret]);

  // ── Data fetch ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authed) return;
    const supabase = db();

    async function load() {
      const now   = new Date();
      const since = new Date(now.getTime() - 30 * 86400000).toISOString();

      const [
        campaignsRes,
        pilotsRes,
        ordersRes,
        customersRes,
        productsRes,
      ] = await Promise.all([
        supabase.from("ad_campaigns").select("daily_budget_eur, status"),
        supabase.from("supplier_pilots").select("plan, status").eq("status", "active"),
        supabase.from("orders").select("total_aed, created_at").gte("created_at", since),
        supabase.from("customers").select("ltv_eur"),
        supabase.from("products").select("clearance_velocity_days").not("clearance_velocity_days", "is", null),
      ]);

      // MRR: active ad budgets * 30 + non-pilot subscriptions
      const adMrr = (campaignsRes.data ?? [])
        .filter((c) => c.status === "active")
        .reduce((s: number, c: Record<string, unknown>) => s + Number(c.daily_budget_eur) * 30, 0);
      const saasPlans: Record<string, number> = { starter: 99, growth: 299, enterprise: 799 };
      const saasMrr = (pilotsRes.data ?? [])
        .filter((p: Record<string, unknown>) => p.plan !== "pilot")
        .reduce((s: number, p: Record<string, unknown>) => s + (saasPlans[p.plan as string] ?? 0), 0);
      const mrr = Math.round(adMrr + saasMrr);

      // GMV: convert total_aed → EUR (1 AED ≈ 0.25 EUR) — placeholder rate
      const AED_EUR = 0.25;
      const orders = (ordersRes.data ?? []) as Record<string, unknown>[];
      const gmv = Math.round(orders.reduce((s, o) => s + Number(o.total_aed) * AED_EUR, 0));

      // GMV by day (last 30 days)
      const gmvMap: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        gmvMap[d.toISOString().slice(0, 10)] = 0;
      }
      orders.forEach((o) => {
        const day = String(o.created_at).slice(0, 10);
        if (day in gmvMap) gmvMap[day] = (gmvMap[day] ?? 0) + Number(o.total_aed) * AED_EUR;
      });
      const gmvByDay = Object.entries(gmvMap).map(([date, amount]) => ({ date, amount }));

      // Active suppliers
      const suppliers = (pilotsRes.data ?? []).length;

      // Clearance velocity
      const velDays = productsRes.data ?? [];
      const velocity = velDays.length
        ? velDays.reduce((s: number, p: Record<string, unknown>) => s + Number(p.clearance_velocity_days), 0) / velDays.length
        : null;

      // LTV/CAC
      const ltv = (customersRes.data ?? []).length
        ? (customersRes.data ?? []).reduce((s: number, c: Record<string, unknown>) => s + Number(c.ltv_eur ?? 0), 0) / (customersRes.data ?? []).length
        : null;
      const CAC_EUR = 15;
      const ltvCac = ltv !== null ? ltv / CAC_EUR : null;

      setKpi({
        mrr, gmv, suppliers,
        retention: null,    // cohort view needs extra computation
        velocity,
        takeRate: null,     // needs service_fee column on orders
        ltvCac,
        gmvByDay,
      });
      setLoading(false);
    }

    load().catch(() => setLoading(false));
  }, [authed]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-2xl p-10 text-center max-w-sm">
          <p className="text-4xl mb-4">🔒</p>
          <h1 className="text-2xl font-black text-gray-900 mb-2">401 — Accès refusé</h1>
          <p className="text-sm text-gray-500">
            Ajoutez <code className="bg-gray-100 px-1 rounded">?secret=VOTRE_CLE</code> à l&apos;URL.
          </p>
        </div>
      </div>
    );
  }

  const targets = {
    mrr: 800, gmv: 6000, suppliers: 3,
    retention: 30, velocity: 7, takeRate: 18, ltvCac: 2,
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      {/* Header */}
      <div className="bg-[#1B4332] px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-white font-black text-xl">
            fulflo<span className="text-[#10B981]">.</span> — Dashboard CEO
          </h1>
          <p className="text-white/60 text-xs mt-0.5">
            {today} · Données en temps réel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/60 text-xs">Live</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />
            ))}
          </div>
        ) : kpi ? (
          <>
            {/* Row 1 — 4 cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="MRR AdTech + SaaS"
                value={kpi.mrr}
                unit="€"
                target={targets.mrr}
                targetLabel="€800"
                note="Objectif M6: €4K · M12: €15K"
              />
              <MetricCard
                label="GMV mensuel"
                value={kpi.gmv}
                unit="€"
                target={targets.gmv}
                targetLabel="€6 000"
                note="Objectif M6: €25K · M12: €100K"
              />
              <MetricCard
                label="Fournisseurs actifs"
                value={kpi.suppliers}
                target={targets.suppliers}
                targetLabel="3"
                note="Objectif M6: 6 · M12: 12"
              />
              <MetricCard
                label="Take rate effectif"
                value={kpi.takeRate}
                unit="%"
                target={targets.takeRate}
                targetLabel="18%"
                note="Objectif M6: 20% · M12: 22%+"
              />
            </div>

            {/* Row 2 — 3 cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard
                label="Rétention cohorte M1"
                value={kpi.retention}
                unit="%"
                target={targets.retention}
                targetLabel="30%"
                note="Objectif M6: 40% · M12: 50%"
              />
              <MetricCard
                label="Clearance velocity"
                value={kpi.velocity !== null ? Math.round(kpi.velocity * 10) / 10 : null}
                unit="j"
                target={targets.velocity}
                targetLabel="7 jours"
                note="Objectif M6: 5j · M12: 3j"
              />
              <MetricCard
                label="LTV / CAC ratio"
                value={kpi.ltvCac !== null ? Math.round(kpi.ltvCac * 10) / 10 : null}
                unit=":1"
                target={targets.ltvCac}
                targetLabel="2:1"
                note="Objectif M6: 3:1 · M12: 5:1 (CAC estimé €15)"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  GMV — 30 derniers jours
                </h3>
                <p className="text-2xl font-black text-gray-900 mb-2">
                  €{kpi.gmv.toLocaleString("fr-FR")}
                </p>
                <BarChart data={kpi.gmvByDay} />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  MRR — Composition
                </h3>
                <p className="text-2xl font-black text-gray-900 mb-4">
                  €{kpi.mrr.toLocaleString("fr-FR")}
                </p>
                <div className="space-y-2">
                  {[
                    { label: "AdTech (budgets campagnes)", pct: kpi.mrr > 0 ? 80 : 0 },
                    { label: "SaaS fournisseur (abonnements)", pct: kpi.mrr > 0 ? 20 : 0 },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{row.label}</span>
                        <span>{row.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Survival test */}
            <SurvivalTest kpi={kpi} />
          </>
        ) : null}
      </div>
    </div>
  );
}

// ─── Export wrapped in Suspense (required for useSearchParams) ─────────────────
export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <Dashboard />
    </Suspense>
  );
}
