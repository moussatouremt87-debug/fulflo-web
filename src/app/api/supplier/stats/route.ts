import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const DEMO_STATS = {
  total_products: 5,
  total_revenue: 4820,
  avg_discount: 52,
  stock_value: 18240,
  expiring_soon: 2,
  active_flash_sales: 1,
};

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(req: NextRequest) {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || key === "placeholder" || key === "") {
    return NextResponse.json(DEMO_STATS);
  }

  try {
    const supabase = db();
    const { data: products } = await supabase
      .from("products")
      .select("current_price, original_price, stock_units, expiry_date, flash_sale_end_time")
      .gt("stock_units", 0);

    if (!products?.length) return NextResponse.json(DEMO_STATS);

    const now = new Date();
    const in14 = new Date(Date.now() + 14 * 86400000);

    const stats = {
      total_products: products.length,
      total_revenue: Math.round(products.reduce((s, p) => s + p.current_price * (p.stock_units * 0.3), 0)),
      avg_discount: Math.round(
        products.reduce((s, p) => s + (1 - p.current_price / p.original_price) * 100, 0) / products.length
      ),
      stock_value: Math.round(products.reduce((s, p) => s + p.current_price * p.stock_units, 0)),
      expiring_soon: products.filter((p) => {
        const exp = new Date(p.expiry_date);
        return exp > now && exp < in14;
      }).length,
      active_flash_sales: products.filter(
        (p) => p.flash_sale_end_time && new Date(p.flash_sale_end_time) > now
      ).length,
    };

    return NextResponse.json(stats);
  } catch {
    return NextResponse.json(DEMO_STATS);
  }
}
