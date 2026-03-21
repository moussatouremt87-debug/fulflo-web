-- ─────────────────────────────────────────────────────────────────────────────
-- Fulflo — Supplier Portal Migration
-- Run in: Supabase > SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension (if not already)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Suppliers table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name    TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  country         TEXT DEFAULT 'FR',
  verified        BOOLEAN DEFAULT FALSE,
  plan            TEXT DEFAULT 'free' CHECK (plan IN ('free','pro','enterprise')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Add supplier_id to products table ─────────────────────────────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id),
  ADD COLUMN IF NOT EXISTS ean         TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS moq         INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS warehouse   TEXT DEFAULT 'Paris CDG';

-- ── RLS: suppliers can only see/edit their own products ───────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read of in-stock products
CREATE POLICY IF NOT EXISTS "Public can read in-stock products"
  ON products FOR SELECT
  USING (stock_units > 0);

-- Suppliers manage their own products
CREATE POLICY IF NOT EXISTS "Suppliers manage own products"
  ON products FOR ALL
  USING (
    supplier_id IN (
      SELECT id FROM suppliers WHERE user_id = auth.uid()
    )
  );

-- RLS on suppliers
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Suppliers can read own record"
  ON suppliers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Suppliers can update own record"
  ON suppliers FOR UPDATE
  USING (user_id = auth.uid());

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_expiry       ON products(expiry_date);
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id     ON suppliers(user_id);
