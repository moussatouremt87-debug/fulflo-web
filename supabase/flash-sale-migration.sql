-- ─────────────────────────────────────────────────────────────────────────────
-- Fulflo — Flash Sale System Migration
-- Run in: Supabase > SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Add flash sale + AI pricing fields to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS flash_sale_end_time  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS original_price        NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_price         NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock_units           INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_pricing_enabled    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS image_url             TEXT,
  ADD COLUMN IF NOT EXISTS category              TEXT,
  ADD COLUMN IF NOT EXISTS brand                 TEXT,
  ADD COLUMN IF NOT EXISTS size                  TEXT,
  ADD COLUMN IF NOT EXISTS expiry_date           DATE;

-- Index for fast flash sale queries
CREATE INDEX IF NOT EXISTS idx_products_flash_sale
  ON products(flash_sale_end_time)
  WHERE flash_sale_end_time IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_expiry
  ON products(expiry_date)
  WHERE stock_units > 0;

-- ─────────────────────────────────────────────────────────────────────────────
-- AI Pricing Function
-- Calculates current price based on days_to_expiry + 3-day markdown cadence
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION calculate_ai_price(
  p_original_price    NUMERIC,
  p_expiry_date       DATE,
  p_ai_enabled        BOOLEAN DEFAULT true
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  v_days_to_expiry    INTEGER;
  v_days_in_window    INTEGER;
  v_markdown_steps    INTEGER;
  v_multiplier        NUMERIC;
  v_price             NUMERIC;
BEGIN
  v_days_to_expiry := (p_expiry_date - CURRENT_DATE)::INTEGER;

  -- AI pricing only active when enabled and expiry < 30 days
  IF NOT p_ai_enabled OR v_days_to_expiry >= 30 THEN
    RETURN p_original_price;
  END IF;

  v_days_in_window  := 30 - v_days_to_expiry;
  v_markdown_steps  := LEAST(FLOOR(v_days_in_window / 3.0)::INTEGER, 14);
  v_multiplier      := POWER(0.95, v_markdown_steps);
  v_price           := ROUND(p_original_price * v_multiplier, 2);

  RETURN GREATEST(v_price, p_original_price * 0.30); -- floor at 70% off
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Scheduled price refresh (calls AI pricing function on all enabled products)
-- Wire this to a cron job via pg_cron or n8n
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION refresh_ai_prices()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET current_price = calculate_ai_price(original_price, expiry_date, ai_pricing_enabled)
  WHERE ai_pricing_enabled = true
    AND expiry_date IS NOT NULL
    AND stock_units > 0;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed data — sample surplus products for testing
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO products (brand, name, size, original_price, current_price, stock_units, expiry_date, ai_pricing_enabled, category, flash_sale_end_time)
VALUES
  ('Colgate',     'Total Advanced',      '75ml × 3',    4.50,  1.89,  247,  CURRENT_DATE + 90,  false, 'hygiene',   NULL),
  ('Nescafé',     'Gold Blend',          '100g',        6.90,  3.29,  183,  CURRENT_DATE + 120, false, 'food',      NULL),
  ('Ariel',       'Pods Color',          '×30 lavages', 9.80,  4.69,  512,  CURRENT_DATE + 60,  false, 'cleaning',  NOW() + INTERVAL '2 hours'),
  ('Gillette',    'Fusion ProGlide',     '×4 lames',    14.99, 7.49,  89,   CURRENT_DATE + 180, false, 'hygiene',   NULL),
  ('Dove',        'Gel Douche Sensitive','250ml × 6',   8.40,  4.19,  321,  CURRENT_DATE + 45,  true,  'hygiene',   NULL),
  ('Pampers',     'Active Fit T4',       '×52',         19.99, 8.49,  44,   CURRENT_DATE + 30,  true,  'baby',      NOW() + INTERVAL '2 hours'),
  ('Head&Shoulders','Classic Clean',     '400ml × 2',   7.80,  3.99,  156,  CURRENT_DATE + 75,  false, 'hygiene',   NULL),
  ('Oral-B',      'Pro 600 Têtes',       '×4',          12.50, 4.89,  67,   CURRENT_DATE + 150, false, 'hygiene',   NULL)
ON CONFLICT DO NOTHING;
