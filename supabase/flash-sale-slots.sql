-- Flash Sale Slots — Sprint 12
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

CREATE TABLE IF NOT EXISTS flash_sale_slots (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id           TEXT NOT NULL,
  product_id            UUID,
  campaign_name         TEXT NOT NULL,
  status                TEXT DEFAULT 'pending'
                          CHECK (status IN ('pending','active','ended','won','outbid')),
  bid_eur               DECIMAL(10,2) NOT NULL DEFAULT 150,
  slot_date             TIMESTAMPTZ NOT NULL,
  slot_duration_hours   INTEGER DEFAULT 2,
  flat_fee_eur          DECIMAL(10,2) DEFAULT 150.00,
  impressions           INTEGER DEFAULT 0,
  clicks                INTEGER DEFAULT 0,
  conversions           INTEGER DEFAULT 0,
  revenue_generated_eur DECIMAL(10,2) DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flash_slots_date   ON flash_sale_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_flash_slots_status ON flash_sale_slots(status);
CREATE INDEX IF NOT EXISTS idx_flash_slots_supplier ON flash_sale_slots(supplier_id);

-- Seed demo data
INSERT INTO flash_sale_slots
  (supplier_id, campaign_name, status, bid_eur, slot_date, flat_fee_eur,
   impressions, clicks, conversions, revenue_generated_eur)
VALUES
  ('demo-nestle', 'Nescafé Gold Flash — Lundi soir',  'ended',  150,
   NOW() - INTERVAL '3 days', 150, 8420, 673, 89, 412.50),
  ('demo-nestle', 'Ariel Pods Flash — Vendredi',      'active', 200,
   NOW() + INTERVAL '2 days', 150, 0, 0, 0, 0)
ON CONFLICT DO NOTHING;
