"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Heart,
  ChevronLeft,
  ChevronRight,
  Star,
  Truck,
  Search,
  MapPin,
  User,
  Menu,
  Tag,
  Zap,
} from "lucide-react";
import HeroEssentials from "@/components/HeroEssentials";

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
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  {
    id: "1",
    brand: "Ariel",
    name: "Ariel Pods Color & Style, Lessive Capsules, 156 lavages",
    price: 28.99,
    originalPrice: 34.99,
    savings: 6.00,
    savingsPct: 17,
    rating: 4.8,
    reviews: 28,
    img: "https://images.unsplash.com/photo-1585670080336-57b8a9b7e461?w=400&q=80",
    badge: "Économie Instantanée",
    freeShipping: true,
  },
  {
    id: "2",
    brand: "Nestlé",
    name: "Nescafé Gold Blend, Café Soluble Premium, 200g × 3",
    price: 30.39,
    originalPrice: 36.99,
    savings: 6.60,
    savingsPct: 18,
    rating: 4.7,
    reviews: 871,
    img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80",
    badge: "Économie Instantanée",
    isNew: true,
    freeShipping: true,
  },
  {
    id: "3",
    brand: "Colgate",
    name: "Colgate Max White Ultra, Dentifrice Blancheur, 150ml × 8",
    price: 17.99,
    originalPrice: 21.99,
    savings: 4.00,
    savingsPct: 18,
    rating: 4.6,
    reviews: 1196,
    img: "https://images.unsplash.com/photo-1571782742078-30d6c6c5b3d1?w=400&q=80",
    badge: "Stock Limité",
    freeShipping: true,
  },
  {
    id: "4",
    brand: "Dove",
    name: "Dove Gel Douche Sensitive, 250ml × 6, Formule Douce",
    price: 14.49,
    originalPrice: 19.99,
    savings: 5.50,
    savingsPct: 28,
    rating: 4.5,
    reviews: 412,
    img: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&q=80",
    badge: "Économie Instantanée",
    freeShipping: false,
  },
  {
    id: "5",
    brand: "Kellogg's",
    name: "Kellogg's Corn Flakes, Format Familial, 1kg × 2",
    price: 11.99,
    originalPrice: 15.99,
    savings: 4.00,
    savingsPct: 25,
    rating: 4.4,
    reviews: 234,
    img: "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=400&q=80",
    badge: "Promo Flash",
    isNew: true,
    freeShipping: true,
  },
  {
    id: "6",
    brand: "Nestlé",
    name: "Nestlé Fitness Céréal Bars, 12 × 23.5g",
    price: 8.99,
    originalPrice: 12.99,
    savings: 4.00,
    savingsPct: 31,
    rating: 4.3,
    reviews: 178,
    img: "https://images.unsplash.com/photo-1517093728584-720867594c6b?w=400&q=80",
    badge: "Offre Surplus",
    freeShipping: false,
  },
  {
    id: "7",
    brand: "Gillette",
    name: "Gillette Fusion5 ProGlide, 12 Recharges",
    price: 22.49,
    originalPrice: 29.99,
    savings: 7.50,
    savingsPct: 25,
    rating: 4.7,
    reviews: 654,
    img: "https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=400&q=80",
    badge: "Économie Instantanée",
    freeShipping: true,
  },
  {
    id: "8",
    brand: "L'Oréal",
    name: "L'Oréal Elvive Extraordinaire, Shampooing + Soin, 400ml × 4",
    price: 16.99,
    originalPrice: 23.99,
    savings: 7.00,
    savingsPct: 29,
    rating: 4.6,
    reviews: 389,
    img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
    badge: "Stock Limité",
    isNew: true,
    freeShipping: true,
  },
];

const FEATURED_SAVINGS = PRODUCTS.slice(0, 4);

// Brand → Unsplash image map (for DB products that have no image_url yet)
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
  const orig = Number(row.original_price ?? 0);
  const curr = Number(row.current_price ?? 0);
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
    img: BRAND_IMG[brand] ?? "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
    badge: "Offre Surplus",
    freeShipping: curr < 15,
  };
}

const CATEGORIES = [
  {
    label: "Hygiène & Beauté",
    desc: "Ariel, Colgate, Dove, Gillette",
    bg: "#1B4332",
    img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
  },
  {
    label: "Alimentation & Boissons",
    desc: "Nestlé, Kellogg's, Mondelez",
    bg: "#065f46",
    img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
  },
  {
    label: "Entretien Maison",
    desc: "Ariel, Flash, Cillit Bang",
    bg: "#047857",
    img: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          className={
            i <= Math.round(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300 fill-gray-300"
          }
        />
      ))}
    </div>
  );
}

function useCountdown(targetSeconds: number) {
  const [secs, setSecs] = useState(targetSeconds);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return { h, m, s };
}

// ─── ProductCard ───────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-white border border-gray-200 flex flex-col h-full group hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative bg-white p-4 flex items-center justify-center" style={{ height: 210 }}>
        {/* Savings badge top-left */}
        {product.savingsPct >= 20 && (
          <span
            className="absolute top-2 left-2 z-10 text-white text-[11px] font-black px-2 py-0.5"
            style={{ background: "#dc2626" }}
          >
            -{product.savingsPct}%
          </span>
        )}
        {/* New badge top-right */}
        {product.isNew && (
          <span
            className="absolute top-2 right-2 z-10 text-white text-[11px] font-black px-2 py-0.5"
            style={{ background: "#1B4332" }}
          >
            NOUVEAU
          </span>
        )}
        <Image
          src={product.img}
          alt={product.name}
          width={170}
          height={170}
          unoptimized
          className="object-contain w-full h-full"
        />
        {/* Heart */}
        <button
          onClick={() => setLiked((l) => !l)}
          className="absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Favoris"
        >
          <Heart size={14} className={liked ? "fill-red-500 text-red-500" : "text-gray-400"} />
        </button>
      </div>

      {/* Body */}
      <div className="px-3 pb-4 flex flex-col flex-1 border-t border-gray-100">
        {/* Brand + badge row */}
        <div className="flex items-center justify-between pt-2 mb-1">
          <span className="text-[11px] font-bold text-[#1B4332] uppercase tracking-wider">
            {product.brand}
          </span>
          {product.badge && (
            <span className="text-[10px] font-bold text-[#10B981] bg-[#ecfdf5] px-1.5 py-0.5 rounded">
              {product.badge}
            </span>
          )}
        </div>

        {/* Name */}
        <p className="text-sm text-gray-800 leading-snug mb-2 flex-1 line-clamp-3">{product.name}</p>

        {/* Stars + reviews */}
        <div className="flex items-center gap-1.5 mb-3">
          <Stars rating={product.rating} />
          <span className="text-[11px] text-[#1B4332] font-semibold">
            ({product.reviews.toLocaleString("fr-FR")})
          </span>
        </div>

        {/* Price block */}
        <div className="mb-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">
              {product.price.toFixed(2).replace(".", ",")} €
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Prix normal{" "}
            <span className="line-through">{product.originalPrice.toFixed(2).replace(".", ",")} €</span>
            {" · "}
            <span className="text-[#1B4332] font-semibold">
              -{product.savings.toFixed(2).replace(".", ",")} €
            </span>
          </p>
        </div>

        {/* Shipping */}
        <div className="flex items-center gap-1 mt-2 mb-3">
          <Truck size={12} className={product.freeShipping ? "text-[#10B981]" : "text-gray-400"} />
          <span className={`text-[11px] font-semibold ${product.freeShipping ? "text-[#10B981]" : "text-gray-400"}`}>
            {product.freeShipping ? "Livraison offerte" : "Livraison 48h"}
          </span>
        </div>

        {/* CTA */}
        <Link
          href="/deals"
          className="block bg-[#1B4332] hover:bg-[#2d6a4f] text-white text-sm font-bold text-center py-2.5 transition-colors"
        >
          Ajouter au panier
        </Link>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [cartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const { h, m, s } = useCountdown(4 * 3600 + 22 * 60 + 15);

  // Fetch top products from Supabase (by discount %) — fallback to static PRODUCTS
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    import("@supabase/supabase-js").then(({ createClient }) => {
      const sb = createClient(url, key);
      Promise.resolve(
        sb.from("products")
          .select("id, brand, name, size, original_price, current_price, stock_units")
          .gt("stock_units", 0)
          .limit(8)
      ).then(({ data }) => {
        if (!data?.length) return;
        const mapped = (data as Record<string, unknown>[])
          .map((row, i) => dbRowToProduct(row, i))
          .sort((a, b) => b.savingsPct - a.savingsPct);
        setDbProducts(mapped);
      }).catch(() => {});
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      {/* ══ 1. ANNOUNCEMENT STRIP ══════════════════════════════════════════════ */}
      <div
        className="bg-[#1B4332] text-white text-center text-xs font-semibold py-2 px-4"
        style={{ minHeight: 36 }}
      >
        <span className="opacity-80">🚚 Livraison offerte dès 49€ · </span>
        <span className="text-[#10B981]">Surplus fabricant certifié</span>
        <span className="opacity-80"> · Grandes marques à -70%</span>
      </div>

      {/* ══ 2. SECONDARY NAV ══════════════════════════════════════════════════ */}
      <div className="bg-[#F9FAFB] border-b border-gray-200 text-xs">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-8 flex items-center justify-end gap-6">
          {[
            { label: "Aide & Contact", href: "#" },
            { label: "Suivi commande", href: "#" },
            { label: "Mon compte", href: "/supplier/login" },
            { label: "Fournisseurs", href: "/supplier/login" },
          ].map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-gray-500 hover:text-[#1B4332] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ══ 3. MAIN NAV ════════════════════════════════════════════════════════ */}
      <nav className="bg-[#1B4332] sticky top-0 z-50 shadow-md">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">

          {/* Mobile menu */}
          <button className="sm:hidden text-white/70 hover:text-white mr-1">
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link href="/" className="text-xl font-black text-white tracking-tight shrink-0">
            fulflo<span className="text-[#10B981]">.</span>
          </Link>

          {/* Categories dropdown button */}
          <button className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-3 py-1.5 rounded transition-colors shrink-0">
            <Menu size={16} />
            Catégories
          </button>

          {/* Search bar */}
          <div className="flex-1 flex items-center max-w-xl">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher parmi 1 200+ produits surplus…"
                className="w-full h-9 pl-4 pr-10 rounded-l text-sm text-gray-800 bg-white border-0 outline-none placeholder-gray-400"
              />
            </div>
            <button className="h-9 px-4 bg-[#10B981] hover:bg-[#059669] text-[#1B4332] font-bold rounded-r flex items-center gap-1.5 transition-colors shrink-0">
              <Search size={16} />
              <span className="hidden sm:inline text-sm">Chercher</span>
            </button>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-4 ml-2 shrink-0">
            <Link href="/supplier/login" className="hidden sm:flex flex-col items-center text-white/80 hover:text-white transition-colors">
              <User size={18} />
              <span className="text-[10px] mt-0.5">Connexion</span>
            </Link>
            <button className="relative flex flex-col items-center text-white/80 hover:text-white transition-colors">
              <ShoppingCart size={18} />
              <span className="text-[10px] mt-0.5">Panier</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#10B981] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ══ 4. LOCATION / UTILITY BAR ══════════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between">
          <div className="flex items-center gap-5 text-xs text-gray-600">
            <button className="flex items-center gap-1.5 hover:text-[#1B4332] transition-colors">
              <MapPin size={13} className="text-[#1B4332]" />
              <span>Livraison vers <strong className="text-gray-900">75001 Paris</strong></span>
            </button>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Truck size={13} className="text-[#10B981]" />
              <span className="text-[#1B4332] font-semibold">Livraison 48h garantie</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500">
            {["Tout", "Hygiène", "Alimentaire", "Entretien", "Beauté"].map((c) => (
              <button key={c} className="hover:text-[#1B4332] font-medium transition-colors">
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ HERO ESSENTIALS BANNER ═════════════════════════════════════════════ */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 mt-4">
        <HeroEssentials />
      </div>

      {/* ══ 5. HERO — 3 COLUMNS ════════════════════════════════════════════════ */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          {/* Left column — main hero */}
          <div
            className="md:col-span-1 relative rounded overflow-hidden flex flex-col justify-end p-6"
            style={{
              background: "linear-gradient(160deg, #1B4332 0%, #2d6a4f 100%)",
              minHeight: 320,
            }}
          >
            {/* Floating product image */}
            <div className="absolute right-4 top-4 w-36 h-36 pointer-events-none">
              <Image
                src={PRODUCTS[0].img}
                alt="Ariel"
                fill
                unoptimized
                className="object-contain drop-shadow-xl"
              />
            </div>
            <div className="relative z-10">
              <span className="inline-block bg-[#10B981] text-[#1B4332] text-[10px] font-black uppercase px-2 py-0.5 mb-3">
                Surplus Direct Fabricant
              </span>
              <h2 className="text-white font-black text-2xl leading-tight uppercase mb-2">
                ESSENTIELS<br />QUOTIDIEN
              </h2>
              <p className="text-white/60 text-sm mb-4">
                -40% à -70% · Grandes marques
              </p>
              <Link
                href="/deals"
                className="inline-flex items-center gap-1 bg-white text-[#1B4332] font-bold text-sm px-4 py-2 rounded hover:bg-[#D1FAE5] transition-colors"
              >
                Voir les offres →
              </Link>
            </div>
          </div>

          {/* Center column */}
          <div
            className="relative rounded overflow-hidden flex flex-col justify-end p-5"
            style={{ background: "#065f46", minHeight: 320 }}
          >
            <div className="absolute right-3 top-3 w-28 h-28 pointer-events-none">
              <Image
                src={PRODUCTS[1].img}
                alt="Nescafé"
                fill
                unoptimized
                className="object-contain drop-shadow-xl"
              />
            </div>
            <div className="relative z-10">
              <p className="text-[#10B981] text-[10px] font-bold uppercase tracking-widest mb-1">Boissons</p>
              <h3 className="text-white font-black text-xl leading-tight mb-1">CAFÉ & INFUSIONS</h3>
              <p className="text-white/60 text-xs mb-3">Nescafé, Carte Noire, Lipton</p>
              <Link href="/deals" className="text-white text-xs font-bold underline underline-offset-2 hover:text-[#10B981] transition-colors">
                Découvrir →
              </Link>
            </div>
          </div>

          {/* Right column */}
          <div
            className="relative rounded overflow-hidden flex flex-col justify-end p-5"
            style={{ background: "#047857", minHeight: 320 }}
          >
            <div className="absolute right-3 top-3 w-28 h-28 pointer-events-none">
              <Image
                src={PRODUCTS[4].img}
                alt="Kelloggs"
                fill
                unoptimized
                className="object-contain drop-shadow-xl"
              />
            </div>
            <div className="relative z-10">
              <p className="text-[#10B981] text-[10px] font-bold uppercase tracking-widest mb-1">Céréales</p>
              <h3 className="text-white font-black text-xl leading-tight mb-1">PETIT-DÉJEUNER</h3>
              <p className="text-white/60 text-xs mb-3">Kellogg's, Nestlé, Quaker</p>
              <Link href="/deals" className="text-white text-xs font-bold underline underline-offset-2 hover:text-[#10B981] transition-colors">
                Découvrir →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ══ 6. FLASH SALE BAR WITH COUNTDOWN ═══════════════════════════════════ */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 mt-4">
        <div
          className="flex items-center justify-between px-5 py-3 rounded"
          style={{ background: "#111827" }}
        >
          <div className="flex items-center gap-3">
            <Zap size={18} className="text-yellow-400 fill-yellow-400 shrink-0" />
            <div>
              <p className="text-yellow-400 text-xs font-black uppercase tracking-widest leading-none">
                Vente Flash
              </p>
              <p className="text-white text-sm font-bold mt-0.5">
                Jusqu&apos;à -70% · Stock limité
              </p>
            </div>
          </div>
          {/* Countdown */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs mr-1">Expire dans</span>
            {[
              { val: h, label: "H" },
              { val: m, label: "M" },
              { val: s, label: "S" },
            ].map(({ val, label }) => (
              <div key={label} className="flex flex-col items-center">
                <span className="bg-[#1B4332] text-white font-black text-lg w-9 h-9 flex items-center justify-center rounded tabular-nums">
                  {String(val).padStart(2, "0")}
                </span>
                <span className="text-gray-500 text-[9px] mt-0.5">{label}</span>
              </div>
            ))}
          </div>
          <Link
            href="/deals"
            className="hidden sm:inline-block bg-yellow-400 text-gray-900 font-black text-sm px-4 py-2 rounded hover:bg-yellow-300 transition-colors"
          >
            Voir les offres
          </Link>
        </div>
      </div>

      {/* ══ 7. PROMO BAR ═══════════════════════════════════════════════════════ */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 mt-3">
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 rounded"
          style={{ background: "#10B981" }}
        >
          <div className="flex items-center gap-3">
            <Tag size={18} className="text-[#1B4332] shrink-0" />
            <p className="text-[#1B4332] font-black text-sm">
              Première commande : <span className="underline">-10€</span> avec le code{" "}
              <span className="bg-[#1B4332] text-white px-2 py-0.5 rounded font-mono tracking-widest text-xs ml-1">
                SURPLUS10
              </span>
            </p>
          </div>
          <Link
            href="/invite"
            className="bg-[#1B4332] text-white font-bold text-sm px-5 py-1.5 rounded hover:bg-[#065f46] transition-colors whitespace-nowrap shrink-0"
          >
            J&apos;en profite →
          </Link>
        </div>
      </div>

      {/* ══ 8. FEATURED SAVINGS BANNER ═════════════════════════════════════════ */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 mt-4">
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <h2 className="font-black text-gray-900 text-sm uppercase tracking-wide">
              Économies du Jour
            </h2>
            <Link href="/deals" className="text-[#1B4332] text-xs font-bold hover:underline">
              Tout voir →
            </Link>
          </div>
          {/* 4 mini product cards — live Supabase data if available */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
            {(dbProducts.length ? dbProducts.slice(0, 4) : FEATURED_SAVINGS).map((p) => (
              <Link
                key={p.id}
                href="/deals"
                className="flex flex-col items-center p-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="relative w-20 h-20 mb-2">
                  <Image
                    src={p.img}
                    alt={p.name}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
                <p className="text-[11px] text-[#1B4332] font-bold uppercase mb-0.5">{p.brand}</p>
                <p className="text-xs text-gray-700 text-center leading-tight line-clamp-2 mb-2">
                  {p.name}
                </p>
                <div className="mt-auto text-center">
                  <span className="text-base font-black text-gray-900">
                    {p.price.toFixed(2).replace(".", ",")} €
                  </span>
                  <p className="text-[10px] text-[#10B981] font-bold">
                    Économisez {p.savings.toFixed(2).replace(".", ",")} €
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ══ 9. PRODUCT GRID ════════════════════════════════════════════════════ */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 mt-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
              Meilleures Offres Surplus
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {(dbProducts.length || PRODUCTS.length)} produits · Mis à jour aujourd&apos;hui
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:inline">Trier par :</span>
            <select className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-700 bg-white outline-none">
              <option>Économies</option>
              <option>Prix croissant</option>
              <option>Mieux notés</option>
              <option>Nouveautés</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {(dbProducts.length ? dbProducts : PRODUCTS).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {/* Load more */}
        <div className="mt-6 flex justify-center">
          <Link
            href="/deals"
            className="bg-[#1B4332] text-white font-bold text-sm px-8 py-3 rounded hover:bg-[#2d6a4f] transition-colors"
          >
            Voir tous les produits →
          </Link>
        </div>
      </div>

      {/* ══ 10. CATEGORY TILES ═════════════════════════════════════════════════ */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 mt-8">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-3">
          Explorer par Catégorie
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href="/deals"
              className="relative rounded overflow-hidden flex flex-col justify-end group"
              style={{ background: cat.bg, minHeight: 160 }}
            >
              {/* Product image top-right */}
              <div className="absolute right-4 top-4 w-24 h-24 pointer-events-none">
                <Image
                  src={cat.img}
                  alt={cat.label}
                  fill
                  unoptimized
                  className="object-contain drop-shadow-xl transition-transform group-hover:scale-110 duration-300"
                />
              </div>
              <div className="relative z-10 p-5">
                <h3 className="text-white font-black text-lg leading-tight">{cat.label}</h3>
                <p className="text-white/60 text-xs mt-0.5 mb-3">{cat.desc}</p>
                <span className="inline-block text-[#10B981] text-xs font-bold group-hover:underline">
                  Voir les offres →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── SUPPLIER CTA ──────────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 mt-6">
        <div className="bg-[#1B4332] rounded p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-[#10B981] text-xs font-bold uppercase tracking-widest mb-1">
              Pour les Marques
            </p>
            <p className="text-white font-black text-xl">
              Votre surplus mérite mieux que la destruction.
            </p>
            <p className="text-white/60 text-sm mt-0.5">
              Commission 15–20% · Brand-safe · Go-live en 48h
            </p>
          </div>
          <Link
            href="/supplier/login"
            className="bg-[#10B981] text-[#1B4332] font-black text-sm px-6 py-2.5 rounded hover:bg-[#D1FAE5] transition-colors whitespace-nowrap shrink-0"
          >
            Devenir Fournisseur →
          </Link>
        </div>
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer className="mt-10 bg-[#1B4332] border-t border-white/10 pt-8 pb-6 px-4">
        <div className="max-w-screen-xl mx-auto">
          {/* Top footer grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
            <div>
              <p className="text-white font-black text-lg mb-3">
                fulflo<span className="text-[#10B981]">.</span>
              </p>
              <p className="text-white/40 text-xs leading-relaxed">
                Europe&apos;s surplus economy platform. Direct fabricant. Certifié.
              </p>
            </div>
            {[
              {
                title: "Acheter",
                links: ["Catalogue", "Flash Sales", "Nouveautés", "Marques"],
              },
              {
                title: "Aide",
                links: ["Livraison & retours", "FAQ", "Contact", "Suivi commande"],
              },
              {
                title: "Entreprise",
                links: ["Fournisseurs", "Devenir partenaire", "Presse", "À propos"],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">
                  {col.title}
                </p>
                <div className="flex flex-col gap-1.5">
                  {col.links.map((l) => (
                    <a key={l} href="#" className="text-white/40 text-xs hover:text-white/80 transition-colors">
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-white/30 text-xs">© 2026 Fulflo SAS · France</p>
            <div className="flex items-center gap-4">
              {["Mentions légales", "CGV", "Confidentialité"].map((l) => (
                <a key={l} href="#" className="text-white/30 text-xs hover:text-white/60 transition-colors">
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
