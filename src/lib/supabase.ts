import { createClient } from "@supabase/supabase-js";

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  brand: string;
  name: string;
  size: string;
  original_price: number;
  current_price: number;
  stock_units: number;
  expiry_date: string;
  flash_sale_end_time: string | null;
  ai_pricing_enabled: boolean;
  image_url: string | null;
  category: string;
  created_at: string;
}

export interface Customer {
  id: string;
  email: string;
  referral_code: string;
  referred_by: string | null;
  credit_pending: number;
  credit_active: number;
  invite_count: number;
  first_purchase: boolean;
  created_at: string;
}

// ─── Referral helpers ─────────────────────────────────────────────────────────

export async function getCustomerByCode(code: string): Promise<Partial<Customer> | null> {
  const { data } = await getSupabase()
    .from("customers")
    .select("id, referral_code, invite_count, credit_active, credit_pending")
    .eq("referral_code", code.toUpperCase())
    .single();
  return data ?? null;
}

export async function getCustomerByEmail(email: string): Promise<Partial<Customer> | null> {
  const { data } = await getSupabase()
    .from("customers")
    .select("referral_code, invite_count, credit_active, credit_pending")
    .eq("email", email.toLowerCase())
    .single();
  return data ?? null;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getActiveFlashSale(): Promise<Product | null> {
  const now = new Date().toISOString();
  const { data, error } = await getSupabase()
    .from("products")
    .select("*")
    .gt("flash_sale_end_time", now)
    .gt("stock_units", 0)
    .order("flash_sale_end_time", { ascending: true })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await getSupabase()
    .from("products")
    .select("*")
    .gt("stock_units", 0)
    .order("expiry_date", { ascending: true });

  if (error) return [];
  return data ?? [];
}
