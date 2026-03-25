// ─── FulFlo Department Agent Configurations ──────────────────────────────────
// Each department gets a system prompt, personality, and tool set.

import { AgentConfig, AgentDepartment, ToolDefinition } from "./types";

// ─── Shared tools available to all agents ───────────────────────────────────

const SHARED_TOOLS: ToolDefinition[] = [
  {
    name: "send_agent_message",
    description: "Send a message to another department agent for cross-department coordination. Use for handoffs, requests, or alerts.",
    input_schema: {
      type: "object",
      properties: {
        from_agent: { type: "string", description: "Your department name" },
        to_agent: { type: "string", enum: ["engineering", "product", "growth", "operations", "finance", "ai-automation", "design"] },
        message_type: { type: "string", enum: ["request", "alert", "handoff"] },
        subject: { type: "string", description: "Brief subject line" },
        body: { type: "object", description: "Message details" },
      },
      required: ["from_agent", "to_agent", "subject", "body"],
    },
  },
  {
    name: "create_agent_task",
    description: "Create a task for any department to process later. Use for non-urgent follow-ups or scheduled work.",
    input_schema: {
      type: "object",
      properties: {
        agent: { type: "string", description: "Target department" },
        sub_agent: { type: "string", description: "Specific sub-agent" },
        task_type: { type: "string", description: "Type of task" },
        priority: { type: "number", description: "1=urgent, 5=normal, 10=low" },
        payload: { type: "object", description: "Task details" },
        scheduled_for: { type: "string", description: "ISO timestamp for when to execute" },
      },
      required: ["agent", "task_type", "payload"],
    },
  },
];

// ─── Growth Agent Tools ─────────────────────────────────────────────────────

const GROWTH_TOOLS: ToolDefinition[] = [
  {
    name: "query_products",
    description: "Query the product catalog. Filter by category, low stock threshold, or expiry date.",
    input_schema: {
      type: "object",
      properties: {
        category: { type: "string" },
        low_stock: { type: "number", description: "Return products with stock below this threshold" },
        expiring_before: { type: "string", description: "ISO date — products expiring before this date" },
        limit: { type: "number" },
      },
    },
  },
  {
    name: "query_orders",
    description: "Query orders with their items. Filter by status, date, or customer.",
    input_schema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"] },
        since: { type: "string", description: "ISO date — orders since this date" },
        customer_id: { type: "string" },
        limit: { type: "number" },
      },
    },
  },
  {
    name: "query_customers",
    description: "Query the customer database. Find by email or filter by order count.",
    input_schema: {
      type: "object",
      properties: {
        email: { type: "string" },
        min_orders: { type: "number" },
        limit: { type: "number" },
      },
    },
  },
  {
    name: "adjust_price",
    description: "Adjust the surplus price of a product. Always provide a reason. Used for dynamic pricing, flash sales, expiry discounts.",
    input_schema: {
      type: "object",
      properties: {
        product_id: { type: "string" },
        new_price: { type: "number", description: "New price in EUR" },
        reason: { type: "string", description: "Reason for the price change (logged)" },
      },
      required: ["product_id", "new_price", "reason"],
    },
  },
  {
    name: "query_ad_campaigns",
    description: "Query active ad campaigns (retail media). Filter by status or supplier.",
    input_schema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["active", "paused", "completed", "draft"] },
        supplier_id: { type: "string" },
      },
    },
  },
  {
    name: "pause_ad_campaign",
    description: "Pause an active ad campaign (e.g., when budget is exhausted).",
    input_schema: {
      type: "object",
      properties: {
        campaign_id: { type: "string" },
      },
      required: ["campaign_id"],
    },
  },
  {
    name: "query_ripple_campaigns",
    description: "Query all Ripple (referral) campaigns to analyze viral growth.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "query_ripple_shares",
    description: "Query share events for a Ripple campaign.",
    input_schema: {
      type: "object",
      properties: {
        campaign_id: { type: "string" },
      },
    },
  },
  {
    name: "send_email",
    description: "Send an email via Zoho SMTP. Use for outreach, re-engagement, or supplier communication.",
    input_schema: {
      type: "object",
      properties: {
        to: { type: "string", description: "Recipient email address" },
        subject: { type: "string" },
        html_body: { type: "string", description: "HTML email body" },
      },
      required: ["to", "subject", "html_body"],
    },
  },
  {
    name: "create_voucher",
    description: "Create a discount voucher for a customer (re-engagement, referral reward, etc.).",
    input_schema: {
      type: "object",
      properties: {
        code: { type: "string" },
        discount_percent: { type: "number" },
        max_uses: { type: "number" },
        expires_at: { type: "string" },
        customer_id: { type: "string" },
      },
      required: ["code", "discount_percent"],
    },
  },
  {
    name: "query_kpi_dashboard",
    description: "Get the KPI dashboard view — key metrics for the business.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "query_customer_cohorts",
    description: "Get customer cohort analysis for retention insights.",
    input_schema: { type: "object", properties: {} },
  },
];

// ─── Operations Agent Tools ─────────────────────────────────────────────────

const OPERATIONS_TOOLS: ToolDefinition[] = [
  {
    name: "query_orders",
    description: "Query orders with their items. Filter by status, date, or customer.",
    input_schema: {
      type: "object",
      properties: {
        status: { type: "string" },
        since: { type: "string" },
        customer_id: { type: "string" },
        limit: { type: "number" },
      },
    },
  },
  {
    name: "update_order_status",
    description: "Update the status of an order (e.g., confirmed → shipped).",
    input_schema: {
      type: "object",
      properties: {
        order_id: { type: "string" },
        status: { type: "string", enum: ["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"] },
      },
      required: ["order_id", "status"],
    },
  },
  {
    name: "query_suppliers",
    description: "Query supplier database. Filter by status.",
    input_schema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["active", "pilot", "pending", "inactive"] },
      },
    },
  },
  {
    name: "query_products",
    description: "Query product catalog.",
    input_schema: {
      type: "object",
      properties: {
        category: { type: "string" },
        low_stock: { type: "number" },
        expiring_before: { type: "string" },
        limit: { type: "number" },
      },
    },
  },
  {
    name: "update_product",
    description: "Update a product's details (stock, status, etc.).",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        stock_units: { type: "number" },
        status: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "create_inventory_alert",
    description: "Create an inventory alert for a product (low stock, expired, damaged).",
    input_schema: {
      type: "object",
      properties: {
        product_id: { type: "string" },
        alert_type: { type: "string", enum: ["low_stock", "expired", "damaged", "overstock"] },
        threshold: { type: "number" },
        current_value: { type: "number" },
      },
      required: ["product_id", "alert_type"],
    },
  },
  {
    name: "send_email",
    description: "Send an email (supplier communication, order updates, etc.).",
    input_schema: {
      type: "object",
      properties: {
        to: { type: "string" },
        subject: { type: "string" },
        html_body: { type: "string" },
      },
      required: ["to", "subject", "html_body"],
    },
  },
  {
    name: "trigger_n8n_workflow",
    description: "Trigger an n8n workflow by name (e.g., order fulfillment, supplier onboarding).",
    input_schema: {
      type: "object",
      properties: {
        workflow: { type: "string", description: "Workflow name/path" },
        payload: { type: "object", description: "Data to pass to the workflow" },
      },
      required: ["workflow"],
    },
  },
];

// ─── Finance Agent Tools ────────────────────────────────────────────────────

const FINANCE_TOOLS: ToolDefinition[] = [
  {
    name: "query_kpi_dashboard",
    description: "Get the KPI dashboard — key business metrics.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "query_revenue_by_engine",
    description: "Get revenue breakdown by engine (marketplace, retail media, data SaaS).",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "query_unit_economics",
    description: "Get per-order unit economics (revenue, COGS, commission, margin).",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "query_product_health",
    description: "Get product health metrics (sales velocity, margin, stock days remaining).",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "query_customer_cohorts",
    description: "Get customer cohort analysis for LTV and retention.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "query_orders",
    description: "Query orders. Filter by status, date, customer.",
    input_schema: {
      type: "object",
      properties: {
        status: { type: "string" },
        since: { type: "string" },
        limit: { type: "number" },
      },
    },
  },
  {
    name: "get_stripe_balance",
    description: "Get the current Stripe account balance.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_stripe_recent_payments",
    description: "List recent Stripe payment intents.",
    input_schema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of payments to retrieve (max 100)" },
      },
    },
  },
  {
    name: "get_stripe_revenue_summary",
    description: "Get total revenue from Stripe charges, optionally filtered by date.",
    input_schema: {
      type: "object",
      properties: {
        since: { type: "string", description: "ISO date — only count charges since this date" },
      },
    },
  },
  {
    name: "create_stripe_refund",
    description: "Issue a refund for a Stripe payment. Partial refunds supported.",
    input_schema: {
      type: "object",
      properties: {
        payment_intent_id: { type: "string" },
        amount: { type: "number", description: "Amount in cents. Omit for full refund." },
        reason: { type: "string", enum: ["duplicate", "fraudulent", "requested_by_customer"] },
      },
      required: ["payment_intent_id"],
    },
  },
  {
    name: "list_stripe_disputes",
    description: "List all Stripe disputes (chargebacks).",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "send_email",
    description: "Send a financial report or alert email.",
    input_schema: {
      type: "object",
      properties: {
        to: { type: "string" },
        subject: { type: "string" },
        html_body: { type: "string" },
      },
      required: ["to", "subject", "html_body"],
    },
  },
];

// ─── System Prompts ─────────────────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<AgentDepartment, string> = {
  growth: `Tu es BRIAN, le Head of Growth de FulFlo — marketplace B2B2C de surplus de marques en France.

CONTEXTE BUSINESS:
- FulFlo vend des surplus/invendus de marques premium (bio, écolo, Made in France) à -30 à -70% vs retail
- 3 moteurs de revenus : commission marketplace (8-12%), retail media (CPC ads, flash sales), data SaaS
- Marché français uniquement. Toute communication client en français.
- Pre-revenue. Chaque euro et chaque client comptent.

TA PHILOSOPHIE (inspiré de Brian Chesky + Andrew Chen):
- "Do things that don't scale" — d'abord 100 clients manuellement
- La croissance vient du produit, pas du marketing
- Trouve la niche qui adore le produit, puis élargis

TES RESPONSABILITÉS:
1. ACQUISITION: SEO, outbound suppliers, content marketing
2. CONVERSION: optimisation funnel, pricing dynamique, A/B tests
3. RETENTION: emails lifecycle, programme Ripple (parrainage), vouchers
4. MONETIZATION: retail media (ads), flash sales, bundles cross-marques

RÈGLES:
- Toujours vérifier les données avant d'agir (query d'abord, action ensuite)
- Pour les changements de prix: jamais en dessous du seuil de marge (prix d'achat + 5%)
- Pour les emails: ton professionnel mais chaleureux, toujours en français
- Si un problème technique est détecté → handoff à engineering via send_agent_message
- Si impact financier > €100 → handoff à finance via send_agent_message
- Loggue ton raisonnement dans chaque réponse`,

  operations: `Tu es SHERYL, la COO de FulFlo — marketplace B2B2C de surplus de marques en France.

CONTEXTE BUSINESS:
- FulFlo connecte fournisseurs de surplus CPG (Favrichon, Coslys, etc.) aux consommateurs français
- Modèle direct-ship (pas de stock propre en Phase 1) + partenaires 3PL (Byrd, Bigblue)
- 1 fournisseur actif: Maison Favrichon. Pipeline de prospects en cours.

TA PHILOSOPHIE (inspirée de Sheryl Sandberg):
- "Done is better than perfect" — mais "compliant is better than sued"
- Automatiser tout ce qui est répétitif
- La conformité est un avantage concurrentiel

TES RESPONSABILITÉS:
1. SUPPLIER MANAGEMENT: onboarding, KYC, SLA, pilot-to-paid conversion
2. ORDER FULFILLMENT: tracking, direct-ship coordination, returns
3. LEGAL & COMPLIANCE: CGV, Code de la consommation, RGPD, AGEC
4. PROCESS: documenter et automatiser chaque flux opérationnel

CADRE LÉGAL FRANÇAIS:
- Droit de rétractation: 14 jours (Code de la consommation L221-18)
- Garantie légale de conformité: 2 ans
- Mention obligatoire: "Produit surplus — DDM/DLC conforme"
- RGPD: consentement explicite, droit à l'effacement
- AGEC: traçabilité des invendus

RÈGLES:
- Toute communication fournisseur: professionnelle, en français
- Onboarding: vérifier KYC avant d'activer (SIRET, assurance RC Pro)
- Commandes: confirmer dans les 2h, expédier dans les 24h
- Si problème de prix/marge → handoff à finance
- Si problème technique → handoff à engineering`,

  finance: `Tu es RUTH, la CFO de FulFlo — marketplace B2B2C de surplus de marques en France.

CONTEXTE BUSINESS:
- 3 moteurs de revenus:
  1. Commission marketplace: 8-12% sur chaque vente (GMV × take rate)
  2. Retail media: CPC ads (€0.15-0.50/clic), flash sales (slots à €99-499), bundles
  3. Data SaaS: insights CPG anonymisés (€199-1499/mois)
- Pre-revenue (lancement en cours). Cash conservation critique.
- Stripe en mode test pour l'instant.

TA PHILOSOPHIE (inspirée de Ruth Porat — Alphabet):
- "Every euro spent must earn two back. No exceptions."
- Revenue follows retention. Fix churn before scaling.
- Cash is oxygen. Never run out.

TES RESPONSABILITÉS:
1. REVENUE TRACKING: GMV, take rate, revenue par moteur, MRR
2. UNIT ECONOMICS: CAC, LTV, contribution margin, payback period
3. CASH FLOW: Stripe reconciliation, payout timing, refund management
4. REPORTING: weekly KPI report au fondateur, alertes sur les anomalies

MÉTRIQUES CLÉS (SQL views disponibles):
- v_kpi_dashboard: KPIs globaux
- v_revenue_by_engine: revenus par moteur
- v_order_unit_economics: unit economics par commande
- v_product_health: santé produit (vélocité, marge, stock)
- v_customer_cohorts: cohorts clients (LTV, retention)

RÈGLES:
- Toujours commencer par les données: query les views avant d'analyser
- Alerter le fondateur (james@fulflo.app) si: revenu drop >20%, dispute Stripe, cash < 30 jours de runway
- Refund: vérifier l'éligibilité avant de traiter (14 jours, produit non ouvert)
- Si problème de pricing → handoff à growth
- Si problème d'opérations → handoff à operations`,

  engineering: `Tu es SATYA, le CTO de FulFlo — marketplace B2B2C Next.js sur Vercel + Supabase.

Stack: Next.js 16 (App Router), Supabase (PostgreSQL + RLS), Stripe, Vercel, n8n.
Principes: Cloud-first, AI-first. Si ça ne scale pas, on ne le fait pas.

Responsabilités: database ops, deployments, API monitoring, security.`,

  product: `Tu es MARTY, le Head of Product de FulFlo.
Principes: "Fall in love with the problem." Outcome over output.
Responsabilités: feature prioritization, specs, A/B tests, user feedback.`,

  "ai-automation": `Tu es ALEX, l'AI & Automation lead de FulFlo.
Tu gères le chatbot multicanal (web, WhatsApp, phone, Telegram, SMS) et les workflows n8n.
Principes: "If a human does it twice, automate it."`,

  design: `Tu es JONY, le Head of Design de FulFlo.
Principes: "Simplicity is the ultimate sophistication."
Responsabilités: UI components, brand consistency, landing pages.`,
};

// ─── Agent Config Factory ───────────────────────────────────────────────────

const AGENT_CONFIGS: Record<AgentDepartment, AgentConfig> = {
  growth: {
    agent: "growth",
    display_name: "BRIAN — Head of Growth",
    system_prompt: SYSTEM_PROMPTS.growth,
    tools: [...GROWTH_TOOLS, ...SHARED_TOOLS],
    sub_agents: ["seo-specialist", "outbound-manager", "copywriter", "social-media", "cro-specialist", "pricing-optimizer", "email-marketer", "referral-manager"],
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    temperature: 0.3,
  },
  operations: {
    agent: "operations",
    display_name: "SHERYL — COO",
    system_prompt: SYSTEM_PROMPTS.operations,
    tools: [...OPERATIONS_TOOLS, ...SHARED_TOOLS],
    sub_agents: ["supplier-manager", "logistics-coordinator", "legal-compliance"],
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    temperature: 0.2,
  },
  finance: {
    agent: "finance",
    display_name: "RUTH — CFO",
    system_prompt: SYSTEM_PROMPTS.finance,
    tools: [...FINANCE_TOOLS, ...SHARED_TOOLS],
    sub_agents: ["revenue-analyst", "treasury-billing"],
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    temperature: 0.1,
  },
  engineering: {
    agent: "engineering",
    display_name: "SATYA — CTO",
    system_prompt: SYSTEM_PROMPTS.engineering,
    tools: [...SHARED_TOOLS],
    sub_agents: ["devops", "qa-security"],
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    temperature: 0.2,
  },
  product: {
    agent: "product",
    display_name: "MARTY — Head of Product",
    system_prompt: SYSTEM_PROMPTS.product,
    tools: [...SHARED_TOOLS],
    sub_agents: ["ux-researcher", "data-analyst"],
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    temperature: 0.3,
  },
  "ai-automation": {
    agent: "ai-automation",
    display_name: "ALEX — AI & Automation",
    system_prompt: SYSTEM_PROMPTS["ai-automation"],
    tools: [...SHARED_TOOLS],
    sub_agents: ["nlp-engineer", "voice-manager", "workflow-architect"],
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    temperature: 0.3,
  },
  design: {
    agent: "design",
    display_name: "JONY — Head of Design",
    system_prompt: SYSTEM_PROMPTS.design,
    tools: [...SHARED_TOOLS],
    sub_agents: ["ui-designer", "brand-manager"],
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    temperature: 0.4,
  },
};

export function getAgentConfig(department: AgentDepartment): AgentConfig {
  return AGENT_CONFIGS[department];
}

export function getAllAgentConfigs(): AgentConfig[] {
  return Object.values(AGENT_CONFIGS);
}
