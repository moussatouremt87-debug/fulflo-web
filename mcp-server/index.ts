#!/usr/bin/env npx tsx
// ─── FulFlo MCP Server ──────────────────────────────────────────────────────
// Exposes autonomous agent capabilities to Claude Code.
// Run: npx tsx mcp-server/index.ts
// Configure in Claude Code settings as a stdio MCP server.

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { config } from "dotenv";
import { resolve } from "path";

// Load env from the Next.js project
config({ path: resolve(import.meta.dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ─── MCP Server Setup ──────────────────────────────────────────────────────

const server = new Server(
  { name: "fulflo-agents", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// ─── Tool Definitions ───────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // ── Orchestrator ────────────────────────────────────────────────────
    {
      name: "invoke_agent",
      description: "Invoke a FulFlo department agent with an instruction. The agent will autonomously analyze the situation and take actions using its tools (Supabase, Stripe, email, etc.). For Growth department, you can target a specific sub-agent.",
      inputSchema: {
        type: "object" as const,
        properties: {
          department: {
            type: "string",
            enum: ["growth", "operations", "finance", "engineering", "product", "ai-automation", "design"],
            description: "Which department agent to invoke",
          },
          sub_agent: {
            type: "string",
            enum: [
              "growth-strategy-architect", "icp-builder", "lead-sourcing-agent", "cold-outreach-agent",
              "lead-magnet-creator", "landing-page-agent", "viral-hook-generator", "content-engine-agent",
              "authority-builder", "seo-strategist", "content-repurposing-agent", "offer-optimisation-agent",
              "sales-page-writer", "objection-handling-agent", "sales-call-prep-agent", "follow-up-agent",
              "onboarding-optimisation-agent", "customer-insight-agent", "upsell-expansion-agent", "churn-reduction-agent",
            ],
            description: "Optional: specific Growth sub-agent to invoke (only for growth department)",
          },
          instruction: {
            type: "string",
            description: "What you want the agent to do (be specific)",
          },
        },
        required: ["department", "instruction"],
      },
    },
    {
      name: "trigger_event",
      description: "Trigger an autonomous agent event (simulates what n8n/webhooks would trigger). Use to test agent workflows.",
      inputSchema: {
        type: "object" as const,
        properties: {
          trigger: {
            type: "string",
            description: "Event trigger name (e.g., n8n:order-placed, n8n:stock-low, cron:weekly-kpi-report)",
          },
          payload: {
            type: "object",
            description: "Event payload data",
          },
        },
        required: ["trigger"],
      },
    },

    // ── Agent Status ────────────────────────────────────────────────────
    {
      name: "agent_status",
      description: "Get the status of all FulFlo agents — recent actions, pending tasks, unread messages, cost tracking.",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
    },
    {
      name: "agent_actions_log",
      description: "Get recent agent actions log. Filter by department or status.",
      inputSchema: {
        type: "object" as const,
        properties: {
          department: { type: "string", description: "Filter by department" },
          status: { type: "string", enum: ["pending", "running", "completed", "failed"] },
          limit: { type: "number", description: "Max results (default 20)" },
        },
      },
    },

    // ── Direct Data Access ──────────────────────────────────────────────
    {
      name: "fulflo_kpi",
      description: "Get FulFlo KPI dashboard — key business metrics from the v_kpi_dashboard SQL view.",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
    },
    {
      name: "fulflo_revenue",
      description: "Get FulFlo revenue breakdown by engine (marketplace commission, retail media, data SaaS).",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
    },
    {
      name: "fulflo_product_health",
      description: "Get product health metrics — sales velocity, margin, stock days remaining.",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
    },
    {
      name: "fulflo_unit_economics",
      description: "Get per-order unit economics — revenue, COGS, commission, contribution margin.",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
    },
    {
      name: "fulflo_products",
      description: "Query FulFlo product catalog. Optionally filter by low stock or expiry.",
      inputSchema: {
        type: "object" as const,
        properties: {
          low_stock_threshold: { type: "number", description: "Show products with stock below this" },
          expiring_before: { type: "string", description: "ISO date — products expiring before this" },
        },
      },
    },
    {
      name: "fulflo_orders",
      description: "Query recent FulFlo orders. Optionally filter by status.",
      inputSchema: {
        type: "object" as const,
        properties: {
          status: { type: "string", enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"] },
          limit: { type: "number" },
        },
      },
    },
    {
      name: "fulflo_stripe_balance",
      description: "Get the current Stripe account balance.",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
    },
  ],
}));

// ─── Tool Execution ─────────────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // ── Orchestrator calls ──────────────────────────────────────────
      case "invoke_agent": {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/agents/orchestrator`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.ADMIN_SECRET}`,
          },
          body: JSON.stringify({
            trigger: "manual",
            payload: {
              instruction: args?.instruction,
              department: args?.department,
              sub_agent: args?.sub_agent,
            },
            source_agent: args?.department,
          }),
        });
        const data = await res.json();
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      }

      case "trigger_event": {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/agents/orchestrator`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.ADMIN_SECRET}`,
          },
          body: JSON.stringify({
            trigger: args?.trigger,
            payload: args?.payload || {},
          }),
        });
        const data = await res.json();
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      }

      // ── Agent Status ────────────────────────────────────────────────
      case "agent_status": {
        const [actions, tasks, messages] = await Promise.all([
          supabase
            .from("agent_actions")
            .select("agent, status, action_type, created_at")
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("agent_tasks")
            .select("*")
            .in("status", ["queued", "processing"]),
          supabase
            .from("agent_messages")
            .select("*")
            .eq("status", "unread"),
        ]);
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              recent_actions: actions.data,
              pending_tasks: tasks.data,
              unread_messages: messages.data,
            }, null, 2),
          }],
        };
      }

      case "agent_actions_log": {
        let query = supabase
          .from("agent_actions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(Number(args?.limit) || 20);
        if (args?.department) query = query.eq("agent", args.department);
        if (args?.status) query = query.eq("status", args.status);
        const { data } = await query;
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      }

      // ── Direct Data ─────────────────────────────────────────────────
      case "fulflo_kpi": {
        const { data } = await supabase.from("v_kpi_dashboard").select("*");
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      }

      case "fulflo_revenue": {
        const { data } = await supabase.from("v_revenue_by_engine").select("*");
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      }

      case "fulflo_product_health": {
        const { data } = await supabase.from("v_product_health").select("*");
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      }

      case "fulflo_unit_economics": {
        const { data } = await supabase.from("v_order_unit_economics").select("*");
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      }

      case "fulflo_products": {
        let query = supabase.from("products").select("*");
        if (args?.low_stock_threshold) query = query.lt("stock_units", args.low_stock_threshold);
        if (args?.expiring_before) query = query.lt("expiry_date", args.expiring_before);
        const { data } = await query;
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      }

      case "fulflo_orders": {
        let query = supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
        if (args?.status) query = query.eq("status", args.status);
        query = query.limit(Number(args?.limit) || 10);
        const { data } = await query;
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      }

      case "fulflo_stripe_balance": {
        const balance = await stripe.balance.retrieve();
        return { content: [{ type: "text" as const, text: JSON.stringify(balance, null, 2) }] };
      }

      default:
        return {
          content: [{ type: "text" as const, text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text" as const, text: `Error: ${msg}` }],
      isError: true,
    };
  }
});

// ─── Start Server ───────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[fulflo-mcp] Server started");
}

main().catch(console.error);
