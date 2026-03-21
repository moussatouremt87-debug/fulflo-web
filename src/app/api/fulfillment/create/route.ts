import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createShipmentWithFallback, selectProvider } from "@/lib/3pl/router";
import type { FulfloOrder } from "@/lib/3pl/index";

export const dynamic = "force-dynamic";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function sendTrackingSMS(phone: string, trackingUrl: string, orderId: string) {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !from) return;

  try {
    const body = encodeURIComponent(
      `Fulflo: Votre commande ${orderId} est en route ! Suivez votre colis: ${trackingUrl}`
    );
    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `To=${encodeURIComponent(phone)}&From=${encodeURIComponent(from)}&Body=${body}`,
      }
    );
  } catch (e) {
    console.error("[Twilio SMS] failed:", e);
  }
}

export async function POST(req: NextRequest) {
  let order: FulfloOrder;

  try {
    order = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Validate required fields
  if (!order.orderId || !order.customer?.email || !order.items?.length) {
    return NextResponse.json(
      { error: "orderId, customer, and items are required" },
      { status: 400 }
    );
  }

  // Determine provider before attempting (for logging)
  const selectedProvider = selectProvider(order);

  try {
    const shipment = await createShipmentWithFallback(order);

    // Persist to Supabase if configured
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key && key !== "placeholder") {
      const { error: dbErr } = await db()
        .from("orders")
        .update({
          fulfillment_provider: shipment.provider.toLowerCase(),
          shipment_id: shipment.shipmentId,
          tracking_number: shipment.trackingNumber,
          tracking_url: shipment.trackingUrl,
          carrier: shipment.carrier,
          estimated_delivery: shipment.estimatedDelivery.toISOString(),
          label_url: shipment.labelUrl,
          fulfillment_cost_eur: shipment.cost_eur,
          fulfillment_status: "picked",
        })
        .eq("id", order.orderId);

      if (dbErr) console.error("[Supabase] order update failed:", dbErr);
    }

    // Send tracking SMS
    if (order.customer.phone) {
      await sendTrackingSMS(order.customer.phone, shipment.trackingUrl, order.orderId);
    }

    return NextResponse.json({
      success: true,
      provider: shipment.provider,
      selectedProvider: selectedProvider.name,
      shipment: {
        shipmentId: shipment.shipmentId,
        trackingNumber: shipment.trackingNumber,
        trackingUrl: shipment.trackingUrl,
        carrier: shipment.carrier,
        estimatedDelivery: shipment.estimatedDelivery,
        labelUrl: shipment.labelUrl,
        cost_eur: shipment.cost_eur,
      },
    });
  } catch (err) {
    console.error("[fulfillment/create] all providers failed:", err);
    return NextResponse.json(
      { error: "Fulfillment failed", detail: String(err) },
      { status: 500 }
    );
  }
}
