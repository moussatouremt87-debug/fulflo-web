// ─── FulFlo Agent Types ──────────────────────────────────────────────────────

export type AgentDepartment =
  | "engineering"
  | "product"
  | "growth"
  | "operations"
  | "finance"
  | "ai-automation"
  | "design";

export type AgentActionType =
  | "query"
  | "update"
  | "email"
  | "deploy"
  | "alert"
  | "analyze"
  | "create"
  | "price-adjust"
  | "outreach";

export type TaskStatus = "queued" | "processing" | "completed" | "failed" | "cancelled";
export type ActionStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export type MessageType = "request" | "response" | "alert" | "handoff";

// ─── Event triggers that wake up agents ─────────────────────────────────────

export type EventTrigger =
  | "n8n:order-placed"
  | "n8n:new-supplier-lead"
  | "n8n:stock-low"
  | "n8n:expiry-approaching"
  | "n8n:ad-budget-exhausted"
  | "n8n:refund-requested"
  | "n8n:supplier-onboarding"
  | "n8n:competitor-price-check"
  | "n8n:ripple-conversion"
  | "n8n:content-calendar"
  | "n8n:customer-churn-risk"
  | "cron:weekly-kpi-report"
  | "cron:daily-expiry-check"
  | "cron:hourly-stock-check"
  | "stripe:payment-succeeded"
  | "stripe:payment-failed"
  | "stripe:dispute-created"
  | "stripe:subscription-created"
  | "manual"
  | `chain:${AgentDepartment}`;

// ─── Core interfaces ────────────────────────────────────────────────────────

export interface AgentEvent {
  trigger: EventTrigger;
  payload: Record<string, unknown>;
  timestamp?: string;
  source_agent?: AgentDepartment;
}

export interface AgentAction {
  id?: string;
  agent: AgentDepartment;
  sub_agent?: string;
  action_type: AgentActionType;
  event_trigger: EventTrigger;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: ActionStatus;
  error_message?: string;
  tokens_used?: number;
  cost_eur?: number;
  duration_ms?: number;
  created_at?: string;
  completed_at?: string;
}

export interface AgentTask {
  id?: string;
  agent: AgentDepartment;
  sub_agent?: string;
  task_type: string;
  priority: number;
  payload: Record<string, unknown>;
  status: TaskStatus;
  retry_count?: number;
  max_retries?: number;
  scheduled_for?: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  result?: Record<string, unknown>;
  parent_task_id?: string;
}

export interface AgentMessage {
  id?: string;
  from_agent: AgentDepartment;
  to_agent: AgentDepartment;
  message_type: MessageType;
  subject: string;
  body: Record<string, unknown>;
  status?: "unread" | "read" | "processed" | "archived";
  parent_message_id?: string;
  task_id?: string;
}

// ─── Tool definitions for Claude API ────────────────────────────────────────

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface AgentConfig {
  agent: AgentDepartment;
  display_name: string;
  system_prompt: string;
  tools: ToolDefinition[];
  sub_agents: string[];
  model: string;
  max_tokens: number;
  temperature: number;
}

// ─── Claude API types ───────────────────────────────────────────────────────

export interface ClaudeToolUse {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ClaudeToolResult {
  type: "tool_result";
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

export interface AgentResponse {
  text: string;
  actions_taken: AgentAction[];
  tasks_created: AgentTask[];
  messages_sent: AgentMessage[];
  tokens_used: number;
  duration_ms: number;
}

// ─── Event routing table ────────────────────────────────────────────────────

export const EVENT_ROUTING: Record<EventTrigger, { agent: AgentDepartment; sub_agent?: string; task_type: string }> = {
  "n8n:order-placed": { agent: "operations", sub_agent: "logistics", task_type: "process-order" },
  "n8n:new-supplier-lead": { agent: "operations", sub_agent: "supplier-manager", task_type: "supplier-outreach" },
  "n8n:stock-low": { agent: "growth", sub_agent: "pricing-optimizer", task_type: "low-stock-pricing" },
  "n8n:expiry-approaching": { agent: "growth", sub_agent: "pricing-optimizer", task_type: "expiry-discount" },
  "n8n:ad-budget-exhausted": { agent: "growth", sub_agent: "cro-specialist", task_type: "pause-campaign" },
  "n8n:refund-requested": { agent: "finance", sub_agent: "treasury", task_type: "process-refund" },
  "n8n:supplier-onboarding": { agent: "operations", sub_agent: "supplier-manager", task_type: "activate-supplier" },
  "n8n:competitor-price-check": { agent: "growth", sub_agent: "pricing-optimizer", task_type: "price-comparison" },
  "n8n:ripple-conversion": { agent: "growth", sub_agent: "referral-manager", task_type: "process-referral" },
  "n8n:content-calendar": { agent: "growth", sub_agent: "copywriter", task_type: "generate-content" },
  "n8n:customer-churn-risk": { agent: "growth", sub_agent: "email-marketer", task_type: "re-engagement" },
  "cron:weekly-kpi-report": { agent: "finance", sub_agent: "revenue-analyst", task_type: "kpi-report" },
  "cron:daily-expiry-check": { agent: "growth", sub_agent: "pricing-optimizer", task_type: "expiry-scan" },
  "cron:hourly-stock-check": { agent: "operations", sub_agent: "logistics", task_type: "stock-audit" },
  "stripe:payment-succeeded": { agent: "finance", sub_agent: "revenue-analyst", task_type: "record-payment" },
  "stripe:payment-failed": { agent: "finance", sub_agent: "treasury", task_type: "payment-recovery" },
  "stripe:dispute-created": { agent: "finance", sub_agent: "treasury", task_type: "handle-dispute" },
  "stripe:subscription-created": { agent: "finance", sub_agent: "revenue-analyst", task_type: "new-subscription" },
  manual: { agent: "operations", task_type: "manual-task" },
  "chain:engineering": { agent: "engineering", task_type: "chained-task" },
  "chain:product": { agent: "product", task_type: "chained-task" },
  "chain:growth": { agent: "growth", task_type: "chained-task" },
  "chain:operations": { agent: "operations", task_type: "chained-task" },
  "chain:finance": { agent: "finance", task_type: "chained-task" },
  "chain:ai-automation": { agent: "ai-automation", task_type: "chained-task" },
  "chain:design": { agent: "design", task_type: "chained-task" },
};
