"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import Header from "@/components/supplier/Header";
import KPICard from "@/components/supplier/KPICard";
import AIInsightCard from "@/components/supplier/AIInsightCard";
import ClearanceChart from "@/components/supplier/ClearanceChart";
import { generateInsights, type AIInsight } from "@/lib/ai-insights";

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_PRODUCTS = [
  { id: "1", brand: "Nestlé", name: "Nescafé Gold Blend", stock_units: 183, expiry_date: new Date(Date.now() + 110 * 86400000).toISOString(), current_price: 3.99, original_price: 8.90, ai_pricing_enabled: false, flash_sale_end_time: null },
  { id: "2", brand: "Nestlé", name: "KitKat Chunky Box", stock_units: 44,  expiry_date: new Date(Date.now() + 6  * 86400000).toISOString(), current_price: 5.49, original_price: 11.90, ai_pricing_enabled: true,  flash_sale_end_time: null },
  { id: "3", brand: "Nestlé", name: "Maggi Bouillon ×72", stock_units: 320, expiry_date: new Date(Date.now() + 35  * 86400000).toISOString(), current_price: 1.59, original_price: 3.80,  ai_pricing_enabled: false, flash_sale_end_time: null },
  { id: "4", brand: "Nestlé", name: "Nespresso Blend 12", stock_units: 12,  expiry_date: new Date(Date.now() + 12  * 86400000).toISOString(), current_price: 7.20, original_price: 14.50, ai_pricing_enabled: true,  flash_sale_end_time: null },
  { id: "5", brand: "Nestlé", name: "Milo Activ-Go 400g", stock_units: 560, expiry_date: new Date(Date.now() + 55  * 86400000).toISOString(), current_price: 4.10, original_price: 8.20,  ai_pricing_enabled: false, flash_sale_end_time: null },
];

const ACTIVITY = [
  { event: "Prix IA appliqué",      product: "KitKat Chunky Box",  change: "-5%",   date: "il y a 2h",    type: "price" },
  { event: "Flash Sale terminée",   product: "Nescafé Gold Blend", change: "+44 ventes", date: "hier",    type: "sale" },
  { event: "Stock bas détecté",     product: "Nespresso Blend 12", change: "12 unités",  date: "hier",    type: "alert" },
  { event: "Nouveau lot ajouté",    product: "Milo Activ-Go 400g", change: "+560u",  date: "il y a 3j", type: "new" },
  { event: "Remise manuelle",       product: "Maggi Bouillon ×72", change: "-10%",   date: "il y a 4j", type: "price" },
];

const eventIconMap: Record<string, string> = {
  price: "💰", sale: "⚡", alert: "🔴", new: "✅",
};

export default function SupplierDashboard() {
  const { t } = useI18n();
  const [insights, setInsights] = useState<AIInsight[]>([]);

  useEffect(() => {
    setInsights(generateInsights(DEMO_PRODUCTS));
  }, []);

  const session = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("supplier_session") ?? "{}")
    : {};
  const demoSupplier = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("fulflo_demo_supplier") ?? "null")
    : null;
  const isDemo = !!demoSupplier?.isDemo;
  const companyName = demoSupplier?.company_name ?? session.company ?? "Nestlé Suisse SA";
  const firstName = companyName.split(" ")[0];

  return (
    <div>
      <Header
        title={`${t("dashboard.welcome")}, ${firstName} 👋${isDemo ? " (Demo)" : ""}`}
        subtitle={t("dashboard.subtitle")}
        action={
          <a
            href="/supplier/products/new"
            className="bg-[#10B981] text-[#1B4332] font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#D1FAE5] transition-colors"
          >
            + {t("products.add")}
          </a>
        }
      />

      {/* ── KPI row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          title={t("dashboard.kpi.totalProducts")}
          value="5"
          subtext="2 expirent dans 14j"
          trend={0}
          icon="📦"
          accent="green"
        />
        <KPICard
          title={t("dashboard.kpi.totalRevenue")}
          value="€4 820"
          subtext="Ce mois"
          trend={12}
          icon="💶"
          accent="blue"
        />
        <KPICard
          title={t("dashboard.kpi.avgDiscount")}
          value="52%"
          subtext="Remise moyenne catalogue"
          trend={-3}
          icon="🏷️"
          accent="amber"
        />
        <KPICard
          title={t("dashboard.kpi.stockValue")}
          value="€18 240"
          subtext="Valeur catalogue restante"
          icon="🏭"
          accent="green"
        />
      </div>

      {/* ── Main grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart — 2 cols */}
        <div className="lg:col-span-2">
          <ClearanceChart />
        </div>

        {/* AI Insights — 1 col */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-900 text-sm">{t("dashboard.insights.title")}</h3>
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              {insights.filter(i => i.severity === "critical").length} critique{insights.filter(i => i.severity === "critical").length > 1 ? "s" : ""}
            </span>
          </div>
          {insights.length === 0 ? (
            <div className="bg-[#ecfdf5] rounded-2xl p-4 text-center">
              <p className="text-2xl mb-2">✅</p>
              <p className="text-sm font-semibold text-[#065F46]">Tout est optimal</p>
              <p className="text-xs text-gray-500 mt-1">L&apos;IA surveille vos produits en continu</p>
            </div>
          ) : (
            insights.map((ins) => (
              <AIInsightCard key={ins.id} insight={ins} />
            ))
          )}
        </div>
      </div>

      {/* ── Activity table ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{t("dashboard.activity.title")}</h3>
          <a href="/supplier/products" className="text-xs text-[#10B981] font-semibold hover:underline">
            Voir tous les produits →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {[t("dashboard.activity.event"), t("dashboard.activity.product"), t("dashboard.activity.change"), t("dashboard.activity.date")].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACTIVITY.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-2">
                      <span>{eventIconMap[row.type]}</span>
                      <span className="font-medium text-gray-800">{row.event}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{row.product}</td>
                  <td className="px-5 py-3.5">
                    <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {row.change}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
