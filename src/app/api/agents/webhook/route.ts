// ─── POST /api/agents/webhook ────────────────────────────────────────────────
// Generic webhook receiver for n8n workflows.
// n8n calls this endpoint with a trigger name and payload.
// This routes to the orchestrator which delegates to the right department.

import { NextRequest, NextResponse } from "next/server";
import { handleAgentEvent } from "@/lib/agents";
import type { EventTrigger } from "@/lib/agents";

// Map n8n workflow names to event triggers
const N8N_TRIGGER_MAP: Record<string, EventTrigger> = {
  "new-supplier-lead": "n8n:new-supplier-lead",
  "order-placed": "n8n:order-placed",
  "stock-low": "n8n:stock-low",
  "expiry-approaching": "n8n:expiry-approaching",
  "ad-budget-exhausted": "n8n:ad-budget-exhausted",
  "refund-requested": "n8n:refund-requested",
  "supplier-onboarding": "n8n:supplier-onboarding",
  "weekly-kpi-report": "cron:weekly-kpi-report",
  "competitor-price-check": "n8n:competitor-price-check",
  "ripple-conversion": "n8n:ripple-conversion",
  "content-calendar": "n8n:content-calendar",
  "customer-churn-risk": "n8n:customer-churn-risk",
};

export async function POST(req: NextRequest) {
  // n8n sends a webhook secret header for auth
  const webhookSecret = req.headers.get("x-webhook-secret");
  const expectedSecret = process.env.ADMIN_SECRET;
  if (!expectedSecret || webhookSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const workflowName = body.workflow || body.trigger;

    if (!workflowName) {
      return NextResponse.json(
        { error: "Missing workflow/trigger name" },
        { status: 400 }
      );
    }

    const trigger = N8N_TRIGGER_MAP[workflowName];
    if (!trigger) {
      return NextResponse.json(
        { error: `Unknown workflow: ${workflowName}`, available: Object.keys(N8N_TRIGGER_MAP) },
        { status: 400 }
      );
    }

    const response = await handleAgentEvent({
      trigger,
      payload: body.payload || body.data || {},
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      workflow: workflowName,
      agent_response: response.text,
      actions: response.actions_taken.length,
      duration_ms: response.duration_ms,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[webhook] Agent error:", msg);
    return NextResponse.json(
      { error: "Webhook processing failed", details: msg },
      { status: 500 }
    );
  }
}
