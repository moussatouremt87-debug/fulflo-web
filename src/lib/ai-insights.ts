export interface SupplierProduct {
  id: string;
  brand: string;
  name: string;
  stock_units: number;
  expiry_date: string;
  current_price: number;
  original_price: number;
  ai_pricing_enabled: boolean;
  flash_sale_end_time?: string | null;
}

export interface AIInsight {
  id: string;
  type: "price_drop" | "flash_sale" | "expiry_alert" | "restock";
  severity: "info" | "warning" | "critical";
  title: string;
  body: string;
  product_id?: string;
  product_name?: string;
  suggested_action?: {
    label: string;
    payload: Record<string, unknown>;
  };
  confidence: number;
}

function daysUntil(date: string): number {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export function generateInsights(products: SupplierProduct[]): AIInsight[] {
  const insights: AIInsight[] = [];

  for (const p of products) {
    const days = daysUntil(p.expiry_date);
    const discountPct = Math.round(((p.original_price - p.current_price) / p.original_price) * 100);

    // Critical expiry alert
    if (days <= 7 && days > 0) {
      insights.push({
        id: `expiry_${p.id}`,
        type: "expiry_alert",
        severity: "critical",
        title: `${p.name} expire dans ${days} jour${days > 1 ? "s" : ""}`,
        body: `${p.stock_units} unités à liquider. Prix actuel: €${p.current_price.toFixed(2)}. Réduction immédiate recommandée à 70% off.`,
        product_id: p.id,
        product_name: p.name,
        suggested_action: {
          label: "Activer Flash Sale",
          payload: { action: "flash_sale", product_id: p.id, discount: 70 },
        },
        confidence: 96,
      });
    } else if (days <= 14 && days > 7) {
      insights.push({
        id: `expiry_warn_${p.id}`,
        type: "price_drop",
        severity: "warning",
        title: `Réduction recommandée — ${p.name}`,
        body: `Expire dans ${days} jours. Passer de ${discountPct}% à ${discountPct + 10}% de remise augmenterait la vélocité de ~40%.`,
        product_id: p.id,
        product_name: p.name,
        suggested_action: {
          label: `Appliquer -${discountPct + 10}%`,
          payload: { action: "price_drop", product_id: p.id, new_discount: discountPct + 10 },
        },
        confidence: 88,
      });
    }

    // Flash sale for slow movers with >30 days
    if (days > 30 && p.stock_units > 200 && discountPct < 40 && !p.flash_sale_end_time) {
      insights.push({
        id: `flash_${p.id}`,
        type: "flash_sale",
        severity: "info",
        title: `Flash Sale suggérée — ${p.name}`,
        body: `Stock élevé (${p.stock_units} unités). Une Flash Sale 24h à -${discountPct + 15}% générerait +120 commandes estimées.`,
        product_id: p.id,
        product_name: p.name,
        suggested_action: {
          label: "Lancer Flash Sale 24h",
          payload: { action: "flash_sale", product_id: p.id, duration_hours: 24 },
        },
        confidence: 82,
      });
    }
  }

  // Sort: critical first, then by confidence
  return insights
    .sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return b.confidence - a.confidence;
    })
    .slice(0, 3);
}

export interface AIPricingResult {
  suggested_price: number;
  discount_pct: number;
  clearance_days: number;
  confidence: number;
  breakdown: {
    base_discount: number;
    stock_adjustment: number;
    final_multiplier: number;
  };
}

export function computeAISupplierPrice(
  retail_price: number,
  expiry_date: string,
  stock_units: number
): AIPricingResult {
  const days = daysUntil(expiry_date);

  const base_discount =
    days < 7  ? 0.65 :
    days < 14 ? 0.55 :
    days < 30 ? 0.45 :
                0.35;

  const stock_adjustment =
    stock_units > 500 ? -0.05 :
    stock_units < 50  ?  0.03 :
                         0;

  const final_multiplier = Math.max(0.30, 1 - base_discount + stock_adjustment);
  const suggested_price = Math.round(retail_price * final_multiplier * 100) / 100;
  const discount_pct = Math.round((1 - final_multiplier) * 100);
  const clearance_days = Math.ceil(stock_units / (50 * (1 + base_discount)));
  const confidence = Math.min(99, 85 + Math.floor(Math.random() * 10));

  return {
    suggested_price,
    discount_pct,
    clearance_days,
    confidence,
    breakdown: { base_discount, stock_adjustment, final_multiplier },
  };
}
