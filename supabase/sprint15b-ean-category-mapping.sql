-- Sprint 15b: Strict EAN ↔ category mapping
-- Run in Supabase Dashboard > SQL Editor

-- Ensure ean column exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS ean TEXT;

-- Hygiene
UPDATE products SET ean = '3029330003533', category = 'hygiene'
  WHERE name ILIKE '%colgate%' OR name ILIKE '%whitening%' OR name ILIKE '%dentifrice%';

UPDATE products SET ean = '4005900036483', category = 'hygiene'
  WHERE name ILIKE '%dove%';

UPDATE products SET ean = '7501009082056', category = 'hygiene'
  WHERE name ILIKE '%gillette%';

-- Alimentation / snacks
UPDATE products SET ean = '3017620422003', category = 'alimentation'
  WHERE name ILIKE '%nutella%';

UPDATE products SET ean = '7622300441937', category = 'alimentation'
  WHERE name ILIKE '%oreo%';

UPDATE products SET ean = '7613035351608', category = 'alimentation'
  WHERE name ILIKE '%kellogg%' OR name ILIKE '%corn flakes%';

-- Boissons
UPDATE products SET ean = '3168930010265', category = 'boissons'
  WHERE name ILIKE '%evian%';

UPDATE products SET ean = '7613035351608', category = 'boissons'
  WHERE name ILIKE '%nescafe%' OR name ILIKE '%nescafé%';

-- Entretien
UPDATE products SET ean = '0037000013488', category = 'entretien'
  WHERE name ILIKE '%ariel%' OR name ILIKE '%pods%' OR name ILIKE '%lessive%';

-- Bébé
UPDATE products SET ean = '8001841956954', category = 'bebe'
  WHERE name ILIKE '%pampers%' OR name ILIKE '%couches%';

-- Beauté
UPDATE products SET ean = '3600542396035', category = 'beaute'
  WHERE name ILIKE '%loreal%' OR name ILIKE '%l''oreal%' OR name ILIKE '%elvive%' OR name ILIKE '%shampooing%';

-- Verify
SELECT id, name, category, ean FROM products ORDER BY category, name;
