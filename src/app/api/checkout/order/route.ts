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
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }

  try {
    // Verify payment with Stripe
    const session = await stripe().checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "payment_not_completed" }, { status: 402 });
    }

    const orderId = session.metadata?.fulflo_order_id;

    // Fetch order from Supabase if we have an orderId
    let order = null;
    if (orderId) {
      const { data } = await db()
        .from("orders")
        .select("id, status, total_eur, items, customer_email, created_at, stripe_session_id")
        .eq("id", orderId)
        .maybeSingle();
      order = data;
    }

    // Parse cart_items from Stripe metadata (compact backup)
    let cartItems = null;
    try {
      const raw = session.metadata?.cart_items;
      if (raw) cartItems = JSON.parse(raw);
    } catch {}

    // Fall back to order.items if metadata not available
    if (!cartItems && order?.items) cartItems = order.items;

    return NextResponse.json({
      orderId:       orderId ?? sessionId,
      sessionId:     session.id,
      status:        session.payment_status,
      customerEmail: session.customer_details?.email ?? order?.customer_email ?? null,
      customerName:  session.customer_details?.name ?? null,
      amountTotal:   session.amount_total ?? 0,   // cents
      currency:      session.currency ?? "eur",
      cartItems,
      order,
    });
  } catch (err) {
    console.error("[checkout/order]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
