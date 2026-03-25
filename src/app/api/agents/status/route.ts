// ─── GET /api/agents/status ──────────────────────────────────────────────────
// Dashboard endpoint — shows recent agent activity, pending tasks, messages.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAllAgentConfigs } from "@/lib/agents";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();

  // Fetch data in parallel
  const [actions, tasks, messages, configs] = await Promise.all([
    supabase
      .from("agent_actions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("agent_tasks")
      .select("*")
      .in("status", ["queued", "processing"])
      .order("priority", { ascending: true })
      .limit(20),
    supabase
      .from("agent_messages")
      .select("*")
      .eq("status", "unread")
      .order("created_at", { ascending: false })
      .limit(20),
    Promise.resolve(getAllAgentConfigs()),
  ]);

  // Summary stats
  const { data: stats } = await supabase.rpc("exec_sql", {
    query: `
      SELECT
        (SELECT COUNT(*) FROM agent_actions WHERE created_at > NOW() - INTERVAL '24 hours') as actions_24h,
        (SELECT COUNT(*) FROM agent_actions WHERE status = 'failed' AND created_at > NOW() - INTERVAL '24 hours') as failures_24h,
        (SELECT COALESCE(SUM(tokens_used), 0) FROM agent_actions WHERE created_at > NOW() - INTERVAL '24 hours') as tokens_24h,
        (SELECT COALESCE(SUM(cost_eur), 0) FROM agent_actions WHERE created_at > NOW() - INTERVAL '24 hours') as cost_24h,
        (SELECT COUNT(*) FROM agent_tasks WHERE status = 'queued') as pending_tasks,
        (SELECT COUNT(*) FROM agent_messages WHERE status = 'unread') as unread_messages
    `,
  });

  return NextResponse.json({
    departments: configs.map((c) => ({
      name: c.agent,
      display_name: c.display_name,
      sub_agents: c.sub_agents,
      tools_count: c.tools.length,
      model: c.model,
    })),
    stats: stats?.[0] || {},
    recent_actions: actions.data || [],
    pending_tasks: tasks.data || [],
    unread_messages: messages.data || [],
  });
}
