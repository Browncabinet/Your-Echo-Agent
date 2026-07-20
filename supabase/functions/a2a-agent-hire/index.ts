// POST /v1/agents/{agent_id}/hire — main hire endpoint
import { corsHeaders, json, admin, authenticateApiKey, emitCallback, checkRateLimit } from "../_shared/a2a.ts";

type HireBody = {
  agent_id?: string;
  campaign?: {
    goal?: string;
    target_audience?: string | string[];
    niche?: string;
    volume?: number;
    website_url?: string;
    name?: string;
  };
  sender_identity?: {
    name?: string;
    email?: string;
    company?: string;
    scheduling_link?: string;
  };
  callback_url?: string;
  spending_cap_cents?: number;
  // Human-flow only: when called from our own app with a logged-in user
  user_id?: string;
  source?: "a2a" | "human";
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: HireBody;
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }

  const sb = admin();
  const url = new URL(req.url);
  const agentId = body.agent_id || url.searchParams.get("agent_id") || url.pathname.split("/").filter(Boolean).slice(-2, -1)[0];
  if (!agentId) return json({ error: "missing agent_id" }, 400);

  // Auth: either partner API key OR a logged-in Echo user (via Supabase JWT)
  let apiKeyId: string | null = null;
  let userId: string | null = null;
  let source: "a2a" | "human" = "a2a";

  const apiKey = await authenticateApiKey(req);
  if (apiKey) {
    const rl = await checkRateLimit(apiKey.id, apiKey.rate_limit_per_min || 60);
    if (!rl.allowed) return json({ error: "rate_limit_exceeded", limit_per_min: rl.limit, count: rl.count }, 429);
    apiKeyId = apiKey.id;
    source = "a2a";

  } else {
    // Try Supabase JWT (human flow)
    const auth = req.headers.get("authorization") || "";
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (m) {
      const { data } = await sb.auth.getUser(m[1]);
      if (data?.user) {
        userId = data.user.id;
        source = "human";
      }
    }
    if (!userId) return json({ error: "unauthorized", hint: "Provide Bearer API key (eak_...) or signed-in user JWT" }, 401);
  }

  // Idempotency (A2A clients): replay-safe hire within 24h
  const idemKey = req.headers.get("idempotency-key") || req.headers.get("Idempotency-Key");
  if (idemKey && apiKeyId) {
    if (idemKey.length > 200) return json({ error: "idempotency_key_too_long" }, 400);
    const { data: existing } = await sb
      .from("a2a_idempotency_keys")
      .select("response_json, status_code, created_at")
      .eq("api_key_id", apiKeyId)
      .eq("idempotency_key", idemKey)
      .maybeSingle();
    if (existing) {
      const ageMs = Date.now() - new Date(existing.created_at as string).getTime();
      if (ageMs < 24 * 60 * 60 * 1000) {
        return json(existing.response_json, existing.status_code || 201, { "Idempotent-Replay": "true" });
      }
    }
  }

  // Validate agent
  const { data: agent, error: agentErr } = await sb
    .from("a2a_agents").select("*").eq("agent_id", agentId).eq("active", true).maybeSingle();
  if (agentErr) return json({ error: agentErr.message }, 500);
  if (!agent) return json({ error: "agent_not_found" }, 404);

  // Validate request
  const camp = body.campaign || {};
  const volume = Math.max(1, Math.min(Number(camp.volume) || 50, 1000));
  const goal = (camp.goal || "Book discovery calls").toString().slice(0, 500);
  const niche = (camp.niche || agent.niche || "").toString().slice(0, 200);
  const ta = Array.isArray(camp.target_audience) ? camp.target_audience : [camp.target_audience].filter(Boolean);
  const targetAudience = (ta as string[]).map((s) => String(s).slice(0, 200)).slice(0, 10);
  const websiteUrl = (camp.website_url || "").toString().slice(0, 500);

  // Clamp per-lead pricing so a rogue agent can't inflate estimatedCost past the 100k cap.
  const perLeadCents = Math.min(Math.max(Number(agent.pricing_per_lead_cents) || 0, 0), 500);
  const estimatedCost = volume * perLeadCents;
  // Resolve per-partner default spending cap when caller omits it
  let defaultCap = 2500;
  if (apiKeyId) {
    const { data: partner } = await sb
      .from("a2a_partners")
      .select("default_spending_cap_cents")
      .eq("api_key_id", apiKeyId)
      .maybeSingle();
    if (partner?.default_spending_cap_cents) defaultCap = partner.default_spending_cap_cents as number;
  }
  const requestedCap = Number(body.spending_cap_cents) || defaultCap;
  const cap = Math.max(estimatedCost, Math.min(requestedCap, 100_000));

  // For A2A flow without a user_id, we still need a user_id on the campaigns row.
  // Strategy: create or reuse a system user keyed by the API key owner email.
  let campaignOwnerId = userId;
  if (!campaignOwnerId && apiKey) {
    // Look for an auth user by email — paginate to avoid the 50-row default.
    const targetEmail = (apiKey.owner_email || "").toLowerCase();
    let existingId: string | null = null;
    for (let page = 1; page <= 20 && !existingId; page++) {
      const { data: list } = await sb.auth.admin.listUsers({ page, perPage: 200 });
      const found = list?.users?.find((u) => (u.email || "").toLowerCase() === targetEmail);
      if (found) existingId = found.id;
      if (!list?.users?.length || list.users.length < 200) break;
    }
    if (existingId) {
      campaignOwnerId = existingId;
    } else {
      const { data: created, error: cErr } = await sb.auth.admin.createUser({
        email: apiKey.owner_email,
        email_confirm: true,
        user_metadata: { source: "a2a_partner", partner_name: apiKey.owner_name },
      });
      if (cErr || !created?.user) return json({ error: "failed_to_create_partner_user", detail: cErr?.message }, 500);
      campaignOwnerId = created.user.id;
    }
  }

  // Ensure a partner billing row exists for this API key
  if (apiKey && apiKeyId) {
    const { data: existingP } = await sb.from("a2a_partners").select("id").eq("api_key_id", apiKeyId).maybeSingle();
    if (!existingP) {
      await sb.from("a2a_partners").insert({
        api_key_id: apiKeyId,
        billing_email: apiKey.owner_email,
        owner_user_id: campaignOwnerId,
        balance_cents: 0,
      });
    }
  }

  // Pre-flight billing check for A2A callers — return HTTP 402 with top-up link
  // if the partner's prepaid balance can't cover the estimated cost. Skips for
  // human-flow (they pay via weekly subscription) and for $0 estimates.
  if (apiKeyId && estimatedCost > 0) {
    const { data: p } = await sb
      .from("a2a_partners")
      .select("balance_cents")
      .eq("api_key_id", apiKeyId)
      .maybeSingle();
    const bal = p?.balance_cents || 0;
    if (bal < estimatedCost) {
      return json({
        error: "payment_required",
        message: `Insufficient balance. Need $${(estimatedCost/100).toFixed(2)}, have $${(bal/100).toFixed(2)}.`,
        balance_cents: bal,
        needed_cents: estimatedCost,
        currency: "usd",
        top_up_url: "https://yourechoagent.com/for-agents/billing",
        hint: "Top up your prepaid balance and retry. Callbacks will fire once the job runs.",
      }, 402);
    }
  }


  // Create campaign (real row in our outreach engine)
  const { data: campaign, error: campErr } = await sb.from("campaigns").insert({
    user_id: campaignOwnerId!,
    name: camp.name || `${agent.name} — ${niche || goal}`.slice(0, 120),
    goal,
    niche,
    target_audience: targetAudience,
    website_url: websiteUrl,
    status: "active",
    leads: [],
    emails: [],
  }).select("id").single();
  if (campErr || !campaign) return json({ error: "failed_to_create_campaign", detail: campErr?.message }, 500);

  // Create job
  const { data: job, error: jobErr } = await sb.from("a2a_jobs").insert({
    agent_id: agentId,
    api_key_id: apiKeyId,
    user_id: campaignOwnerId,
    campaign_id: campaign.id,
    source,
    status: "queued",
    callback_url: body.callback_url || null,
    sender_identity: body.sender_identity || {},
    request: { campaign: { goal, niche, target_audience: targetAudience, volume, website_url: websiteUrl } },
    spending_cap_cents: cap,
    estimated_cost_cents: estimatedCost,
  }).select("*").single();
  if (jobErr || !job) return json({ error: "failed_to_create_job", detail: jobErr?.message }, 500);

  // Fire callback (queued)
  emitCallback(job.callback_url, "job.queued", { job_id: job.id, agent_id: agentId, campaign_id: campaign.id }, { job_id: job.id, api_key_id: apiKeyId });

  // Kick the worker in background — partner gets a fast response
  const kick = fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/a2a-run-job`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    },
    body: JSON.stringify({ job_id: job.id }),
  }).catch((e) => console.error("worker kick failed", e));
  // @ts-ignore EdgeRuntime is available in Supabase edge
  if (typeof EdgeRuntime !== "undefined" && (EdgeRuntime as any).waitUntil) {
    // @ts-ignore
    (EdgeRuntime as any).waitUntil(kick);
  }

  // ---- Referral attribution (track-only mode) ----
  // Accept via X-Referral-Code header OR referral_code field in body.
  const refCodeRaw = (req.headers.get("x-referral-code")
    || (body as unknown as { referral_code?: string }).referral_code
    || "").toString().trim().slice(0, 80);
  if (refCodeRaw) {
    try {
      const { data: refRow } = await sb
        .from("referral_codes")
        .select("code, referrer_agent_id, owner_user_id")
        .eq("code", refCodeRaw)
        .maybeSingle();
      if (refRow) {
        await sb.from("referral_conversions").insert({
          referrer_code: refRow.code,
          referrer_agent_id: refRow.referrer_agent_id,
          attributed_user_id: campaignOwnerId,
          agent_id: agentId,
          task_id: job.id,
          event_type: "hire",
          amount_cents: estimatedCost,
          currency: "usd",
          status: "tracked_only",
          metadata: { source, volume, niche },
        });
        await sb.rpc("noop_ignore" as never).catch(() => {});
        await sb
          .from("referral_codes")
          .update({ conversions: (undefined as unknown as number) })
          .eq("code", refRow.code)
          .then(() => {}, () => {});
        // Best-effort increment (ignore failures — conversion row is source of truth).
        await sb.from("referral_codes")
          .update({ conversions: 1 })
          .eq("code", refRow.code)
          .then(() => {}, () => {});
      }
    } catch (e) {
      console.error("referral attribution failed", e);
    }
  }

  const response = {
    job_id: job.id,
    campaign_id: campaign.id,
    status: "queued",
    agent_id: agentId,
    estimated_cost_cents: estimatedCost,
    spending_cap_cents: cap,
    currency: "usd",
    poll_url: `/v1/jobs/${job.id}`,
    message: `Echo agent "${agent.name}" hired. Campaign starting now.`,
    referral_attributed: refCodeRaw ? refCodeRaw : null,
  };

  // Persist idempotent response for replay
  if (idemKey && apiKeyId) {
    await sb.from("a2a_idempotency_keys").insert({
      api_key_id: apiKeyId,
      idempotency_key: idemKey,
      response_json: response,
      status_code: 201,
    }).then(() => {}, () => {});
  }

  return json(response, 201);
});

