import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { brand, name, category, size } = await req.json();

  if (!brand || !name) {
    return NextResponse.json({ error: "brand and name required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 200,
          messages: [
            {
              role: "user",
              content: `Write a compelling 2-sentence product description for a surplus marketplace listing.
Product: ${brand} ${name}${size ? `, ${size}` : ""}${category ? `, category: ${category}` : ""}.
Emphasize: authentic brand product, surplus stock certified, significant savings vs retail.
Language: French. Tone: professional, conversion-focused. Max 50 words.`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const description = data.content?.[0]?.text?.trim() ?? "";
        if (description) return NextResponse.json({ description });
      }
    } catch {
      // fall through to fallback
    }
  }

  // Fallback: rule-based description
  const categoryLabels: Record<string, string> = {
    alimentation: "alimentaire",
    hygiene: "d'hygiène",
    entretien: "d'entretien",
    boissons: "boisson",
    baby: "bébé",
  };
  const catLabel = categoryLabels[category] || "";
  const description = `${brand} ${name}${size ? ` (${size})` : ""} — Lot surplus certifié, produit ${catLabel} authentique issu d'un excédent de production. Qualité garantie, économisez jusqu'à 60% sur le prix de vente conseillé, livraison rapide depuis nos entrepôts européens.`;

  return NextResponse.json({ description });
}
