import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

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

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  const baseUrl   = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.fulflo.app";

  if (!sessionId) {
    return NextResponse.redirect(`${baseUrl}/deals?checkout=error`);
  }

  try {
    // Retrieve and verify the session with Stripe
    const session = await stripe().checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "customer"],
    });

    // Only proceed if payment is complete
    if (session.payment_status !== "paid") {
      return NextResponse.redirect(`${baseUrl}/deals?checkout=unpaid`);
    }

    const orderId = session.metadata?.fulflo_order_id;

    // Update order in Supabase
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (orderId && url && key && key !== "placeholder") {
      const pi = session.payment_intent as Stripe.PaymentIntent | null;
      await db()
        .from("orders")
        .update({
          status:             "confirmed",
          stripe_session_id:  session.id,
          stripe_payment_id:  pi?.id ?? null,
          customer_email:     session.customer_details?.email ?? null,
          customer_name:      session.customer_details?.name  ?? null,
          customer_phone:     session.customer_details?.phone ?? null,
          customer_address:   session.customer_details?.address?.line1 ?? null,
          customer_city:      session.customer_details?.address?.city  ?? null,
          customer_country:   session.customer_details?.address?.country ?? "FR",
          customer_zip:       session.customer_details?.address?.postal_code ?? null,
          paid_at:            new Date().toISOString(),
        })
        .eq("id", orderId);
    }

    // Redirect to tracking page (n8n fulfillment workflow fires from the confirmed status)
    const redirectOrderId = orderId ?? sessionId;
    return NextResponse.redirect(`${baseUrl}/track/${redirectOrderId}?paid=1`);

  } catch (err) {
    console.error("[checkout/success] error:", err);
    return NextResponse.redirect(`${baseUrl}/deals?checkout=error`);
  }
}
