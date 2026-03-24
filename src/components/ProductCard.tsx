"use client";

import { calculateAIPrice, formatExpiryLabel } from "@/lib/aiPricing";
import Countdown from "./Countdown";
import StockIndicator from "./StockIndicator";

export interface ProductCardProps {
  id: string;
  brand: string;
  name: string;
  size: string;
  original_price: number;
  current_price: number;
  stock_units: number;
  expiry_date: string;
  flash_sale_end_time?: string | null;
  ai_pricing_enabled: boolean;
  category?: string;
  cardBg?: string;
  lang?: string;
  featured?: boolean;
  ean?: string;
  onAddToCart?: (id: string) => void;
}

const urgencyConfig = {
  normal:   { bar: "bg-mint",     label: null },
  watch:    { bar: "bg-amber-400", label: "Expire bientôt" },
  urgent:   { bar: "bg-orange-500", label: "Expire dans 14j" },
  critical: { bar: "bg-red-500",  label: "Derniers jours !" },
};

const categoryConfig: Record<string, { label: string; color: string }> = {
  alimentation: { label: "Alimentation", color: "bg-orange-100 text-orange-700" },
  hygiene:      { label: "Hygiène",      color: "bg-blue-100 text-blue-700" },
  entretien:    { label: "Entretien",    color: "bg-purple-100 text-purple-700" },
  boissons:     { label: "Boissons",     color: "bg-cyan-100 text-cyan-700" },
  baby:         { label: "Bébé",         color: "bg-pink-100 text-pink-700" },
  cleaning:     { label: "Entretien",    color: "bg-purple-100 text-purple-700" },
  food:         { label: "Alimentation", color: "bg-orange-100 text-orange-700" },
};

export default function ProductCard({
  brand,
  name,
  size,
  original_price,
  current_price,
  stock_units,
  expiry_date,
  flash_sale_end_time,
  ai_pricing_enabled,
  category,
  cardBg = "bg-surface",
  lang = "fr",
  featured = false,
  onAddToCart,
  id,
}: ProductCardProps) {
  const pricing = calculateAIPrice({
    original_price,
    expiry_date,
    ai_pricing_enabled,
    override_price: current_price,
  });

  const { urgency } = pricing;
  const displayPrice = pricing.current_price;
  const discount = pricing.discount_pct;
  const isFlash = !!flash_sale_end_time && new Date(flash_sale_end_time) > new Date();
  const urg = urgencyConfig[urgency];

  return (
    <div
      className={`
        ${cardBg} rounded-2xl border border-white shadow-sm
        hover:shadow-lg transition-all duration-200
        ${featured ? "ring-2 ring-mint ring-offset-2" : ""}
        flex flex-col overflow-hidden
      `}
    >
      {/* Flash sale ribbon */}
      {isFlash && (
        <div className="bg-mint text-forest text-xs font-bold px-4 py-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
            FLASH SALE
          </span>
          <Countdown endTime={flash_sale_end_time!} size="sm" />
        </div>
      )}

      {/* AI pricing ribbon */}
      {ai_pricing_enabled && pricing.markdown_steps > 0 && !isFlash && (
        <div className="bg-amber-50 border-b border-amber-100 text-amber-700 text-xs font-semibold px-4 py-1 flex items-center gap-1.5">
          <span>🤖</span>
          Prix IA — {pricing.markdown_steps} palier{pricing.markdown_steps > 1 ? "s" : ""} appliqué{pricing.markdown_steps > 1 ? "s" : ""}
        </div>
      )}

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold text-text-dark uppercase tracking-wider">{brand}</span>
              {category && categoryConfig[category] && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryConfig[category].color}`}>
                  {categoryConfig[category].label}
                </span>
              )}
            </div>
            <p className="font-semibold text-forest text-base leading-snug">{name}</p>
            <p className="text-xs text-text-mid">{size}</p>
          </div>
          <span className="bg-forest text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
            -{discount}%
          </span>
        </div>

        {/* Urgency bar */}
        {urgency !== "normal" && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-mint-light rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${urg.bar}`}
                style={{
                  width: urgency === "critical" ? "90%" : urgency === "urgent" ? "65%" : "40%",
                }}
              />
            </div>
            {urg.label && (
              <span className={`text-xs font-semibold ${urgency === "critical" ? "text-red-500" : "text-amber-600"}`}>
                {urg.label}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-forest">
            €{displayPrice.toFixed(2)}
          </span>
          <div className="mb-0.5 flex flex-col items-start">
            <span className="text-sm text-text-mid line-through">
              €{original_price.toFixed(2)}
            </span>
            <span className="text-xs text-mint font-semibold">
              Vous économisez €{(original_price - displayPrice).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Price history indicator */}
        {pricing.markdown_steps > 0 && (
          <div className="text-xs text-text-mid bg-amber-50 rounded-lg px-3 py-1.5 border border-amber-100">
            Prix d&apos;origine: €{original_price.toFixed(2)} → {pricing.markdown_steps} réduction{pricing.markdown_steps > 1 ? "s" : ""} IA appliquée{pricing.markdown_steps > 1 ? "s" : ""}
          </div>
        )}

        {/* Expiry */}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-text-mid/40 shrink-0" />
          <span className="text-xs text-text-mid">
            {formatExpiryLabel(expiry_date, lang)}
            {pricing.days_to_expiry <= 30 && (
              <span className="ml-1 font-semibold">
                ({pricing.days_to_expiry}j restants)
              </span>
            )}
          </span>
        </div>

        {/* Stock */}
        <div className="mt-auto pt-2 border-t border-mint-light/50">
          <StockIndicator units={stock_units} />
        </div>

        {/* CTA */}
        <button
          onClick={() => onAddToCart?.(id)}
          disabled={stock_units === 0}
          className="w-full bg-forest text-white font-semibold py-2.5 rounded-xl hover:bg-forest-mid transition-colors text-sm mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {stock_units === 0 ? "Épuisé" : isFlash ? "⚡ Acheter maintenant" : "Ajouter au panier"}
        </button>
      </div>
    </div>
  );
}
