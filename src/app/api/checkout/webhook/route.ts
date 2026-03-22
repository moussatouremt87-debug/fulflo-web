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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // ── 1. Parse items from metadata ─────────────────────────────────────────
  let cartItems: Array<{ id: string; qty: number }> = [];
  try {
    const raw = session.metadata?.items_compact;
    if (raw) cartItems = JSON.parse(raw);
  } catch {}

  // ── 2. Decrement stock_units for each item ────────────────────────────────
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (sbUrl && sbKey && sbKey !== "placeholder" && cartItems.length) {
    for (const item of cartItems) {
      if (!item.id || !item.qty) continue;
      const { data: prod } = await db()
        .from("products")
        .select("id, stock_units")
        .eq("id", item.id)
        .maybeSingle();
      if (!prod || prod.stock_units < item.qty) continue;
      await db()
        .from("products")
        .update({ stock_units: prod.stock_units - item.qty, stock_quantity: prod.stock_units - item.qty })
        .eq("id", item.id);
    }
  }

  // ── 3. Trigger n8n fulfillment workflow ───────────────────────────────────
  const n8nUrl = process.env.N8N_WEBHOOK_URL;
  if (n8nUrl) {
    await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event:          "order.confirmed",
        session_id:     session.id,
        customer_email: session.customer_details?.email,
        customer_name:  session.customer_details?.name,
        amount_total:   session.amount_total,
        currency:       session.currency,
        items:          cartItems,
        paid_at:        new Date().toISOString(),
      }),
    }).catch(() => {});
  }

  // ── 4. Telegram alert ─────────────────────────────────────────────────────
  const amountFormatted = session.amount_total
    ? `${(session.amount_total / 100).toFixed(2)} ${session.currency?.toUpperCase()}`
    : "—";

  await alertTelegram(
    `💳 <b>Paiement confirmé</b>\n` +
    `Session: <code>${session.id}</code>\n` +
    `Client: ${session.customer_details?.name ?? "—"} (${session.customer_details?.email ?? "—"})\n` +
    `Montant: <b>${amountFormatted}</b>\n` +
    `Articles: ${cartItems.length} référence(s)\n` +
    `→ n8n fulfillment déclenché.`
  );
}

async function handlePaymentFailed(intent: Stripe.PaymentIntent) {
  await alertTelegram(
    `❌ <b>Paiement échoué</b>\n` +
    `Intent: <code>${intent.id}</code>\n` +
    `Raison: ${intent.last_payment_error?.message ?? "inconnue"}`
  );
}

async function handleRefund(charge: Stripe.Charge) {
  const amountFormatted = `${(charge.amount_refunded / 100).toFixed(2)} ${charge.currency.toUpperCase()}`;
  await alertTelegram(
    `↩️ <b>Remboursement</b>\n` +
    `Charge: <code>${charge.id}</code>\n` +
    `Montant remboursé: <b>${amountFormatted}</b>`
  );
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET not configured" }, { status: 500 });
  }

  const sig  = req.headers.get("stripe-signature");
  const body = await req.text();

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
        break;
    }
  } catch (err) {
    console.error(`[checkout/webhook] handler error for ${event.type}:`, err);
    return NextResponse.json({ received: true, warning: String(err) });
  }

  return NextResponse.json({ received: true, type: event.type });
}
