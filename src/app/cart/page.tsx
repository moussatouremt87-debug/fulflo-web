"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { ChevronLeft, Minus, Plus, Trash2, Lock, ChevronRight, Tag } from "lucide-react";

type Delivery = "standard" | "express" | "pickup";

const DELIVERY_OPTIONS: { key: Delivery; label: string; sub: string; price: number; emoji: string }[] = [
  { key: "standard", label: "Standard", sub: "24h · Gratuit",    price: 0,    emoji: "🚚" },
  { key: "express",  label: "Express",  sub: "3h · €3,99",       price: 3.99, emoji: "⚡" },
  { key: "pickup",   label: "Retrait",  sub: "Gratuit · En magasin", price: 0, emoji: "🏪" },
];

export default function CartPage() {
  const { t } = useI18n();
  const { items, removeItem, updateQuantity, subtotal, serviceFee, shipping, total, totalSavings, clearCart } = useCart();

  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [delivery, setDelivery] = useState<Delivery>("standard");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const deliveryFee = DELIVERY_OPTIONS.find((d) => d.key === delivery)?.price ?? 0;
  const finalDelivery = delivery === "standard" ? shipping : deliveryFee;
  const finalTotal = subtotal + serviceFee + finalDelivery;

  const ecoKg = Math.round(subtotal * 0.4);

  const handleCheckout = async () => {
    if (!items.length) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ product_id: i.productId, name: i.name, brand: i.brand, quantity: i.quantity, unit_price_eur: i.price, image_url: i.image })),
          customer_email: email || undefined,
          service_fee_eur: serviceFee,
          shipping_eur: finalDelivery,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Error creating session.");
        setLoading(false);
      }
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : "Server error") + " Réessayez.");
      setLoading(false);
    }
  };

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (!items.length) {
    return (
      <div className="min-h-screen bg-green-50">
        <div className="max-w-sm mx-auto bg-white min-h-screen flex flex-col">
          <div className="bg-green-800 px-4 py-3 flex items-center gap-3">
            <Link href="/" className="w-8 h-8 bg-white/10 rounded-[6px] flex items-center justify-center">
              <ChevronLeft size={18} className="text-white" />
            </Link>
            <span className="text-white font-display font-semibold text-sm">Mon Panier</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
            <div className="w-20 h-20 bg-green-50 rounded-[20px] flex items-center justify-center text-4xl">🛒</div>
            <p className="font-display font-bold text-ink-900 text-xl text-center">{t("cart.empty.title")}</p>
            <p className="text-ink-400 text-sm text-center">{t("cart.empty.sub")}</p>
            <Link href="/deals" className="bg-green-800 text-white font-bold px-8 py-3 rounded-full text-sm">
              {t("cart.empty.cta")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      <div className="max-w-sm mx-auto bg-white min-h-screen pb-32">

        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="bg-green-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
          <Link href="/" className="w-8 h-8 bg-white/10 rounded-[6px] flex items-center justify-center">
            <ChevronLeft size={18} className="text-white" />
          </Link>
          <span className="text-white font-display font-semibold text-sm flex-1">Mon Panier</span>
          <span className="text-white/50 text-xs">
            {items.reduce((s, i) => s + i.quantity, 0)} {items.reduce((s, i) => s + i.quantity, 0) > 1 ? t("cart.articles") : t("cart.article")}
          </span>
        </div>

        {/* ── DELIVERY PICKER ───────────────────────────────────────────── */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[11px] font-bold text-ink-400 uppercase tracking-widest mb-3">Mode de livraison</p>
          <div className="flex gap-2">
            {DELIVERY_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setDelivery(opt.key)}
                className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-[14px] border-2 transition-all text-center ${
                  delivery === opt.key
                    ? "bg-green-50 border-green-500"
                    : "bg-white border-ink-100"
                }`}
              >
                <span className="text-xl">{opt.emoji}</span>
                <p className={`text-[11px] font-bold leading-tight ${delivery === opt.key ? "text-green-700" : "text-ink-700"}`}>
                  {opt.label}
                </p>
                <p className={`text-[10px] ${delivery === opt.key ? "text-green-500" : "text-ink-300"}`}>{opt.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── CART ITEMS ────────────────────────────────────────────────── */}
        <div className="px-4 pt-4 space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="bg-white border border-ink-100 rounded-[20px] p-4 flex items-center gap-3 shadow-xs">
              {/* Image */}
              <div className="w-[68px] h-[68px] bg-green-50 rounded-[14px] flex items-center justify-center text-3xl shrink-0">
                {item.category === "hygiene" ? "🧴" : item.category === "alimentation" ? "🍝" : item.category === "entretien" ? "🧹" : "📦"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-ink-400 uppercase tracking-widest">{item.brand}</p>
                <p className="text-sm font-semibold text-ink-900 leading-tight line-clamp-2 mt-0.5">{item.name}</p>
                {item.originalPrice > item.price && (
                  <p className="text-green-500 text-[11px] font-bold mt-0.5">
                    Économisez €{((item.originalPrice - item.price) * item.quantity).toFixed(2)}
                  </p>
                )}

                <div className="flex items-center justify-between mt-2">
                  {/* Price */}
                  <div>
                    <p className="font-black text-ink-900 text-base">€{(item.price * item.quantity).toFixed(2)}</p>
                    {item.originalPrice > item.price && (
                      <p className="text-ink-300 text-[10px] line-through">€{(item.originalPrice * item.quantity).toFixed(2)}</p>
                    )}
                  </div>

                  {/* Qty stepper */}
                  <div className="flex items-center gap-2 bg-green-50 rounded-[10px] px-2 py-1.5">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="text-ink-500">
                      <Minus size={13} />
                    </button>
                    <span className="font-black text-ink-900 text-sm tabular-nums w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="text-ink-500">
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeItem(item.productId)}
                aria-label={t("cart.remove")}
                className="text-ink-200 hover:text-discount-red transition-colors self-start"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        {/* ── PROMO CODE ────────────────────────────────────────────────── */}
        <div className="px-4 pt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
              <input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Code promo"
                className="w-full bg-ink-100 rounded-[12px] pl-9 pr-3 py-3 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-green-400 uppercase"
              />
            </div>
            <button
              onClick={() => setPromoApplied(!!promoCode)}
              className="bg-ink-900 text-white font-bold text-sm px-5 rounded-[12px] whitespace-nowrap"
            >
              Appliquer
            </button>
          </div>
          {promoApplied && (
            <p className="text-green-500 text-xs font-semibold mt-2">✓ Code {promoCode} appliqué</p>
          )}
        </div>

        {/* ── ORDER SUMMARY ─────────────────────────────────────────────── */}
        <div className="px-4 pt-4">
          <div className="bg-white border border-ink-100 rounded-[20px] p-5 shadow-xs">
            <h2 className="font-display font-bold text-ink-900 text-sm mb-4">Récapitulatif</h2>

            {/* Email input */}
            <div className="mb-4">
              <label className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1.5 block">
                {t("cart.email-label")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("cart.email-ph")}
                className="w-full bg-ink-100 border-0 rounded-[12px] px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-ink-500">
                <span>{t("cart.subtotal")}</span>
                <span className="font-semibold text-ink-700">€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink-500">
                <span>{t("cart.service-fee")}</span>
                <span className="font-semibold text-ink-700">€{serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink-500">
                <span>Livraison</span>
                <span className={`font-semibold ${finalDelivery === 0 ? "text-green-500" : "text-ink-700"}`}>
                  {finalDelivery === 0 ? "Gratuit 🎉" : `€${finalDelivery.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && delivery === "standard" && (
                <p className="text-[11px] text-ink-300">{t("cart.shipping-threshold")}</p>
              )}

              {/* Total */}
              <div className="border-t border-ink-100 pt-3 flex justify-between items-baseline">
                <span className="font-display font-black text-ink-900 text-base">Total</span>
                <span className="font-display font-black text-ink-900" style={{ fontSize: 20 }}>
                  €{finalTotal.toFixed(2)}
                </span>
              </div>

              {/* Savings */}
              {totalSavings > 0 && (
                <div className="bg-green-50 rounded-[12px] px-4 py-2.5 flex justify-between items-center">
                  <span className="text-green-700 text-xs font-semibold">{t("cart.savings-label")}</span>
                  <span className="text-green-500 font-black text-sm">-€{totalSavings.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── ECO BADGE ─────────────────────────────────────────────────── */}
        <div className="px-4 pt-4">
          <div className="bg-green-50 border border-green-100 rounded-[14px] px-4 py-3 flex items-center gap-3">
            <span className="text-2xl shrink-0">♻️</span>
            <p className="text-green-700 text-xs font-semibold leading-snug">
              Votre achat évite <strong>{ecoKg} kg</strong> de destruction de produits neufs
            </p>
          </div>
        </div>

        {/* ── CHECKOUT BUTTON (sticky) ───────────────────────────────────── */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 pb-6 pt-3 bg-white border-t border-ink-100 z-40">
          {error && <p className="text-discount-red text-xs font-semibold mb-2 text-center">{error}</p>}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-green-800 text-white font-display font-black py-4 rounded-[20px] flex items-center justify-between px-6 disabled:opacity-60 transition-all"
            style={{ boxShadow: "0 8px 28px rgba(15,45,30,.25)" }}
          >
            <Lock size={16} />
            <span className="text-base">
              {loading ? t("cart.checkout-loading") : `Passer commande · €${finalTotal.toFixed(2)}`}
            </span>
            <ChevronRight size={18} />
          </button>
          <p className="text-center text-[10px] text-ink-300 mt-2.5 flex items-center justify-center gap-1">
            <Lock size={9} /> {t("cart.secure")}
          </p>
        </div>

      </div>
    </div>
  );
}
