import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function makeCode(prefix: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 6; i++) rand += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix.slice(0, 3).toUpperCase()}${rand}`;
}

export async function POST(req: NextRequest) {
  const { customerId, productId, channel = "copy" } = await req.json();
  if (!customerId) return NextResponse.json({ error: "customerId required" }, { status: 400 });

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find active ripple campaign
  let campaignId: string | null = null;
  let sharerVoucher = 3.0;
  let friendVoucher = 2.0;
  let productName = "ce produit";
  let productPrice = "prix réduit";
  let brandName = "FulFlo";

  const { data: campaigns } = await sb
    .from("ripple_campaigns")
    .select("id, sharer_voucher_eur, friend_voucher_eur, campaign_name")
    .eq("status", "active")
    .limit(1);

  if (campaigns?.length) {
    campaignId = campaigns[0].id;
    sharerVoucher = Number(campaigns[0].sharer_voucher_eur);
    friendVoucher = Number(campaigns[0].friend_voucher_eur);
    brandName = campaigns[0].campaign_name.split("—")[0].trim();
  }

  // Try to get product info
  if (productId) {
    const { data: prod } = await sb
      .from("products")
      .select("name, brand, price_surplus_eur")
      .eq("id", productId)
      .single();
    if (prod) {
      productName = `${prod.brand} ${prod.name}`;
      productPrice = `€${Number(prod.price_surplus_eur).toFixed(2)}`;
      brandName = prod.brand;
    }
  }

  // Generate unique share code
  let shareCode = makeCode(customerId);
  let attempt = 0;
  while (attempt < 5) {
    const { data: exists } = await sb
      .from("ripple_shares")
      .select("id")
      .eq("share_code", shareCode)
      .single();
    if (!exists) break;
    shareCode = makeCode(customerId + attempt);
    attempt++;
  }

  // Insert share row
  const { error } = await sb.from("ripple_shares").insert({
    campaign_id: campaignId,
    sharer_id: customerId,
    product_id: productId || null,
    share_code: shareCode,
    share_channel: channel,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Increment share count on campaign
  if (campaignId) {
    const { data: camp } = await sb.from("ripple_campaigns").select("total_shares").eq("id", campaignId).single();
    if (camp) {
      await sb.from("ripple_campaigns").update({ total_shares: Number(camp.total_shares) + 1 }).eq("id", campaignId);
    }
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://fulflo.app"}/ref/${shareCode}`;
  const message = `J'ai acheté ${productName} à ${productPrice} sur FulFlo. Tu peux avoir €${friendVoucher.toFixed(0)} de réduction → ${shareUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return NextResponse.json({
    shareCode,
    shareUrl,
    shareMessage: message,
    whatsappUrl,
    sharerVoucher,
    friendVoucher,
    brandName,
  });
}
