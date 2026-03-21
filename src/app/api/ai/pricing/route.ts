import { NextRequest, NextResponse } from "next/server";
import { computeAISupplierPrice } from "@/lib/ai-insights";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { retail_price, expiry_date, stock_units } = await req.json();

  if (!retail_price || !expiry_date || !stock_units) {
    return NextResponse.json({ error: "retail_price, expiry_date, stock_units required" }, { status: 400 });
  }

  const result = computeAISupplierPrice(
    parseFloat(retail_price),
    expiry_date,
    parseInt(stock_units, 10)
  );

  return NextResponse.json(result);
}
