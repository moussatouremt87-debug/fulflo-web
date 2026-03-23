"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { CheckCircle, Package, Share2, Clock, Copy, Check } from "lucide-react";

// Replenishment prediction by category
const DURATION_DAYS: Record<string, number> = {
  hygiene:     45,
  alimentaire: 30,
  boissons:    14,
  entretien:   60,
  beaute:      60,
};

interface CartItemData {
  productId: string;
  name: string;
  brand: string;
  size: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
  category?: string;
}

interface OrderData {
  orderId: string;
  sessionId: string;
  customerEmail: string | null;
  customerName: string | null;
  amountTotal: number; // cents
  currency: string;
  cartItems: CartItemData[] | null;
  order: { id: string; status: string } | null;
}

function SuccessContent() {
  const params      = useSearchParams();
  const sessionId   = params.get("session_id");
  const { clearCart } = useCart();

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [copied, setCopied]       = useState(false);
  const [rippleShare, setRippleShare] = useState<{
    shareUrl: string; whatsappUrl: string; shareMessage: string;
    sharerVoucher: number; friendVoucher: number; brandName: string;
  } | null>(null);
  const [rippleCopied, setRippleCopied] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!sessionId) { setError("Session introuvable."); setLoading(false); return; }
    try {
      const res  = await fetch(`/api/checkout/order?session_id=${sessionId}`);
      const data = await res.json();
      if (data.error) { setError("Commande introuvable."); setLoading(false); return; }
      setOrderData(data);
      clearCart(); // Clear cart after confirmed payment
      // Fetch Ripple share link for the first purchased product
      const firstItem = data.cartItems?.[0];
      if (firstItem) {
        fetch("/api/ripple/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: data.customerEmail || data.sessionId || "anon",
            productId: firstItem.productId,
            channel: "copy",
          }),
        }).then((r) => r.json()).then((rd) => {
          if (!rd.error) setRippleShare(rd);
        }).catch(() => {});
      }
    } catch {
      setError("Impossible de charger la commande.");
    } finally {
      setLoading(false);
    }
  }, [sessionId, clearCart]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const shareInvite = () => {
    const url = `${window.location.origin}/invite`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Confirmation de votre commande…</p>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-500 font-semibold">{error || "Erreur inconnue."}</p>
        <Link href="/deals" className="text-[#1B4332] underline text-sm">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const { orderId, customerName, customerEmail, amountTotal, currency, cartItems } = orderData;
  const totalFormatted = (amountTotal / 100).toFixed(2).replace(".", ",");
  const currencyLabel  = currency.toUpperCase();
  const shortId        = orderId.slice(0, 8).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Nav */}
      <nav className="bg-[#1B4332] h-14 flex items-center px-6">
        <Link href="/" className="text-xl font-black text-white tracking-tight">
          fulflo<span className="text-[#10B981]">.</span>
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-5">

        {/* ── Confirmation header ─────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#ecfdf5] rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-[#10B981]" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">
            Commande confirmée !
          </h1>
          <p className="text-gray-500 text-sm mb-2">
            {customerName && <span>Merci, {customerName}. </span>}
            Votre référence : <span className="font-bold text-gray-900">#{shortId}</span>
          </p>
          {customerEmail && (
            <p className="text-xs text-gray-400">
              Confirmation envoyée à <span className="font-semibold">{customerEmail}</span>
            </p>
          )}
          <div className="mt-4 inline-block bg-[#1B4332] text-white font-black text-lg px-6 py-2 rounded">
            {totalFormatted} {currencyLabel} payé
          </div>
        </div>

        {/* ── Items purchased ─────────────────────────────────────────────── */}
        {cartItems && cartItems.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
              <Package size={16} className="text-[#1B4332]" />
              <h2 className="font-bold text-gray-900 text-sm">Articles commandés</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-12 h-12 relative bg-gray-50 rounded shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-[#1B4332] uppercase">{item.brand}</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.size} · ×{item.quantity}</p>
                  </div>
                  <p className="font-black text-gray-900 text-sm shrink-0">
                    {(item.price * item.quantity).toFixed(2).replace(".", ",")} €
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Replenishment prediction ─────────────────────────────────────── */}
        {cartItems && cartItems.length > 0 && (
          <div className="bg-[#1B4332] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-[#10B981]" />
              <h2 className="font-bold text-white text-sm">Prévision de consommation</h2>
            </div>
            <div className="space-y-2">
              {cartItems.map((item) => {
                const days = DURATION_DAYS[item.category ?? "hygiene"] ?? 45;
                const totalDays = days * item.quantity;
                const refillDate = new Date(Date.now() + totalDays * 86400000);
                const refillStr  = refillDate.toLocaleDateString("fr-FR", {
                  day: "numeric", month: "long", year: "numeric",
                });
                return (
                  <div key={item.productId} className="flex items-center justify-between">
                    <span className="text-white/80 text-sm">
                      {item.brand} {item.name}
                    </span>
                    <span className="text-[#A7F3D0] text-xs font-semibold">
                      ~{totalDays}j · À réapprovisionner le {refillStr}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Ripple share widget ─────────────────────────────────────────── */}
        {rippleShare && (
          <div className="bg-[#F0FDF4] border border-[#10B981] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Share2 size={16} className="text-[#10B981]" />
              <h3 className="font-bold text-[#1B4332] text-base">
                Partagez et gagnez €{rippleShare.sharerVoucher.toFixed(0)}
              </h3>
            </div>
            <p className="text-sm text-[#1B4332]/80 mb-1">
              Vous venez d&apos;acheter un produit de qualité à prix surplus.
              Partagez à vos proches : si l&apos;un d&apos;eux achète, vous recevez{" "}
              <strong>€{rippleShare.sharerVoucher.toFixed(0)} de crédit</strong>.
            </p>
            <p className="text-sm text-[#1B4332]/80 mb-4">
              Ils reçoivent <strong>€{rippleShare.friendVoucher.toFixed(0)} de bienvenue</strong> sur leur première commande.
            </p>
            <div className="flex gap-2 flex-wrap">
              <a
                href={rippleShare.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-[#1ebe5c] transition-colors"
              >
                <span>📲</span> WhatsApp
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(rippleShare.shareUrl).then(() => {
                    setRippleCopied(true);
                    setTimeout(() => setRippleCopied(false), 2500);
                  }).catch(() => {});
                }}
                className="flex items-center gap-2 bg-[#1B4332] text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-[#2d6a4f] transition-colors"
              >
                {rippleCopied ? <Check size={14} /> : <Copy size={14} />}
                {rippleCopied ? "Lien copié ✓" : "Copier le lien"}
              </button>
            </div>
            <p className="text-xs text-[#1B4332]/40 mt-3">Sponsorisé par {rippleShare.brandName}</p>
          </div>
        )}

        {/* ── Invite widget ───────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <Share2 size={16} className="text-[#10B981]" />
            <h2 className="font-bold text-gray-900 text-sm">Partagez et gagnez €5</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Invitez un ami sur Fulflo — vous recevez chacun €5 de crédit à sa première commande.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-xs text-gray-600 font-mono truncate">
              {typeof window !== "undefined" ? `${window.location.origin}/invite` : "fulflo.app/invite"}
            </div>
            <button
              onClick={shareInvite}
              className="bg-[#10B981] text-[#1B4332] font-bold text-xs px-4 py-2 rounded hover:bg-[#D1FAE5] transition-colors whitespace-nowrap"
            >
              {copied ? "Copié ✓" : "Copier"}
            </button>
          </div>
        </div>

        {/* ── CTA links ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/track/${orderId}`}
            className="flex-1 bg-[#1B4332] text-white font-bold text-sm py-3 rounded text-center hover:bg-[#2d6a4f] transition-colors"
          >
            Suivre ma livraison →
          </Link>
          <Link
            href="/deals"
            className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold text-sm py-3 rounded text-center hover:bg-gray-50 transition-colors"
          >
            Continuer mes achats
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
