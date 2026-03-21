import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Maps 3PL-specific statuses to Fulflo canonical statuses
const STATUS_MAP: Record<string, string> = {
  // Byrd statuses
  "created": "pending",
  "fulfillment_processing": "picked",
  "fulfillment_shipped": "shipped",
  "fulfillment_delivered": "delivered",
  "fulfillment_cancelled": "failed",
  // Bigblue statuses
  "pending": "pending",
  "prepared": "picked",
  "shipped": "shipped",
  "delivered": "delivered",
  "cancelled": "failed",
  "returned": "failed",
  // Generic
  "picked": "picked",
  "in_transit": "shipped",
  "out_for_delivery": "shipped",
  "failed": "failed",
};

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

export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Normalise across Byrd & Bigblue webhook shapes
  const rawStatus   = String(payload.status ?? payload.event ?? payload.fulfillment_status ?? "");
  const shipmentId  = String(payload.id ?? payload.shipment_id ?? payload.order_id ?? "");
  const trackingNum = String(payload.tracking_number ?? payload.trackingNumber ?? "");
  const rawDelivery = payload.estimated_delivery ?? payload.estimated_delivery_at ?? null;

  if (!shipmentId || !rawStatus) {
    return NextResponse.json({ error: "shipmentId and status required" }, { status: 400 });
  }

  const fulfillmentStatus = STATUS_MAP[rawStatus.toLowerCase()] ?? "pending";

  // Update Supabase order
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key && key !== "placeholder") {
    const updatePayload: Record<string, unknown> = { fulfillment_status: fulfillmentStatus };
    if (trackingNum) updatePayload.tracking_number = trackingNum;
    if (rawDelivery) updatePayload.estimated_delivery = new Date(rawDelivery as string).toISOString();

    const { error: dbErr } = await db()
      .from("orders")
      .update(updatePayload)
      .eq("shipment_id", shipmentId);

    if (dbErr) console.error("[webhook] Supabase update error:", dbErr);
  }

  // Notify Moussa on key events
  if (fulfillmentStatus === "delivered") {
    await alertTelegram(
      `✅ <b>Livraison confirmée</b>\nShipment: <code>${shipmentId}</code>\nTracking: ${trackingNum}`
    );
  } else if (fulfillmentStatus === "failed") {
    await alertTelegram(
      `❌ <b>Échec de livraison</b>\nShipment: <code>${shipmentId}</code>\nStatut 3PL: ${rawStatus}`
    );
  }

  return NextResponse.json({ received: true, mapped_status: fulfillmentStatus });
}
