-- ═══════════════════════════════════════════════
-- Fulflo — Data Model v2 (Sprint 5)
-- ═══════════════════════════════════════════════

-- ── Couche 2: Consumer Layer ─────────────────────────────────────────────────
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS age_range TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS household_size INTEGER,
  ADD COLUMN IF NOT EXISTS purchase_frequency_days INTEGER,
  ADD COLUMN IF NOT EXISTS ltv_eur DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cohort_week TEXT,
  ADD COLUMN IF NOT EXISTS acquisition_source TEXT DEFAULT 'organic';

-- ── Couche 3: Product Intelligence Layer ─────────────────────────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS clearance_velocity_days DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS price_elasticity JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pairing_products UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(5,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS supplier_id TEXT;

-- ── Couche 4: Supplier Intelligence Layer ────────────────────────────────────
CREATE TABLE IF NOT EXISTS supplier_pilots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id  TEXT NOT NULL UNIQUE,
  plan         TEXT DEFAULT 'pilot' CHECK (plan IN ('pilot','starter','growth','enterprise')),
  pilot_start  TIMESTAMPTZ DEFAULT NOW(),
  pilot_end    TIMESTAMPTZ DEFAULT NOW() + INTERVAL '90 days',
  status       TEXT DEFAULT 'active' CHECK (status IN ('active','expired','converted')),
  converted_to_plan TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Orders: acquisition tracking ─────────────────────────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS acquisition_source TEXT DEFAULT 'organic',
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS basket_cross_sell JSONB DEFAULT '{}';

-- ── Cohort retention view ─────────────────────────────────────────────────────
CREATE OR REPLACE VIEW cohort_retention AS
SELECT
  c.cohort_week,
  DATE_TRUNC('week', o.created_at)::TEXT AS purchase_week,
  COUNT(DISTINCT o.customer_email)        AS customers
FROM customers c
JOIN orders o ON o.customer_email = c.email
WHERE c.cohort_week IS NOT NULL
GROUP BY c.cohort_week, DATE_TRUNC('week', o.created_at)
ORDER BY c.cohort_week, purchase_week;

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_customers_cohort  ON customers(cohort_week);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_source     ON orders(acquisition_source);

-- ── Seed pilot for demo-nestle ────────────────────────────────────────────────
INSERT INTO supplier_pilots (supplier_id, plan, status)
VALUES ('demo-nestle', 'pilot', 'active')
ON CONFLICT (supplier_id) DO NOTHING;

SELECT 'Data model v2 OK' AS status;
