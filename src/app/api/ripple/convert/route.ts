import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function randomVoucher(prefix: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 8; i++) rand += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${rand}`;
}

export async function POST(req: NextRequest) {
  const { shareCode, newCustomerEmail, orderId } = await req.json();
  if (!shareCode) return NextResponse.json({ error: "shareCode required" }, { status: 400 });

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find share
  const { data: share } = await sb
    .from("ripple_shares")
    .select("id, campaign_id, sharer_id, converted")
    .eq("share_code", shareCode)
    .single();

  if (!share) return NextResponse.json({ error: "Share not found" }, { status: 404 });
  if (share.converted) return NextResponse.json({ error: "Already converted" }, { status: 409 });

  // Get campaign voucher amounts
  let sharerAmt = 3.0;
  let friendAmt = 2.0;
  if (share.campaign_id) {
    const { data: camp } = await sb
      .from("ripple_campaigns")
      .select("sharer_voucher_eur, friend_voucher_eur, cost_per_conversion, total_budget_eur, total_spent_eur")
      .eq("id", share.campaign_id)
      .single();
    if (camp) {
      sharerAmt = Number(camp.sharer_voucher_eur);
      friendAmt = Number(camp.friend_voucher_eur);
    }
  }

  const sharerVoucherCode = randomVoucher("RIPPLE");
  const friendVoucherCode = randomVoucher("WELCOME");

  // Mark converted
  await sb.from("ripple_shares").update({
    converted: true,
    converted_by: newCustomerEmail || orderId || "unknown",
    converted_at: new Date().toISOString(),
    sharer_voucher_code: sharerVoucherCode,
    friend_voucher_code: friendVoucherCode,
  }).eq("id", share.id);

  // Insert vouchers
  await sb.from("vouchers").insert([
    {
      code: sharerVoucherCode,
      owner_email: null, // will be sent to sharer separately
      amount_eur: sharerAmt,
      source: "ripple_sharer",
    },
    {
      code: friendVoucherCode,
      owner_email: newCustomerEmail || null,
      amount_eur: friendAmt,
      source: "ripple_friend",
    },
  ]);

  // Update campaign stats
  if (share.campaign_id) {
    const { data: camp } = await sb
      .from("ripple_campaigns")
      .select("total_conversions, total_spent_eur, cost_per_conversion")
      .eq("id", share.campaign_id)
      .single();
    if (camp) {
      await sb.from("ripple_campaigns").update({
        total_conversions: Number(camp.total_conversions) + 1,
        total_spent_eur: Number(camp.total_spent_eur) + Number(camp.cost_per_conversion),
      }).eq("id", share.campaign_id);
    }
  }

  return NextResponse.json({ sharerVoucher: sharerVoucherCode, friendVoucher: friendVoucherCode });
}
