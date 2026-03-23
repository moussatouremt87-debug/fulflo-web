import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { supplierId, campaignName, productId, totalBudget, sharerVoucher, friendVoucher } = body;

  if (!supplierId || !campaignName || !totalBudget) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await sb.from("ripple_campaigns").insert({
    supplier_id: supplierId,
    campaign_name: campaignName,
    product_id: productId || null,
    total_budget_eur: Number(totalBudget),
    sharer_voucher_eur: Number(sharerVoucher ?? 3),
    friend_voucher_eur: Number(friendVoucher ?? 2),
    status: "active",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function GET(req: NextRequest) {
  const supplierId = req.nextUrl.searchParams.get("supplierId") ?? "demo-nestle";

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await sb
    .from("ripple_campaigns")
    .select("*")
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
