-- ─────────────────────────────────────────────────────────────────────────────
-- Fulflo — Stripe Checkout Migration
-- Adds payment columns to orders table
-- Run in: Supabase > SQL Editor (after fulfillment-migration.sql)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS stripe_session_id  TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_payment_id  TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS paid_at            TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS currency           TEXT DEFAULT 'eur' CHECK (currency IN ('eur','chf'));

-- Fast lookups by Stripe IDs (for webhook handler)
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session  ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment  ON orders(stripe_payment_id);
