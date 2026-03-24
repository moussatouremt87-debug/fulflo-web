// One carefully verified representative EAN per category
export const CATEGORY_REPRESENTATIVE_EANS: Record<string, string> = {
  hygiene:        "3029330003533", // Colgate Total Whitening
  alimentaire:    "3017620422003", // Nutella
  alimentation:   "3017620422003", // alias
  boissons:       "3168930010265", // Evian 1.5L
  entretien:      "0037000013488", // Ariel Pods
  bebe:           "8001841956954", // Pampers Baby-Dry
  snacks:         "7622300441937", // Oreo
  beaute:         "3600542396035", // L'Oréal Elvive
  sport:          "3175681851093", // Sport protéines
  pharmacie:      "3400935100018", // Doliprane
  electromenager: "8710103895435", // Philips
  animaux:        "4008429044694", // Pedigree
};

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
