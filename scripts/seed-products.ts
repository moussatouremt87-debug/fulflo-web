/**
 * Fulflo — Product + Supplier Seed Script
 * Run: npx tsx scripts/seed-products.ts
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (bypasses RLS)
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// ─── Parse .env.local manually (no dotenv dependency) ─────────────────────────
const envPath = path.resolve(process.cwd(), ".env.local");
const env = fs.readFileSync(envPath, "utf8")
  .split("\n")
  .reduce<Record<string, string>>((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return acc;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return acc;
    acc[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    return acc;
  }, {});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) { console.error("❌ NEXT_PUBLIC_SUPABASE_URL missing"); process.exit(1); }
if (!SERVICE_KEY)  { console.error("❌ SUPABASE_SERVICE_ROLE_KEY missing from .env.local\n   Get it at: https://supabase.com/dashboard/project/fgctemruakcxgwgmxhck/settings/api"); process.exit(1); }

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Supplier ──────────────────────────────────────────────────────────────────
// Note: suppliers.id is UUID — we use a fixed seed UUID for repeatability
const SUPPLIER = {
  company_name: "Nestlé Suisse SA",
  email:        "demo@nestle.com",
  country:      "CH",
  verified:     true,
  plan:         "pro" as const,
};

// ─── Products ─────────────────────────────────────────────────────────────────
// Column names match the actual Supabase schema (flash-sale-migration + supplier-migration)
// original_price, current_price, stock_units, expiry_date, ai_pricing_enabled, category, size
// supplier_price and platform_price are NOT NULL in the schema
// price_retail_eur / price_surplus_eur = what we display to customers
const PRODUCTS = [
  {
    brand:               "Ariel",
    name:                "Pods Color & Style ×30",
    category:            "entretien",
    description:         "Capsules de lessive concentrées pour couleurs, 30 lavages. Surplus fabricant certifié.",
    price_retail_eur:    9.80,
    price_surplus_eur:   4.69,
    supplier_price:      3.29,
    platform_price:      4.69,
    discount_percent:    52,
    stock_units:         247,
    stock_quantity:      247,
    expiry_date:         "2026-04-15",
    is_active:           true,
    is_sponsored:        true,
    status:              "active",
    ean:                 "8001090791504",
    image_url:           "https://images.unsplash.com/photo-1585670080336-57b8a9b7e461?w=400&q=80",
    typical_duration_days: 60,
  },
  {
    brand:               "Nestlé",
    name:                "Nescafé Gold Blend 200g",
    category:            "alimentation",
    description:         "Café soluble premium Nescafé Gold Blend 200g. Stock surplus direct usine.",
    price_retail_eur:    6.90,
    price_surplus_eur:   3.29,
    supplier_price:      2.30,
    platform_price:      3.29,
    discount_percent:    52,
    stock_units:         183,
    stock_quantity:      183,
    expiry_date:         "2026-05-30",
    is_active:           true,
    is_sponsored:        true,
    status:              "active",
    ean:                 "7613035137578",
    image_url:           "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80",
    typical_duration_days: 30,
  },
  {
    brand:               "Colgate",
    name:                "Total Whitening 75ml ×3",
    category:            "hygiene",
    description:         "Dentifrice blancheur Colgate Total Advanced Whitening, lot de 3 × 75ml.",
    price_retail_eur:    4.50,
    price_surplus_eur:   1.89,
    supplier_price:      1.32,
    platform_price:      1.89,
    discount_percent:    58,
    stock_units:         312,
    stock_quantity:      312,
    expiry_date:         "2026-06-20",
    is_active:           true,
    is_sponsored:        false,
    status:              "active",
    ean:                 "8714789711027",
    image_url:           "https://images.unsplash.com/photo-1571782742078-30d6c6c5b3d1?w=400&q=80",
    typical_duration_days: 45,
  },
  {
    brand:               "Evian",
    name:                "Eau Minérale Naturelle 1.5L ×6",
    category:            "boissons",
    description:         "Pack eau minérale naturelle Evian 6 × 1.5L. Surplus logistique.",
    price_retail_eur:    5.90,
    price_surplus_eur:   2.49,
    supplier_price:      1.74,
    platform_price:      2.49,
    discount_percent:    58,
    stock_units:         520,
    stock_quantity:      520,
    expiry_date:         "2026-09-01",
    is_active:           true,
    is_sponsored:        false,
    status:              "active",
    ean:                 "3179732101956",
    image_url:           "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80",
    typical_duration_days: 14,
  },
  {
    brand:               "Dove",
    name:                "Gel Douche Sensitive 250ml ×6",
    category:            "hygiene",
    description:         "Gel douche Dove Sensitive Skin, formule douce, lot de 6 × 250ml.",
    price_retail_eur:    19.99,
    price_surplus_eur:   14.49,
    supplier_price:      10.14,
    platform_price:      14.49,
    discount_percent:    28,
    stock_units:         98,
    stock_quantity:      98,
    expiry_date:         "2026-07-10",
    is_active:           true,
    is_sponsored:        false,
    status:              "active",
    ean:                 "8710447305867",
    image_url:           "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&q=80",
    typical_duration_days: 90,
  },
  {
    brand:               "Kellogg's",
    name:                "Corn Flakes Format Familial 1kg ×2",
    category:            "alimentation",
    description:         "Corn Flakes Kellogg's format familial, lot de 2 × 1kg. Date proche.",
    price_retail_eur:    15.99,
    price_surplus_eur:   11.99,
    supplier_price:      8.39,
    platform_price:      11.99,
    discount_percent:    25,
    stock_units:         44,
    stock_quantity:      44,
    expiry_date:         "2026-04-08",
    is_active:           true,
    is_sponsored:        false,
    status:              "active",
    ean:                 "5053827160536",
    image_url:           "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=400&q=80",
    typical_duration_days: 21,
  },
  {
    brand:               "Gillette",
    name:                "Fusion5 ProGlide ×12 Recharges",
    category:            "hygiene",
    description:         "Recharges rasoir Gillette Fusion5 ProGlide, pack de 12. Surplus export.",
    price_retail_eur:    29.99,
    price_surplus_eur:   22.49,
    supplier_price:      15.74,
    platform_price:      22.49,
    discount_percent:    25,
    stock_units:         67,
    stock_quantity:      67,
    expiry_date:         "2026-12-01",
    is_active:           true,
    is_sponsored:        false,
    status:              "active",
    ean:                 "7702018534494",
    image_url:           "https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=400&q=80",
    typical_duration_days: 180,
  },
  {
    brand:               "L'Oréal",
    name:                "Elvive Extraordinaire 400ml ×4",
    category:            "beaute",
    description:         "Shampooing Elvive Extraordinaire L'Oréal, lot de 4 × 400ml. Surplus fabricant.",
    price_retail_eur:    23.99,
    price_surplus_eur:   16.99,
    supplier_price:      11.89,
    platform_price:      16.99,
    discount_percent:    29,
    stock_units:         156,
    stock_quantity:      156,
    expiry_date:         "2026-08-15",
    is_active:           true,
    is_sponsored:        false,
    status:              "active",
    ean:                 "3600523541515",
    image_url:           "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
    typical_duration_days: 60,
  },
];

// ─── Run ───────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Fulflo seed script starting…\n");

  // ── 1. Supplier ──────────────────────────────────────────────────────────────
  console.log("📦 Inserting supplier…");
  const { data: existingSupplier } = await sb
    .from("suppliers")
    .select("id")
    .eq("email", SUPPLIER.email)
    .maybeSingle();

  let supplierId: string | null = existingSupplier?.id ?? null;

  if (!supplierId) {
    const { data: newSupplier, error: supErr } = await sb
      .from("suppliers")
      .insert(SUPPLIER)
      .select("id")
      .single();
    if (supErr) {
      console.error("   ⚠️  Supplier insert failed:", supErr.message, "(continuing)");
    } else {
      supplierId = newSupplier.id;
      console.log(`   ✅ Supplier created: ${supplierId}`);
    }
  } else {
    console.log(`   ℹ️  Supplier already exists: ${supplierId}`);
  }

  // ── 2. Clear existing demo products (0-stock or duplicates) ─────────────────
  console.log("\n🗑️  Clearing stale demo products…");
  const { error: delErr } = await sb
    .from("products")
    .delete()
    .in("brand", PRODUCTS.map((p) => p.brand));
  if (delErr) console.error("   ⚠️  Clear error:", delErr.message, "(continuing)");
  else console.log("   ✅ Cleared");

  // ── 3. Insert products ───────────────────────────────────────────────────────
  console.log("\n📤 Inserting 8 products…");
  const rows = PRODUCTS.map((p) => ({
    ...p,
    ...(supplierId ? { supplier_id: supplierId } : {}),
  }));

  const { data: inserted, error: insErr } = await sb
    .from("products")
    .insert(rows)
    .select("id, brand, name, price_surplus_eur, stock_units");

  if (insErr) {
    console.error("❌ Product insert failed:", insErr.message);
    console.error("   Details:", insErr.details ?? insErr.hint ?? "");
    process.exit(1);
  }

  console.log(`\n✅ Seeded ${inserted?.length ?? 0} products:\n`);
  inserted?.forEach((p) => {
    console.log(`   • ${p.brand} — ${p.name} | €${p.price_surplus_eur} | ${p.stock_units} units | id: ${p.id}`);
  });

  // ── 4. Verify read-back ──────────────────────────────────────────────────────
  console.log("\n🔍 Verifying public read (anon key)…");
  const { createClient: createAnon } = await import("@supabase/supabase-js");
  const sbAnon = createAnon(SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: publicData, error: pubErr } = await sbAnon
    .from("products")
    .select("brand, name, price_surplus_eur, stock_units")
    .gt("stock_units", 0)
    .order("price_surplus_eur", { ascending: true });

  if (pubErr) {
    console.error("   ⚠️  Public read error:", pubErr.message);
  } else {
    console.log(`   ✅ ${publicData?.length ?? 0} products visible to public (anon key)`);
    publicData?.forEach((p) => console.log(`      - ${p.brand} ${p.name} €${p.price_surplus_eur}`));
  }

  console.log("\n🎉 Seed complete!");
}

seed().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
