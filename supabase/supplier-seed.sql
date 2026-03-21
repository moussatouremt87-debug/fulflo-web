-- ─────────────────────────────────────────────────────────────────────────────
-- Fulflo — Supplier Demo Seed
-- Creates: demo@nestle.com / Fulflo2026! supplier account + 5 products
-- Run AFTER supplier-migration.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create auth user (demo account)
-- NOTE: In Supabase Dashboard > Authentication > Users > "Invite user"
--       Email: demo@nestle.com  Password: Fulflo2026!
-- Then run this to create the supplier record:

INSERT INTO suppliers (user_id, company_name, email, country, verified, plan)
SELECT
  id,
  'Nestlé Suisse SA',
  'demo@nestle.com',
  'CH',
  true,
  'pro'
FROM auth.users
WHERE email = 'demo@nestle.com'
ON CONFLICT (email) DO NOTHING;

-- 2. Seed supplier products (linked to Nestlé supplier)
INSERT INTO products (
  brand, name, size, original_price, current_price,
  stock_units, expiry_date, ai_pricing_enabled, category,
  flash_sale_end_time, ean, description, moq, warehouse,
  supplier_id
)
SELECT
  brand, name, size, original_price, current_price,
  stock_units, expiry_date, ai_pricing_enabled, category,
  flash_sale_end_time, ean, description, moq, warehouse,
  (SELECT id FROM suppliers WHERE email = 'demo@nestle.com')
FROM (VALUES
  (
    'Nestlé', 'Nescafé Gold Blend', '200 g',
    8.90, 3.99, 183,
    CURRENT_DATE + 110, false, 'alimentation', NULL,
    '3800059908943',
    'Café soluble haut de gamme Nescafé Gold Blend. Lot surplus certifié, issu d''un excédent de production. Économisez 55% sur le prix conseillé.',
    1, 'Paris CDG'
  ),
  (
    'Nestlé', 'KitKat Chunky Box', '×24 barres',
    11.90, 5.49, 44,
    CURRENT_DATE + 6, true, 'alimentation',
    NOW() + INTERVAL '2 hours',
    NULL,
    'Assortiment KitKat Chunky, boîte de 24 barres. Stock limité, expiration imminente.',
    6, 'Lyon Part-Dieu'
  ),
  (
    'Nestlé', 'Maggi Bouillon ×72', '×72 cubes',
    3.80, 1.59, 320,
    CURRENT_DATE + 35, false, 'alimentation', NULL,
    NULL,
    'Cubes de bouillon de poulet Maggi, lot de 72. Idéal pour la restauration et les ménages.',
    1, 'Paris CDG'
  ),
  (
    'Nespresso', 'Blend Intenso', '×50 pods',
    14.50, 7.20, 12,
    CURRENT_DATE + 12, true, 'boissons', NULL,
    NULL,
    'Capsules Nespresso Blend Intenso, lot de 50. Compatible machines Nespresso Original Line.',
    1, 'Bruxelles'
  ),
  (
    'Nestlé', 'Milo Activ-Go', '400 g',
    8.20, 4.10, 560,
    CURRENT_DATE + 55, false, 'boissons', NULL,
    NULL,
    'Boisson maltée chocolatée Milo Activ-Go 400g. Riche en vitamines et minéraux. Lot surplus grande distribution.',
    12, 'Marseille'
  )
) AS v(brand, name, size, original_price, current_price, stock_units, expiry_date, ai_pricing_enabled, category, flash_sale_end_time, ean, description, moq, warehouse)
ON CONFLICT DO NOTHING;
