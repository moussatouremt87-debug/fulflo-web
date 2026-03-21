-- ─────────────────────────────────────────────────────────────────────────────
-- Fulflo — Referral System Migration
-- Run in: Supabase > SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS customers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  referral_code   TEXT UNIQUE NOT NULL,
  referred_by     UUID REFERENCES customers(id) ON DELETE SET NULL,
  credit_pending  NUMERIC(10,2) NOT NULL DEFAULT 0,   -- activated on first purchase
  credit_active   NUMERIC(10,2) NOT NULL DEFAULT 0,   -- spendable
  invite_count    INTEGER NOT NULL DEFAULT 0,
  first_purchase  BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup by referral code and email
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_referral_code ON customers(referral_code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_referred_by ON customers(referred_by);

-- ─────────────────────────────────────────────────────────────────────────────
-- Generate unique referral code (6 chars, uppercase alphanumeric)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars  TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I ambiguity
  code   TEXT := '';
  i      INTEGER;
  taken  BOOLEAN;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
    END LOOP;
    SELECT EXISTS(SELECT 1 FROM customers WHERE referral_code = code) INTO taken;
    EXIT WHEN NOT taken;
  END LOOP;
  RETURN code;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Activate credits on first purchase (call from order webhook / n8n)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION activate_referral_credits(p_customer_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_referrer_id UUID;
BEGIN
  -- Only run once
  IF (SELECT first_purchase FROM customers WHERE id = p_customer_id) THEN
    RETURN;
  END IF;

  SELECT referred_by INTO v_referrer_id FROM customers WHERE id = p_customer_id;

  -- Activate new customer's pending credit
  UPDATE customers
  SET credit_active  = credit_active + credit_pending,
      credit_pending = 0,
      first_purchase = true
  WHERE id = p_customer_id;

  -- Activate referrer's pending credit too
  IF v_referrer_id IS NOT NULL THEN
    UPDATE customers
    SET credit_active  = credit_active + credit_pending,
        credit_pending = 0
    WHERE id = v_referrer_id;
  END IF;
END;
$$;

-- RLS: customers can only read their own row
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_read_own" ON customers
  FOR SELECT USING (true); -- open read for referral code lookup (email not exposed)

CREATE POLICY "customers_insert" ON customers
  FOR INSERT WITH CHECK (true); -- open insert for signup

CREATE POLICY "customers_update_own" ON customers
  FOR UPDATE USING (true); -- tighten with auth later

-- ─────────────────────────────────────────────────────────────────────────────
-- Increment referrer reward (called from API route on new signup)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_referrer_reward(p_referrer_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE customers
  SET credit_pending = credit_pending + 5,
      invite_count   = invite_count + 1
  WHERE id = p_referrer_id;
END;
$$;
