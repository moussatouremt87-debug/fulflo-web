// ─── AI Pricing Engine ────────────────────────────────────────────────────────
// Auto-markdown logic: -5% every 3 days when expiry < 30 days

export interface AIPricingInput {
  original_price: number;
  expiry_date: string; // ISO date string
  ai_pricing_enabled: boolean;
  override_price?: number | null;
}

export interface AIPricingResult {
  current_price: number;
  discount_pct: number;
  markdown_steps: number;
  days_to_expiry: number;
  urgency: "normal" | "watch" | "urgent" | "critical";
}

export function calculateAIPrice(input: AIPricingInput): AIPricingResult {
  const today = new Date();
  const expiry = new Date(input.expiry_date);
  const days_to_expiry = Math.max(
    0,
    Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Urgency bands
  let urgency: AIPricingResult["urgency"] = "normal";
  if (days_to_expiry <= 7) urgency = "critical";
  else if (days_to_expiry <= 14) urgency = "urgent";
  else if (days_to_expiry <= 30) urgency = "watch";

  // AI pricing only kicks in when enabled and expiry < 30 days
  if (!input.ai_pricing_enabled || days_to_expiry >= 30) {
    const base = input.override_price ?? input.original_price;
    const discount_pct = Math.round(
      ((input.original_price - base) / input.original_price) * 100
    );
    return { current_price: base, discount_pct, markdown_steps: 0, days_to_expiry, urgency };
  }

  // How many 3-day steps have elapsed since the 30-day threshold
  const days_in_window = 30 - days_to_expiry;
  const markdown_steps = Math.floor(days_in_window / 3);

  // Each step = -5%, floor at 70% off original
  const max_steps = 14; // 14 × 5% = 70%
  const effective_steps = Math.min(markdown_steps, max_steps);
  const markdown_multiplier = Math.pow(0.95, effective_steps);
  const ai_price = parseFloat(
    (input.original_price * markdown_multiplier).toFixed(2)
  );

  // Use override if lower (manual floor set by supplier)
  const current_price = input.override_price
    ? Math.min(ai_price, input.override_price)
    : ai_price;

  const discount_pct = Math.round(
    ((input.original_price - current_price) / input.original_price) * 100
  );

  return { current_price, discount_pct, markdown_steps: effective_steps, days_to_expiry, urgency };
}

export function formatExpiryLabel(expiry_date: string, lang: string = "fr"): string {
  const date = new Date(expiry_date);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(2);
  if (lang === "ar") return `انتهاء ${mm}/${yy}`;
  return `Exp. ${mm}/${yy}`;
}
