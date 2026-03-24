"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import Header from "@/components/supplier/Header";
import { computeAISupplierPrice, type AIPricingResult } from "@/lib/ai-insights";

type Step = 1 | 2 | 3 | 4;

interface FormData {
  brand: string;
  name: string;
  category: string;
  size: string;
  ean: string;
  description: string;
  stock_units: string;
  retail_price: string;
  expiry_date: string;
  warehouse: string;
  moq: string;
  use_ai_price: boolean;
  override_price: string;
  image_url: string;
}

const EMPTY: FormData = {
  brand: "Nestlé", name: "", category: "alimentation", size: "", ean: "",
  description: "", stock_units: "", retail_price: "", expiry_date: "",
  warehouse: "Paris CDG", moq: "1", use_ai_price: true, override_price: "", image_url: "",
};

const CATEGORIES = ["alimentation", "hygiene", "entretien", "boissons", "baby"];
const WAREHOUSES  = ["Paris CDG", "Lyon Part-Dieu", "Marseille", "Bruxelles", "Amsterdam"];

export default function NewProduct() {
  const { t } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [pricing, setPricing] = useState<AIPricingResult | null>(null);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof FormData, val: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Local preview immediately
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setImageUploading(true);
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `products/new-${Date.now()}.${ext}`;
      const { error } = await sb.storage.from("product-images").upload(path, file, { upsert: true });
      if (!error) {
        const { data: { publicUrl } } = sb.storage.from("product-images").getPublicUrl(path);
        set("image_url", publicUrl);
      }
    } catch { /* keep local preview, image_url stays empty */ }
    setImageUploading(false);
  };

  // Recompute AI price whenever relevant fields change
  useEffect(() => {
    if (form.retail_price && form.expiry_date && form.stock_units) {
      const result = computeAISupplierPrice(
        parseFloat(form.retail_price),
        form.expiry_date,
        parseInt(form.stock_units, 10)
      );
      setPricing(result);
    }
  }, [form.retail_price, form.expiry_date, form.stock_units]);

  const generateDescription = useCallback(async () => {
    if (!form.name || !form.brand) return;
    setGeneratingDesc(true);
    try {
      const res = await fetch("/api/ai/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: form.brand, name: form.name, category: form.category, size: form.size }),
      });
      if (res.ok) {
        const { description } = await res.json();
        set("description", description);
      } else {
        // Fallback
        set("description", `${form.brand} ${form.name} — Lot surplus certifié. ${form.size ? `Conditionnement: ${form.size}.` : ""} Produit authentique issu d'un excédent de production. Qualité garantie, économisez jusqu'à 60% sur le prix de vente conseillé.`);
      }
    } catch {
      set("description", `${form.brand} ${form.name} — Lot surplus certifié. Qualité garantie, économisez jusqu'à 60% sur le prix de vente conseillé.`);
    }
    setGeneratingDesc(false);
  }, [form.brand, form.name, form.category, form.size]);

  const handleSubmit = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200)); // simulate API
    setSaving(false);
    setSuccess(true);
    setTimeout(() => router.push("/supplier/products"), 2000);
  };

  const canAdvance = () => {
    if (step === 1) return form.brand && form.name && form.category && form.size;
    if (step === 2) return form.retail_price && form.expiry_date && form.stock_units;
    if (step === 3) return true;
    return true;
  };

  const steps = [
    t("newProduct.steps.details"),
    t("newProduct.steps.pricing"),
    t("newProduct.steps.logistics"),
    t("newProduct.steps.review"),
  ];

  return (
    <div>
      <Header
        title={t("newProduct.title")}
        action={
          <a href="/supplier/products" className="text-sm text-gray-500 hover:text-gray-700">
            ← {t("common.back")}
          </a>
        }
      />

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((label, i) => {
          const s = (i + 1) as Step;
          const done = step > s;
          const active = step === s;
          return (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                active  ? "bg-[#1B4332] text-white" :
                done    ? "bg-[#D1FAE5] text-[#065F46]" :
                          "bg-gray-100 text-gray-400"
              }`}>
                <span>{done ? "✓" : s}</span>
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px w-6 ${done ? "bg-[#10B981]" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="max-w-2xl">
        {/* ── Step 1: Details ──────────────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("newProduct.fields.brand")} *</label>
                <input value={form.brand} onChange={(e) => set("brand", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  placeholder="Nestlé" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("newProduct.fields.category")} *</label>
                <select value={form.category} onChange={(e) => set("category", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-white">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("newProduct.fields.name")} *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                placeholder="Nescafé Gold Blend 200g" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("newProduct.fields.size")} *</label>
                <input value={form.size} onChange={(e) => set("size", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  placeholder="200g × 6" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("newProduct.fields.ean")}</label>
                <input value={form.ean} onChange={(e) => set("ean", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  placeholder="3800059908943" />
              </div>
            </div>
            {/* Image upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Photo produit
                <span className="text-xs text-gray-400 font-normal ml-2">JPG/PNG · 500×500px recommandé</span>
              </label>
              <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreview} alt="preview" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-2xl">📷</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageFile}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                    className="w-full border border-dashed border-gray-300 rounded-xl py-2.5 text-sm text-gray-500 hover:border-[#10B981] hover:text-[#10B981] transition-colors disabled:opacity-50"
                  >
                    {imageUploading ? "⏳ Upload en cours…" : "Choisir une photo"}
                  </button>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Sans photo → Fulflo utilise automatiquement la photo fabricant via Open Food Facts
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600">{t("newProduct.fields.description")}</label>
                <button
                  type="button"
                  onClick={generateDescription}
                  disabled={generatingDesc || !form.name}
                  className="text-xs font-bold text-[#10B981] hover:underline disabled:text-gray-300 flex items-center gap-1"
                >
                  {generatingDesc ? "⏳ " : "🤖 "}{t("newProduct.fields.generateDescription")}
                </button>
              </div>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] resize-none"
                placeholder={t("ai.descriptionPlaceholder")}
              />
            </div>
          </div>
        )}

        {/* ── Step 2: AI Pricing ───────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("newProduct.fields.retailPrice")} *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</span>
                    <input type="number" step="0.01" min="0" value={form.retail_price} onChange={(e) => set("retail_price", e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                      placeholder="8.90" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("newProduct.fields.stockUnits")} *</label>
                  <input type="number" min="1" value={form.stock_units} onChange={(e) => set("stock_units", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    placeholder="500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("newProduct.fields.expiryDate")} *</label>
                <input type="date" value={form.expiry_date} onChange={(e) => set("expiry_date", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  min={new Date().toISOString().split("T")[0]} />
              </div>
            </div>

            {/* AI pricing widget */}
            {pricing && (
              <div className="bg-[#ecfdf5] border border-[#10B981]/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🤖</span>
                  <h3 className="font-bold text-[#1B4332]">{t("newProduct.pricing.title")}</h3>
                  <span className="ml-auto text-xs font-bold bg-[#D1FAE5] text-[#065F46] px-2 py-0.5 rounded-full">
                    {pricing.confidence}% {t("newProduct.pricing.confidence")}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-[#1B4332]">€{pricing.suggested_price.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t("newProduct.pricing.suggestedPrice")}</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-amber-600">-{pricing.discount_pct}%</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t("newProduct.pricing.discount")}</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-[#1B4332]">{pricing.clearance_days}j</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t("newProduct.pricing.clearanceDays")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { set("use_ai_price", true); set("override_price", ""); }}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                      form.use_ai_price ? "bg-[#1B4332] text-white" : "bg-white text-gray-600 border border-gray-200"
                    }`}
                  >
                    ✓ {t("newProduct.pricing.accept")}
                  </button>
                  <button
                    onClick={() => set("use_ai_price", false)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                      !form.use_ai_price ? "bg-[#1B4332] text-white" : "bg-white text-gray-600 border border-gray-200"
                    }`}
                  >
                    ✏️ {t("newProduct.pricing.override")}
                  </button>
                </div>
                {!form.use_ai_price && (
                  <div className="mt-3 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</span>
                    <input
                      type="number" step="0.01" min="0"
                      value={form.override_price}
                      onChange={(e) => set("override_price", e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-white"
                      placeholder={`Prix personnalisé (IA recommande €${pricing.suggested_price.toFixed(2)})`}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Logistics ────────────────────────────────────────── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("newProduct.fields.warehouseLocation")}</label>
                <select value={form.warehouse} onChange={(e) => set("warehouse", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-white">
                  {WAREHOUSES.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("newProduct.fields.moq")}</label>
                <input type="number" min="1" value={form.moq} onChange={(e) => set("moq", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  placeholder="1" />
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">🚚 Fulfilment par Fulflo</p>
              <p className="text-xs leading-relaxed">Fulflo prend en charge la logistique. Le produit sera collecté dans votre entrepôt sous 48–72h après publication. Aucun frais de stockage.</p>
            </div>
          </div>
        )}

        {/* ── Step 4: Review ───────────────────────────────────────────── */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Récapitulatif du lot</h3>
            <dl className="space-y-3">
              {[
                ["Produit",      `${form.brand} — ${form.name}`],
                ["Catégorie",    form.category],
                ["Taille",       form.size || "—"],
                ["EAN",          form.ean || "—"],
                ["Stock",        `${form.stock_units} unités`],
                ["Prix catalogue", `€${parseFloat(form.retail_price || "0").toFixed(2)}`],
                ["Prix Fulflo",  form.use_ai_price && pricing ? `€${pricing.suggested_price.toFixed(2)} (IA)` : `€${form.override_price}`],
                ["Expiration",   form.expiry_date],
                ["Entrepôt",     form.warehouse],
                ["Commande min", form.moq],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</dt>
                  <dd className="text-sm font-semibold text-gray-800">{value}</dd>
                </div>
              ))}
            </dl>
            {form.description && (
              <div className="mt-4 bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-gray-700">{form.description}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Navigation ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-6">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="bg-white border border-gray-200 text-gray-600 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              ← {t("common.back")}
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={!canAdvance()}
              className="bg-[#1B4332] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#2d6a4f] transition-colors disabled:opacity-40"
            >
              {t("common.next")} →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving || success}
              className={`font-bold px-6 py-2.5 rounded-xl text-sm transition-colors ${
                success
                  ? "bg-[#D1FAE5] text-[#065F46] cursor-default"
                  : "bg-[#10B981] text-[#1B4332] hover:bg-[#D1FAE5]"
              }`}
            >
              {success ? "✅ " + t("newProduct.success") : saving ? t("newProduct.saving") : t("newProduct.submit")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
