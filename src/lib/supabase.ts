import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ─── Server / API-route client (new instance per call) ────────────────────────
export function getSupabase() {
  return createClient(URL, ANON);
}

// ─── Browser singleton — prevents "GoTrueClient: multiple instances" warning ──
let _browser: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error("supabaseBrowser() must only be called on the client");
  }
  if (!_browser) {
    _browser = createClient(URL, ANON, {
      auth: { persistSession: true, storageKey: "fulflo_auth_v1" },
    });
  }
  return _browser;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  email: string;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  preferred_language: string | null;
  referral_code: string;
  referred_by: string | null;
  total_orders: number | null;
  total_spent: number | null;
  created_at: string;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  price_retail_eur: number;
  price_surplus_eur: number;
  stock_units: number;
  expiry_date: string;
  image_url: string | null;
  category: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  const { data } = await getSupabase()
    .from("customers")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return data ?? null;
}

export async function getActiveFlashSale(): Promise<Product | null> {
  const now = new Date().toISOString();
  const { data } = await getSupabase()
    .from("products")
    .select("id, brand, name, price_retail_eur, price_surplus_eur, stock_units, expiry_date, image_url, category")
    .gt("flash_sale_end_time", now)
    .gt("stock_units", 0)
    .order("flash_sale_end_time", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}
