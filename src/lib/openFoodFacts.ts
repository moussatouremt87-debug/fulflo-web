// EAN fallback chains — try primary EAN first, then alternatives
const EAN_FALLBACKS: Record<string, string[]> = {
  "3029330003533": ["3029330003540", "5000299391441"],
  "3168930010265": ["3068320112134", "3068320101725"],
  "0037000013488": ["8001841456003", "4015400516040"],
  "8001841956954": ["4015400539094"],
  "7622300441937": ["7622300143559"],
  "7613035351608": ["7613035351615"],
  "3017620422003": ["3017620425035"],
  "4005900036483": ["4005900036490"],
  "7501009082056": ["7501009082063"],
  "3600542396035": ["3600542396042"],
};

// One verified representative EAN per category — explicit, never positional
export const CATEGORY_EANS: Record<string, string> = {
  hygiene:        "3029330003533", // Coslys Bio
  alimentaire:    "3017620422003", // Nutella
  alimentation:   "3017620422003", // alias
  boissons:       "3168930010265", // Evian 1.5L
  entretien:      "0037000013488", // Coslys Lessive Bio
  bebe:           "8001841956954", // Pampers Baby-Dry
  snacks:         "7622300441937", // Oreo
  beaute:         "3600542396035", // Melvita Bio
  sport:          "3175681851093",
  pharmacie:      "3400935100018",
  electromenager: "8710103895435",
  animaux:        "4008429044694",
};

// Keep backward compat alias
export const CATEGORY_REPRESENTATIVE_EANS = CATEGORY_EANS;

export interface OFFProduct {
  image_front_url?: string;
  image_url?: string;
}

export async function fetchProductImage(ean: string): Promise<string | null> {
  const candidates = [ean, ...(EAN_FALLBACKS[ean] ?? [])];
  for (const code of candidates) {
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=image_front_url,image_url`,
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      if (data.status !== 1 || !data.product) continue;
      const img = (data.product as OFFProduct).image_front_url || (data.product as OFFProduct).image_url;
      if (img) return img;
    } catch { continue; }
  }
  return null;
}

export async function fetchProductImages(eans: string[]): Promise<Record<string, string>> {
  const results = await Promise.allSettled(
    eans.map(async (ean) => ({ ean, url: await fetchProductImage(ean) }))
  );
  const map: Record<string, string> = {};
  for (const r of results) {
    if (r.status === "fulfilled" && r.value.url) map[r.value.ean] = r.value.url;
  }
  return map;
}
