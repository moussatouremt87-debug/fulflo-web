-- ─────────────────────────────────────────────────────────────────────────────
-- Fulflo — Products Table Schema Fix
-- Adds all missing columns that were never applied from flash-sale-migration.sql
-- and supplier-migration.sql.
-- Safe to run multiple times (IF NOT EXISTS throughout).
-- Run in: Supabase > SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Add all missing product columns ──────────────────────────────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS brand                TEXT,
  ADD COLUMN IF NOT EXISTS size                 TEXT,
  ADD COLUMN IF NOT EXISTS description          TEXT,
  ADD COLUMN IF NOT EXISTS original_price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_price        NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_percent     INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS flash_sale_end_time  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ai_pricing_enabled   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active            BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_sponsored         BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS typical_duration_days INTEGER,
  ADD COLUMN IF NOT EXISTS ean                  TEXT,
  ADD COLUMN IF NOT EXISTS moq                  INTEGER DEFAULT 1;

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_is_active
  ON products(is_active)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_products_expiry
  ON products(expiry_date)
  WHERE stock_units > 0;

CREATE INDEX IF NOT EXISTS idx_products_discount
  ON products(discount_percent DESC)
  WHERE is_active = true AND stock_units > 0;

-- ── RLS: allow public read of active in-stock products ────────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read in-stock products" ON products;
CREATE POLICY "Public can read active in-stock products"
  ON products FOR SELECT
  USING (is_active = true AND stock_units > 0);

-- ── Verify: show current columns ─────────────────────────────────────────────
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'products' AND table_schema = 'public'
-- ORDER BY ordinal_position;
