// ─── Daily Cron — runs every day at 7:00 AM UTC ─────────────────────────────
// Triggers: stock check, expiry alerts, pricing adjustments
// Vercel cron calls this automatically. Also callable manually.

import { NextRequest, NextResponse } from "next/server";
import { handleAgentEvent } from "@/lib/agents";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sets this) or admin auth
  const authHeader = req.headers.get("authorization");
  const cronSecret = req.headers.get("x-vercel-cron-secret") || req.headers.get("x-cron-secret");
  const isAuthorized =
    cronSecret === process.env.CRON_SECRET ||
    authHeader === `Bearer ${process.env.ADMIN_SECRET}`;

  if (!isAuthorized && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: { task: string; success: boolean; summary?: string; error?: string }[] = [];

  // 1. Stock & expiry check → Growth agent (pricing optimizer)
  try {
    const response = await handleAgentEvent({
      trigger: "cron:daily-expiry-check",
      payload: {
        instruction: "Vérifie les produits expirant dans les 30 prochains jours. Pour ceux à moins de 14 jours, applique une réduction de -30% supplémentaire. Pour ceux à moins de 7 jours, applique -50%. Logge toutes les actions.",
      },
    });
    results.push({
      task: "expiry-check",
      success: true,
      summary: `${response.actions_taken.length} actions, ${response.tokens_used} tokens`,
    });
  } catch (e) {
    results.push({ task: "expiry-check", success: false, error: String(e) });
  }

  // 2. Stock alerts → Operations
  try {
    const response = await handleAgentEvent({
      trigger: "cron:hourly-stock-check",
      payload: {
        instruction: "Vérifie les niveaux de stock. Produits sous 20 unités = alerte critique. Sous 50 = attention. Crée des inventory_alerts pour chaque produit concerné.",
      },
    });
    results.push({
      task: "stock-check",
      success: true,
      summary: `${response.actions_taken.length} actions, ${response.tokens_used} tokens`,
    });
  } catch (e) {
    results.push({ task: "stock-check", success: false, error: String(e) });
  }

  return NextResponse.json({
    cron: "daily",
    timestamp: new Date().toISOString(),
    results,
  });
}
