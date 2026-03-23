"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/lib/cart";

interface RippleShareData {
  campaign_name: string;
  product_name?: string;
  product_brand?: string;
  product_price?: number;
  product_original?: number;
  friend_voucher_eur: number;
  sharer_voucher_eur: number;
}

export default function ReferralLandingPage() {
  const params = useParams();
  const router = useRouter();
  const cart   = useCart();
  const code   = (params.code as string ?? "").toUpperCase();

  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [referralValid, setReferralValid]   = useState<boolean | null>(null);
  const [rippleData, setRippleData]         = useState<RippleShareData | null>(null);
  const [addedToCart, setAddedToCart]       = useState(false);

  useEffect(() => {
    if (!code) return;

    // Check Ripple share first
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (sbUrl && sbKey) {
      const sb = createClient(sbUrl, sbKey);
      Promise.resolve(
        sb.from("ripple_shares")
          .select("campaign_id, product_id, ripple_campaigns(campaign_name, friend_voucher_eur, sharer_voucher_eur)")
          .eq("share_code", code)
          .single()
      ).then(async ({ data }) => {
          if (data) {
            const camp = Array.isArray(data.ripple_campaigns) ? data.ripple_campaigns[0] : data.ripple_campaigns as Record<string, unknown>;
            const rd: RippleShareData = {
              campaign_name:    String(camp?.campaign_name ?? "FulFlo"),
              friend_voucher_eur: Number(camp?.friend_voucher_eur ?? 2),
              sharer_voucher_eur: Number(camp?.sharer_voucher_eur ?? 3),
            };
            // Try to get product details
            if (data.product_id) {
              const { data: prod } = await Promise.resolve(
                sb.from("products")
                  .select("name, brand, price_surplus_eur, price_retail_eur")
                  .eq("id", data.product_id as string)
                  .single()
              );
              if (prod) {
                rd.product_name     = String(prod.name);
                rd.product_brand    = String(prod.brand);
                rd.product_price    = Number(prod.price_surplus_eur);
                rd.product_original = Number(prod.price_retail_eur);
              }
            }
            setRippleData(rd);
            setReferralValid(true);
            localStorage.setItem("ripple_share_code", code);
            return;
          }
          fetch(`/api/referral?code=${code}`).then((r) => setReferralValid(r.ok)).catch(() => setReferralValid(false));
        })
        .catch(() => {
          fetch(`/api/referral?code=${code}`).then((r) => setReferralValid(r.ok)).catch(() => setReferralValid(false));
        });
    } else {
      fetch(`/api/referral?code=${code}`).then((r) => setReferralValid(r.ok)).catch(() => setReferralValid(false));
    }
  }, [code]);

  const handleAddToCart = () => {
    if (rippleData?.product_name && rippleData?.product_price) {
      cart.addItem({
        productId:     `ripple-${code}`,
        name:          rippleData.product_name,
        brand:         rippleData.product_brand ?? "FulFlo",
        size:          "",
        price:         rippleData.product_price,
        originalPrice: rippleData.product_original ?? rippleData.product_price * 2,
        image:         "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80",
        category:      "alimentation",
      });
      // Store voucher in localStorage
      localStorage.setItem("ripple_friend_voucher_eur", String(rippleData.friend_voucher_eur));
      setAddedToCart(true);
      setTimeout(() => router.push("/cart"), 1200);
    } else {
      router.push("/deals");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, referral_code: code }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setStatus("success");
      setTimeout(() => router.push(`/invite?email=${encodeURIComponent(email)}`), 2000);
    } else {
      setStatus("error");
    }
  };

  // ── Ripple landing page ────────────────────────────────────────────────────
  if (rippleData) {
    const discount = rippleData.product_price && rippleData.product_original
      ? Math.round(((rippleData.product_original - rippleData.product_price) / rippleData.product_original) * 100)
      : 0;

    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center px-4 py-10">
        <a href="/" className="text-3xl font-bold text-[#1B4332] mb-8 tracking-tight">
          fulflo<span className="text-[#10B981]">.</span>
        </a>

        <div className="w-full max-w-md space-y-4">
          {/* Recommended badge */}
          <div className="bg-[#ecfdf5] border border-[#10B981] rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#10B981] rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <div>
              <p className="text-[#065f46] font-bold text-sm">Recommandé par un ami</p>
              <p className="text-[#065f46]/70 text-xs">Ce lien vous offre €{rippleData.friend_voucher_eur.toFixed(0)} sur votre première commande</p>
            </div>
          </div>

          {/* Main card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Hero */}
            <div className="bg-[#1B4332] px-6 pt-6 pb-4 text-center">
              <p className="text-[#10B981] text-xs font-bold uppercase tracking-widest mb-2">
                Économisez comme votre ami
              </p>
              <h1 className="text-2xl font-black text-white leading-tight mb-1">
                {rippleData.product_name
                  ? `${rippleData.product_brand} ${rippleData.product_name}`
                  : "Surplus Direct Fabricant"}
              </h1>
              {rippleData.product_price && (
                <div className="flex items-center justify-center gap-3 mt-3">
                  <span className="text-3xl font-black text-white">
                    €{rippleData.product_price.toFixed(2)}
                  </span>
                  {rippleData.product_original && (
                    <>
                      <span className="text-white/50 text-base line-through">
                        €{rippleData.product_original.toFixed(2)}
                      </span>
                      {discount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded">
                          -{discount}%
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Voucher banner */}
            <div className="bg-[#10B981] px-6 py-3 text-center">
              <p className="text-[#1B4332] font-black text-base">
                🎁 €{rippleData.friend_voucher_eur.toFixed(0)} offerts sur votre première commande
              </p>
            </div>

            {/* Stars + reviews */}
            <div className="flex items-center justify-center gap-1 py-3 border-b border-gray-100">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
              ))}
              <span className="text-xs text-gray-500 ml-1.5">(1 246 avis · 4.8/5)</span>
            </div>

            <div className="p-6 space-y-3">
              {addedToCart ? (
                <div className="text-center py-4">
                  <p className="text-[#10B981] font-bold text-lg">✅ Ajouté ! Redirection…</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 bg-[#1B4332] text-white font-black py-4 rounded-xl hover:bg-[#2d6a4f] transition-colors text-base"
                  >
                    <ShoppingCart size={18} />
                    Ajouter au panier · €{rippleData.product_price?.toFixed(2) ?? "—"}
                  </button>
                  <a
                    href="/deals"
                    className="block text-center text-sm text-gray-500 hover:text-[#1B4332] transition-colors"
                  >
                    Voir tout le catalogue surplus →
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Value props */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: "🏭", label: "Surplus fabricant" },
              { icon: "✅", label: "100% authentique" },
              { icon: "🚚", label: "Livraison 48h" },
            ].map((p) => (
              <div key={p.label} className="bg-white rounded-xl py-3 px-2 shadow-sm">
                <div className="text-xl mb-1">{p.icon}</div>
                <p className="text-xs text-gray-500 font-medium">{p.label}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400">
            Sponsorisé par {rippleData.product_brand ?? rippleData.campaign_name.split("—")[0].trim()} via FulFlo Ripple
          </p>
        </div>
      </div>
    );
  }

  // ── Standard referral landing (unchanged) ─────────────────────────────────
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
      <a href="/" className="text-3xl font-bold text-forest mb-12 tracking-tight">
        fulflo<span className="text-mint">.</span>
      </a>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-mint-light rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🎁</span>
        </div>

        <div className="inline-flex items-center gap-2 bg-mint-light text-text-dark text-xs font-bold tracking-widest px-4 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-mint" />
          INVITATION PERSONNELLE
        </div>

        <h1 className="text-3xl font-bold text-forest mb-3 leading-tight">
          Votre ami vous offre<br />
          <span className="text-mint">€5 de crédit</span>
        </h1>

        <p className="text-text-mid mb-2 leading-relaxed">
          Inscrivez-vous avec ce lien d&apos;invitation et recevez <strong>€5</strong> de crédit sur votre première commande.
        </p>

        {referralValid === false && (
          <p className="text-xs text-red-500 mb-4">
            Ce lien d&apos;invitation a expiré ou est invalide.
          </p>
        )}

        <div className="bg-surface rounded-xl px-4 py-2 mb-6 inline-flex items-center gap-2">
          <span className="text-xs text-text-mid">Code:</span>
          <span className="font-mono font-bold text-forest tracking-widest">{code}</span>
        </div>

        {status === "success" ? (
          <div className="bg-mint-light text-text-dark rounded-2xl p-6">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-bold text-forest text-lg mb-1">Bienvenue chez Fulflo !</p>
            <p className="text-sm text-text-mid">€5 de crédit ajouté. Redirection en cours…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email..."
              className="w-full px-4 py-3 rounded-xl border border-mint-light bg-white text-forest placeholder:text-text-mid/50 focus:outline-none focus:ring-2 focus:ring-mint text-sm"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-forest text-white font-bold py-3.5 rounded-xl hover:bg-forest-mid transition-colors text-sm disabled:opacity-60"
            >
              {status === "loading" ? "Inscription…" : "Réclamer mes €5 →"}
            </button>
            {status === "error" && (
              <p className="text-xs text-red-500">Une erreur s&apos;est produite. Réessayez.</p>
            )}
          </form>
        )}

        <p className="text-xs text-text-mid mt-4 opacity-60">
          Crédit activé à la première commande · Sans engagement
        </p>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 max-w-md w-full text-center">
        {[
          { icon: "🏭", label: "Surplus fabricant" },
          { icon: "✅", label: "100% authentique" },
          { icon: "🚚", label: "Livraison 24h" },
        ].map((p) => (
          <div key={p.label} className="bg-white rounded-2xl py-4 px-2 shadow-sm">
            <div className="text-2xl mb-1">{p.icon}</div>
            <p className="text-xs text-text-mid font-medium">{p.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
