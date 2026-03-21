import { createClient } from "@supabase/supabase-js";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SponsoredProduct {
  productId: string;
  campaignId: string;
  cpcEur: number;
  position: 1 | 2 | 3;
  supplierName?: string;
}

interface RawCampaign {
  id: string;
  product_id: string;
  cpc_eur: number;
  daily_budget_eur: number;
  daily_spend_eur: number;
  impressions: number;
  clicks: number;
}

// ─── Supabase client (server-side only) ────────────────────────────────────────

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase not configured");
  return createClient(url, key);
}

// ─── Quality score: CTR-based, clamped [1, 10] ────────────────────────────────

function qualityScore(impressions: number, clicks: number): number {
  if (impressions === 0) return 1.0;
  const ctr = clicks / impressions;
  return Math.min(10, Math.max(1, ctr * 10));
}

// ─── Auction engine ───────────────────────────────────────────────────────────

export async function getWinningSponsoredProducts(
  _category?: string
): Promise<SponsoredProduct[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fall back to demo data when Supabase is not available
  if (!url || !key || key === "placeholder") {
    return DEMO_SPONSORED;
  }

  try {
    const { data, error } = await db()
      .from("ad_campaigns")
      .select("id, product_id, cpc_eur, daily_budget_eur, daily_spend_eur, impressions, clicks")
      .eq("status", "active")
      .order("cpc_eur", { ascending: false })
      .limit(10);

    if (error || !data?.length) return DEMO_SPONSORED;

    // Filter: only campaigns with budget remaining
    const eligible = (data as RawCampaign[]).filter(
      (c) => Number(c.daily_spend_eur) < Number(c.daily_budget_eur)
    );

    // Rank: cpc_eur × quality_score (descending)
    const ranked = eligible
      .map((c) => ({
        ...c,
        score: c.cpc_eur * qualityScore(c.impressions, c.clicks),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return ranked.map((c, i) => ({
      productId: c.product_id,
      campaignId: c.id,
      cpcEur: c.cpc_eur,
      position: (i + 1) as 1 | 2 | 3,
    }));
  } catch {
    return DEMO_SPONSORED;
  }
}

// ─── Event recording ──────────────────────────────────────────────────────────

export async function recordImpression(
  campaignId: string,
  productId: string,
  userSession: string
): Promise<void> {
  const supabase = db();

  await supabase.from("ad_events").insert({
    campaign_id: campaignId,
    event_type: "impression",
    product_id: productId,
    user_session: userSession,
    cost_eur: 0,
  });
}

export async function recordClick(
  campaignId: string,
  productId: string,
  userSession: string
): Promise<{ cpcEur: number; paused: boolean }> {
  const supabase = db();

  // Fetch current campaign state
  const { data: campaign } = await supabase
    .from("ad_campaigns")
    .select("cpc_eur, daily_spend_eur, daily_budget_eur, clicks, total_spend_eur")
    .eq("id", campaignId)
    .single();

  if (!campaign) return { cpcEur: 0, paused: false };

  const cpc       = Number(campaign.cpc_eur);
  const newSpend  = Number(campaign.daily_spend_eur) + cpc;
  const newTotal  = Number(campaign.total_spend_eur) + cpc;
  const newClicks = Number(campaign.clicks) + 1;
  const paused    = newSpend >= Number(campaign.daily_budget_eur);

  await Promise.all([
    supabase.from("ad_events").insert({
      campaign_id: campaignId,
      event_type: "click",
      product_id: productId,
      user_session: userSession,
      cost_eur: cpc,
    }),
    supabase.from("ad_campaigns").update({
      clicks: newClicks,
      daily_spend_eur: newSpend,
      total_spend_eur: newTotal,
      status: paused ? "paused" : "active",
      updated_at: new Date().toISOString(),
    }).eq("id", campaignId),
  ]);

  return { cpcEur: cpc, paused };
}

// ─── Demo data fallback ───────────────────────────────────────────────────────

const DEMO_SPONSORED: SponsoredProduct[] = [
  {
    productId: "2",       // Nescafé Gold (matches DEMO product id in deals page)
    campaignId: "11111111-1111-1111-1111-111111111111",
    cpcEur: 1.50,
    position: 1,
    supplierName: "Nestlé",
  },
  {
    productId: "6",       // Maggi Bouillon
    campaignId: "22222222-2222-2222-2222-222222222222",
    cpcEur: 2.00,
    position: 2,
    supplierName: "Nestlé",
  },
];
