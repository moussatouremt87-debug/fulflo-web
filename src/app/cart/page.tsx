"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { Minus, Plus, Trash2, ShoppingBag, ChevronRight, Lock } from "lucide-react";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    serviceFee,
    shipping,
    total,
    totalSavings,
    clearCart,
  } = useCart();

  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleCheckout = async () => {
    if (!items.length) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id:    i.productId,
            name:          i.name,
            brand:         i.brand,
            quantity:      i.quantity,
            unit_price_eur: i.price,
            image_url:     i.image,
          })),
          customer_email:   email || undefined,
          service_fee_eur:  serviceFee,
          shipping_eur:     shipping,
          cart_items:       items,
        }),
      });
      const data = await res.json();
      if (data.url) {
        clearCart();
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Erreur lors de la création de la session.");
        setLoading(false);
      }
    } catch {
      setError("Impossible de contacter le serveur. Réessayez.");
      setLoading(false);
    }
  };

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!items.length) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <nav className="bg-[#1B4332] h-14 flex items-center px-6 sticky top-0 z-50">
          <Link href="/" className="text-xl font-black text-white tracking-tight">
            fulflo<span className="text-[#10B981]">.</span>
          </Link>
        </nav>
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-5 px-4">
          <ShoppingBag size={56} className="text-gray-200" />
          <h2 className="text-2xl font-black text-gray-700">Votre panier est vide</h2>
          <p className="text-gray-400 text-sm">Ajoutez des produits depuis le catalogue.</p>
          <Link
            href="/deals"
            className="bg-[#1B4332] text-white font-bold px-8 py-3 rounded hover:bg-[#2d6a4f] transition-colors"
          >
            Voir les offres surplus →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Nav */}
      <nav className="bg-[#1B4332] h-14 flex items-center gap-3 px-6 sticky top-0 z-50">
        <Link href="/" className="text-xl font-black text-white tracking-tight shrink-0">
          fulflo<span className="text-[#10B981]">.</span>
        </Link>
        <span className="text-white/30">/</span>
        <span className="text-white/70 text-sm">Mon panier</span>
        <Link
          href="/deals"
          className="ml-auto text-white/60 hover:text-white text-sm transition-colors"
        >
          ← Continuer les achats
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-black text-gray-900 mb-6">
          Mon panier{" "}
          <span className="text-gray-400 font-normal text-lg">
            ({items.reduce((s, i) => s + i.quantity, 0)} article{items.reduce((s, i) => s + i.quantity, 0) > 1 ? "s" : ""})
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Item list ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-white border border-gray-200 rounded flex gap-4 p-4"
              >
                {/* Image */}
                <div className="w-20 h-20 relative shrink-0 bg-gray-50 rounded overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-contain p-1"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-[#1B4332] uppercase tracking-wider mb-0.5">
                    {item.brand}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400 mb-3">{item.size}</p>

                  <div className="flex items-center justify-between">
                    {/* Qty stepper */}
                    <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="px-3 text-sm font-bold tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Line price */}
                    <div className="text-right">
                      <p className="font-black text-gray-900">
                        {(item.price * item.quantity).toFixed(2).replace(".", ",")} €
                      </p>
                      <p className="text-xs text-gray-400 line-through">
                        {(item.originalPrice * item.quantity).toFixed(2).replace(".", ",")} €
                      </p>
                    </div>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-gray-300 hover:text-red-400 transition-colors self-start"
                  aria-label="Supprimer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* ── Order summary ─────────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded p-5 sticky top-20">
              <h2 className="font-black text-gray-900 text-base mb-4 uppercase tracking-wide">
                Récapitulatif
              </h2>

              {/* Email */}
              <div className="mb-4">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 block">
                  Email de confirmation
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#1B4332] transition-colors"
                />
              </div>

              {/* Lines */}
              <div className="space-y-2.5 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span className="font-semibold">{subtotal.toFixed(2).replace(".", ",")} €</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frais de service (5%)</span>
                  <span className="font-semibold">{serviceFee.toFixed(2).replace(".", ",")} €</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span className={`font-semibold ${shipping === 0 ? "text-[#10B981]" : ""}`}>
                    {shipping === 0 ? "Offerte ✓" : `${shipping.toFixed(2).replace(".", ",")} €`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[11px] text-gray-400">
                    Livraison offerte à partir de 40 €
                  </p>
                )}

                {/* Total */}
                <div className="border-t border-gray-200 pt-3 mt-1 flex justify-between items-baseline">
                  <span className="font-black text-gray-900">Total</span>
                  <span className="font-black text-gray-900 text-xl">
                    {total.toFixed(2).replace(".", ",")} €
                  </span>
                </div>

                {/* Savings callout */}
                {totalSavings > 0 && (
                  <div className="bg-[#ecfdf5] rounded px-3 py-2 flex justify-between items-center">
                    <span className="text-[11px] text-[#1B4332] font-semibold">
                      Économies vs grande distribution
                    </span>
                    <span className="text-[#10B981] font-black text-sm">
                      -{totalSavings.toFixed(2).replace(".", ",")} €
                    </span>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <p className="text-red-500 text-xs mt-3 font-semibold">{error}</p>
              )}

              {/* CTA */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full mt-4 bg-[#1B4332] hover:bg-[#2d6a4f] disabled:opacity-60 text-white font-black py-3.5 rounded flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  "Redirection vers Stripe…"
                ) : (
                  <>
                    <Lock size={15} />
                    Payer {total.toFixed(2).replace(".", ",")} €
                    <ChevronRight size={16} />
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-gray-400 mt-3 flex items-center justify-center gap-1">
                <Lock size={10} /> Paiement sécurisé · Stripe · SSL 256-bit
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
