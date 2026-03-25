"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import Header from "@/components/supplier/Header";
import { computeAISupplierPrice, type AIPricingResult } from "@/lib/ai-insights";

const DEMO_PRODUCTS: Record<string, {
  brand: string; name: string; category: string; size: string; ean: string;
  description: string; stock_units: number; retail_price: number;
  expiry_date: string; warehouse: string; moq: number; current_price: number;
}> = {
  "1": { brand: "Favrichon", name: "Crème de Riz Bio",       category: "alimentation", size: "400g",     ean: "3760001234561", description: "Lot surplus certifié. Crème de riz bio, sans gluten.", stock_units: 183, retail_price: 5.90,  expiry_date: new Date(Date.now() + 110 * 86400000).toISOString().split("T")[0], warehouse: "Paris CDG",    moq: 1,  current_price: 2.49 },
  "2": { brand: "Favrichon", name: "Galettes Riz Chocolat", category: "alimentation", size: "×10",      ean: "",              description: "Galettes de riz enrobées chocolat au lait, lot de 10.", stock_units: 44,  retail_price: 6.90,  expiry_date: new Date(Date.now() + 6   * 86400000).toISOString().split("T")[0], warehouse: "Lyon Part-Dieu", moq: 6,  current_price: 3.29 },
  "3": { brand: "Favrichon", name: "Muesli Croustillant Bio", category: "alimentation", size: "1kg",    ean: "",              description: "Muesli croustillant biologique, riche en fibres.", stock_units: 320, retail_price: 8.50,  expiry_date: new Date(Date.now() + 35  * 86400000).toISOString().split("T")[0], warehouse: "Paris CDG",    moq: 1,  current_price: 3.99 },
  "4": { brand: "Favrichon", name: "Granola Fruits Rouges",  category: "alimentation", size: "400g",    ean: "",              description: "Granola bio aux fruits rouges, sans sucres ajoutés.", stock_units: 12,  retail_price: 6.50,  expiry_date: new Date(Date.now() + 12  * 86400000).toISOString().split("T")[0], warehouse: "Bruxelles",    moq: 1,  current_price: 2.99 },
  "5": { brand: "Favrichon", name: "Flocons Avoine Bio",     category: "alimentation", size: "750g",    ean: "",              description: "Flocons d'avoine biologiques, idéaux pour le petit-déjeuner.", stock_units: 560, retail_price: 4.20, expiry_date: new Date(Date.now() + 55  * 86400000).toISOString().split("T")[0], warehouse: "Marseille",    moq: 12, current_price: 1.89 },
};

export default function EditProduct() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState({
    brand: "", name: "", category: "", size: "", ean: "",
    description: "", stock_units: "", retail_price: "",
    expiry_date: "", warehouse: "", moq: "", override_price: "",
  });
  const [pricing, setPricing] = useState<AIPricingResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const p = DEMO_PRODUCTS[id];
    if (!p) { setNotFound(true); return; }
    setForm({
      brand: p.brand, name: p.name, category: p.category, size: p.size, ean: p.ean,
      description: p.description, stock_units: String(p.stock_units),
      retail_price: String(p.retail_price), expiry_date: p.expiry_date,
      warehouse: p.warehouse, moq: String(p.moq), override_price: String(p.current_price),
    });
    setPricing(computeAISupplierPrice(p.retail_price, p.expiry_date, p.stock_units));
  }, [id]);

  useEffect(() => {
    if (form.retail_price && form.expiry_date && form.stock_units) {
      setPricing(computeAISupplierPrice(
        parseFloat(form.retail_price),
        form.expiry_date,
        parseInt(form.stock_units, 10)
      ));
    }
  }, [form.retail_price, form.expiry_date, form.stock_units]);

  const set = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setSaved(true);
    setTimeout(() => router.push("/supplier/products"), 1500);
  };

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-4xl mb-4">📦</p>
        <p className="text-lg font-bold text-gray-800 mb-2">Produit introuvable</p>
        <a href="/supplier/products" className="text-[#10B981] hover:underline text-sm">← Retour aux produits</a>
      </div>
    );
  }

  return (
    <div>
      <Header
        title={`Modifier — ${form.name || "…"}`}
        subtitle={form.brand}
        action={
          <a href="/supplier/products" className="text-sm text-gray-500 hover:text-gray-700">
            ← {t("common.back")}
          </a>
        }
      />

      <div className="max-w-2xl space-y-5">
        {/* Product info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider text-gray-400 mb-3">Informations produit</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Marque</label>
              <input value={form.brand} onChange={(e) => set("brand", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Catégorie</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-white">
                {["alimentation","hygiene","entretien","boissons","baby"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nom du produit</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Conditionnement</label>
              <input value={form.size} onChange={(e) => set("size", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">EAN</label>
              <input value={form.ean} onChange={(e) => set("ean", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              rows={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] resize-none" />
          </div>
        </div>

        {/* Pricing & stock */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-3">Stock & Prix</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Stock (unités)</label>
              <input type="number" value={form.stock_units} onChange={(e) => set("stock_units", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Prix conseillé (€)</label>
              <input type="number" step="0.01" value={form.retail_price} onChange={(e) => set("retail_price", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Expiration</label>
              <input type="date" value={form.expiry_date} onChange={(e) => set("expiry_date", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]" />
            </div>
          </div>

          {/* Live AI price preview */}
          {pricing && (
            <div className="bg-[#ecfdf5] border border-[#10B981]/20 rounded-xl p-4 flex items-center gap-4 flex-wrap">
              <span className="text-sm">🤖</span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-[#065F46]">Prix IA recommandé: <strong>€{pricing.suggested_price.toFixed(2)}</strong> (-{pricing.discount_pct}%)</p>
                <p className="text-xs text-gray-500">Liquidation estimée en {pricing.clearance_days} jours · Confiance {pricing.confidence}%</p>
              </div>
              <button
                onClick={() => set("override_price", String(pricing.suggested_price))}
                className="text-xs font-bold text-[#1B4332] bg-[#D1FAE5] px-3 py-1.5 rounded-lg hover:bg-[#10B981]/20 transition-colors"
              >
                Appliquer
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Prix Fulflo actuel (€)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</span>
              <input type="number" step="0.01" value={form.override_price} onChange={(e) => set("override_price", e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`font-bold px-6 py-2.5 rounded-xl text-sm transition-colors ${
              saved ? "bg-[#D1FAE5] text-[#065F46]" : "bg-[#1B4332] text-white hover:bg-[#2d6a4f]"
            } disabled:opacity-60`}
          >
            {saved ? "✅ Enregistré" : saving ? t("common.loading") : t("common.save")}
          </button>
          <a href="/supplier/products" className="text-sm text-gray-500 hover:text-gray-700">
            {t("common.cancel")}
          </a>
        </div>
      </div>
    </div>
  );
}
