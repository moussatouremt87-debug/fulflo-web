-- ─────────────────────────────────────────────────────────────────────────────
-- Fulflo — Deals Catalogue Seed Data
-- Run in: Supabase > SQL Editor (after flash-sale-migration.sql)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO products (
  brand, name, size, original_price, current_price,
  stock_units, expiry_date, ai_pricing_enabled, category, flash_sale_end_time
)
VALUES
  (
    'Colgate', 'Total Advanced Whitening', '75 ml × 3',
    4.50, 1.89, 247,
    CURRENT_DATE + 90, false, 'hygiene', NULL
  ),
  (
    'Nestlé', 'Nescafé Gold Blend', '200 g',
    8.90, 3.99, 183,
    CURRENT_DATE + 110, false, 'alimentation', NULL
  ),
  (
    'Ariel', 'Pods Color & Style', '×34 lavages',
    11.90, 5.49, 44,
    CURRENT_DATE + 18, true, 'entretien',
    NOW() + INTERVAL '2 hours'
  ),
  (
    'Dove', 'Gel Douche Sensitive', '250 ml × 6',
    9.60, 4.29, 12,
    CURRENT_DATE + 22, true, 'hygiene', NULL
  ),
  (
    'Evian', 'Eau Minérale Naturelle', '1.5 L × 6',
    5.90, 2.49, 320,
    CURRENT_DATE + 180, false, 'boissons', NULL
  ),
  (
    'Maggi', 'Bouillon de Poulet', '×72 cubes',
    3.80, 1.59, 6,
    CURRENT_DATE + 35, false, 'alimentation', NULL
  )
ON CONFLICT DO NOTHING;

-- Run AI price refresh to update prices based on expiry
SELECT refresh_ai_prices();
