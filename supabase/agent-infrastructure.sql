-- FulFlo Agent Infrastructure
-- Tables for autonomous AI agent coordination

-- 1. Agent action log — every action any agent takes
CREATE TABLE IF NOT EXISTS agent_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent TEXT NOT NULL,           -- 'growth', 'operations', 'finance', 'engineering', 'product', 'design', 'ai-automation'
  sub_agent TEXT,                -- 'seo-specialist', 'pricing-optimizer', etc.
  action_type TEXT NOT NULL,     -- 'query', 'update', 'email', 'deploy', 'alert', 'analyze'
  event_trigger TEXT,            -- what caused this: 'n8n:order-placed', 'cron:daily-kpi', 'manual', 'chain:growth'
  input JSONB DEFAULT '{}',     -- event payload / context passed in
  output JSONB DEFAULT '{}',    -- result / response from the agent
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  error_message TEXT,
  tokens_used INTEGER DEFAULT 0,
  cost_eur NUMERIC(10,6) DEFAULT 0,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 2. Agent task queue — for async and chained tasks
CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent TEXT NOT NULL,
  sub_agent TEXT,
  task_type TEXT NOT NULL,       -- 'supplier-outreach', 'price-adjustment', 'kpi-report', etc.
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),  -- 1=urgent, 10=low
  payload JSONB DEFAULT '{}',
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  result JSONB DEFAULT '{}',
  parent_task_id UUID REFERENCES agent_tasks(id),  -- for chained tasks
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Agent configs — system prompts and tool definitions per department
CREATE TABLE IF NOT EXISTS agent_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  tools JSONB DEFAULT '[]',     -- tool definitions for Claude API
  sub_agents JSONB DEFAULT '[]', -- sub-agent definitions
  is_active BOOLEAN DEFAULT true,
  max_tokens INTEGER DEFAULT 4096,
  model TEXT DEFAULT 'claude-sonnet-4-6-20250514',
  temperature NUMERIC(3,2) DEFAULT 0.3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Agent communication — inter-agent messages
CREATE TABLE IF NOT EXISTS agent_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_agent TEXT NOT NULL,
  to_agent TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('request', 'response', 'alert', 'handoff')),
  subject TEXT NOT NULL,
  body JSONB NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'processed', 'archived')),
  parent_message_id UUID REFERENCES agent_messages(id),
  task_id UUID REFERENCES agent_tasks(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_actions_agent ON agent_actions(agent);
CREATE INDEX IF NOT EXISTS idx_agent_actions_status ON agent_actions(status);
CREATE INDEX IF NOT EXISTS idx_agent_actions_created ON agent_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent ON agent_tasks(agent);
CREATE INDEX IF NOT EXISTS idx_agent_messages_to ON agent_messages(to_agent, status);

-- RLS policies
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (agents use service role key)
CREATE POLICY "Service role full access on agent_actions" ON agent_actions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on agent_tasks" ON agent_tasks
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on agent_configs" ON agent_configs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on agent_messages" ON agent_messages
  FOR ALL USING (auth.role() = 'service_role');

-- Admin can read agent logs
CREATE POLICY "Admin read agent_actions" ON agent_actions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin read agent_tasks" ON agent_tasks
  FOR SELECT USING (auth.role() = 'authenticated');
