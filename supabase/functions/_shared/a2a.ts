// Shared helpers for A2A edge functions
import { createClient } from "npm:@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-a2a-callback",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extra },
  });
}

export function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type ApiKeyRow = {
  id: string;
  owner_email: string;
  owner_name: string;
  status: string;
  rate_limit_per_min: number;
};

export async function authenticateApiKey(req: Request): Promise<ApiKeyRow | null> {
  const auth = req.headers.get("authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const key = m[1].trim();
  if (!key.startsWith("eak_")) return null;
  const hash = await sha256Hex(key);
  const sb = admin();
  const { data, error } = await sb
    .from("a2a_api_keys")
    .select("id, owner_email, owner_name, status, rate_limit_per_min")
    .eq("key_hash", hash)
    .eq("status", "active")
    .maybeSingle();
  if (error || !data) return null;
  sb.from("a2a_api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id).then(() => {});
  return data as ApiKeyRow;
}

/** Derive the public base URL of this deployment, e.g. https://yourechoagent.com */
export function publicBaseUrl(req: Request): string {
  try {
    const u = new URL(req.url);
    // If hitting the supabase functions origin directly, prefer the canonical domain
    if (u.hostname.endsWith(".supabase.co")) return "https://yourechoagent.com";
    return `${u.protocol}//${u.host}`;
  } catch {
    return "https://yourechoagent.com";
  }
}

export async function signPayload(payload: string): Promise<string> {
  const secret = Deno.env.get("A2A_CALLBACK_SIGNING_SECRET");
  if (!secret) {
    throw new Error("A2A_CALLBACK_SIGNING_SECRET is not configured. Refusing to sign callbacks with an insecure default.");
  }
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Best-effort callback delivery + log to a2a_callbacks_log. */
export async function emitCallback(
  url: string | null | undefined,
  event: string,
  data: unknown,
  ctx?: { job_id?: string; api_key_id?: string | null; partner_id?: string | null },
) {
  const sb = admin();
  let partnerId = ctx?.partner_id || null;
  let apiKeyId = ctx?.api_key_id || null;

  // Resolve partner / api_key from job if not given
  if (!partnerId && ctx?.job_id) {
    const { data: job } = await sb.from("a2a_jobs").select("api_key_id").eq("id", ctx.job_id).maybeSingle();
    if (job?.api_key_id) {
      apiKeyId = job.api_key_id;
      const { data: p } = await sb.from("a2a_partners").select("id").eq("api_key_id", job.api_key_id).maybeSingle();
      if (p) partnerId = p.id;
    }
  }

  const payload = { event, data, ts: new Date().toISOString() };
  const body = JSON.stringify(payload);

  if (!url) {
    await sb.from("a2a_callbacks_log").insert({
      partner_id: partnerId,
      api_key_id: apiKeyId,
      job_id: ctx?.job_id || null,
      event_type: event,
      callback_url: "",
      payload,
      delivered: false,
      error_message: "no_callback_url",
    });
    return;
  }

  let status: number | null = null;
  let errMsg: string | null = null;
  let respBody = "";
  try {
    const sig = await signPayload(body);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Echo-Signature": `sha256=${sig}`,
        "X-Echo-Event": event,
      },
      body,
    });
    status = res.status;
    try { respBody = (await res.text()).slice(0, 500); } catch { /* ignore */ }
  } catch (e) {
    errMsg = e instanceof Error ? e.message : String(e);
    console.error("callback failed", url, errMsg);
  }
  await sb.from("a2a_callbacks_log").insert({
    partner_id: partnerId,
    api_key_id: apiKeyId,
    job_id: ctx?.job_id || null,
    event_type: event,
    callback_url: url,
    payload,
    response_status: status,
    response_body: respBody,
    delivered: status !== null && status >= 200 && status < 300,
    error_message: errMsg,
  });
}

/** Token-bucket rate limit using a2a_rate_buckets. Returns true if allowed. */
export async function checkRateLimit(apiKeyId: string, limitPerMin: number): Promise<{ allowed: boolean; count: number; limit: number }> {
  const sb = admin();
  const now = new Date();
  const windowStart = new Date(Math.floor(now.getTime() / 60000) * 60000).toISOString();

  // Atomic upsert+increment via two-step (best effort; small volume).
  const { data: existing } = await sb
    .from("a2a_rate_buckets")
    .select("count")
    .eq("api_key_id", apiKeyId)
    .eq("window_start", windowStart)
    .maybeSingle();
  const nextCount = (existing?.count || 0) + 1;
  if (existing) {
    await sb.from("a2a_rate_buckets").update({ count: nextCount }).eq("api_key_id", apiKeyId).eq("window_start", windowStart);
  } else {
    await sb.from("a2a_rate_buckets").insert({ api_key_id: apiKeyId, window_start: windowStart, count: 1 });
    // opportunistic cleanup of old buckets
    sb.from("a2a_rate_buckets").delete().lt("window_start", new Date(now.getTime() - 600000).toISOString()).then(() => {});
  }
  return { allowed: nextCount <= limitPerMin, count: nextCount, limit: limitPerMin };
}

export function toAgentCard(a: Record<string, unknown>, baseUrl: string) {
  return {
    schemaVersion: "0.3.0",
    name: a.name,
    description: a.description,
    url: `${baseUrl}/v1/agents/${a.agent_id}`,
    version: a.version,
    capabilities: a.capabilities,
    pricing: {
      perLeadCents: a.pricing_per_lead_cents,
      perReplyCents: a.pricing_per_reply_cents,
      perMeetingCents: a.pricing_per_meeting_cents,
      currency: "usd",
    },
    rating: a.rating,
    jobsCompleted: a.jobs_completed,
    niche: a.niche,
    tagline: a.tagline,
    persona: a.persona,
  };
}
