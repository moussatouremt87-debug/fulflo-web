-- Sponsored Surplus AdTech Schema
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id TEXT NOT NULL,
  product_id UUID REFERENCES products(id),
  campaign_name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','ended')),
  cpc_eur DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  daily_budget_eur DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  daily_spend_eur DECIMAL(10,2) DEFAULT 0.00,
  total_spend_eur DECIMAL(10,2) DEFAULT 0.00,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ad_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES ad_campaigns(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('impression','click')),
  product_id UUID,
  user_session TEXT,
  cost_eur DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_events_campaign ON ad_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_events_created ON ad_events(created_at);

-- Seed: Demo Nestlé campaigns
INSERT INTO ad_campaigns (
  id, supplier_id, campaign_name, status, cpc_eur, daily_budget_eur,
  daily_spend_eur, total_spend_eur, impressions, clicks
) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'demo-nestle',
    'Nescafé Gold - Boost Q1',
    'active',
    1.50, 100.00,
    27.00, 142.50,
    234, 18
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'demo-nestle',
    'Maggi Bouillon Flash',
    'active',
    2.00, 75.00,
    24.00, 98.00,
    89, 12
  )
ON CONFLICT (id) DO NOTHING;
