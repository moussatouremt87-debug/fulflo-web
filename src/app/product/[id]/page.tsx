"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Share2, Heart, Plus, Minus, ShoppingCart, Truck, Star } from "lucide-react";
import { useCart } from "@/lib/cart";

interface ProductDetail {
  id: string;
  brand: string;
  name: string;
  price: number;
  originalPrice: number;
  savingsPct: number;
  category: string;
  stock_units: number;
  expiry_date: string;
  description: string;
  rating?: number;
  reviews?: number;
}

const CATEGORY_EMOJI: Record<string, string> = {
  hygiene: "🧴", alimentation: "🍝", entretien: "🧹",
  beaute: "💄", boissons: "💧", bebe: "👶",
  animaux: "🐾", sport: "⚽", pharmacie: "💊",
};

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const id = String(params.id ?? "");

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      import("@supabase/supabase-js").then(({ createClient }) => {
        const sb = createClient(url, key);
        Promise.resolve(
          sb.from("products")
            .select("id, brand, name, price_retail_eur, price_surplus_eur, discount_percent, stock_units, expiry_date, category, description")
            .eq("id", id)
            .single()
        ).then(({ data }) => {
          if (data) {
            const d = data as Record<string, unknown>;
            const orig = Number(d.price_retail_eur ?? 0);
            const curr = Number(d.price_surplus_eur ?? 0);
            setProduct({
              id: String(d.id),
              brand: String(d.brand ?? ""),
              name: String(d.name ?? ""),
              price: curr,
              originalPrice: orig,
              savingsPct: orig > 0 ? Math.round(((orig - curr) / orig) * 100) : 0,
              category: String(d.category ?? ""),
              stock_units: Number(d.stock_units ?? 0),
              expiry_date: String(d.expiry_date ?? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)),
              description: String(d.description ?? "Produit surplus certifié directement du fabricant."),
              rating: undefined,
              reviews: undefined,
            });
          }
          setLoading(false);
        }).catch(() => setLoading(false));
      });
    } else {
      // Demo fallback
      setProduct({
        id,
        brand: "Favrichon",
        name: "Favrichon Muesli Croustillant Bio, 500g × 4",
        price: 14.99,
        originalPrice: 23.96,
        savingsPct: 37,
        category: "alimentation",
        stock_units: 47,
        expiry_date: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
        description: "Muesli croustillant bio Favrichon — surplus fabricant certifié. Même produit, prix réduit, aucun gaspillage.",
        rating: undefined,
        reviews: undefined,
      });
      setLoading(false);
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        size: "",
        price: product.price,
        originalPrice: product.originalPrice,
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
        category: product.category,
      });
    }
    setAdded(true);
    setTimeout(() => router.push("/cart"), 1200);
  };

  if (loading) {
    return (
      <div className="max-w-sm mx-auto min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-sm mx-auto min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-6">
        <span className="text-5xl">📦</span>
        <p className="font-display font-bold text-ink-900 text-xl text-center">Produit introuvable</p>
        <button onClick={() => router.back()} className="text-green-600 text-sm font-semibold">← Retour</button>
      </div>
    );
  }

  const emoji = CATEGORY_EMOJI[product.category] ?? "📦";
  const savings = product.originalPrice - product.price;
  const dlcDays = daysUntil(product.expiry_date);

  return (
    <div className="min-h-screen bg-[#FAFCFB]">
      <div className="max-w-4xl mx-auto bg-white min-h-screen relative pb-28">

        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="bg-green-800 px-4 md:px-8 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 bg-white/10 rounded-[6px] flex items-center justify-center"
          >
            <ChevronLeft size={18} className="text-white" />
          </button>
          <span className="text-white font-display font-semibold text-sm">{product.brand}</span>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 bg-white/10 rounded-[6px] flex items-center justify-center">
              <Share2 size={14} className="text-white" />
            </button>
            <button
              onClick={() => setLiked((l) => !l)}
              className="w-8 h-8 bg-white/10 rounded-[6px] flex items-center justify-center"
            >
              <Heart size={14} className={liked ? "fill-red-400 text-red-400" : "text-white"} />
            </button>
          </div>
        </div>

        {/* ── IMAGE ZONE ────────────────────────────────────────────────── */}
        <div className="relative bg-green-50 flex items-center justify-center" style={{ height: 240 }}>
          {/* Discount badge */}
          {product.savingsPct >= 10 && (
            <div className="absolute top-4 left-4 bg-discount-red text-white text-xs font-black px-3 py-1 rounded-full">
              -{product.savingsPct}%
            </div>
          )}
          <span className="text-8xl select-none">{emoji}</span>
          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <div className="w-2 h-2 bg-green-800 rounded-full" />
            <div className="w-1.5 h-1.5 bg-ink-200 rounded-full" />
            <div className="w-1.5 h-1.5 bg-ink-200 rounded-full" />
          </div>
        </div>

        {/* ── PRODUCT INFO ──────────────────────────────────────────────── */}
        <div className="px-5 pt-5">
          {/* Brand + trust signal */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-ink-400 uppercase tracking-widest">{product.brand}</span>
            <span className="text-[10px] text-[#10B981] font-semibold">♻️ Surplus certifié</span>
          </div>

          {/* Name */}
          <h1 className="font-display font-black text-ink-900 leading-tight mb-3" style={{ fontSize: 21 }}>
            {product.name}
          </h1>

          {/* Price block */}
          <div className="flex items-baseline gap-3 mb-1">
            <span className="font-display font-black text-ink-900 text-3xl">€{product.price.toFixed(2)}</span>
            <span className="text-ink-300 text-sm line-through">€{product.originalPrice.toFixed(2)}</span>
          </div>
          <p className="text-discount-red font-semibold text-sm mb-5">
            Vous économisez €{savings.toFixed(2)} ({product.savingsPct}%)
          </p>

          {/* Description */}
          <p className="text-ink-400 text-sm leading-relaxed mb-5">{product.description}</p>

          {/* 3 info cards */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { icon: "📦", value: `${product.stock_units}`, label: "unités" },
              { icon: "🚚", value: "3-5j",  label: "livraison" },
              { icon: "📅", value: `${dlcDays}j`, label: "avant DLC" },
            ].map((card) => (
              <div key={card.label} className="bg-green-50 rounded-[14px] py-3 flex flex-col items-center gap-1">
                <span className="text-xl">{card.icon}</span>
                <span className="font-display font-black text-ink-900 text-base leading-none">{card.value}</span>
                <span className="text-[10px] text-ink-400">{card.label}</span>
              </div>
            ))}
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-between bg-green-50 rounded-[14px] px-4 py-3 mb-6">
            <span className="font-display font-semibold text-ink-700 text-sm">Quantité</span>
            <div className="flex items-center gap-3 bg-white rounded-[10px] px-3 py-1.5 shadow-xs">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="text-ink-500 hover:text-ink-900 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="font-black text-ink-900 text-base tabular-nums w-5 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="text-ink-500 hover:text-ink-900 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 pb-6 pt-3 bg-white border-t border-ink-100 z-40">
          <div className="flex items-center gap-2 mb-3">
            <Truck size={14} className="text-green-500" />
            <span className="text-xs text-green-600 font-semibold">Livraison offerte dès 49€</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={added}
            className="w-full bg-green-800 text-white font-display font-black text-base py-4 rounded-[20px] flex items-center justify-between px-6 disabled:opacity-70 transition-all"
            style={{ boxShadow: "0 8px 24px rgba(15,45,30,.25)" }}
          >
            <ShoppingCart size={20} />
            <span>{added ? "Ajouté ! Redirection..." : `Ajouter au panier · €${(product.price * quantity).toFixed(2)}`}</span>
            <span />
          </button>
        </div>

      </div>
    </div>
  );
}
