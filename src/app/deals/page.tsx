"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ProductCardProps } from "@/components/ProductCard";
import { calculateAIPrice } from "@/lib/aiPricing";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import {
  ChevronLeft, SlidersHorizontal, Plus, Heart, Search, ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import ProductImage from "@/components/ui/ProductImage";
import { ProductGridSkeleton } from "@/components/ui/Shimmer";

// Brand → Unsplash fallback images
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

// ─── Bundle types ──────────────────────────────────────────────────────────────

interface BundleDeal {
  id: string;
  name: string;
  bundle_price_eur: number;
  bundle_discount_percent: number;
}

// ─── Sponsored slot types ──────────────────────────────────────────────────────

interface SponsoredSlot {
  productId: string | null;
  campaignId: string;
  cpcEur: number;
  position: 1 | 2 | 3;
  supplierName?: string;
}

// ─── Sponsored card ────────────────────────────────────────────────────────────

function SponsoredCard({
  product, slot, userSession, onAddToCart, added,
}: {
  product: ProductCardProps;
  slot: SponsoredSlot;
  userSession: string;
  onAddToCart: (id: string) => void;
  added: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const impressionFired = useRef(false);
  const { t } = useI18n();

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !impressionFired.current) {
          impressionFired.current = true;
          fetch("/api/ads/impression", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ campaignId: slot.campaignId, productId: slot.productId, userSession }) }).catch(() => {});
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [slot.campaignId, slot.productId, userSession]);

  const handleClick = async () => {
    await fetch("/api/ads/click", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ campaignId: slot.campaignId, productId: slot.productId, userSession }) }).catch(() => {});
    onAddToCart(product.id);
  };

  const discount = Math.round(((product.original_price - product.current_price) / product.original_price) * 100);

  return (
    <div ref={ref} className="bg-white rounded-[20px] shadow-sm overflow-hidden relative">
      {/* Sponsored badge */}
      <div className="absolute top-2.5 left-2.5 z-10">
        <span className="text-[9px] font-bold text-ink-400 bg-ink-100 px-2 py-0.5 rounded-full">{t("deals.sponsored")}</span>
      </div>

      {added && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-green-500/10 rounded-[20px]">
          <div className="bg-green-800 text-white font-bold text-xs px-4 py-2 rounded-full">✅ {t("deals.added")}</div>
        </div>
      )}

      <div className="h-[120px] relative">
        {discount > 0 && (
          <span className="absolute top-2 right-2 z-10 text-[10px] font-black text-discount-red bg-discount-bg px-2 py-0.5 rounded-full">-{discount}%</span>
        )}
        <ProductImage ean={product.ean} category={product.category} brand={product.brand} className="w-full h-full" size={120} />
      </div>

      <div className="p-3">
        <p className="text-[9px] font-black text-ink-400 uppercase tracking-widest mb-0.5">{product.brand}</p>
        <p className="font-semibold text-ink-900 text-[13px] leading-tight line-clamp-2 mb-2">{product.name}</p>
        <p className="text-green-500 text-[11px] font-bold mb-2">Économisez €{(product.original_price - product.current_price).toFixed(2)}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-black text-ink-900 text-base">€{product.current_price.toFixed(2)}</p>
            <p className="text-ink-300 text-[10px] line-through">€{product.original_price.toFixed(2)}</p>
          </div>
          <button
            onClick={handleClick}
            className="w-8 h-8 bg-green-800 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
          >
            <Plus size={15} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Organic product card ──────────────────────────────────────────────────────

function DealsCard({ product, onAdd, added }: { product: ProductCardProps; onAdd: (id: string) => void; added: boolean }) {
  const [liked, setLiked] = useState(false);
  const discount = Math.round(((product.original_price - product.current_price) / product.original_price) * 100);

  return (
    <div className="bg-white rounded-[20px] shadow-xs overflow-hidden relative">
      {added && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-green-500/10 rounded-[20px]">
          <div className="bg-green-800 text-white font-bold text-xs px-3 py-1.5 rounded-full">✅ Ajouté</div>
        </div>
      )}

      {/* Image area */}
      <div className="h-[120px] relative">
        {discount >= 10 && (
          <span className="absolute top-2 left-2 z-10 text-[10px] font-black text-discount-red bg-discount-bg px-2 py-0.5 rounded-full">-{discount}%</span>
        )}
        <button onClick={() => setLiked((l) => !l)} className="absolute top-2 right-2 z-10 w-6 h-6 bg-white rounded-[6px] flex items-center justify-center shadow-xs">
          <Heart size={11} className={liked ? "fill-red-500 text-red-500" : "text-ink-300"} />
        </button>
        <ProductImage ean={product.ean} category={product.category} brand={product.brand} className="w-full h-full" size={120} />
      </div>

      <div className="p-3">
        <p className="text-[9px] font-black text-ink-400 uppercase tracking-widest mb-0.5">{product.brand}</p>
        <p className="font-semibold text-ink-900 text-[13px] leading-tight line-clamp-2 mb-1.5">{product.name}</p>
        <p className="text-green-500 text-[11px] font-bold mb-2">Économisez €{(product.original_price - product.current_price).toFixed(2)}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-black text-ink-900 text-base leading-none">€{product.current_price.toFixed(2)}</p>
            <p className="text-ink-300 text-[10px] line-through">€{product.original_price.toFixed(2)}</p>
          </div>
          <button
            onClick={() => onAdd(product.id)}
            className="w-8 h-8 bg-green-800 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
          >
            <Plus size={15} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type Category = "all" | "alimentation" | "hygiene" | "entretien" | "beaute" | "boissons" | "bebe" | "animaux" | "sport" | "pharmacie" | "electromenager";
type SortKey  = "price_asc" | "discount_max" | "expiry_soon";

const CATEGORIES: { key: Category; label: string; emoji: string }[] = [
  { key: "all",            label: "Tout",          emoji: "⭐" },
  { key: "alimentation",   label: "Alimentation",  emoji: "🍝" },
  { key: "hygiene",        label: "Hygiène",        emoji: "🧴" },
  { key: "entretien",      label: "Entretien",      emoji: "🧹" },
  { key: "beaute",         label: "Beauté",         emoji: "💄" },
  { key: "boissons",       label: "Boissons",       emoji: "💧" },
  { key: "bebe",           label: "Bébé",           emoji: "👶" },
  { key: "animaux",        label: "Animaux",        emoji: "🐾" },
  { key: "sport",          label: "Sport",          emoji: "⚽" },
  { key: "pharmacie",      label: "Pharmacie",      emoji: "💊" },
  { key: "electromenager", label: "Électroménager", emoji: "🔌" },
];

const SORT_KEYS: { key: SortKey; tKey: string }[] = [
  { key: "price_asc",    tKey: "deals.sort.price" },
  { key: "discount_max", tKey: "deals.sort.discount" },
  { key: "expiry_soon",  tKey: "deals.sort.expiry" },
];

// ─── Data fetching ─────────────────────────────────────────────────────────────

async function fetchProducts(): Promise<ProductCardProps[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(url, key);
    const { data, error } = await sb.from("products")
      .select("id, brand, name, price_retail_eur, price_surplus_eur, discount_percent, stock_units, expiry_date, is_active, category, image_url, typical_duration_days, description, is_sponsored, ean")
      .eq("is_active", true).gt("stock_units", 0).order("discount_percent", { ascending: false });
    if (error || !data?.length) return [];
    return (data as Record<string, unknown>[]).map((row) => ({
      id: String(row.id ?? ""), brand: String(row.brand ?? ""), name: String(row.name ?? ""), size: "",
      original_price: Number(row.price_retail_eur ?? 0), current_price: Number(row.price_surplus_eur ?? 0),
      stock_units: Number(row.stock_units ?? 0),
      expiry_date: String(row.expiry_date ?? new Date().toISOString().slice(0, 10)),
      flash_sale_end_time: null, ai_pricing_enabled: false,
      category: String(row.category ?? ""), image_url: String(row.image_url ?? ""),
      ean: row.ean ? String(row.ean) : undefined,
    })) as ProductCardProps[];
  } catch { return []; }
}

function getSession(): string {
  if (typeof window === "undefined") return "ssr";
  let s = sessionStorage.getItem("fulflo_session");
  if (!s) { s = crypto.randomUUID(); sessionStorage.setItem("fulflo_session", s); }
  return s;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DealsPage() {
  const cart = useCart();
  const { t } = useI18n();
  const [products, setProducts]   = useState<ProductCardProps[]>([]);
  const [loading, setLoading]     = useState(true);
  const [category, setCategory]   = useState<Category>("all");
  const [sort, setSort]           = useState<SortKey>("discount_max");
  const [search, setSearch]       = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [addedIds, setAddedIds]   = useState<Set<string>>(new Set());
  const [toast, setToast]         = useState<string | null>(null);
  const [sponsored, setSponsored] = useState<SponsoredSlot[]>([]);
  const [bundles, setBundles]     = useState<BundleDeal[]>([]);
  const userSession = useRef(typeof window !== "undefined" ? getSession() : "ssr");

  useEffect(() => {
    fetchProducts().then((p) => { setProducts(p); setLoading(false); });

    // Supabase Realtime — subscribe to product stock changes
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (sbUrl && sbKey && sbKey !== "placeholder") {
      import("@supabase/supabase-js").then(({ createClient }) => {
        const sb = createClient(sbUrl, sbKey);
        const channel = sb.channel("stock-updates")
          .on("postgres_changes", { event: "UPDATE", schema: "public", table: "products" },
            (payload: { new: Record<string, unknown> }) => {
              setProducts((prev) => prev.map((p) => p.id === payload.new.id ? { ...p, stock_units: Number(payload.new.stock_units ?? payload.new.stock_quantity ?? p.stock_units) } : p));
            })
          .subscribe();
        return () => { sb.removeChannel(channel); };
      });

      // Fetch sponsored slots
      import("@supabase/supabase-js").then(({ createClient }) => {
        const sb = createClient(sbUrl, sbKey);
        Promise.resolve(
          sb.from("ad_campaigns").select("id, supplier_id, product_id, cpc_eur, daily_budget_eur, daily_spend_eur").eq("status", "active").order("cpc_eur", { ascending: false }).limit(6)
        ).then(({ data }) => {
          if (!data?.length) return;
          const eligible = data.filter((c) => Number(c.daily_spend_eur) < Number(c.daily_budget_eur));
          const slots: SponsoredSlot[] = eligible.slice(0, 3).map((c, i) => ({ productId: (c.product_id as string) ?? null, campaignId: c.id as string, cpcEur: Number(c.cpc_eur), position: (i + 1) as 1 | 2 | 3, supplierName: c.supplier_id as string }));
          if (slots.length) setSponsored(slots);
        }).catch(() => {});
      });

      // Fetch bundle deals
      import("@supabase/supabase-js").then(({ createClient }) => {
        const sb = createClient(sbUrl, sbKey);
        Promise.resolve(
          sb.from("bundle_campaigns").select("id, name, bundle_price_eur, bundle_discount_percent").eq("status", "active").limit(2)
        ).then(({ data }) => {
          if (data?.length) setBundles(data as BundleDeal[]);
        }).catch(() => {});
      });
    }
  }, []);

  const handleAddToCart = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      cart.addItem({ productId: product.id, name: product.name, brand: product.brand, size: product.size ?? "", price: product.current_price, originalPrice: product.original_price, image: (product as unknown as Record<string, string>).image_url || BRAND_IMG[product.brand] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80", category: product.category });
      setToast(`${product.brand} ${product.name} ajouté ✓`);
      setTimeout(() => setToast(null), 2500);
    }
    setAddedIds((prev) => new Set(prev).add(id));
    setTimeout(() => setAddedIds((prev) => { const s = new Set(prev); s.delete(id); return s; }), 1500);
  };

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.brand.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || (p.category ?? "").toLowerCase().includes(q));
    }
    if (category !== "all") {
      list = list.filter((p) => {
        const c = (p.category ?? "").toLowerCase();
        if (category === "entretien") return c === "entretien" || c === "cleaning";
        if (category === "alimentation") return c === "alimentation" || c === "food";
        return c === category;
      });
    }
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

  const totalSavings = useMemo(() => filtered.reduce((sum, p) => sum + (p.original_price - p.current_price), 0), [filtered]);

  return (
    <div className="min-h-screen bg-green-50">
      <div className="max-w-sm mx-auto bg-white min-h-screen pb-6 shadow-md">

        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="bg-green-800 px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-8 h-8 bg-white/10 rounded-[6px] flex items-center justify-center">
              <ChevronLeft size={18} className="text-white" />
            </Link>
            <span className="text-white font-display font-bold text-base flex-1">
              {loading ? "Chargement…" : `${filtered.length} offres surplus`}
            </span>
            <button
              onClick={() => setShowSearch((v) => !v)}
              className="w-8 h-8 bg-white/10 rounded-[6px] flex items-center justify-center"
            >
              <Search size={15} className="text-white" />
            </button>
            <button className="w-8 h-8 bg-white/10 rounded-[6px] flex items-center justify-center">
              <SlidersHorizontal size={15} className="text-white" />
            </button>
          </div>

          {/* Search input — collapsible */}
          {showSearch && (
            <div className="mt-2 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("deals.search")}
                className="w-full bg-white rounded-[12px] pl-9 pr-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* ── SUBCAT CHIPS ──────────────────────────────────────────────── */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  category === c.key
                    ? "bg-green-100 border border-green-500 text-green-800"
                    : "bg-ink-100 text-ink-500 border border-transparent"
                }`}
              >
                <span>{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── SORT BAR ──────────────────────────────────────────────────── */}
        <div className="px-4 py-2 flex items-center justify-between">
          <p className="text-[11px] text-ink-400">
            {loading ? "…" : <><span className="font-bold text-ink-700">{filtered.length}</span> produits · Écon. <span className="font-bold text-green-500">€{totalSavings.toFixed(0)}</span></>}
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="text-xs font-semibold text-ink-700 bg-ink-100 border-0 rounded-[10px] px-3 py-2 focus:outline-none cursor-pointer"
          >
            {SORT_KEYS.map((s) => <option key={s.key} value={s.key}>{t(s.tKey)}</option>)}
          </select>
        </div>

        {/* ── PRODUCT GRID ──────────────────────────────────────────────── */}
        <div className="px-4">
          {loading ? (
            <ProductGridSkeleton count={6} />
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">📦</p>
              <p className="font-display font-bold text-ink-700 text-lg mb-2">{t("deals.empty.no-products")}</p>
              <p className="text-ink-400 text-sm">{t("deals.empty.no-products-sub")}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">🔍</p>
              <p className="font-display font-bold text-ink-700 text-lg mb-2">{t("deals.empty.no-results")}</p>
              <button onClick={() => { setCategory("all"); setSearch(""); }} className="bg-green-800 text-white font-bold px-6 py-2.5 rounded-full text-sm mt-3">
                {t("deals.empty.reset")}
              </button>
            </div>
          ) : (
            <>
              {/* Sponsored slots */}
              {sponsored.length > 0 && (
                <>
                  <p className="text-[10px] font-bold text-ink-300 uppercase tracking-widest mb-2">
                    {t("deals.sponsored")}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {sponsored.slice(0, 2).map((slot) => {
                      const product = (slot.productId ? products.find((p) => p.id === slot.productId) : null) ?? filtered[slot.position - 1] ?? filtered[0];
                      if (!product) return null;
                      return (
                        <SponsoredCard key={slot.campaignId} product={product} slot={slot} userSession={userSession.current} onAddToCart={handleAddToCart} added={addedIds.has(product.id)} />
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 border-t border-ink-100" />
                    <span className="text-[10px] font-bold text-ink-300 uppercase tracking-widest">{t("deals.sponsored-other")}</span>
                    <div className="flex-1 border-t border-ink-100" />
                  </div>
                </>
              )}

              {/* Bundle deals */}
              {bundles.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-ink-300 uppercase tracking-widest mb-2">Bundles du Moment</p>
                  <div className="space-y-3">
                    {bundles.map((b) => {
                      const originalPrice = Number(b.bundle_price_eur) / (1 - Number(b.bundle_discount_percent) / 100);
                      return (
                        <div key={b.id} className="bg-white rounded-[20px] border border-[#7C3AED]/20 overflow-hidden shadow-xs">
                          <div className="bg-[#7C3AED] px-4 py-2 flex items-center gap-2">
                            <span className="text-white text-[10px] font-black uppercase tracking-wider">BUNDLE</span>
                            <span className="text-white text-[10px] font-bold">-{b.bundle_discount_percent}%</span>
                          </div>
                          <div className="p-4 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-ink-900 text-sm mb-1 leading-snug">{b.name}</p>
                              <div className="flex items-baseline gap-2">
                                <span className="font-black text-ink-900 text-lg">€{Number(b.bundle_price_eur).toFixed(2)}</span>
                                <span className="text-ink-300 text-xs line-through">€{originalPrice.toFixed(2)}</span>
                              </div>
                            </div>
                            <button className="bg-[#7C3AED] text-white font-bold text-xs px-4 py-2.5 rounded-full hover:bg-[#6D28D9] transition-colors whitespace-nowrap">
                              Ajouter →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 border-t border-ink-100" />
                    <span className="text-[10px] font-bold text-ink-300 uppercase tracking-widest">Toutes les offres</span>
                    <div className="flex-1 border-t border-ink-100" />
                  </div>
                </div>
              )}

              {/* Organic products grid */}
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((p) => (
                  <DealsCard key={p.id} product={p} onAdd={handleAddToCart} added={addedIds.has(p.id)} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── TOAST ─────────────────────────────────────────────────────── */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div className="bg-green-800 text-white rounded-full shadow-xl px-5 py-2.5 text-xs font-semibold whitespace-nowrap">
              ✓ {toast}
            </div>
          </div>
        )}

        {/* ── STICKY CART BAR ───────────────────────────────────────────── */}
        {cart.itemCount > 0 && !toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <Link href="/cart" className="flex items-center gap-3 bg-green-800 text-white rounded-2xl shadow-xl px-5 py-3.5">
              <ShoppingCart size={16} />
              <div>
                <p className="font-bold text-sm">{cart.itemCount} {cart.itemCount > 1 ? t("cart.articles") : t("cart.article")} · €{cart.subtotal.toFixed(2)}</p>
                <p className="text-white/60 text-[10px]">Économies -{cart.totalSavings.toFixed(2)} €</p>
              </div>
              <ChevronLeft size={16} className="rotate-180 ml-1 text-green-400" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
