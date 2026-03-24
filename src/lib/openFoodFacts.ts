export interface OFFProduct {
  image_front_url?: string;
  image_url?: string;
  image_front_thumb_url?: string;
}

export async function fetchProductImage(ean: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${ean}.json?fields=image_front_url,image_url,image_front_thumb_url`,
      { next: { revalidate: 86400 } } // cache 24h in Next.js fetch cache
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;
    const p: OFFProduct = data.product;
    return p.image_front_url || p.image_url || p.image_front_thumb_url || null;
  } catch {
    return null;
  }
}

export async function fetchProductImages(eans: string[]): Promise<Record<string, string>> {
  const results = await Promise.allSettled(
    eans.map(async (ean) => ({ ean, url: await fetchProductImage(ean) }))
  );
  const map: Record<string, string> = {};
  for (const r of results) {
    if (r.status === "fulfilled" && r.value.url) {
      map[r.value.ean] = r.value.url;
    }
  }
  return map;
}
