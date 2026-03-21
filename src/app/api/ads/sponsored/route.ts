import { NextRequest, NextResponse } from "next/server";
import { getWinningSponsoredProducts } from "@/lib/adAuction";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get("category") ?? undefined;
    const sponsored = await getWinningSponsoredProducts(category);
    return NextResponse.json({ sponsored });
  } catch (err) {
    console.error("[ads/sponsored]", err);
    return NextResponse.json({ sponsored: [] });
  }
}
