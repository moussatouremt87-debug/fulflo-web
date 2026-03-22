import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generatePackingSlipHtml } from "@/lib/packingSlip";

export const dynamic = "force-dynamic";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  // Basic auth: require admin secret
  const secret = req.nextUrl.searchParams.get("secret");
  if (process.env.ADMIN_SECRET && secret !== process.env.ADMIN_SECRET) {
    return new NextResponse("Non autorisé", { status: 401 });
  }

  const { orderId } = await params;

  // Fetch order from Supabase
  const { data: order } = await db()
    .from("orders")
    .select("id, customer_email, created_at, delivery_address")
    .eq("id", orderId)
    .maybeSingle();

  // Fetch items from Stripe metadata — fall back to a placeholder if order not found
  let items: { brand: string; name: string; quantity: number; ean?: string }[] = [];
  let customerEmail = order?.customer_email ?? "client@fulflo.app";
  let shippingAddress = order?.delivery_address ?? undefined;
  const createdAt = order?.created_at ?? new Date().toISOString();

  // Try to get items from products table via order metadata
  // (items are stored in Stripe metadata as items_compact)
  // For now, return a minimal slip — the Stripe session is the source of truth
  if (!order) {
    // No order found — return 404
    return new NextResponse("Commande introuvable", { status: 404 });
  }

  const html = generatePackingSlipHtml({
    orderId,
    createdAt,
    items,
    customerEmail,
    shippingAddress,
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
