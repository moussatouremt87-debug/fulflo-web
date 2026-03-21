import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getTracking } from "@/lib/3pl/router";

export const dynamic = "force-dynamic";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  const { shipmentId } = await params;

  // Look up provider from Supabase
  let providerName = "DirectShip";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key && key !== "placeholder") {
    const { data } = await db()
      .from("orders")
      .select("fulfillment_provider")
      .eq("shipment_id", shipmentId)
      .single();

    if (data?.fulfillment_provider) {
      providerName = data.fulfillment_provider === "byrd"
        ? "Byrd"
        : data.fulfillment_provider === "bigblue"
        ? "Bigblue"
        : "DirectShip";
    }
  }

  try {
    const tracking = await getTracking(shipmentId, providerName);
    return NextResponse.json(tracking);
  } catch (err) {
    return NextResponse.json(
      { error: "Tracking unavailable", detail: String(err) },
      { status: 502 }
    );
  }
}
