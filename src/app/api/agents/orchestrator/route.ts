// ─── POST /api/agents/orchestrator ──────────────────────────────────────────
// Main entry point for triggering autonomous agents.
// Called by: n8n webhooks, Stripe webhooks, cron jobs, or manual invocation.

import { NextRequest, NextResponse } from "next/server";
import { handleAgentEvent } from "@/lib/agents";
import type { EventTrigger } from "@/lib/agents";
import { rateLimit } from "@/lib/rateLimit";

const agentLimiter = rateLimit({ limit: 20, windowMs: 60 * 1000 });

export async function POST(req: NextRequest) {
  // Rate limit
  const { success: rateLimitOk } = agentLimiter(req);
  if (!rateLimitOk) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Verify the request is authorized
  const authHeader = req.headers.get("authorization");
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Validate required fields
    if (!body.trigger) {
      return NextResponse.json(
        { error: "Missing required field: trigger" },
        { status: 400 }
      );
    }

    const event = {
      trigger: body.trigger as EventTrigger,
      payload: body.payload || {},
      timestamp: body.timestamp || new Date().toISOString(),
      source_agent: body.source_agent,
    };

    const response = await handleAgentEvent(event);

    return NextResponse.json({
      success: true,
      agent_response: response.text,
      actions_taken: response.actions_taken.length,
      tasks_created: response.tasks_created.length,
      messages_sent: response.messages_sent.length,
      tokens_used: response.tokens_used,
      duration_ms: response.duration_ms,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[orchestrator] Error:", msg);
    return NextResponse.json(
      { error: "Agent execution failed", details: msg },
      { status: 500 }
    );
  }
}
