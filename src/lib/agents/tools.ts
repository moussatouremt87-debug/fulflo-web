// ─── FulFlo Agent Tool Execution ─────────────────────────────────────────────
// Maps tool names to actual implementations (Supabase queries, Stripe calls, emails).

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

interface ToolResult {
  content: string;
  is_error?: boolean;
}

// ─── Tool dispatcher ────────────────────────────────────────────────────────

export async function executeAgentTool(
  toolName: string,
  input: Record<string, unknown>
): Promise<ToolResult> {
  try {
    const handler = TOOL_HANDLERS[toolName];
    if (!handler) {
      return { content: `Unknown tool: ${toolName}`, is_error: true };
    }
    return await handler(input);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[agent-tool] ${toolName} failed:`, msg);
    return { content: `Tool error: ${msg}`, is_error: true };
  }
}

// ─── Tool handlers ──────────────────────────────────────────────────────────

const TOOL_HANDLERS: Record<string, (input: Record<string, unknown>) => Promise<ToolResult>> = {

  // ── Supabase: Query ─────────────────────────────────────────────────────
  async query_products(input) {
    const supabase = getServiceClient();
    let query = supabase.from("products").select("*");
    if (input.category) query = query.eq("category", input.category);
    if (input.low_stock) query = query.lt("stock_units", Number(input.low_stock));
    if (input.expiring_before) query = query.lt("expiry_date", input.expiring_before);
    if (input.limit) query = query.limit(Number(input.limit));
    const { data, error } = await query;
    if (error) return { content: `Query error: ${error.message}`, is_error: true };
    return { content: JSON.stringify(data, null, 2) };
  },

  async query_orders(input) {
    const supabase = getServiceClient();
    let query = supabase.from("orders").select("*, order_items(*)");
    if (input.status) query = query.eq("status", input.status);
    if (input.since) query = query.gte("created_at", input.since);
    if (input.customer_id) query = query.eq("customer_id", input.customer_id);
    if (input.limit) query = query.limit(Number(input.limit));
    query = query.order("created_at", { ascending: false });
    const { data, error } = await query;
    if (error) return { content: `Query error: ${error.message}`, is_error: true };
    return { content: JSON.stringify(data, null, 2) };
  },

  async query_customers(input) {
    const supabase = getServiceClient();
    let query = supabase.from("customers").select("*");
    if (input.email) query = query.eq("email", input.email);
    if (input.min_orders) query = query.gte("total_orders", Number(input.min_orders));
    if (input.limit) query = query.limit(Number(input.limit));
    const { data, error } = await query;
    if (error) return { content: `Query error: ${error.message}`, is_error: true };
    return { content: JSON.stringify(data, null, 2) };
  },

  async query_suppliers(input) {
    const supabase = getServiceClient();
    let query = supabase.from("suppliers").select("*");
    if (input.status) query = query.eq("status", input.status);
    const { data, error } = await query;
    if (error) return { content: `Query error: ${error.message}`, is_error: true };
    return { content: JSON.stringify(data, null, 2) };
  },

  async query_kpi_dashboard(_input) {
    const supabase = getServiceClient();
    const { data, error } = await supabase.from("v_kpi_dashboard").select("*");
    if (error) return { content: `Query error: ${error.message}`, is_error: true };
    return { content: JSON.stringify(data, null, 2) };
  },

  async query_revenue_by_engine(_input) {
    const supabase = getServiceClient();
    const { data, error } = await supabase.from("v_revenue_by_engine").select("*");
    if (error) return { content: `Query error: ${error.message}`, is_error: true };
    return { content: JSON.stringify(data, null, 2) };
  },

  async query_product_health(_input) {
    const supabase = getServiceClient();
    const { data, error } = await supabase.from("v_product_health").select("*");
    if (error) return { content: `Query error: ${error.message}`, is_error: true };
    return { content: JSON.stringify(data, null, 2) };
  },

  async query_customer_cohorts(_input) {
    const supabase = getServiceClient();
    const { data, error } = await supabase.from("v_customer_cohorts").select("*");
    if (error) return { content: `Query error: ${error.message}`, is_error: true };
    return { content: JSON.stringify(data, null, 2) };
  },

  async query_unit_economics(_input) {
    const supabase = getServiceClient();
    const { data, error } = await supabase.from("v_order_unit_economics").select("*");
    if (error) return { content: `Query error: ${error.message}`, is_error: true };
    return { content: JSON.stringify(data, null, 2) };
  },

  async run_sql(input) {
    const supabase = getServiceClient();
    const sql = String(input.query);
    // Safety: only allow SELECT statements
    if (!sql.trim().toUpperCase().startsWith("SELECT")) {
      return { content: "Only SELECT queries are allowed via this tool.", is_error: true };
    }
    const { data, error } = await supabase.rpc("exec_sql", { query: sql });
    if (error) return { content: `SQL error: ${error.message}`, is_error: true };
    return { content: JSON.stringify(data, null, 2) };
  },

  // ── Supabase: Mutations ─────────────────────────────────────────────────
  async update_product(input) {
    const supabase = getServiceClient();
    const { id, ...updates } = input;
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) return { content: `Update error: ${error.message}`, is_error: true };
    return { content: `Product updated: ${JSON.stringify(data)}` };
  },

  async update_order_status(input) {
    const supabase = getServiceClient();
    const { order_id, status } = input;
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", order_id);
    if (error) return { content: `Update error: ${error.message}`, is_error: true };
    return { content: `Order ${order_id} status updated to ${status}` };
  },

  async adjust_price(input) {
    const supabase = getServiceClient();
    const { product_id, new_price, reason } = input;
    const { data: product, error: fetchErr } = await supabase
      .from("products")
      .select("name, price_surplus_eur")
      .eq("id", product_id)
      .single();
    if (fetchErr) return { content: `Fetch error: ${fetchErr.message}`, is_error: true };

    const oldPrice = product.price_surplus_eur;
    const { error } = await supabase
      .from("products")
      .update({ price_surplus_eur: Number(new_price) })
      .eq("id", product_id);
    if (error) return { content: `Price update error: ${error.message}`, is_error: true };

    return {
      content: `Price adjusted for "${product.name}": €${oldPrice} → €${new_price}. Reason: ${reason}`,
    };
  },

  async create_inventory_alert(input) {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("inventory_alerts")
      .insert(input)
      .select()
      .single();
    if (error) return { content: `Insert error: ${error.message}`, is_error: true };
    return { content: `Inventory alert created: ${JSON.stringify(data)}` };
  },

  // ── Stripe ──────────────────────────────────────────────────────────────
  async get_stripe_balance(_input) {
    const stripe = getStripe();
    const balance = await stripe.balance.retrieve();
    return { content: JSON.stringify(balance, null, 2) };
  },

  async get_stripe_recent_payments(input) {
    const stripe = getStripe();
    const payments = await stripe.paymentIntents.list({
      limit: Number(input.limit) || 10,
    });
    return { content: JSON.stringify(payments.data, null, 2) };
  },

  async create_stripe_refund(input) {
    const stripe = getStripe();
    const refund = await stripe.refunds.create({
      payment_intent: String(input.payment_intent_id),
      amount: input.amount ? Number(input.amount) : undefined,
      reason: (input.reason as Stripe.RefundCreateParams["reason"]) || "requested_by_customer",
    });
    return { content: `Refund created: ${refund.id}, amount: €${(refund.amount / 100).toFixed(2)}` };
  },

  async list_stripe_disputes(_input) {
    const stripe = getStripe();
    const disputes = await stripe.disputes.list({ limit: 20 });
    return { content: JSON.stringify(disputes.data, null, 2) };
  },

  async get_stripe_revenue_summary(input) {
    const stripe = getStripe();
    const since = input.since ? Number(new Date(String(input.since)).getTime() / 1000) : undefined;
    const charges = await stripe.charges.list({
      limit: 100,
      created: since ? { gte: since } : undefined,
    });
    const total = charges.data
      .filter((c) => c.paid && !c.refunded)
      .reduce((sum, c) => sum + c.amount, 0);
    return {
      content: JSON.stringify({
        total_revenue_eur: (total / 100).toFixed(2),
        charge_count: charges.data.length,
        period: input.since || "all time",
      }),
    };
  },

  // ── Email ───────────────────────────────────────────────────────────────
  async send_email(input) {
    // Uses the existing email.ts transporter
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_PASSWORD,
      },
    });

    if (!process.env.ZOHO_EMAIL || !process.env.ZOHO_PASSWORD) {
      return { content: "Email not sent: ZOHO credentials not configured", is_error: true };
    }

    await transporter.sendMail({
      from: `"FulFlo" <${process.env.ZOHO_EMAIL}>`,
      to: String(input.to),
      subject: String(input.subject),
      html: String(input.html_body),
    });

    return { content: `Email sent to ${input.to}: "${input.subject}"` };
  },

  // ── Ad campaigns ────────────────────────────────────────────────────────
  async query_ad_campaigns(input) {
    const supabase = getServiceClient();
    let query = supabase.from("ad_campaigns").select("*, ad_events(*)");
    if (input.status) query = query.eq("status", input.status);
    if (input.supplier_id) query = query.eq("supplier_id", input.supplier_id);
    const { data, error } = await query;
    if (error) return { content: `Query error: ${error.message}`, is_error: true };
    return { content: JSON.stringify(data, null, 2) };
  },

  async pause_ad_campaign(input) {
    const supabase = getServiceClient();
    const { error } = await supabase
      .from("ad_campaigns")
      .update({ status: "paused" })
      .eq("id", input.campaign_id);
    if (error) return { content: `Update error: ${error.message}`, is_error: true };
    return { content: `Campaign ${input.campaign_id} paused.` };
  },

  // ── Inter-agent communication ───────────────────────────────────────────
  async send_agent_message(input) {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("agent_messages")
      .insert({
        from_agent: input.from_agent,
        to_agent: input.to_agent,
        message_type: input.message_type || "request",
        subject: input.subject,
        body: input.body || {},
      })
      .select()
      .single();
    if (error) return { content: `Message error: ${error.message}`, is_error: true };
    return { content: `Message sent from ${input.from_agent} to ${input.to_agent}: "${input.subject}"` };
  },

  async create_agent_task(input) {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("agent_tasks")
      .insert({
        agent: input.agent,
        sub_agent: input.sub_agent,
        task_type: input.task_type,
        priority: input.priority || 5,
        payload: input.payload || {},
        scheduled_for: input.scheduled_for || new Date().toISOString(),
      })
      .select()
      .single();
    if (error) return { content: `Task error: ${error.message}`, is_error: true };
    return { content: `Task created: ${data.id} (${input.task_type}) for ${input.agent}` };
  },

  // ── Webhook: Trigger n8n ────────────────────────────────────────────────
  async trigger_n8n_workflow(input) {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl || webhookUrl.includes("localhost")) {
      return { content: "n8n not deployed yet (still pointing to localhost)", is_error: true };
    }
    const response = await fetch(`${webhookUrl}/${input.workflow}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input.payload || {}),
    });
    if (!response.ok) {
      return { content: `n8n webhook failed: ${response.status}`, is_error: true };
    }
    return { content: `n8n workflow "${input.workflow}" triggered successfully` };
  },

  // ── Ripple / Referral ───────────────────────────────────────────────────
  async query_ripple_campaigns(_input) {
    const supabase = getServiceClient();
    const { data, error } = await supabase.from("ripple_campaigns").select("*");
    if (error) return { content: `Query error: ${error.message}`, is_error: true };
    return { content: JSON.stringify(data, null, 2) };
  },

  async query_ripple_shares(input) {
    const supabase = getServiceClient();
    let query = supabase.from("ripple_shares").select("*");
    if (input.campaign_id) query = query.eq("campaign_id", input.campaign_id);
    const { data, error } = await query;
    if (error) return { content: `Query error: ${error.message}`, is_error: true };
    return { content: JSON.stringify(data, null, 2) };
  },

  // ── Flash sales ─────────────────────────────────────────────────────────
  async query_flash_sales(_input) {
    const supabase = getServiceClient();
    const { data, error } = await supabase.from("flash_sale_slots").select("*");
    if (error) return { content: `Query error: ${error.message}`, is_error: true };
    return { content: JSON.stringify(data, null, 2) };
  },

  // ── Promotions & Vouchers ───────────────────────────────────────────────
  async query_vouchers(input) {
    const supabase = getServiceClient();
    let query = supabase.from("vouchers").select("*");
    if (input.status) query = query.eq("status", input.status);
    const { data, error } = await query;
    if (error) return { content: `Query error: ${error.message}`, is_error: true };
    return { content: JSON.stringify(data, null, 2) };
  },

  async create_voucher(input) {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("vouchers")
      .insert(input)
      .select()
      .single();
    if (error) return { content: `Insert error: ${error.message}`, is_error: true };
    return { content: `Voucher created: ${JSON.stringify(data)}` };
  },
};
