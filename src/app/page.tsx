"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart, Heart, Search, Bell, User,
  ChevronDown, Plus, Home as HomeIcon, Grid, Bookmark,
  Package, Truck, ShieldCheck, ArrowRight, Menu, X,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import ProductImage from "@/components/ui/ProductImage";
import { ProductCardSkeleton } from "@/components/ui/Skeletons";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  brand: string;
  name: string;
  price: number;
  originalPrice: number;
  savings: number;
  savingsPct: number;
  img: string;
  badge?: string;
  isNew?: boolean;
  freeShipping?: boolean;
  category?: string;
  ean?: string;
  image_url?: string;
  expiry_date?: string;
}

// ─── Static Data ────────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  { id: "1", brand: "Coslys", name: "Lessive Liquide Bio, 2L × 3", price: 19.99, originalPrice: 29.99, savings: 10.00, savingsPct: 33, img: "https://images.unsplash.com/photo-1585670080336-57b8a9b7e461?w=400&q=80", badge: "Économie Instantanée", freeShipping: true, category: "entretien" },
  { id: "2", brand: "Favrichon", name: "Muesli Croustillant Bio, 500g × 4", price: 14.99, originalPrice: 23.96, savings: 8.97, savingsPct: 37, img: "https://images.unsplash.com/photo-1517093728584-720867594c6b?w=400&q=80", badge: "Économie Instantanée", isNew: true, freeShipping: true, category: "alimentation" },
  { id: "3", brand: "Lamazuna", name: "Dentifrice Solide Bio, 4 × 65g", price: 12.99, originalPrice: 19.96, savings: 6.97, savingsPct: 35, img: "https://images.unsplash.com/photo-1571782742078-30d6c6c5b3d1?w=400&q=80", badge: "Stock Limité", freeShipping: true, category: "hygiene" },
  { id: "4", brand: "Melvita", name: "Gel Douche Bio Rose, 200ml × 6", price: 18.49, originalPrice: 29.94, savings: 11.45, savingsPct: 38, img: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&q=80", badge: "Économie Instantanée", freeShipping: false, category: "hygiene" },
  { id: "5", brand: "Alpina Savoie", name: "Flocons Avoine Bio, 750g × 3", price: 9.99, originalPrice: 14.97, savings: 4.98, savingsPct: 33, img: "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=400&q=80", badge: "Promo Flash", isNew: true, freeShipping: true, category: "alimentation" },
  { id: "6", brand: "Michel et Augustin", name: "Biscuits Pur Beurre, 12 × 130g", price: 11.49, originalPrice: 17.88, savings: 6.39, savingsPct: 36, img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80", badge: "Offre Surplus", freeShipping: false, category: "alimentation" },
  { id: "7", brand: "Lamazuna", name: "Rasoir Rechargeable Bio, Pack de 3", price: 16.99, originalPrice: 24.99, savings: 8.00, savingsPct: 32, img: "https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=400&q=80", badge: "Économie Instantanée", freeShipping: true, category: "hygiene" },
  { id: "8", brand: "Melvita", name: "Shampooing + Soin Argan, 200ml × 4", price: 21.99, originalPrice: 31.96, savings: 9.97, savingsPct: 31, img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80", badge: "Stock Limité", isNew: true, freeShipping: true, category: "beaute" },
];

const BRAND_IMG: Record<string, string> = {
  "Coslys":              "https://images.unsplash.com/photo-1585670080336-57b8a9b7e461?w=400&q=80",
  "Favrichon":           "https://images.unsplash.com/photo-1517093728584-720867594c6b?w=400&q=80",
  "Lamazuna":            "https://images.unsplash.com/photo-1571782742078-30d6c6c5b3d1?w=400&q=80",
  "Melvita":             "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&q=80",
  "Alpina Savoie":       "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=400&q=80",
  "Michel et Augustin":  "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80",
  "Cristalline":         "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80",
  "Le Petit Marseillais": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
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
    img: String(row.image_url || BRAND_IMG[brand] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80"),
    badge: "Offre Surplus",
    freeShipping: curr < 15,
    category: String(row.category ?? ""),
    ean: row.ean ? String(row.ean) : undefined,
    image_url: row.image_url ? String(row.image_url) : undefined,
    expiry_date: row.expiry_date ? String(row.expiry_date) : undefined,
  };
}

// ─── Category data ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: "all",           label: "Tout",        emoji: "⭐", bg: "#1D4D35" },
  { key: "hygiene",       label: "Hygiène",     emoji: "🧴", bg: "#7C3AED" },
  { key: "alimentation",  label: "Alimentation", emoji: "🍝", bg: "#2E7A50" },
  { key: "entretien",     label: "Entretien",   emoji: "🧹", bg: "#1E40AF" },
  { key: "beaute",        label: "Beauté",      emoji: "💄", bg: "#BE185D" },
  { key: "boissons",      label: "Boissons",    emoji: "💧", bg: "#0369A1" },
];

const PROMO_CARDS = [
  { label: "Hygiène & Beauté", cat: "hygiene",      pct: 58, imageUrl: "https://images.unsplash.com/photo-1556228578-626d5d5a2c55?w=300&q=80", gradient: "linear-gradient(135deg, #1D4D35 0%, #2E7A50 100%)" },
  { label: "Alimentation Bio", cat: "alimentation",  pct: 45, imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&q=80", gradient: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)" },
  { label: "Entretien Maison", cat: "entretien",     pct: 62, imageUrl: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300&q=80", gradient: "linear-gradient(135deg, #0284C7 0%, #075985 100%)" },
  { label: "Bébé & Enfants",   cat: "bebe",          pct: 50, imageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&q=80", gradient: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────

function useCountdown(targetSeconds: number) {
  const [secs, setSecs] = useState(targetSeconds);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  return { h: Math.floor(secs / 3600), m: Math.floor((secs % 3600) / 60), s: secs % 60 };
}

function pad2(n: number) { return String(n).padStart(2, "0"); }

// ─── Product Card (responsive) ──────────────────────────────────────────────────

function ProductCard({ product, onAdd, added }: { product: Product; onAdd: (p: Product) => void; added: boolean }) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-ink-100/50 card-lift transition-all group">
      {/* Image */}
      <div className="aspect-square relative bg-[#F4FAF6]">
        {product.savingsPct >= 10 && (
          <span className="absolute top-2.5 left-2.5 z-10 text-[11px] font-black text-discount-red bg-discount-bg px-2.5 py-1 rounded-full">
            -{product.savingsPct}%
          </span>
        )}
        {product.isNew && (
          <span className="absolute top-2.5 right-10 z-10 text-[10px] font-bold text-white bg-green-800 px-2 py-0.5 rounded-full">
            Nouveau
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); setLiked((l) => !l); }}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart size={14} className={liked ? "fill-red-500 text-red-500" : "text-gray-400"} />
        </button>
        <ProductImage imageUrl={product.image_url} ean={product.ean} name={product.name} className="w-full h-full" />
      </div>
      {/* Body */}
      <div className="p-3.5">
        <p className="text-[10px] font-black text-ink-400 uppercase tracking-widest mb-1">{product.brand}</p>
        <p className="text-sm font-semibold text-ink-900 leading-snug line-clamp-2 mb-2 min-h-[2.5rem]">{product.name}</p>
        {product.expiry_date && (
          <p className="text-[11px] text-ink-300 mb-2">
            📅 DLC : {new Date(product.expiry_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        )}
        {product.savings > 0 && (
          <p className="text-xs font-semibold text-mint mb-2">Économisez €{product.savings.toFixed(2)}</p>
        )}
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-green-800 font-black text-lg leading-none">€{product.price.toFixed(2)}</p>
            <p className="text-sm text-discount-red/60 line-through">€{product.originalPrice.toFixed(2)}</p>
          </div>
          <button
            onClick={() => onAdd(product)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              added ? "bg-mint scale-95" : "bg-green-800 hover:bg-green-700"
            }`}
          >
            {added ? <span className="text-white text-xs font-black">✓</span> : <Plus size={16} className="text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function Home() {
  const { t } = useI18n();
  const { addItem, items } = useCart();
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
          .select("id, brand, name, price_retail_eur, price_surplus_eur, discount_percent, stock_units, image_url, category, ean, expiry_date")
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

  const displayProducts = dbProducts.length ? dbProducts : PRODUCTS;
  const filteredProducts = activeCategory === "all"
    ? displayProducts
    : displayProducts.filter((p) => p.category === activeCategory);

  const handleAdd = (product: Product) => {
    addItem({ productId: product.id, name: product.name, brand: product.brand, size: "", price: product.price, originalPrice: product.originalPrice, image: product.img, category: product.category ?? "general" });
    setAddedIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => setAddedIds((prev) => { const ns = new Set(prev); ns.delete(product.id); return ns; }), 1500);
  };

  return (
    <div className="min-h-screen bg-[#FAFCFB]">

      {/* ═══════════════════════════════════════════════════════════════════
          DESKTOP HEADER — hidden on mobile
          ═══════════════════════════════════════════════════════════════════ */}
      <header className="hidden md:block sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-ink-100/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Top bar */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1">
              <span className="font-display font-black text-2xl text-green-800 tracking-tight">
                fulflo<span className="text-mint">.</span>
              </span>
            </Link>

            {/* Search */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  className="w-full bg-green-50/60 border border-ink-100/40 rounded-xl pl-11 pr-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint transition-all"
                  placeholder="Chercher des produits surplus..."
                />
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex items-center gap-6">
              <Link href="/deals" className="text-sm font-medium text-ink-500 hover:text-green-800 transition-colors">
                Offres
              </Link>
              <Link href="/how-it-works" className="text-sm font-medium text-ink-500 hover:text-green-800 transition-colors">
                Comment ça marche
              </Link>
              <Link href="/supplier/login" className="text-sm font-medium text-ink-500 hover:text-green-800 transition-colors">
                Fournisseurs
              </Link>
              <Link href="/cart" className="relative">
                <ShoppingCart size={20} className="text-ink-500 hover:text-green-800 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-discount-red text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/account" className="w-9 h-9 bg-green-800 rounded-full flex items-center justify-center">
                <User size={15} className="text-white" />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE HEADER — visible only on mobile
          ═══════════════════════════════════════════════════════════════════ */}
      <header className="md:hidden sticky top-0 z-50 bg-green-800">
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
            </button>
            <span className="font-display font-black text-lg text-white tracking-tight">
              fulflo<span className="text-mint">.</span>
            </span>
            <div className="flex items-center gap-2">
              <Link href="/cart" className="relative">
                <ShoppingCart size={18} className="text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-discount-red text-white text-[8px] font-black rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full bg-white rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
              placeholder="Chercher des produits surplus..."
            />
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="bg-green-900 px-4 py-4 space-y-3 border-t border-white/10">
            <Link href="/deals" className="block text-white text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Offres</Link>
            <Link href="/how-it-works" className="block text-white/70 text-sm" onClick={() => setMobileMenuOpen(false)}>Comment ça marche</Link>
            <Link href="/supplier/login" className="block text-white/70 text-sm" onClick={() => setMobileMenuOpen(false)}>Fournisseurs</Link>
            <Link href="/account" className="block text-white/70 text-sm" onClick={() => setMobileMenuOpen(false)}>Mon compte</Link>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          ANNOUNCEMENT TICKER
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-green-900 py-2 overflow-hidden">
        <div className="ticker-track whitespace-nowrap text-[11px] text-white/60 font-medium inline-flex gap-8">
          {[...Array(4)].map((_, i) => (
            <span key={i}>🚚 Livraison offerte dès 49€ &middot; Surplus fabricant certifié &middot; Marques premium à -40% à -70% &middot; Zéro gaspillage &middot; </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION — responsive: stacked mobile, side-by-side desktop
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-6 md:pt-10 pb-4">
        <div
          className="rounded-2xl md:rounded-3xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #1D4D35 100%)" }}
        >
          <div className="flex flex-col md:flex-row md:items-center">
            {/* Text side */}
            <div className="p-6 md:p-10 lg:p-14 flex-1">
              {/* Flash sale pill */}
              <div className="inline-flex items-center gap-1.5 bg-discount-red text-white text-[10px] font-black px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                ⚡ FLASH SALE
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-2 mb-5">
                {[{ v: pad2(h), l: "h" }, { v: pad2(m), l: "m" }, { v: pad2(s), l: "s" }].map(({ v, l }) => (
                  <div key={l} className="flex items-center gap-1">
                    <span className="bg-white/15 text-white font-black text-base md:text-lg px-2.5 py-1.5 rounded-lg tabular-nums min-w-[2.5rem] text-center">{v}</span>
                    <span className="text-white/50 text-xs">{l}</span>
                  </div>
                ))}
              </div>

              <h1 className="font-display font-black text-white text-3xl md:text-4xl lg:text-5xl leading-[1.1] mb-3">
                Les vraies marques,<br />
                <span className="text-mint">sans le prix.</span>
              </h1>
              <p className="text-white/60 text-sm md:text-base max-w-md mb-6 leading-relaxed">
                Surplus certifiés de Favrichon, Michel et Augustin, Coslys et
                autres marques françaises à -40% à -70%. Livraison 3-5 jours.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/deals"
                  className="inline-flex items-center justify-center gap-2 bg-mint text-white font-bold text-sm px-7 py-3 rounded-xl hover:bg-green-400 transition-colors"
                  style={{ boxShadow: "0 8px 28px rgba(16,185,129,.35)" }}
                >
                  Commencer ma chasse aux trésors
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/supplier/login"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-white/20 transition-colors border border-white/20"
                >
                  Je suis fournisseur
                </Link>
              </div>
            </div>

            {/* Image side — floating product showcase */}
            <div className="hidden md:flex items-center justify-center p-8 lg:p-14 flex-shrink-0 relative" style={{ width: 340 }}>
              {/* Main featured product — large, centered */}
              {displayProducts[0] && (
                <div className="relative w-[200px] h-[200px] lg:w-[220px] lg:h-[220px] bg-white rounded-3xl shadow-2xl overflow-hidden z-20 animate-hero-float">
                  <ProductImage imageUrl={displayProducts[0].image_url} ean={displayProducts[0].ean} name={displayProducts[0].name} className="w-full h-full" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-xs font-bold">{displayProducts[0].brand}</p>
                    <p className="text-mint text-sm font-black">-{displayProducts[0].savingsPct}%</p>
                  </div>
                </div>
              )}
              {/* Floating accent card — top right */}
              {displayProducts[1] && (
                <div className="absolute top-4 right-0 w-[100px] h-[100px] lg:w-[110px] lg:h-[110px] bg-white rounded-2xl shadow-lg overflow-hidden z-10 rotate-6 opacity-80">
                  <ProductImage imageUrl={displayProducts[1].image_url} ean={displayProducts[1].ean} name={displayProducts[1].name} className="w-full h-full" />
                </div>
              )}
              {/* Floating accent card — bottom left */}
              {displayProducts[2] && (
                <div className="absolute bottom-6 left-0 w-[90px] h-[90px] lg:w-[100px] lg:h-[100px] bg-white rounded-2xl shadow-lg overflow-hidden z-10 -rotate-6 opacity-80">
                  <ProductImage imageUrl={displayProducts[2].image_url} ean={displayProducts[2].ean} name={displayProducts[2].name} className="w-full h-full" />
                </div>
              )}
              {/* Savings badge — floating */}
              <div className="absolute top-12 left-4 bg-mint text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg z-30 animate-float">
                Économisez jusqu&apos;à 70%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          TRUST BAR
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Package size={20} />, title: "Surplus certifié", desc: "Directement du fabricant, 100% authentique" },
            { icon: <Truck size={20} />, title: "Livraison 3-5 jours", desc: "Gratuite dès 49€ en France métropolitaine" },
            { icon: <ShieldCheck size={20} />, title: "Zéro artifice", desc: "Pas de faux avis. Prix honnêtes. Transparence totale." },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-ink-100/40">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-800 shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-ink-900">{item.title}</p>
                <p className="text-xs text-ink-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CATEGORY PROMO GRID
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-ink-900 text-lg md:text-xl">Meilleures catégories</h2>
          <Link href="/deals" className="text-mint text-sm font-semibold hover:underline">Tout voir →</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {PROMO_CARDS.map((p) => (
            <Link href={`/deals?cat=${p.cat}`} key={p.label}>
              <div className="rounded-2xl p-5 relative overflow-hidden h-[130px] md:h-[150px] group hover:scale-[1.02] transition-transform" style={{ background: p.gradient }}>
                <div className="absolute top-4 right-4 w-[65px] h-[65px] md:w-[75px] md:h-[75px] rounded-xl overflow-hidden bg-white/15 backdrop-blur-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imageUrl} alt={p.label} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <p className="text-white/70 text-xs font-medium mb-1">{p.label}</p>
                <p className="font-display font-black text-white text-3xl md:text-4xl leading-none">-{p.pct}%</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CATEGORY FILTERS
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-ink-900 text-lg md:text-xl">
            Meilleures offres
            {activeCategory !== "all" && <span className="text-mint ml-2">· {CATEGORIES.find((c) => c.key === activeCategory)?.label}</span>}
          </h2>
          <Link href={activeCategory !== "all" ? `/deals?cat=${activeCategory}` : "/deals"} className="text-mint text-sm font-semibold hover:underline">
            Tout voir →
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={c.key === "all" ? "/deals" : `/deals?cat=${c.key}`}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === c.key
                  ? "bg-green-800 text-white shadow-sm"
                  : "bg-white text-ink-500 border border-ink-100/60 hover:border-green-800/30 hover:text-green-800"
              }`}
            >
              <span>{c.emoji}</span>
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PRODUCT GRID — responsive: 2 cols → 3 cols → 4 cols
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {loadingProducts
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : (filteredProducts.length ? filteredProducts : displayProducts).map((p) => (
                <ProductCard key={p.id} product={p} onAdd={handleAdd} added={addedIds.has(p.id)} />
              ))
          }
        </div>
        <div className="text-center mt-8">
          <Link
            href="/deals"
            className="inline-flex items-center gap-2 bg-green-800 text-white font-bold text-sm px-8 py-3 rounded-xl hover:bg-green-700 transition-colors"
          >
            Voir toutes les offres
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-y border-ink-100/40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <h2 className="font-display font-bold text-ink-900 text-xl md:text-2xl text-center mb-10">Comment ça marche</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", emoji: "🔍", title: "Parcourez les surplus", desc: "Browsez les stocks de marques premium en liquidation. Produits certifiés, prix réduit." },
              { step: "02", emoji: "🛒", title: "Commandez en 2 clics", desc: "Panier simple, checkout fluide. Pas de surprises. Commission FulFlo : 8-12% seulement." },
              { step: "03", emoji: "🚚", title: "Recevez en 3-5 jours", desc: "Expédition directe du fournisseur. Livraison métropole 3-5 jours ouvrés. Suivi temps réel." },
            ].map((item) => (
              <div key={item.step} className="text-center md:text-left">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 rounded-2xl text-2xl mb-4">{item.emoji}</div>
                <p className="text-xs font-black text-mint uppercase tracking-widest mb-2">Étape {item.step}</p>
                <h3 className="font-display font-bold text-ink-900 text-base mb-2">{item.title}</h3>
                <p className="text-sm text-ink-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SUPPLIER CTA
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10">
        <div
          className="rounded-2xl md:rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: "linear-gradient(135deg, #0F2D1E 0%, #1D4D35 100%)" }}
        >
          <div>
            <p className="text-mint text-[10px] font-bold uppercase tracking-widest mb-2">Pour les Partenaires</p>
            <h2 className="font-display font-bold text-white text-xl md:text-2xl leading-snug mb-2">
              Votre surplus mérite mieux que la destruction.
            </h2>
            <p className="text-white/50 text-sm max-w-md">
              Rejoignez FulFlo et transformez vos invendus en revenus. Commission transparente, zéro frais d&apos;entrée.
            </p>
          </div>
          <Link
            href="/supplier/login"
            className="shrink-0 bg-white text-green-900 font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-green-50 transition-colors"
          >
            Devenir fournisseur →
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════════════ */}
      <footer className="bg-green-900 text-white/60 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <span className="font-display font-black text-xl text-white">fulflo<span className="text-mint">.</span></span>
              <p className="text-sm mt-3 leading-relaxed">Surplus de marques premium françaises. Zéro gaspillage, vraies économies.</p>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-3">Acheteurs</p>
              <div className="space-y-2 text-sm">
                <Link href="/deals" className="block hover:text-white transition-colors">Offres</Link>
                <Link href="/how-it-works" className="block hover:text-white transition-colors">Comment ça marche</Link>
                <Link href="/faq" className="block hover:text-white transition-colors">FAQ</Link>
              </div>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-3">Fournisseurs</p>
              <div className="space-y-2 text-sm">
                <Link href="/supplier/login" className="block hover:text-white transition-colors">Espace fournisseur</Link>
                <Link href="/supplier/login" className="block hover:text-white transition-colors">Devenir partenaire</Link>
              </div>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-3">Légal</p>
              <div className="space-y-2 text-sm">
                <Link href="/faq" className="block hover:text-white transition-colors">CGV</Link>
                <Link href="/faq" className="block hover:text-white transition-colors">Politique de confidentialité</Link>
                <Link href="/faq" className="block hover:text-white transition-colors">Mentions légales</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs">
            © 2026 FulFlo SAS · France · Surplus de marques, zéro gaspillage
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE BOTTOM NAV — only on small screens
          ═══════════════════════════════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-ink-100 px-4 py-2 z-40 flex items-center justify-around">
        <Link href="/" className="flex flex-col items-center gap-0.5">
          <HomeIcon size={20} className="text-green-700" />
          <span className="text-[10px] text-green-700 font-semibold">Accueil</span>
        </Link>
        <Link href="/deals" className="flex flex-col items-center gap-0.5">
          <Grid size={20} className="text-ink-300" />
          <span className="text-[10px] text-ink-300">Offres</span>
        </Link>
        <Link href="/cart" className="flex flex-col items-center -mt-4">
          <div className="relative w-12 h-12 bg-green-800 rounded-2xl flex items-center justify-center shadow-lg shadow-green-900/30">
            <ShoppingCart size={20} className="text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-discount-red text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] text-ink-300 mt-0.5">Panier</span>
        </Link>
        <Link href="/faq" className="flex flex-col items-center gap-0.5">
          <Bookmark size={20} className="text-ink-300" />
          <span className="text-[10px] text-ink-300">Favoris</span>
        </Link>
        <Link href="/account" className="flex flex-col items-center gap-0.5">
          <User size={20} className="text-ink-300" />
          <span className="text-[10px] text-ink-300">Profil</span>
        </Link>
      </nav>
    </div>
  );
}
