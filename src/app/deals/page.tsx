"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import ProductCard, { ProductCardProps } from "@/components/ProductCard";
import { calculateAIPrice } from "@/lib/aiPricing";
import { useCart } from "@/lib/cart";

// Brand → Unsplash image map for cart thumbnails
const BRAND_IMG: Record<string, string> = {
  "Ariel":     "https://images.unsplash.com/photo-1585670080336-57b8a9b7e461?w=400&q=80",
  "Nestlé":    "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80",
  "Colgate":   "https://images.unsplash.com/photo-1571782742078-30d6c6c5b3d1?w=400&q=80",
  "Evian":     "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80",
  "Dove":      "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&q=80",
  "Kellogg's": "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=400&q=80",
  "Gillette":  "https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=400&q=80",
  "L'Oréal":   "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
  "Maggi":     "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80",
};

// ─── Sponsored slot types ─────────────────────────────────────────────────────

interface SponsoredSlot {
  productId: string | null;
  campaignId: string;
  cpcEur: number;
  position: 1 | 2 | 3;
  supplierName?: string;
}

// ─── Sponsored card component ─────────────────────────────────────────────────

function SponsoredCard({
  product,
  slot,
  userSession,
  onAddToCart,
  added,
}: {
  product: ProductCardProps;
  slot: SponsoredSlot;
  userSession: string;
  onAddToCart: (id: string) => void;
  added: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const impressionFired = useRef(false);

  // Fire impression once when card enters viewport
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !impressionFired.current) {
          impressionFired.current = true;
          fetch("/api/ads/impression", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              campaignId: slot.campaignId,
              productId: slot.productId,
              userSession,
            }),
          }).catch(() => {});
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [slot.campaignId, slot.productId, userSession]);

  const handleClick = async () => {
    await fetch("/api/ads/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId: slot.campaignId,
        productId: slot.productId,
        userSession,
      }),
    }).catch(() => {});
    onAddToCart(product.id);
  };

  const discount = Math.round(
    ((product.original_price - product.current_price) / product.original_price) * 100
  );

  return (
    <div
      ref={ref}
      className="relative bg-white rounded-2xl border-l-2 border-[#10B981] shadow-sm overflow-hidden group transition-all hover:shadow-md"
    >
      {/* Sponsored badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="text-[10px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
          Sponsorisé
        </span>
      </div>

      {/* Brand circle */}
      <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-[#1B4332] flex items-center justify-center">
        <span className="text-white text-xs font-bold">{product.brand[0]}</span>
      </div>

      {/* Added overlay */}
      {added && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#10B981]/10 rounded-2xl backdrop-blur-sm">
          <div className="bg-[#1B4332] text-white font-bold text-sm px-4 py-2.5 rounded-full flex items-center gap-2">
            ✅ Ajouté
          </div>
        </div>
      )}

      <div className="p-4 pt-10">
        {/* Product info */}
        <div className="bg-slate-50 rounded-xl h-32 flex items-center justify-center mb-3 overflow-hidden">
          <span className="text-4xl">
            {product.category === "hygiene" ? "🧴"
              : product.category === "alimentation" ? "🍝"
              : product.category === "entretien" ? "🧹"
              : product.category === "boissons" ? "💧"
              : "📦"}
          </span>
        </div>

        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{product.brand}</p>
        <p className="font-bold text-gray-900 text-sm leading-snug mb-1">{product.name}</p>
        {product.size && <p className="text-xs text-gray-400 mb-2">{product.size}</p>}

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-black text-[#1B4332]">€{product.current_price.toFixed(2)}</span>
          <span className="text-xs text-gray-400 line-through">€{product.original_price.toFixed(2)}</span>
          <span className="text-[10px] font-black bg-[#ff955a] text-[#552100] px-1.5 py-0.5 rounded-md ml-auto">
            -{discount}%
          </span>
        </div>

        <button
          onClick={handleClick}
          className="w-full bg-[#1B4332] text-white font-bold text-sm py-2 rounded-xl hover:bg-[#2d6a4f] transition-colors mb-2"
        >
          Ajouter au panier
        </button>

        <a
          href="#"
          className="block text-center text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          En savoir plus sur {product.brand} →
        </a>
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "all" | "alimentation" | "hygiene" | "entretien" | "boissons";
type SortKey  = "price_asc" | "discount_max" | "expiry_soon";

// ─── Filter / sort config ─────────────────────────────────────────────────────

const CATEGORIES: { key: Category; label: string; emoji: string }[] = [
  { key: "all",          label: "Tout",         emoji: "🛒" },
  { key: "alimentation", label: "Alimentation",  emoji: "🍝" },
  { key: "hygiene",      label: "Hygiène",       emoji: "🧴" },
  { key: "entretien",    label: "Entretien",     emoji: "🧹" },
  { key: "boissons",     label: "Boissons",      emoji: "💧" },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: "price_asc",    label: "Prix croissant" },
  { key: "discount_max", label: "Réduction max" },
  { key: "expiry_soon",  label: "Expire bientôt" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchProducts(): Promise<ProductCardProps[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(url, key);
    const { data, error } = await sb
      .from("products")
      .select("id, brand, name, price_retail_eur, price_surplus_eur, discount_percent, stock_units, expiry_date, is_active, category, image_url, typical_duration_days, description, is_sponsored")
      .eq("is_active", true)
      .gt("stock_units", 0)
      .order("discount_percent", { ascending: false });

    if (error || !data?.length) return [];

    // Map DB column names → ProductCardProps
    return (data as Record<string, unknown>[]).map((row) => ({
      id:                 String(row.id ?? ""),
      brand:              String(row.brand ?? ""),
      name:               String(row.name ?? ""),
      size:               "",
      original_price:     Number(row.price_retail_eur ?? 0),
      current_price:      Number(row.price_surplus_eur ?? 0),
      stock_units:        Number(row.stock_units ?? 0),
      expiry_date:        String(row.expiry_date ?? new Date().toISOString().slice(0, 10)),
      flash_sale_end_time: null,
      ai_pricing_enabled: false,
      category:           String(row.category ?? ""),
      image_url:          String(row.image_url ?? ""),
    })) as ProductCardProps[];
  } catch {
    return [];
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// Stable session ID for impression/click tracking
function getSession(): string {
  if (typeof window === "undefined") return "ssr";
  let s = sessionStorage.getItem("fulflo_session");
  if (!s) { s = crypto.randomUUID(); sessionStorage.setItem("fulflo_session", s); }
  return s;
}

export default function DealsPage() {
  const cart = useCart();
  const [products, setProducts]   = useState<ProductCardProps[]>([]);
  const [loading, setLoading]     = useState(true);
  const [category, setCategory]   = useState<Category>("all");
  const [sort, setSort]           = useState<SortKey>("discount_max");
  const [search, setSearch]       = useState("");
  const [addedIds, setAddedIds]   = useState<Set<string>>(new Set());
  const [toast, setToast]         = useState<string | null>(null);
  const [sponsored, setSponsored] = useState<SponsoredSlot[]>([]);
  const userSession = useRef(typeof window !== "undefined" ? getSession() : "ssr");

  useEffect(() => {
    fetchProducts().then((p) => { setProducts(p); setLoading(false); });

    // Fetch sponsored slots directly from Supabase
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (sbUrl && sbKey && sbKey !== "placeholder") {
      import("@supabase/supabase-js").then(({ createClient }) => {
        const sb = createClient(sbUrl, sbKey);
        Promise.resolve(
          sb.from("ad_campaigns")
            .select("id, supplier_id, product_id, cpc_eur, daily_budget_eur, daily_spend_eur, impressions, clicks")
            .eq("status", "active")
            .order("cpc_eur", { ascending: false })
            .limit(6)
        ).then(({ data }) => {
          if (!data?.length) return;
          const eligible = data.filter(
            (c) => Number(c.daily_spend_eur) < Number(c.daily_budget_eur)
          );
          const slots: SponsoredSlot[] = eligible.slice(0, 3).map((c, i) => ({
            productId: (c.product_id as string) ?? null,
            campaignId: c.id as string,
            cpcEur: Number(c.cpc_eur),
            position: (i + 1) as 1 | 2 | 3,
            supplierName: c.supplier_id as string,
          }));
          if (slots.length) setSponsored(slots);
        }).catch(() => {});
      });
    }
  }, []);

  const handleAddToCart = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      cart.addItem({
        productId:     product.id,
        name:          product.name,
        brand:         product.brand,
        size:          product.size ?? "",
        price:         product.current_price,
        originalPrice: product.original_price,
        image:         (product as unknown as Record<string, string>).image_url || BRAND_IMG[product.brand] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
        category:      product.category,
      });
      // Toast notification
      setToast(`${product.brand} ${product.name} ajouté au panier ✓`);
      setTimeout(() => setToast(null), 2500);
    }
    setAddedIds((prev) => new Set(prev).add(id));
    setTimeout(() => setAddedIds((prev) => { const s = new Set(prev); s.delete(id); return s; }), 1500);
  };

  const filtered = useMemo(() => {
    let list = [...products];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.brand.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          (p.category ?? "").toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category !== "all") {
      list = list.filter((p) => {
        const c = (p.category ?? "").toLowerCase();
        // Map DB values to filter keys
        if (category === "entretien") return c === "entretien" || c === "cleaning";
        if (category === "alimentation") return c === "alimentation" || c === "food";
        return c === category;
      });
    }

    // Sort
    list.sort((a, b) => {
      if (sort === "price_asc") return a.current_price - b.current_price;
      if (sort === "expiry_soon") return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
      if (sort === "discount_max") {
        const da = calculateAIPrice({ original_price: a.original_price, expiry_date: a.expiry_date, ai_pricing_enabled: a.ai_pricing_enabled, override_price: a.current_price }).discount_pct;
        const db_ = calculateAIPrice({ original_price: b.original_price, expiry_date: b.expiry_date, ai_pricing_enabled: b.ai_pricing_enabled, override_price: b.current_price }).discount_pct;
        return db_ - da;
      }
      return 0;
    });

    return list;
  }, [products, category, sort, search]);

  const totalSavings = useMemo(
    () => filtered.reduce((sum, p) => sum + (p.original_price - p.current_price), 0),
    [filtered]
  );

  return (
    <div className="min-h-screen bg-surface">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-mint-light sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <a href="/" className="text-2xl font-bold text-forest tracking-tight shrink-0">
            fulflo<span className="text-mint">.</span>
          </a>

          {/* Search */}
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-mid text-sm">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Chercher une marque ou un produit…"
                className="w-full pl-8 pr-4 py-2 rounded-xl border border-mint-light bg-surface text-sm text-forest placeholder:text-text-mid/50 focus:outline-none focus:ring-2 focus:ring-mint"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a href="/invite" className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-text-dark hover:text-forest transition-colors">
              🎁 <span>€5 offerts</span>
            </a>
            {/* Cart indicator — links to cart page */}
            {cart.itemCount > 0 && (
              <a href="/cart" className="flex items-center gap-1.5 bg-forest text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#2d6a4f] transition-colors">
                🛒 {cart.itemCount}
              </a>
            )}
            <a href="/" className="text-xs text-text-mid hover:text-forest transition-colors">← Accueil</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── PAGE TITLE ────────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-forest mb-1">Toutes les offres surplus</h1>
          <p className="text-text-mid text-sm">
            {loading ? "Chargement…" : (
              <>
                <span className="font-semibold text-forest">{filtered.length} produits</span>
                {" "}— économies potentielles jusqu&apos;à{" "}
                <span className="font-semibold text-mint">€{totalSavings.toFixed(0)}</span>
              </>
            )}
          </p>
        </div>

        {/* ── FILTER + SORT BAR ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
          {/* Category filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  category === c.key
                    ? "bg-forest text-white shadow-sm"
                    : "bg-white text-text-dark border border-mint-light hover:border-mint hover:text-forest"
                }`}
              >
                <span>{c.emoji}</span>
                {c.label}
                {category === c.key && c.key !== "all" && (
                  <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {filtered.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-text-mid">Trier :</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="text-sm font-semibold text-forest bg-white border border-mint-light rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mint cursor-pointer"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── PRODUCT GRID ──────────────────────────────────────────────── */}
        {loading ? (
          // Skeleton
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">📦</p>
            <p className="text-forest font-semibold text-lg mb-2">Aucun produit disponible</p>
            <p className="text-text-mid text-sm">Le catalogue est en cours de mise à jour. Revenez bientôt.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-forest font-semibold text-lg mb-2">Aucun produit trouvé</p>
            <p className="text-text-mid text-sm mb-4">Essayez un autre filtre ou une autre recherche.</p>
            <button
              onClick={() => { setCategory("all"); setSearch(""); }}
              className="bg-forest text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-forest-mid transition-colors"
            >
              Voir tous les produits
            </button>
          </div>
        ) : (
          <>
            {/* ── SPONSORED SLOTS (top 3) ─────────────────────────────── */}
            {sponsored.length > 0 && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                  {sponsored.slice(0, 3).map((slot) => {
                    const product = (slot.productId ? products.find((p) => p.id === slot.productId) : null)
                      ?? filtered[slot.position - 1]
                      ?? filtered[0];
                    if (!product) return null;
                    return (
                      <SponsoredCard
                        key={slot.campaignId}
                        product={product}
                        slot={slot}
                        userSession={userSession.current}
                        onAddToCart={handleAddToCart}
                        added={addedIds.has(product.id)}
                      />
                    );
                  })}
                </div>
                {/* Separator */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 border-t border-gray-100" />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Autres offres surplus
                  </span>
                  <div className="flex-1 border-t border-gray-100" />
                </div>
              </>
            )}

            {/* ── ORGANIC PRODUCTS ───────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <div key={p.id} className="relative">
                  {addedIds.has(p.id) && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-mint/10 rounded-2xl backdrop-blur-sm">
                      <div className="bg-forest text-white font-bold text-sm px-4 py-2.5 rounded-full flex items-center gap-2">
                        ✅ Ajouté au panier
                      </div>
                    </div>
                  )}
                  <ProductCard
                    {...p}
                    onAddToCart={handleAddToCart}
                    featured={!!p.flash_sale_end_time}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── TOAST NOTIFICATION ────────────────────────────────────────── */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div className="bg-[#1B4332] text-white rounded-full shadow-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
              ✓ {toast}
            </div>
          </div>
        )}

        {/* ── CART STICKY BAR (when items in cart) ───────────────────────── */}
        {cart.itemCount > 0 && !toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-forest text-white rounded-2xl shadow-xl px-6 py-4 flex items-center gap-4">
              <div>
                <p className="font-bold text-sm">
                  {cart.itemCount} article{cart.itemCount > 1 ? "s" : ""} · {cart.subtotal.toFixed(2).replace(".", ",")} €
                </p>
                <p className="text-white/60 text-xs">Économies: -{cart.totalSavings.toFixed(2).replace(".", ",")} €</p>
              </div>
              <a
                href="/cart"
                className="bg-mint text-forest font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-mint-light transition-colors whitespace-nowrap"
              >
                Voir le panier →
              </a>
            </div>
          </div>
        )}

        {/* ── REFERRAL NUDGE ────────────────────────────────────────────── */}
        <div className="mt-12 bg-forest rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-mint font-bold text-sm uppercase tracking-wider mb-1">Invitez vos amis</p>
            <p className="text-white font-semibold text-lg">Vous et votre ami recevez chacun <span className="text-mint">€5</span></p>
            <p className="text-white/60 text-sm">Crédit activé à la première commande</p>
          </div>
          <a
            href="/invite"
            className="bg-mint text-forest font-bold px-6 py-3 rounded-xl text-sm hover:bg-mint-light transition-colors whitespace-nowrap shrink-0"
          >
            🎁 Obtenir mon lien →
          </a>
        </div>

      </main>
    </div>
  );
}
