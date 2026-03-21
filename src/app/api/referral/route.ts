import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// GET /api/referral?code=ABC123  or  ?email=user@example.com
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.toUpperCase();
  const email = searchParams.get("email")?.toLowerCase();
  const supabase = db();

  if (code) {
    const { data } = await supabase
      .from("customers")
      .select("referral_code, invite_count, credit_active, credit_pending")
      .eq("referral_code", code)
      .single();
    if (!data) return NextResponse.json({ error: "Code introuvable" }, { status: 404 });
    return NextResponse.json(data);
  }

  if (email) {
    const { data } = await supabase
      .from("customers")
      .select("referral_code, invite_count, credit_active, credit_pending")
      .eq("email", email)
      .single();
    if (!data) return NextResponse.json({ error: "Email introuvable" }, { status: 404 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Paramètre manquant: code ou email requis" }, { status: 400 });
}
