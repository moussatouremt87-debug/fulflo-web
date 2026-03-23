import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, supplierId, bundlePriceEur, bundleDiscountPercent } = body;

  if (!name || !supplierId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await sb.from("bundle_campaigns").insert({
    name,
    supplier_ids: [supplierId],
    product_ids: [],
    bundle_price_eur: Number(bundlePriceEur ?? 9.99),
    bundle_discount_percent: Number(bundleDiscountPercent ?? 40),
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
    .from("bundle_campaigns")
    .select("*")
    .contains("supplier_ids", [supplierId])
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
