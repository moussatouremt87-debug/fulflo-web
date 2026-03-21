import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || key === "placeholder") {
    return NextResponse.json([]);
  }
  try {
    const { data, error } = await db()
      .from("products")
      .select("*")
      .order("expiry_date", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    brand, name, category, size, ean, description,
    stock_units, original_price, current_price, expiry_date,
    ai_pricing_enabled = false,
  } = body;

  if (!brand || !name || !stock_units || !original_price || !expiry_date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || key === "placeholder") {
    return NextResponse.json({ success: true, demo: true });
  }

  try {
    const { data, error } = await db()
      .from("products")
      .insert({
        brand, name, category, size, ean, description,
        stock_units: parseInt(stock_units, 10),
        original_price: parseFloat(original_price),
        current_price: parseFloat(current_price ?? original_price),
        expiry_date,
        ai_pricing_enabled,
      })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, id: data.id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
