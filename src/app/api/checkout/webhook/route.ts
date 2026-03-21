import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Note: Next.js App Router streams the raw body via req.text() — no config needed.

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

async function alertTelegram(message: string) {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_MOUSSA_CHAT_ID;
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
  }).catch(() => {});
}

// ─── Event handlers ───────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.fulflo_order_id;
  if (!orderId) return;

  const pi = session.payment_intent as string | null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key && key !== "placeholder") {
    await db()
      .from("orders")
      .update({
        status:            "confirmed",
        stripe_session_id: session.id,
        stripe_payment_id: pi ?? null,
        customer_email:    session.customer_details?.email ?? null,
        customer_name:     session.customer_details?.name  ?? null,
        customer_phone:    session.customer_details?.phone ?? null,
        customer_address:  session.customer_details?.address?.line1 ?? null,
        customer_city:     session.customer_details?.address?.city  ?? null,
        customer_country:  session.customer_details?.address?.country ?? "FR",
        customer_zip:      session.customer_details?.address?.postal_code ?? null,
        paid_at:           new Date().toISOString(),
      })
      .eq("id", orderId);
  }

  const amountFormatted = session.amount_total
    ? `${(session.amount_total / 100).toFixed(2)} ${session.currency?.toUpperCase()}`
    : "—";

  await alertTelegram(
    `💳 <b>Paiement confirmé</b>\n` +
    `Commande: <code>${orderId}</code>\n` +
    `Client: ${session.customer_details?.name ?? "—"} (${session.customer_details?.email ?? "—"})\n` +
    `Montant: <b>${amountFormatted}</b>\n` +
    `→ Fulfillment déclenché automatiquement.`
  );
}

async function handlePaymentFailed(intent: Stripe.PaymentIntent) {
  const orderId = intent.metadata?.fulflo_order_id;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (orderId && url && key && key !== "placeholder") {
    await db()
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId);
  }

  await alertTelegram(
    `❌ <b>Paiement échoué</b>\n` +
    `Commande: <code>${orderId ?? "—"}</code>\n` +
    `Raison: ${intent.last_payment_error?.message ?? "inconnue"}`
  );
}

async function handleRefund(charge: Stripe.Charge) {
  const orderId = charge.metadata?.fulflo_order_id
    ?? charge.payment_intent as string | null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (orderId && url && key && key !== "placeholder") {
    await db()
      .from("orders")
      .update({ status: "refunded" })
      .eq("stripe_payment_id", charge.payment_intent as string);
  }

  const amountFormatted = `${(charge.amount_refunded / 100).toFixed(2)} ${charge.currency.toUpperCase()}`;
  await alertTelegram(
    `↩️ <b>Remboursement</b>\n` +
    `Charge: <code>${charge.id}</code>\n` +
    `Montant remboursé: <b>${amountFormatted}</b>`
  );
}

// ─── Main webhook handler ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET not configured" }, { status: 500 });
  }

  const sig  = req.headers.get("stripe-signature");
  const body = await req.text(); // must be raw text for signature verification

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, sig ?? "", webhookSecret);
  } catch (err) {
    console.error("[checkout/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "charge.refunded":
        await handleRefund(event.data.object as Stripe.Charge);
        break;

      default:
        // Ignore unhandled events silently
        break;
    }
  } catch (err) {
    console.error(`[checkout/webhook] handler error for ${event.type}:`, err);
    // Return 200 so Stripe doesn't retry — log for manual review
    return NextResponse.json({ received: true, warning: String(err) });
  }

  return NextResponse.json({ received: true, type: event.type });
}
