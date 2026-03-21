"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, Star, Truck } from "lucide-react";

// ─── Product data ──────────────────────────────────────────────────────────────

interface Product {
  id: string;
  brand: string;
  name: string;
  price: number;
  originalPrice: number;
  savings: number;
  rating: number;
  reviews: number;
  img: string;
  badge?: string;
}

const PRODUCTS: Product[] = [
  {
    id: "1",
    brand: "Ariel",
    name: "Ariel Pods Color & Style, Lessive Capsules, 156 lavages",
    price: 28.99,
    originalPrice: 34.99,
    savings: 6.00,
    rating: 4.8,
    reviews: 28,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1WqcYeuYq97DUxakBFtP6OExe6suxFahIFaVsJK6D7P4IxAaomZSzv92GNzpRfRtIpdOWjxBqrvsRVvi6hLJihDTjoFuMvm4x9mYe5I8gSRMo1UIJhlPs1xMlkGyPUescRg5VVVBLVoLCx4kUgHttkuH4lopf0WfyXxQKHu2I-1NOhHVm5BiQL3tOyh5NwP6pJXC0zJWci5bOMGv_7xWzfxEnZj5pcLvyHUwlncmFtw6QFssUXEfJMyB9MDrD_C_K89hCrIfGReKV",
    badge: "Économie Instantanée",
  },
  {
    id: "2",
    brand: "Nestlé",
    name: "Nescafé Gold Blend, Café Soluble Premium, 200g × 3",
    price: 30.39,
    originalPrice: 36.99,
    savings: 6.60,
    rating: 4.7,
    reviews: 871,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEkZtoHBRieF2HglisIFeHBsZwyEvQNhjT_aK29jJUaUiLapXqDHJi_Q1npuKEeerWDiukTzOnHD5QEM_WLHuEQb4NweUJKcHKGHNnE9Xm2QcH58PDemOwS1cKivywIoPruN0s-nQjFa4oo2Q90Hein7rqvF-LDtcEChEwCdVklou2aB1QYb4rTdI7jlY9INFlcigCYMvXBtgtLWrlHXOlJiqD4uzn5ZFtBoAgZIvFzYVs9PqpXgHoPJgt0i6kj3kdSkpITPwlVJ69",
    badge: "Économie Instantanée",
  },
  {
    id: "3",
    brand: "Colgate",
    name: "Colgate Max White Ultra, Dentifrice Blancheur, 150ml, 240-count",
    price: 17.99,
    originalPrice: 21.99,
    savings: 4.00,
    rating: 4.6,
    reviews: 1196,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfPw2tDQ_5HNLOQBNCTmpZ2sgw9iS4URycepczvo0L4T2iof2FlM7iqD_Jwie9imW0juSmaeoXH8wdf9rqJ7s9u3cB5VOroS70SJB_YTaGaB19sUN5uenI29Djg1nt-oEa3th-455zFD8Jta8ucRZl5ZYy1Lb2Zm-AqwalYB4TbelXJT7vw1vYfviNZl8hkyb7Hf5bT7TetYR5S1WfSoi_FoZt53h64aEIh-VFtZwsEynud4G3W3GpZAz8TMLjjWa--CPnvmXhQyvu",
    badge: "Économie Instantanée",
  },
  {
    id: "4",
    brand: "Dove",
    name: "Dove Gel Douche Sensitive, 250ml × 6, Formule Douce",
    price: 14.49,
    originalPrice: 19.99,
    savings: 5.50,
    rating: 4.5,
    reviews: 412,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBoSn2CX3YgHLC2JqfuQBhrvaWRSpJMw76cGgXKHmd2OG-Gx9Ia7CxBgCnT4jFYqMkAZQOFd2l6WJ0D-_9Dd88OLw4F95iewyWNo-Jwc5zA75ktckh-wdlwiu31RO-aojWKTjYaUAIMRM9Qf4iAEO9-ySejtIg6l8lKx1pFRGv2iUExx8kUJT1i5y1gHDwwN2q3ONNgWl0k39dgHQw7cj7nWcIhhj4rld8tsh94mEPbXPHOICeQfof9eZrOszL-VVvRnPhHTIhZzH1u",
    badge: "Économie Instantanée",
  },
  {
    id: "5",
    brand: "Kellogg's",
    name: "Kellogg's Corn Flakes, Format Familial, 1kg × 2",
    price: 11.99,
    originalPrice: 15.99,
    savings: 4.00,
    rating: 4.4,
    reviews: 234,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzaqA1LOz-UMET5Tf0K7rdhQD72yh1LxaScreQQE3dJxn0xKFWVKf-QszvwFAqICf7B2pqikOKFk-xhDhL0bzHDaBvpQskMhMJcV46qJsjkhAeqTYyMIfebcVD-qKxlZFF-7-zx6OHnzbpRdXTxzc5pHQK9lK7WkTThs_3JdnGjld0XgFBVNJ39iHWZzfzrhMdQ3XTR5QpPQbqtpg773rFZ7scZDZyn2StBvPsXJnw_VPbZ9mC4slxofTSX2bJDYGZoJLQPkFds",
    badge: "Économie Instantanée",
  },
  {
    id: "6",
    brand: "Nestlé",
    name: "Nestlé Fitness Cereal Bars, Barres Céréales, 12 × 23.5g",
    price: 8.99,
    originalPrice: 12.99,
    savings: 4.00,
    rating: 4.3,
    reviews: 178,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNLNTLM6R0H_azoATBQ0QFB-cJTD_-zYcG7Aopmf2KacQnUCtciOIgOysyXcOxf8VC0HsN6HPeIu-ydppSKTEaIFInlyqS7tlJM2qyzFdcSIYi7Zw0ObLUHDM_8KUNM6vE7zEPPKOnqHG0XBIHSPGEWl9SzLI8xhzVA5_PT6e_o-gN3gMOwRB1bG1p8nAhsLjRLeJeNpTIz_h8Fxz2JCWtOeyntGyWotQkTK5R9qu8rJN7W1QaOtKD3hGIO_VLabSX8F7y7xU4QPm0",
    badge: "Économie Instantanée",
  },
];

// Banner product images (floating top-right in hero)
const BANNER_IMGS = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAx0_QXl6S5d8-Xo_oAdSwcsEuMB54SanRcp6BNno7og2bFdCNTqwe97JwRMt-rJZ-DBJTxD-45lc5wr7M0D6wQNsHyJkUOnqkN5-TC8cp50r79yAbNhhggCdUhlhrR3b-jtSgSVh95P16gTEF-eDUu_FsHP2NKNRcrVtgwP7CZDgka1NVSmVgun0CQ2L7b6CHjdHFq9Bl4OSGSqPPy1FAUwWX62fSxcb1hfAZzy_Qn7csufiFtlGCvbKiglwW_6eRTEQISzlhnU68V",
    alt: "Ariel",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzaqA1LOz-UMET5Tf0K7rdhQD72yh1LxaScreQQE3dJxn0xKFWVKf-QszvwFAqICf7B2pqikOKFk-xhDhL0bzHDaBvpQskMhMJcV46qJsjkhAeqTYyMIfebcVD-qKxlZFF-7-zx6OHnzbpRdXTxzc5pHQK9lK7WkTThs_3JdnGjld0XgFBVNJ39iHWZzfzrhMdQ3XTR5QpPQbqtpg773rFZ7scZDZyn2StBvPsXJnw_VPbZ9mC4slxofTSX2bJDYGZoJLQPkFds",
    alt: "Kelloggs",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwLforUgcT8qXGGOFmgsY4B5a30-HxzYGM0xUmdlrUgdkLlEC7xbTw7BT4DWmQ8n41YfXTaWQJs6LNjxJFJ78giY8XUgJqDMzml4X4oypl7lOguTCTtoeORXA3QsgKKUidk3vUehFuDlSxYUuL0PSp5yqe_vMaE66_EifXXgJOzxjD18-z2XynhHZFYXIgLalvH3NYDJsAScY_Pc_9RkmZp3IS7V559fAipQFHbmkmduyUHcw5J_8CvYIu890oQ59YddHhgAAQ2dIl",
    alt: "Colgate",
  },
];

// ─── Star rating component ─────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"}
        />
      ))}
    </div>
  );
}

// ─── Product card — Costco style ───────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-white rounded-sm border border-gray-200 flex flex-col h-full">
      {/* Product image */}
      <div className="relative bg-white p-4 flex items-center justify-center" style={{ height: 220 }}>
        <Image
          src={product.img}
          alt={product.name}
          width={180}
          height={180}
          unoptimized
          className="object-contain w-full h-full"
        />
      </div>

      {/* Card body */}
      <div className="px-4 pb-4 flex flex-col flex-1">
        {/* Badge */}
        {product.badge && (
          <span className="inline-block bg-[#10B981] text-white text-[11px] font-bold px-2 py-0.5 rounded-sm mb-2 self-start">
            {product.badge}
          </span>
        )}

        {/* Delivery */}
        <div className="flex items-center gap-1.5 mb-2">
          <Truck size={14} className="text-[#1B4332] shrink-0" />
          <span className="text-[#1B4332] text-sm font-semibold">Livraison 48h</span>
        </div>

        {/* Name */}
        <p className="text-sm text-gray-800 leading-snug mb-2 flex-1">{product.name}</p>

        {/* Stars */}
        <div className="flex items-center gap-1.5 mb-3">
          <Stars rating={product.rating} />
          <span className="text-[#1B4332] text-xs font-semibold">({product.reviews.toLocaleString("fr-FR")})</span>
        </div>

        {/* Price */}
        <div className="mb-1">
          <span className="text-2xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
        </div>

        {/* Savings */}
        <p className="text-sm text-gray-600 mb-4">
          Soit -{product.savings.toFixed(2).replace(".", ",")} € de réduction
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto">
          <Link
            href="/deals"
            className="flex-1 bg-[#1B4332] text-white text-sm font-bold py-2.5 rounded text-center hover:bg-[#2d6a4f] transition-colors"
          >
            Voir les détails
          </Link>
          <button
            onClick={() => setLiked((l) => !l)}
            className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 transition-colors shrink-0"
            aria-label="Ajouter aux favoris"
          >
            <Heart
              size={18}
              className={liked ? "fill-red-500 text-red-500" : "text-gray-400"}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

const VISIBLE = 3; // cards visible at once on desktop

export default function Home() {
  const [idx, setIdx] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const maxIdx = PRODUCTS.length - VISIBLE;
  const canPrev = idx > 0;
  const canNext = idx < maxIdx;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="bg-[#1B4332] sticky top-0 z-50 shadow-md">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="text-xl font-black text-white tracking-tight shrink-0">
            fulflo<span className="text-[#10B981]">.</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {[
              { label: "Catalogue", href: "/deals" },
              { label: "Marques",   href: "/supplier/login" },
              { label: "Surplus",   href: "/deals" },
              { label: "À propos",  href: "#" },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-white/80 hover:text-white text-sm font-medium transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button className="relative text-white hover:text-[#10B981] transition-colors">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#10B981] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <Link
              href="/supplier/login"
              className="hidden sm:block text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/invite"
              className="bg-white text-[#1B4332] text-sm font-bold px-4 py-1.5 rounded hover:bg-[#D1FAE5] transition-colors"
            >
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">

        {/* ── HERO BANNER — "EVERYDAY ESSENTIALS" Costco style ─────────── */}
        <div
          className="relative rounded overflow-hidden mb-6"
          style={{ background: "linear-gradient(135deg, #1B4332 0%, #2d6a4f 60%, #1B4332 100%)" }}
        >
          {/* Left text */}
          <div className="relative z-10 px-8 py-8 pr-0 max-w-[55%]">
            <p className="text-[#10B981] text-xs font-bold uppercase tracking-widest mb-1">
              Stock Limité · Surplus Fabricant
            </p>
            <h1 className="text-white font-black uppercase leading-none tracking-tight"
              style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
              ESSENTIELS DU<br />QUOTIDIEN
            </h1>
            <p className="text-white/70 text-sm mt-3 max-w-xs">
              Grandes marques à -40% à -70%. Direct fabricant.
            </p>
            <Link
              href="/deals"
              className="inline-block mt-4 bg-[#10B981] text-[#1B4332] font-bold text-sm px-5 py-2 rounded hover:bg-[#D1FAE5] transition-colors"
            >
              Voir toutes les offres →
            </Link>
          </div>

          {/* Right — floating product images */}
          <div className="absolute right-0 top-0 h-full flex items-end gap-2 pr-4 pb-0 pointer-events-none">
            {BANNER_IMGS.map((img, i) => (
              <div
                key={img.alt}
                className="relative"
                style={{
                  width: i === 1 ? 130 : 110,
                  height: i === 1 ? 160 : 140,
                  transform: i === 0 ? "translateY(12px)" : i === 2 ? "translateY(8px)" : "translateY(0)",
                }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  unoptimized
                  className="object-contain drop-shadow-xl"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── PRODUCT CAROUSEL ──────────────────────────────────────────── */}
        <div className="relative">
          {/* Left arrow */}
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={!canPrev}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 rounded-full bg-white border border-gray-300 shadow flex items-center justify-center transition-all ${
              canPrev ? "hover:bg-gray-50 text-gray-700" : "opacity-30 cursor-default text-gray-400"
            }`}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Cards grid */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out gap-4"
              style={{ transform: `translateX(calc(-${idx} * (33.333% + 5.33px)))` }}
            >
              {PRODUCTS.map((p) => (
                <div
                  key={p.id}
                  className="shrink-0"
                  style={{ width: "calc(33.333% - 10.67px)" }}
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>

          {/* Right arrow */}
          <button
            onClick={() => setIdx((i) => Math.min(maxIdx, i + 1))}
            disabled={!canNext}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 rounded-full bg-white border border-gray-300 shadow flex items-center justify-center transition-all ${
              canNext ? "hover:bg-gray-50 text-gray-700" : "opacity-30 cursor-default text-gray-400"
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: maxIdx + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === i ? "bg-[#1B4332] w-5" : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>

        {/* ── CTA STRIP ─────────────────────────────────────────────────── */}
        <div className="mt-8 bg-white border border-gray-200 rounded p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ecfdf5] flex items-center justify-center text-xl shrink-0">
              🎁
            </div>
            <div>
              <p className="font-bold text-gray-900">Invitez un ami — recevez chacun €5</p>
              <p className="text-sm text-gray-500">Crédit activé à la première commande</p>
            </div>
          </div>
          <Link
            href="/invite"
            className="bg-[#1B4332] text-white font-bold text-sm px-6 py-2.5 rounded hover:bg-[#2d6a4f] transition-colors whitespace-nowrap shrink-0"
          >
            Obtenir mon lien →
          </Link>
        </div>

        {/* ── SUPPLIER STRIP ────────────────────────────────────────────── */}
        <div className="mt-4 bg-[#1B4332] rounded p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-[#10B981] text-xs font-bold uppercase tracking-widest mb-1">Pour les Marques</p>
            <p className="text-white font-bold text-lg">Votre surplus mérite mieux que la destruction.</p>
            <p className="text-white/60 text-sm">Commission 15–20% · Brand-safe · Go-live en 48h</p>
          </div>
          <Link
            href="/supplier/login"
            className="bg-[#10B981] text-[#1B4332] font-bold text-sm px-6 py-2.5 rounded hover:bg-[#D1FAE5] transition-colors whitespace-nowrap shrink-0"
          >
            Devenir Fournisseur →
          </Link>
        </div>

      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="mt-10 bg-white border-t border-gray-200 py-8 px-4">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-lg font-black text-[#1B4332]">
            fulflo<span className="text-[#10B981]">.</span>
          </span>
          <div className="flex items-center gap-6">
            {["Mentions légales", "CGV", "Confidentialité", "Contact"].map((l) => (
              <a key={l} href="#" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                {l}
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-400">© 2026 Fulflo SAS · France</p>
        </div>
      </footer>
    </div>
  );
}
