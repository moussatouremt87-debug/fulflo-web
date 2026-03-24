import { fetchProductImage } from "@/lib/openFoodFacts";

// Simple in-memory cache — persists across requests in the same worker
const cache = new Map<string, string | null>();

export async function GET(req: Request) {
  const ean = new URL(req.url).searchParams.get("ean");
  if (!ean) return Response.json({ url: null }, { status: 400 });

  if (!cache.has(ean)) {
    cache.set(ean, await fetchProductImage(ean));
  }

  return Response.json(
    { url: cache.get(ean) },
    { headers: { "Cache-Control": "public, max-age=86400" } }
  );
}
