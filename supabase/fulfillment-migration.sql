-- ─────────────────────────────────────────────────────────────────────────────
-- Fulflo — Fulfillment Migration
-- Adds 3PL fulfillment columns to orders table + creates orders table if needed
-- Run in: Supabase > SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Create orders table if it doesn't exist ───────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id      UUID REFERENCES customers(id) ON DELETE SET NULL,
  supplier_id      UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  total_eur        NUMERIC(10,2) NOT NULL DEFAULT 0,
  items            JSONB DEFAULT '[]'::jsonb,
  customer_email   TEXT,
  customer_name    TEXT,
  customer_phone   TEXT,
  customer_address TEXT,
  customer_city    TEXT,
  customer_country TEXT DEFAULT 'FR',
  customer_zip     TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Add fulfillment columns ───────────────────────────────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS fulfillment_provider  TEXT CHECK (fulfillment_provider IN ('byrd','bigblue','directship', NULL)),
  ADD COLUMN IF NOT EXISTS shipment_id           TEXT,
  ADD COLUMN IF NOT EXISTS tracking_number       TEXT,
  ADD COLUMN IF NOT EXISTS tracking_url          TEXT,
  ADD COLUMN IF NOT EXISTS carrier               TEXT,
  ADD COLUMN IF NOT EXISTS estimated_delivery    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS label_url             TEXT,
  ADD COLUMN IF NOT EXISTS fulfillment_cost_eur  NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS fulfillment_status    TEXT DEFAULT 'pending'
    CHECK (fulfillment_status IN ('pending','picked','shipped','delivered','failed'));

-- ── Updated_at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_shipment_id        ON orders(shipment_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number    ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id        ON orders(customer_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Customers can read their own orders
CREATE POLICY IF NOT EXISTS "Customers read own orders"
  ON orders FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

-- Suppliers can read orders for their products
CREATE POLICY IF NOT EXISTS "Suppliers read relevant orders"
  ON orders FOR SELECT
  USING (
    supplier_id IN (
      SELECT id FROM suppliers WHERE user_id = auth.uid()
    )
  );

-- Service role can do everything (for API routes using service role key)
-- This is automatic for service role — no policy needed.

-- ── Webhook registration helper ───────────────────────────────────────────────
-- Uncomment to enable Supabase realtime webhooks on order INSERT
-- (configure webhook URL in Supabase > Database > Webhooks)
--
-- INSERT INTO supabase_functions.hooks (hook_table_id, hook_name, request_path)
-- SELECT id, 'fulfillment_on_order_insert', '/api/fulfillment/create'
-- FROM information_schema.tables
-- WHERE table_name = 'orders' AND table_schema = 'public'
-- ON CONFLICT DO NOTHING;
