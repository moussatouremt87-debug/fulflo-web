import { NextRequest, NextResponse } from "next/server";
import { fetchProductImage } from "@/lib/openFoodFacts";

// In-memory cache: ean → { url, ts }
const cache = new Map<string, { url: string | null; ts: number }>();
const TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(req: NextRequest) {
  const ean = req.nextUrl.searchParams.get("ean");
  if (!ean) return NextResponse.json({ url: null }, { status: 400 });

  const cached = cache.get(ean);
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json({ url: cached.url }, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  }

  const url = await fetchProductImage(ean);
  cache.set(ean, { url, ts: Date.now() });

  return NextResponse.json({ url }, {
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}
