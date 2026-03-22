import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rateLimit";

const impressionLimiter = rateLimit({ limit: 100, windowMs: 60 * 1000 });

export const dynamic = "force-dynamic";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  const { success: rateLimitOk } = impressionLimiter(req);
  if (!rateLimitOk) {
    return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 });
  }
  try {
    const { campaignId, productId, userSession } = await req.json();
    if (!campaignId || !productId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || key === "placeholder") {
      return NextResponse.json({ recorded: true, demo: true });
    }

    const supabase = db();

    // Read current impressions then increment
    const { data: campaign } = await supabase
      .from("ad_campaigns")
      .select("impressions")
      .eq("id", campaignId)
      .single();

    await Promise.all([
      supabase.from("ad_events").insert({
        campaign_id: campaignId,
        event_type: "impression",
        product_id: productId,
        user_session: userSession ?? null,
        cost_eur: 0,
      }),
      supabase.from("ad_campaigns").update({
        impressions: (campaign?.impressions ?? 0) + 1,
        updated_at: new Date().toISOString(),
      }).eq("id", campaignId),
    ]);

    return NextResponse.json({ recorded: true });
  } catch (err) {
    console.error("[ads/impression]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
