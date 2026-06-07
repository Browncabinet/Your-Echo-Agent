// Charges a partner's prepaid balance for unbilled ledger events on a job.
// Called by a2a-run-job after each send batch and on terminal events.
// Service-role only.
import { corsHeaders, json, admin, emitCallback } from "../_shared/a2a.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (token !== Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
    return json({ error: "unauthorized" }, 401);
  }

  let body: { job_id?: string } = {};
  try { body = await req.json(); } catch {}
  if (!body.job_id) return json({ error: "missing job_id" }, 400);

  const sb = admin();
  const { data: job } = await sb.from("a2a_jobs").select("*").eq("id", body.job_id).maybeSingle();
  if (!job) return json({ error: "job_not_found" }, 404);

  // Human-flow jobs (no api_key_id) skip billing — those users pay via their normal weekly sub.
  if (!job.api_key_id) return json({ ok: true, skipped: "human_flow" });

  // Resolve partner
  const { data: partner } = await sb
    .from("a2a_partners").select("*").eq("api_key_id", job.api_key_id).maybeSingle();
  if (!partner) return json({ ok: true, skipped: "no_partner_record" });

  // Collect unbilled ledger rows for this job
  const { data: ledger } = await sb
    .from("a2a_ledger")
    .select("id, unit_cost_cents")
    .eq("job_id", body.job_id)
    .eq("billed", false)
    .limit(500);

  if (!ledger || ledger.length === 0) return json({ ok: true, charged_cents: 0, items: 0 });

  const total = ledger.reduce((s, r) => s + (r.unit_cost_cents || 0), 0);
  const balance = partner.balance_cents || 0;

  if (total > balance) {
    // Insufficient funds — pause job and notify
    await sb.from("a2a_jobs").update({
      status: "paused",
      paused_at: new Date().toISOString(),
      last_event: "billing.insufficient_funds",
      last_event_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", body.job_id);

    emitCallback(job.callback_url, "billing.insufficient_funds", {
      job_id: body.job_id,
      balance_cents: balance,
      needed_cents: total,
      top_up_url: "https://yourechoagent.com/for-agents/billing",
    });
    return json({ ok: false, paused: true, balance_cents: balance, needed_cents: total });
  }

  // Debit balance + mark ledger rows billed
  await sb.from("a2a_partners").update({
    balance_cents: balance - total,
    total_spent_cents: (partner.total_spent_cents || 0) + total,
    updated_at: new Date().toISOString(),
  }).eq("id", partner.id);

  await sb.from("a2a_ledger").update({
    billed: true,
    billed_at: new Date().toISOString(),
    billing_method: "prepaid_balance",
  }).in("id", ledger.map((r) => r.id));

  return json({ ok: true, charged_cents: total, items: ledger.length, balance_after_cents: balance - total });
});
