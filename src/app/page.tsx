"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart, Heart, Search, Bell, User, LayoutGrid,
  ChevronDown, Plus, Home as HomeIcon, Grid, Bookmark, Star,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import ProductImage from "@/components/ui/ProductImage";
import { ProductCardSkeleton } from "@/components/ui/Skeletons";
import { CATEGORY_REPRESENTATIVE_EANS } from "@/lib/openFoodFacts";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  brand: string;
  name: string;
  price: number;
  originalPrice: number;
  savings: number;
  savingsPct: number;
  rating: number;
  reviews: number;
  img: string;
  badge?: string;
  isNew?: boolean;
  freeShipping?: boolean;
  category?: string;
  ean?: string;
  image_url?: string;
}

// ─── Static Data ────────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  { id: "1", brand: "Ariel", name: "Ariel Pods Color & Style, 156 lavages", price: 28.99, originalPrice: 34.99, savings: 6.00, savingsPct: 17, rating: 4.8, reviews: 28, img: "https://images.unsplash.com/photo-1585670080336-57b8a9b7e461?w=400&q=80", badge: "Économie Instantanée", freeShipping: true, category: "entretien" },
  { id: "2", brand: "Nestlé", name: "Nescafé Gold Blend, Café Soluble Premium, 200g × 3", price: 30.39, originalPrice: 36.99, savings: 6.60, savingsPct: 18, rating: 4.7, reviews: 871, img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80", badge: "Économie Instantanée", isNew: true, freeShipping: true, category: "alimentation" },
  { id: "3", brand: "Colgate", name: "Colgate Max White Ultra, Dentifrice, 150ml × 8", price: 17.99, originalPrice: 21.99, savings: 4.00, savingsPct: 18, rating: 4.6, reviews: 1196, img: "https://images.unsplash.com/photo-1571782742078-30d6c6c5b3d1?w=400&q=80", badge: "Stock Limité", freeShipping: true, category: "hygiene" },
  { id: "4", brand: "Dove", name: "Dove Gel Douche Sensitive, 250ml × 6", price: 14.49, originalPrice: 19.99, savings: 5.50, savingsPct: 28, rating: 4.5, reviews: 412, img: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&q=80", badge: "Économie Instantanée", freeShipping: false, category: "hygiene" },
  { id: "5", brand: "Kellogg's", name: "Kellogg's Corn Flakes, Format Familial, 1kg × 2", price: 11.99, originalPrice: 15.99, savings: 4.00, savingsPct: 25, rating: 4.4, reviews: 234, img: "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=400&q=80", badge: "Promo Flash", isNew: true, freeShipping: true, category: "alimentation" },
  { id: "6", brand: "Nestlé", name: "Nestlé Fitness Céréal Bars, 12 × 23.5g", price: 8.99, originalPrice: 12.99, savings: 4.00, savingsPct: 31, rating: 4.3, reviews: 178, img: "https://images.unsplash.com/photo-1517093728584-720867594c6b?w=400&q=80", badge: "Offre Surplus", freeShipping: false, category: "alimentation" },
  { id: "7", brand: "Gillette", name: "Gillette Fusion5 ProGlide, 12 Recharges", price: 22.49, originalPrice: 29.99, savings: 7.50, savingsPct: 25, rating: 4.7, reviews: 654, img: "https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=400&q=80", badge: "Économie Instantanée", freeShipping: true, category: "hygiene" },
  { id: "8", brand: "L'Oréal", name: "L'Oréal Elvive, Shampooing + Soin, 400ml × 4", price: 16.99, originalPrice: 23.99, savings: 7.00, savingsPct: 29, rating: 4.6, reviews: 389, img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80", badge: "Stock Limité", isNew: true, freeShipping: true, category: "beaute" },
];

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

function dbRowToProduct(row: Record<string, unknown>, idx: number): Product {
  const orig  = Number(row.price_retail_eur ?? 0);
  const curr  = Number(row.price_surplus_eur ?? 0);
  const brand = String(row.brand ?? "");
  return {
    id: String(row.id ?? idx),
    brand,
    name: [row.name, row.size].filter(Boolean).join(" — "),
    price: curr,
    originalPrice: orig,
    savings: parseFloat((orig - curr).toFixed(2)),
    savingsPct: orig > 0 ? Math.round(((orig - curr) / orig) * 100) : 0,
    rating: 4.5,
    reviews: 0,
    img: String(row.image_url || BRAND_IMG[brand] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80"),
    badge: "Offre Surplus",
    freeShipping: curr < 15,
    category: String(row.category ?? ""),
    ean: row.ean ? String(row.ean) : undefined,
    image_url: row.image_url ? String(row.image_url) : undefined,
  };
}

// ─── Category pills with emoji ─────────────────────────────────────────────────

const CAT_PILLS = [
  { key: "all",           label: "Tout",        emoji: "⭐", bg: "#1D4D35" },
  { key: "hygiene",       label: "Hygiène",     emoji: "🧴", bg: "#7C3AED" },
  { key: "alimentation",  label: "Alim.",       emoji: "🍝", bg: "#2E7A50" },
  { key: "entretien",     label: "Entretien",   emoji: "🧹", bg: "#1E40AF" },
  { key: "beaute",        label: "Beauté",      emoji: "💄", bg: "#BE185D" },
  { key: "boissons",      label: "Boissons",    emoji: "💧", bg: "#0369A1" },
  { key: "bebe",          label: "Bébé",        emoji: "👶", bg: "#DC2626" },
  { key: "animaux",       label: "Animaux",     emoji: "🐾", bg: "#92400E" },
  { key: "sport",         label: "Sport",       emoji: "⚽", bg: "#065F46" },
  { key: "pharmacie",     label: "Pharmacie",   emoji: "💊", bg: "#7E22CE" },
  { key: "electromenager",label: "Électro",     emoji: "🔌", bg: "#1E3A5F" },
];

const PROMO_CARDS = [
  { label: "Hygiène & Beauté", emoji: "🧴", pct: 58, ean: CATEGORY_REPRESENTATIVE_EANS.hygiene,       gradient: "linear-gradient(135deg, #1D4D35 0%, #2E7A50 100%)" },
  { label: "Alimentation",     emoji: "🍝", pct: 45, ean: CATEGORY_REPRESENTATIVE_EANS.alimentaire,   gradient: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)" },
  { label: "Entretien Maison", emoji: "🧹", pct: 62, ean: CATEGORY_REPRESENTATIVE_EANS.entretien,     gradient: "linear-gradient(135deg, #0284C7 0%, #075985 100%)" },
  { label: "Bébé & Enfants",   emoji: "👶", pct: 50, ean: CATEGORY_REPRESENTATIVE_EANS.bebe,          gradient: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function useCountdown(targetSeconds: number) {
  const [secs, setSecs] = useState(targetSeconds);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  return { h: Math.floor(secs / 3600), m: Math.floor((secs % 3600) / 60), s: secs % 60 };
}

function pad2(n: number) { return String(n).padStart(2, "0"); }

// ─── Mini product card for horizontal scroll ───────────────────────────────────

function MiniCard({ product, onAdd, added }: { product: Product; onAdd: (p: Product) => void; added: boolean }) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="shrink-0 w-[150px] bg-white rounded-[20px] shadow-sm overflow-hidden">
      {/* Image area */}
      <div className="h-[118px] relative">
        {product.savingsPct >= 10 && (
          <span className="absolute top-2 left-2 z-10 text-[10px] font-black text-discount-red bg-discount-bg px-2 py-0.5 rounded-full">
            -{product.savingsPct}%
          </span>
        )}
        <button
          onClick={() => setLiked((l) => !l)}
          className="absolute top-2 right-2 z-10 w-6 h-6 bg-white rounded-[6px] flex items-center justify-center shadow-sm"
        >
          <Heart size={11} className={liked ? "fill-red-500 text-red-500" : "text-gray-300"} />
        </button>
        <ProductImage imageUrl={product.image_url} ean={product.ean} name={product.name} className="w-full h-full" />
      </div>
      {/* Body */}
      <div className="p-3">
        <p className="text-[9px] font-black text-ink-400 uppercase tracking-wider mb-0.5 truncate">{product.brand}</p>
        <p className="text-[13px] font-semibold text-ink-900 leading-tight line-clamp-2 mb-2 min-h-[2.5rem]">{product.name}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-800 font-black text-[15px] leading-none">€{product.price.toFixed(2)}</p>
            <p className="text-ink-300 text-[10px] line-through">€{product.originalPrice.toFixed(2)}</p>
          </div>
          <button
            onClick={() => onAdd(product)}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              added ? "bg-green-500 scale-95" : "bg-green-800 hover:bg-green-700"
            }`}
          >
            {added ? <span className="text-white text-[10px] font-black">✓</span> : <Plus size={14} className="text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const { t } = useI18n();
  const { addItem, items } = useCart();
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [catImages, setCatImages] = useState<Record<string, string>>({});
  const [promoImages, setPromoImages] = useState<Record<string, string>>({});
  const { h, m, s } = useCountdown(4 * 3600 + 22 * 60 + 15);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  // Supabase fetch
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) { setLoadingProducts(false); return; }
    import("@supabase/supabase-js").then(({ createClient }) => {
      const sb = createClient(url, key);
      Promise.resolve(
        sb.from("products")
          .select("id, brand, name, price_retail_eur, price_surplus_eur, discount_percent, stock_units, image_url, category, ean")
          .eq("is_active", true).gt("stock_units", 0)
          .order("discount_percent", { ascending: false }).limit(8)
      ).then(({ data }) => {
        if (data?.length) {
          setDbProducts((data as Record<string, unknown>[]).map((r, i) => dbRowToProduct(r, i)).sort((a, b) => b.savingsPct - a.savingsPct));
        }
        setLoadingProducts(false);
      }).catch(() => { setLoadingProducts(false); });
    });
  }, []);

  // Fetch category representative images (Fix 3)
  useEffect(() => {
    const entries = Object.entries(CATEGORY_REPRESENTATIVE_EANS);
    Promise.allSettled(
      entries.map(([cat, ean]) =>
        fetch(`/api/product-image?ean=${encodeURIComponent(ean)}`)
          .then((r) => r.json())
          .then((d) => ({ cat, url: d.url as string | null }))
          .catch(() => ({ cat, url: null }))
      )
    ).then((results) => {
      const map: Record<string, string> = {};
      for (const r of results) {
        if (r.status === "fulfilled" && r.value.url) map[r.value.cat] = r.value.url;
      }
      setCatImages(map);
    });
  }, []);

  // Fetch promo card images (Fix 4)
  useEffect(() => {
    Promise.allSettled(
      PROMO_CARDS.map((c) =>
        fetch(`/api/product-image?ean=${encodeURIComponent(c.ean)}`)
          .then((r) => r.json())
          .then((d) => ({ label: c.label, url: d.url as string | null }))
          .catch(() => ({ label: c.label, url: null }))
      )
    ).then((results) => {
      const map: Record<string, string> = {};
      for (const r of results) {
        if (r.status === "fulfilled" && r.value.url) map[r.value.label] = r.value.url;
      }
      setPromoImages(map);
    });
  }, []);

  const displayProducts = dbProducts.length ? dbProducts : PRODUCTS;
  const filteredProducts = activeCategory === "all"
    ? displayProducts
    : displayProducts.filter((p) => p.category === activeCategory);

  // Fix 5: hero = best deal (highest savings %)
  const heroProduct = [...displayProducts].sort((a, b) => b.savingsPct - a.savingsPct)[0];

  const handleAdd = (product: Product) => {
    addItem({ productId: product.id, name: product.name, brand: product.brand, size: "", price: product.price, originalPrice: product.originalPrice, image: product.img, category: product.category ?? "general" });
    setAddedIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => setAddedIds((prev) => { const s = new Set(prev); s.delete(product.id); return s; }), 1500);
  };

  return (
    <div className="min-h-screen bg-green-50">
      <div className="max-w-sm mx-auto bg-white min-h-screen relative pb-20 shadow-md">

        {/* ── TOPBAR ─────────────────────────────────────────────────────── */}
        <div className="bg-green-800 px-4 pt-3 pb-3">
          {/* Row 1 */}
          <div className="flex items-center gap-2 mb-3">
            <button className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 shrink-0">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white text-xs font-medium">75001 Paris</span>
              <ChevronDown size={11} className="text-white/60" />
            </button>
            <span className="text-white/50 text-xs flex-1 text-center font-display font-bold tracking-tight">
              fulflo<span className="text-green-400">.</span>
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button className="w-8 h-8 bg-white/10 rounded-[6px] flex items-center justify-center">
                <Bell size={15} className="text-white" />
              </button>
              <Link href="/account" className="w-8 h-8 bg-white/10 rounded-[6px] flex items-center justify-center">
                <User size={15} className="text-white" />
              </Link>
            </div>
          </div>
          {/* Row 2: search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full bg-white rounded-[14px] pl-9 pr-10 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none shadow-md"
              placeholder="Chercher des produits surplus..."
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2">
              <LayoutGrid size={15} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* ── TICKER ─────────────────────────────────────────────────────── */}
        <div className="bg-green-900 py-2 overflow-hidden">
          <div className="ticker-track whitespace-nowrap text-[11px] text-white/60 font-medium inline-flex gap-8">
            {[...Array(4)].map((_, i) => (
              <span key={i}>🚚 Livraison offerte dès 49€ · Surplus fabricant certifié · Grandes marques à -70% · </span>
            ))}
          </div>
        </div>

        {/* ── HERO CARD ──────────────────────────────────────────────────── */}
        <div className="px-4 pt-4 pb-2">
          <div className="rounded-[28px] overflow-hidden" style={{ background: "linear-gradient(135deg, #1D4D35 0%, #246040 100%)" }}>
            <div className="relative p-6 pb-7">
              {/* Hero product image — best deal */}
              <div className="absolute top-3 right-3 w-[88px] h-[88px] animate-float select-none">
                {heroProduct ? (
                  <ProductImage imageUrl={heroProduct.image_url} ean={heroProduct.ean} name={heroProduct.name} className="w-full h-full rounded-[16px] bg-white/10" />
                ) : (
                  <span className="text-5xl flex items-center justify-center w-full h-full">🛒</span>
                )}
              </div>

              {/* Flash sale pill */}
              <div className="inline-flex items-center gap-1.5 bg-discount-red text-white text-[10px] font-black px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                ⚡ FLASH SALE
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-2 mb-3">
                {[{ v: pad2(h), l: "h" }, { v: pad2(m), l: "m" }, { v: pad2(s), l: "s" }].map(({ v, l }) => (
                  <div key={l} className="flex items-center gap-1">
                    <span className="bg-white/15 text-white font-black text-base px-2.5 py-1 rounded-[8px] tabular-nums min-w-[2.5rem] text-center">{v}</span>
                    <span className="text-white/50 text-xs">{l}</span>
                  </div>
                ))}
              </div>

              <p className="text-white/60 text-sm mb-0.5">Jusqu&apos;à</p>
              <h1 className="font-display font-black leading-none mb-1" style={{ fontSize: 42 }}>
                <span className="text-green-400">-70%</span>
                <span className="text-white"> Off</span>
              </h1>
              <p className="text-white/50 text-sm mt-1 mb-5">Surplus direct fabricant certifié</p>

              <Link
                href="/deals"
                className="inline-flex items-center gap-2 bg-green-500 text-white font-bold text-sm px-6 py-2.5 rounded-full"
                style={{ boxShadow: "0 8px 28px rgba(61,184,122,.40)" }}
              >
                Découvrir les offres →
              </Link>

              {/* Dots */}
              <div className="flex gap-2 mt-6">
                <div className="h-1.5 w-6 bg-white rounded-full" />
                <div className="h-1.5 w-2 bg-white/30 rounded-full" />
                <div className="h-1.5 w-2 bg-white/30 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* ── CATEGORY PILLS ─────────────────────────────────────────────── */}
        <div className="px-4 pt-5 pb-1">
          <h2 className="font-display font-bold text-ink-900 text-sm mb-3">Explorer par catégorie</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {CAT_PILLS.map((c) => (
              <button
                key={c.key}
                onClick={() => setActiveCategory(c.key)}
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <div
                  className="w-[62px] h-[62px] rounded-[14px] overflow-hidden transition-all relative"
                  style={{
                    background: c.bg,
                    boxShadow: activeCategory === c.key ? `0 4px 16px ${c.bg}55` : "none",
                    transform: activeCategory === c.key ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  {catImages[c.key] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={catImages[c.key]} alt={c.label} className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-2xl">{c.emoji}</span>
                  )}
                </div>
                <span className={`text-[11px] font-display font-medium whitespace-nowrap ${activeCategory === c.key ? "text-green-700 font-bold" : "text-ink-500"}`}>
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── PROMO GRID ─────────────────────────────────────────────────── */}
        <div className="px-4 pt-5 pb-1">
          <h2 className="font-display font-bold text-ink-900 text-sm mb-3">Meilleures catégories</h2>
          <div className="grid grid-cols-2 gap-3">
            {PROMO_CARDS.map((p) => (
              <Link href="/deals" key={p.label}>
                <div className="rounded-[20px] p-4 relative overflow-hidden h-[110px]" style={{ background: p.gradient }}>
                  {/* Real product image for this category */}
                  <div className="absolute top-2 right-2 w-[54px] h-[54px] rounded-[10px] overflow-hidden bg-white/15">
                    {promoImages[p.label] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={promoImages[p.label]} alt={p.label} className="w-full h-full object-contain p-1.5" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-2xl">{p.emoji}</span>
                    )}
                  </div>
                  <p className="text-white/70 text-xs font-medium mb-1">{p.label}</p>
                  <p className="font-display font-black text-white leading-none" style={{ fontSize: 36 }}>-{p.pct}%</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── PRODUCT SCROLL ─────────────────────────────────────────────── */}
        <div className="pt-5 pb-2">
          <div className="px-4 flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-ink-900 text-sm">
              Meilleures offres
              {activeCategory !== "all" && <span className="text-green-500 ml-1">· {CAT_PILLS.find((c) => c.key === activeCategory)?.label}</span>}
            </h2>
            <Link href="/deals" className="text-green-600 text-xs font-semibold">Tout voir →</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pl-4 pr-4 pb-2 scrollbar-hide">
            {loadingProducts
              ? Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : (filteredProducts.length ? filteredProducts : displayProducts).map((p) => (
                  <MiniCard key={p.id} product={p} onAdd={handleAdd} added={addedIds.has(p.id)} />
                ))
            }
          </div>
        </div>

        {/* ── SAVINGS SECTION ────────────────────────────────────────────── */}
        <div className="px-4 pt-4 pb-1">
          <div className="bg-green-50 rounded-[20px] p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-200 rounded-[14px] flex items-center justify-center text-2xl shrink-0">♻️</div>
            <div>
              <p className="font-display font-bold text-green-800 text-sm">Économisez sans gaspillage</p>
              <p className="text-ink-400 text-xs mt-0.5">Achetez le surplus CPG avant destruction. 100% certifié.</p>
            </div>
          </div>
        </div>

        {/* ── STARS / SOCIAL PROOF ───────────────────────────────────────── */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-1 justify-center mb-1">
            {[1,2,3,4,5].map((i) => <Star key={i} size={14} className="text-gold fill-gold" />)}
          </div>
          <p className="text-center text-xs text-ink-400">4.9 · 2 846 avis clients vérifiés</p>
        </div>

        {/* ── SUPPLIER BANNER ────────────────────────────────────────────── */}
        <div className="px-4 pt-5 pb-6">
          <div
            className="rounded-[20px] p-5 flex items-center justify-between gap-4"
            style={{ background: "linear-gradient(135deg, #0F2D1E 0%, #1D4D35 100%)" }}
          >
            <div>
              <p className="text-green-400 text-[10px] font-bold uppercase tracking-widest mb-1">Pour les fournisseurs</p>
              <p className="text-white font-display font-bold text-sm leading-snug">
                Votre surplus mérite mieux que la destruction.
              </p>
            </div>
            <Link
              href="/supplier/login"
              className="shrink-0 bg-white text-green-900 font-bold text-xs px-4 py-2.5 rounded-full whitespace-nowrap hover:bg-green-50 transition-colors"
            >
              Vendre →
            </Link>
          </div>
        </div>

        {/* ── BOTTOM NAV ─────────────────────────────────────────────────── */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-ink-100 px-4 py-2 z-40 flex items-center justify-around">
          <Link href="/" className="flex flex-col items-center gap-1">
            <HomeIcon size={20} className="text-green-700" />
            <span className="text-[10px] text-green-700 font-semibold">Accueil</span>
          </Link>
          <Link href="/deals" className="flex flex-col items-center gap-1">
            <Grid size={20} className="text-ink-300" />
            <span className="text-[10px] text-ink-300">Catégories</span>
          </Link>
          {/* Center cart button */}
          <Link href="/cart" className="flex flex-col items-center -mt-5">
            <div className="relative w-14 h-14 bg-green-800 rounded-[16px] flex items-center justify-center shadow-lg shadow-green-900/30">
              <ShoppingCart size={22} className="text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-discount-red text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] text-ink-300 mt-1">Panier</span>
          </Link>
          <button className="flex flex-col items-center gap-1">
            <Bookmark size={20} className="text-ink-300" />
            <span className="text-[10px] text-ink-300">Favoris</span>
          </button>
          <Link href="/account" className="flex flex-col items-center gap-1">
            <User size={20} className="text-ink-300" />
            <span className="text-[10px] text-ink-300">Profil</span>
          </Link>
        </nav>

      </div>
    </div>
  );
}
