import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email: string = (body.email ?? "").toLowerCase().trim();
  const referral_code_used: string = (body.referral_code ?? "").toUpperCase().trim();
  const supabase = db();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  // Check if already signed up
  const { data: existing } = await supabase
    .from("customers")
    .select("id, referral_code, credit_pending, credit_active, invite_count")
    .eq("email", email)
    .single();

  if (existing) {
    return NextResponse.json({ success: true, already_exists: true, customer: existing });
  }

  // Resolve referrer
  let referrer_id: string | null = null;
  if (referral_code_used) {
    const { data: referrer } = await supabase
      .from("customers")
      .select("id")
      .eq("referral_code", referral_code_used)
      .single();
    if (referrer) referrer_id = referrer.id;
  }

  // Generate unique referral code
  let new_code = generateCode();
  for (let i = 0; i < 10; i++) {
    const { data: taken } = await supabase
      .from("customers").select("id").eq("referral_code", new_code).single();
    if (!taken) break;
    new_code = generateCode();
  }

  const { data: customer, error } = await supabase
    .from("customers")
    .insert({
      email,
      referral_code: new_code,
      referred_by: referrer_id,
      credit_pending: referrer_id ? 5 : 0,
    })
    .select("id, referral_code, credit_pending, credit_active, invite_count")
    .single();

  if (error) {
    return NextResponse.json({ error: "Inscription échouée" }, { status: 500 });
  }

  // Credit referrer: +€5 pending + increment invite count
  if (referrer_id) {
    await supabase.rpc("increment_referrer_reward", { p_referrer_id: referrer_id });
  }

  return NextResponse.json({ success: true, customer });
}
