import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return false;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  const { data: { user } } = await createClient(url, key).auth.getUser(token);
  return !!user;
}

export async function GET(req: NextRequest) {
  const supplierId = req.nextUrl.searchParams.get("supplierId");
  if (!supplierId) {
    return NextResponse.json({ error: "supplierId required" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || key === "placeholder") {
    return NextResponse.json(DEMO_ANALYTICS);
  }

  const authorized = await isAuthorized(req);
  if (!authorized) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const supabase = db();
    const since = new Date(Date.now() - 30 * 86400000).toISOString();

    const { data: campaigns } = await supabase
      .from("ad_campaigns")
      .select("*")
      .eq("supplier_id", supplierId)
      .gte("created_at", since);

    if (!campaigns?.length) return NextResponse.json(DEMO_ANALYTICS);

    const total_spend       = campaigns.reduce((s, c) => s + Number(c.total_spend_eur), 0);
    const total_clicks      = campaigns.reduce((s, c) => s + Number(c.clicks), 0);
    const total_impressions = campaigns.reduce((s, c) => s + Number(c.impressions), 0);
    const avg_ctr           = total_impressions > 0
      ? (total_clicks / total_impressions) * 100
      : 0;

    return NextResponse.json({
      total_spend,
      total_clicks,
      total_impressions,
      avg_ctr: Math.round(avg_ctr * 100) / 100,
      campaigns,
    });
  } catch (err) {
    console.error("[ads/analytics]", err);
    return NextResponse.json(DEMO_ANALYTICS);
  }
}

const DEMO_ANALYTICS = {
  total_spend: 240.50,
  total_clicks: 30,
  total_impressions: 323,
  avg_ctr: 9.29,
  campaigns: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      supplier_id: "demo-nestle",
      campaign_name: "Nescafé Gold - Boost Q1",
      status: "active",
      cpc_eur: 1.50,
      daily_budget_eur: 100.00,
      daily_spend_eur: 27.00,
      total_spend_eur: 142.50,
      impressions: 234,
      clicks: 18,
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      supplier_id: "demo-nestle",
      campaign_name: "Maggi Bouillon Flash",
      status: "active",
      cpc_eur: 2.00,
      daily_budget_eur: 75.00,
      daily_spend_eur: 24.00,
      total_spend_eur: 98.00,
      impressions: 89,
      clicks: 12,
    },
  ],
};
