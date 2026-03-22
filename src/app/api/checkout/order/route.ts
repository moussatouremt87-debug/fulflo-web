import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(key, { apiVersion: "2026-02-25.clover" });
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }

  try {
    // Verify payment with Stripe
    const session = await stripe().checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "payment_not_completed" }, { status: 402 });
    }

    // Parse compact items from metadata
    let compactItems: Array<{ id: string; qty: number }> = [];
    try {
      const raw = session.metadata?.items_compact;
      if (raw) compactItems = JSON.parse(raw);
    } catch {}

    // Fetch full product details from Supabase for success page display
    let cartItems = null;
    if (compactItems.length) {
      const ids = compactItems.map((i) => i.id);
      const { data: products } = await db()
        .from("products")
        .select("id, brand, name, price_retail_eur, price_surplus_eur, image_url, category")
        .in("id", ids);

      if (products?.length) {
        cartItems = compactItems.map((ci) => {
          const p = products.find((pr) => pr.id === ci.id);
          return {
            productId:     ci.id,
            name:          p?.name ?? "",
            brand:         p?.brand ?? "",
            size:          "",
            price:         Number(p?.price_surplus_eur ?? 0),
            originalPrice: Number(p?.price_retail_eur ?? 0),
            quantity:      ci.qty,
            image:         p?.image_url ?? "",
            category:      p?.category ?? "",
          };
        });
      }
    }

    return NextResponse.json({
      orderId:       session.id,
      sessionId:     session.id,
      status:        session.payment_status,
      customerEmail: session.customer_details?.email ?? null,
      customerName:  session.customer_details?.name ?? null,
      amountTotal:   session.amount_total ?? 0,
      currency:      session.currency ?? "eur",
      cartItems,
      order:         null,
    });
  } catch (err) {
    console.error("[checkout/order]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
