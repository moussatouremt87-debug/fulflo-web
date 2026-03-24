-- Sprint 15: Add EAN column + seed values for Open Food Facts image lookup
-- Run this in Supabase Dashboard > SQL Editor

ALTER TABLE products ADD COLUMN IF NOT EXISTS ean TEXT;

-- Seed known EAN codes for demo products
UPDATE products SET ean = '8001841000817' WHERE brand ILIKE 'ariel%';
UPDATE products SET ean = '7613034383198' WHERE brand ILIKE 'nestlé%' AND name ILIKE '%nescafé%';
UPDATE products SET ean = '7613036311960' WHERE brand ILIKE 'nestlé%' AND name ILIKE '%fitness%';
UPDATE products SET ean = '8714789982984' WHERE brand ILIKE 'colgate%';
UPDATE products SET ean = '8717163590416' WHERE brand ILIKE 'dove%';
UPDATE products SET ean = '5000112637809' WHERE brand ILIKE 'kellogg%';
UPDATE products SET ean = '7702018866465' WHERE brand ILIKE 'gillette%';
UPDATE products SET ean = '3600523520176' WHERE brand ILIKE 'l''oréal%';
UPDATE products SET ean = '7613034979063' WHERE brand ILIKE 'maggi%';
UPDATE products SET ean = '3017620422003' WHERE brand ILIKE 'nutella%';
UPDATE products SET ean = '5449000131805' WHERE brand ILIKE 'coca%';
UPDATE products SET ean = '5000159461122' WHERE brand ILIKE 'evian%';

CREATE INDEX IF NOT EXISTS products_ean_idx ON products(ean);
