// ─── Weekly Cron — runs every Monday at 8:00 AM UTC ─────────────────────────
// Triggers: KPI report, revenue analysis, growth recommendations
// Vercel cron calls this automatically. Also callable manually.

import { NextRequest, NextResponse } from "next/server";
import { handleAgentEvent } from "@/lib/agents";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = req.headers.get("x-vercel-cron-secret") || req.headers.get("x-cron-secret");
  const isAuthorized =
    cronSecret === process.env.CRON_SECRET ||
    authHeader === `Bearer ${process.env.ADMIN_SECRET}`;

  if (!isAuthorized && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: { task: string; success: boolean; summary?: string; error?: string }[] = [];

  // 1. Weekly KPI report → Finance agent
  try {
    const response = await handleAgentEvent({
      trigger: "cron:weekly-kpi-report",
      payload: {
        instruction: "Génère le rapport KPI hebdomadaire. Revenus par moteur, unit economics, santé produits, cohorts clients. Identifie les tendances et anomalies. Envoie le résumé à james@fulflo.app.",
      },
    });
    results.push({
      task: "weekly-kpi",
      success: true,
      summary: `${response.actions_taken.length} actions, ${response.tokens_used} tokens`,
    });
  } catch (e) {
    results.push({ task: "weekly-kpi", success: false, error: String(e) });
  }

  // 2. Growth recommendations → Growth Strategy Architect
  try {
    const response = await handleAgentEvent({
      trigger: "manual",
      payload: {
        department: "growth",
        sub_agent: "growth-strategy-architect",
        instruction: "Analyse hebdomadaire: 1) Quels produits performent le mieux cette semaine ? 2) Quels produits stagnent ? 3) Recommande 3 actions growth pour la semaine prochaine. Crée des tâches pour les sub-agents concernés.",
      },
    });
    results.push({
      task: "growth-review",
      success: true,
      summary: `${response.actions_taken.length} actions, ${response.tasks_created.length} tasks created`,
    });
  } catch (e) {
    results.push({ task: "growth-review", success: false, error: String(e) });
  }

  return NextResponse.json({
    cron: "weekly",
    timestamp: new Date().toISOString(),
    results,
  });
}
