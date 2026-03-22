import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// ─── Stripe client (lazy — avoids build-time errors when key absent) ──────────
function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2026-02-25.clover" });
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ─── Currency guard — Stripe supports EUR and CHF for hosted checkout ─────────
const SUPPORTED_CURRENCIES = ["eur", "chf"] as const;
type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

function normaliseCurrency(raw: string): SupportedCurrency {
  const c = raw.toLowerCase();
  if (SUPPORTED_CURRENCIES.includes(c as SupportedCurrency)) return c as SupportedCurrency;
  return "eur"; // safe default
}

// ─── Request shape ─────────────────────────────────────────────────────────────
interface CheckoutItem {
  product_id: string;
  name: string;
  brand: string;
  quantity: number;
  unit_price_eur: number; // always stored in EUR; converted if CHF
  image_url?: string;
}

interface CheckoutRequest {
  items: CheckoutItem[];
  customer_email?: string;
  currency?: string;         // "eur" | "chf" — defaults to "eur"
  supplier_id?: string;
  metadata?: Record<string, string>;
  service_fee_eur?: number;  // pre-calculated 5% service fee
  shipping_eur?: number;     // pre-calculated shipping (0 or 4.90)
  cart_items?: unknown[];    // full CartItem array for success page
}

// ─── CHF/EUR rate (static fallback — swap for live FX if needed) ─────────────
const EUR_TO_CHF = 0.97; // 1 EUR ≈ 0.97 CHF (update periodically)

function convertPrice(amount_eur: number, currency: SupportedCurrency): number {
  if (currency === "chf") return Math.round(amount_eur * EUR_TO_CHF * 100) / 100;
  return amount_eur;
}

export async function POST(req: NextRequest) {
  let body: CheckoutRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    items,
    customer_email,
    currency: rawCurrency = "eur",
    supplier_id,
    metadata = {},
    service_fee_eur,
    shipping_eur,
    cart_items,
  } = body;

  if (!items?.length) {
    return NextResponse.json({ error: "items[] is required and must not be empty" }, { status: 400 });
  }

  const currency = normaliseCurrency(rawCurrency);
  const baseUrl  = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.fulflo.app";

  // Build Stripe line items
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
    const unit_amount = Math.round(convertPrice(item.unit_price_eur, currency) * 100); // in cents
    return {
      quantity: item.quantity,
      price_data: {
        currency,
        unit_amount,
        product_data: {
          name: `${item.brand} — ${item.name}`,
          ...(item.image_url ? { images: [item.image_url] } : {}),
          metadata: { product_id: item.product_id },
        },
      },
    };
  });

  // Service fee line item (5% of subtotal)
  const subtotalEur = items.reduce((s, i) => s + i.unit_price_eur * i.quantity, 0);
  const feeEur = service_fee_eur ?? Math.round(subtotalEur * 0.05 * 100) / 100;
  if (feeEur > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency,
        unit_amount: Math.round(convertPrice(feeEur, currency) * 100),
        product_data: { name: "Frais de service FulFlo" },
      },
    });
  }

  // Shipping line item (if not free)
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

  // Create order record in Supabase first (so we have an ID for metadata)
  let orderId: string | null = null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key && key !== "placeholder") {
    const totalEur = items.reduce((s, i) => s + i.unit_price_eur * i.quantity, 0);
    const { data: order } = await db()
      .from("orders")
      .insert({
        status: "pending",
        total_eur: Math.round(totalEur * 100) / 100,
        items: items,
        customer_email: customer_email ?? null,
        supplier_id: supplier_id ?? null,
        fulfillment_status: "pending",
      })
      .select("id")
      .single();
    orderId = order?.id ?? null;
  }

  // Create Stripe Checkout session
  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      currency,
      ...(customer_email ? { customer_email } : {}),
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/cart`,
      metadata: {
        fulflo_order_id: orderId ?? "",
        supplier_id:     supplier_id ?? "",
        currency,
        // Compact cart snapshot for success page (max 500 chars per Stripe limit)
        cart_items: cart_items
          ? JSON.stringify(cart_items).slice(0, 490)
          : "",
        ...metadata,
      },
      payment_intent_data: {
        metadata: {
          fulflo_order_id: orderId ?? "",
        },
      },
      // Collect billing address for EU VAT compliance
      billing_address_collection: "required",
      // Allow promo codes
      allow_promotion_codes: true,
      // Expire after 30 minutes
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    return NextResponse.json({
      url:        session.url,
      session_id: session.id,
      order_id:   orderId,
      currency,
      amount_total: session.amount_total, // in cents
    });
  } catch (err) {
    console.error("[checkout/create] Stripe error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session", detail: String(err) },
      { status: 502 }
    );
  }
}
