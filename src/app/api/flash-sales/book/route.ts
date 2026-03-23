import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { supplierId, productId, slotDate, campaignName } = body as {
    supplierId?: string;
    productId?: string;
    slotDate?: string;
    campaignName?: string;
  };

  if (!supplierId || !slotDate || !campaignName) {
    return NextResponse.json({ error: "supplierId, slotDate, campaignName requis" }, { status: 400 });
  }

  const sb = db();

  // Check if slot already taken on that calendar day
  const dayStart = new Date(slotDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(slotDate);
  dayEnd.setHours(23, 59, 59, 999);

  const { data: existing } = await sb
    .from("flash_sale_slots")
    .select("id, supplier_id, status")
    .gte("slot_date", dayStart.toISOString())
    .lte("slot_date", dayEnd.toISOString())
    .neq("status", "ended")
    .limit(1);

  if (existing && existing.length > 0) {
    const takenBy = existing[0].supplier_id === supplierId ? "vous" : "un autre fournisseur";
    return NextResponse.json(
      { error: `Ce créneau est déjà réservé par ${takenBy}` },
      { status: 409 }
    );
  }

  // Set slot time to 20:00 Paris time (UTC+1/+2 depending on DST — use 19:00 UTC as safe default)
  const slotDateTime = new Date(slotDate);
  slotDateTime.setUTCHours(19, 0, 0, 0);

  const { data, error } = await sb
    .from("flash_sale_slots")
    .insert({
      supplier_id:   supplierId,
      product_id:    productId ?? null,
      campaign_name: campaignName,
      status:        "pending",
      bid_eur:       150,
      slot_date:     slotDateTime.toISOString(),
      flat_fee_eur:  150,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedDate = slotDateTime.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return NextResponse.json({
    success: true,
    slotId:  data.id,
    message: `Créneau réservé ✓ — ${formattedDate} · 20h00–22h00`,
  });
}
