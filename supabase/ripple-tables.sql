-- Sprint 13: Ripple social commerce tables
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/fgctemruakcxgwgmxhck/sql

CREATE TABLE IF NOT EXISTS ripple_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id TEXT NOT NULL,
  product_id UUID,
  campaign_name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','ended','budget_exhausted')),
  sharer_voucher_eur DECIMAL(10,2) DEFAULT 3.00,
  friend_voucher_eur DECIMAL(10,2) DEFAULT 2.00,
  cost_per_conversion DECIMAL(10,2) DEFAULT 1.50,
  activation_fee_eur DECIMAL(10,2) DEFAULT 199.00,
  total_budget_eur DECIMAL(10,2) NOT NULL DEFAULT 500,
  total_spent_eur DECIMAL(10,2) DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ripple_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES ripple_campaigns(id),
  sharer_id TEXT NOT NULL,
  product_id UUID,
  share_code TEXT UNIQUE NOT NULL,
  share_channel TEXT DEFAULT 'copy',
  converted BOOLEAN DEFAULT FALSE,
  converted_by TEXT,
  converted_at TIMESTAMPTZ,
  sharer_voucher_code TEXT,
  friend_voucher_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  owner_email TEXT,
  amount_eur DECIMAL(10,2) NOT NULL,
  source TEXT DEFAULT 'ripple_sharer',
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '90 days',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ripple_share_code ON ripple_shares(share_code);

-- Seed demo campaign
INSERT INTO ripple_campaigns (supplier_id, campaign_name, status, total_budget_eur, total_shares, total_conversions, total_spent_eur)
VALUES ('demo-nestle', 'Nescafé Gold — Programme Ambassadeur', 'active', 500, 47, 12, 18.00)
ON CONFLICT DO NOTHING;

-- Bundle campaigns table
CREATE TABLE IF NOT EXISTS bundle_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','ended')),
  supplier_ids TEXT[] NOT NULL,
  product_ids UUID[] NOT NULL,
  bundle_price_eur DECIMAL(10,2) NOT NULL,
  bundle_discount_percent INTEGER NOT NULL,
  activation_fee_eur DECIMAL(10,2) DEFAULT 299.00,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue_generated_eur DECIMAL(10,2) DEFAULT 0,
  valid_until TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed demo bundles
INSERT INTO bundle_campaigns
  (name, status, supplier_ids, product_ids, bundle_price_eur, bundle_discount_percent, activation_fee_eur, impressions, clicks, conversions, revenue_generated_eur)
VALUES
  ('Bundle Petit-Déjeuner Premium', 'active', ARRAY['demo-nestle'], ARRAY[]::UUID[], 7.99, 55, 299, 3240, 187, 34, 271.66),
  ('Bundle Hygiène Famille', 'active', ARRAY['demo-nestle'], ARRAY[]::UUID[], 9.49, 48, 299, 2180, 143, 22, 208.78)
ON CONFLICT DO NOTHING;
