import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rateLimit";

const clickLimiter = rateLimit({ limit: 30, windowMs: 60 * 1000 });

export const dynamic = "force-dynamic";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  const { success: rateLimitOk } = clickLimiter(req);
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
      return NextResponse.json({ success: true, demo: true, redirectUrl: `/deals` });
    }

    const supabase = db();

    // Fetch current campaign data
    const { data: campaign, error } = await supabase
      .from("ad_campaigns")
      .select("cpc_eur, daily_spend_eur, daily_budget_eur, clicks, total_spend_eur")
      .eq("id", campaignId)
      .single();

    if (error || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const cpc        = Number(campaign.cpc_eur);
    const newSpend   = Number(campaign.daily_spend_eur) + cpc;
    const newTotal   = Number(campaign.total_spend_eur) + cpc;
    const newClicks  = Number(campaign.clicks) + 1;
    const budget     = Number(campaign.daily_budget_eur);
    const paused     = newSpend >= budget;

    await Promise.all([
      supabase.from("ad_events").insert({
        campaign_id: campaignId,
        event_type: "click",
        product_id: productId,
        user_session: userSession ?? null,
        cost_eur: cpc,
      }),
      supabase
        .from("ad_campaigns")
        .update({
          clicks: newClicks,
          daily_spend_eur: newSpend,
          total_spend_eur: newTotal,
          status: paused ? "paused" : "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", campaignId),
    ]);

    return NextResponse.json({
      success: true,
      cpcEur: cpc,
      paused,
      redirectUrl: `/deals`,
    });
  } catch (err) {
    console.error("[ads/click]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
