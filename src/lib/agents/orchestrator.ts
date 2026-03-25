// ─── FulFlo Agent Orchestrator ────────────────────────────────────────────────
// Receives events, routes to department agents, executes tools, logs everything.

import { createClient } from "@supabase/supabase-js";
import {
  AgentEvent,
  AgentAction,
  AgentTask,
  AgentMessage,
  AgentResponse,
  AgentDepartment,
  EVENT_ROUTING,
  ClaudeToolUse,
  ClaudeToolResult,
} from "./types";
import { getAgentConfig } from "./configs";
import { executeAgentTool } from "./tools";
import { getGrowthSubAgent } from "./growth-team";
import { getOperationsSubAgent } from "./operations-team";
import { getFinanceSubAgent } from "./finance-team";

// Service role client for agent operations (bypasses RLS)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

// ─── Main orchestrator entry point ──────────────────────────────────────────

export async function handleAgentEvent(event: AgentEvent): Promise<AgentResponse> {
  const startTime = Date.now();
  const supabase = getServiceClient();

  // 1. Route event to the correct department
  let routing = EVENT_ROUTING[event.trigger];
  if (!routing) {
    throw new Error(`No routing defined for event: ${event.trigger}`);
  }

  // For manual triggers, respect the department specified in payload
  if (event.trigger === "manual" && event.payload.department) {
    const dept = event.payload.department as AgentDepartment;
    routing = { agent: dept, sub_agent: event.payload.sub_agent as string | undefined, task_type: "manual-task" };
  }

  // 2. Log the action
  const { data: action } = await supabase
    .from("agent_actions")
    .insert({
      agent: routing.agent,
      sub_agent: routing.sub_agent,
      action_type: "analyze",
      event_trigger: event.trigger,
      input: event.payload,
      status: "running",
    })
    .select()
    .single();

  try {
    // 3. Get agent config (system prompt + tools)
    const config = getAgentConfig(routing.agent);

    // 3b. If a specific sub-agent is requested, use its specialized prompt
    let systemPrompt = config.system_prompt;
    if (routing.sub_agent) {
      const subAgent =
        routing.agent === "growth" ? getGrowthSubAgent(routing.sub_agent) :
        routing.agent === "operations" ? getOperationsSubAgent(routing.sub_agent) :
        routing.agent === "finance" ? getFinanceSubAgent(routing.sub_agent) :
        undefined;
      if (subAgent) {
        systemPrompt = subAgent.system_prompt;
      }
    }

    // 4. Call Claude API with department-specific prompt
    const response = await callClaudeAgent(systemPrompt, config.tools, event, config.model, config.max_tokens);

    // 5. Log completion
    const duration = Date.now() - startTime;
    if (action) {
      await supabase
        .from("agent_actions")
        .update({
          status: "completed",
          output: { text: response.text, actions: response.actions_taken.length },
          tokens_used: response.tokens_used,
          cost_eur: estimateCost(response.tokens_used, config.model),
          duration_ms: duration,
          completed_at: new Date().toISOString(),
        })
        .eq("id", action.id);
    }

    return { ...response, duration_ms: duration };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);

    if (action) {
      await supabase
        .from("agent_actions")
        .update({
          status: "failed",
          error_message: errMsg,
          duration_ms: Date.now() - startTime,
          completed_at: new Date().toISOString(),
        })
        .eq("id", action.id);
    }

    throw error;
  }
}

// ─── Call Claude API with tool use ──────────────────────────────────────────

async function callClaudeAgent(
  systemPrompt: string,
  tools: { name: string; description: string; input_schema: Record<string, unknown> }[],
  event: AgentEvent,
  model: string,
  maxTokens: number
): Promise<AgentResponse> {
  const apiKey = process.env.FULFLO_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("FULFLO_ANTHROPIC_API_KEY not set");

  const actions_taken: AgentAction[] = [];
  const tasks_created: AgentTask[] = [];
  const messages_sent: AgentMessage[] = [];
  let totalTokens = 0;

  // Build the initial user message with event context
  const userMessage = buildEventMessage(event);

  // Conversation loop (tool use may require multiple turns)
  type MessageContent = { type: "text"; text: string } | ClaudeToolUse | ClaudeToolResult;
  const messages: { role: "user" | "assistant"; content: string | MessageContent[] }[] = [
    { role: "user", content: userMessage },
  ];

  const MAX_TURNS = 10;
  let finalText = "";

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        tools: tools.length > 0 ? tools : undefined,
        messages,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Claude API error ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    totalTokens += (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0);

    // Collect assistant response
    const assistantContent: MessageContent[] = data.content;
    messages.push({ role: "assistant", content: assistantContent });

    // Check if there are tool calls
    const toolUses = assistantContent.filter(
      (c): c is ClaudeToolUse => c.type === "tool_use"
    );

    // Collect text response
    for (const block of assistantContent) {
      if (block.type === "text") {
        finalText += (block as { type: "text"; text: string }).text;
      }
    }

    // If no tool calls, we're done
    if (toolUses.length === 0 || data.stop_reason !== "tool_use") {
      break;
    }

    // Execute each tool call
    const toolResults: ClaudeToolResult[] = [];
    for (const toolUse of toolUses) {
      const result = await executeAgentTool(toolUse.name, toolUse.input);

      // Track the action
      actions_taken.push({
        agent: EVENT_ROUTING[event.trigger].agent,
        sub_agent: EVENT_ROUTING[event.trigger].sub_agent,
        action_type: categorizeToolAction(toolUse.name),
        event_trigger: event.trigger,
        input: toolUse.input,
        output: { result: result.content },
        status: result.is_error ? "failed" : "completed",
        error_message: result.is_error ? result.content : undefined,
      });

      // Check if the tool created a task or message
      if (toolUse.name === "create_agent_task") {
        tasks_created.push(toolUse.input as unknown as AgentTask);
      }
      if (toolUse.name === "send_agent_message") {
        messages_sent.push(toolUse.input as unknown as AgentMessage);
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: result.content,
        is_error: result.is_error,
      });
    }

    messages.push({ role: "user", content: toolResults });
  }

  return {
    text: finalText,
    actions_taken,
    tasks_created,
    messages_sent,
    tokens_used: totalTokens,
    duration_ms: 0,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildEventMessage(event: AgentEvent): string {
  const now = new Date().toISOString();
  return `[EVENT RECEIVED — ${now}]
Trigger: ${event.trigger}
${event.source_agent ? `Source agent: ${event.source_agent}` : ""}

Payload:
${JSON.stringify(event.payload, null, 2)}

Analyze this event and take the appropriate actions using your tools. Be decisive and act — do not ask for clarification. Log your reasoning. If this requires another department, use send_agent_message to hand off.`;
}

function categorizeToolAction(toolName: string): AgentAction["action_type"] {
  if (toolName.startsWith("query_") || toolName.startsWith("get_")) return "query";
  if (toolName.startsWith("update_") || toolName.startsWith("set_")) return "update";
  if (toolName.startsWith("send_email") || toolName.startsWith("email_")) return "email";
  if (toolName.startsWith("deploy_")) return "deploy";
  if (toolName.startsWith("alert_")) return "alert";
  if (toolName.startsWith("analyze_")) return "analyze";
  if (toolName.startsWith("create_")) return "create";
  if (toolName.startsWith("adjust_price")) return "price-adjust";
  if (toolName.startsWith("outreach_")) return "outreach";
  return "query";
}

function estimateCost(tokens: number, model: string): number {
  // Approximate cost per 1M tokens (input+output blended)
  const rates: Record<string, number> = {
    "claude-sonnet-4-20250514": 9.0,
    "claude-haiku-4-5-20251001": 1.5,
    "claude-opus-4-6-20250620": 45.0,
  };
  const rate = rates[model] ?? 9.0;
  return (tokens / 1_000_000) * rate;
}

// ─── Direct agent invocation (for manual/Claude Code use) ───────────────────

export async function invokeAgent(
  department: AgentDepartment,
  instruction: string,
  context?: Record<string, unknown>
): Promise<AgentResponse> {
  return handleAgentEvent({
    trigger: "manual",
    payload: { instruction, context },
    source_agent: department,
  });
}

// ─── Chain to another department ────────────────────────────────────────────

export async function chainToAgent(
  fromDepartment: AgentDepartment,
  toDepartment: AgentDepartment,
  payload: Record<string, unknown>
): Promise<AgentResponse> {
  const supabase = getServiceClient();

  // Log the handoff
  await supabase.from("agent_messages").insert({
    from_agent: fromDepartment,
    to_agent: toDepartment,
    message_type: "handoff",
    subject: `Chain from ${fromDepartment}`,
    body: payload,
  });

  return handleAgentEvent({
    trigger: `chain:${toDepartment}`,
    payload,
    source_agent: fromDepartment,
  });
}
