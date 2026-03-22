import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { rateLimit } from "@/lib/rateLimit";

const checkoutLimiter = rateLimit({ limit: 10, windowMs: 60 * 1000 });

export const dynamic = "force-dynamic";

// Lazy init — read key at request time, not at module cold-start
// (Vercel can inject env vars after module init in some cold-start scenarios)
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2026-02-25.clover" });
}

const SUPPORTED_CURRENCIES = ["eur", "chf"] as const;
type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

function normaliseCurrency(raw: string): SupportedCurrency {
  const c = raw.toLowerCase();
  if (SUPPORTED_CURRENCIES.includes(c as SupportedCurrency)) return c as SupportedCurrency;
  return "eur";
}

const EUR_TO_CHF = 0.97;

function convertPrice(amount_eur: number, currency: SupportedCurrency): number {
  if (currency === "chf") return Math.round(amount_eur * EUR_TO_CHF * 100) / 100;
  return amount_eur;
}

interface CheckoutItem {
  product_id: string;
  name: string;
  brand: string;
  quantity: number;
  unit_price_eur: number;
  image_url?: string;
}

interface CheckoutRequest {
  items: CheckoutItem[];
  customer_email?: string;
  currency?: string;
  service_fee_eur?: number;
  shipping_eur?: number;
}

export async function POST(req: NextRequest) {
  const { success: rateLimitOk } = checkoutLimiter(req);
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans une minute." },
      { status: 429 }
    );
  }

  // ── Debug: confirm env vars present ───────────────────────────────────────
  console.log("[checkout/create] STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY);
  console.log("[checkout/create] STRIPE_SECRET_KEY starts:", process.env.STRIPE_SECRET_KEY?.substring(0, 12));

  try {
    let body: CheckoutRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { items, customer_email, currency: rawCurrency = "eur", service_fee_eur, shipping_eur } = body;

    console.log("[checkout/create] items received:", items?.length ?? 0);

    if (!items?.length) {
      return NextResponse.json({ error: "items[] is required and must not be empty" }, { status: 400 });
    }

    const currency    = normaliseCurrency(rawCurrency);
    const baseUrl     = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.fulflo.app";
    const subtotalEur = items.reduce((s, i) => s + i.unit_price_eur * i.quantity, 0);

    // Build Stripe line items — no image URLs (Stripe fetches them server-side
    // and rejects sessions if the URL isn't publicly reachable/fast)
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency,
        unit_amount: Math.round(convertPrice(item.unit_price_eur, currency) * 100),
        product_data: {
          name: `${item.brand} — ${item.name}`,
        },
      },
    }));

    // Service fee (5%)
    const feeEur = service_fee_eur ?? Math.round(subtotalEur * 0.05 * 100) / 100;
    if (feeEur > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency,
          unit_amount: Math.round(convertPrice(feeEur, currency) * 100),
          product_data: { name: "Frais de service FulFlo (5%)" },
        },
      });
    }

    // Shipping
    const shipEur = shipping_eur ?? (subtotalEur >= 40 ? 0 : 4.9);
    if (shipEur > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency,
          unit_amount: Math.round(convertPrice(shipEur, currency) * 100),
          product_data: { name: "Livraison FulFlo" },
        },
      });
    }

    // Compact items for webhook stock decrement + success page lookup
    const itemsCompact = JSON.stringify(
      items.map((i) => ({ id: i.product_id, qty: i.quantity }))
    ).slice(0, 490);

    console.log("[checkout/create] creating Stripe session, lineItems:", lineItems.length);

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      currency,
      ...(customer_email ? { customer_email } : {}),
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/cart`,
      metadata: {
        items_compact: itemsCompact,
        currency,
      },
      payment_intent_data: { metadata: { fulflo_items: itemsCompact } },
      billing_address_collection: "required",
      allow_promotion_codes: true,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    console.log("[checkout/create] session created:", session.id);

    return NextResponse.json({
      url:          session.url,
      session_id:   session.id,
      currency,
      amount_total: session.amount_total,
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[checkout/create] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
