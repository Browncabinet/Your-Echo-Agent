// Shared helpers for A2A edge functions
import { createClient } from "npm:@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-a2a-callback, idempotency-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extra },
  });
}

/** Standardized A2A error response. */
export function errorJson(code: string, message: string, status: number, hint?: string) {
  return json({ error: code, message, ...(hint ? { hint } : {}) }, status);
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
    if (u.hostname.endsWith(".supabase.co")) return "https://yourechoagent.com";
    return `${u.protocol}//${u.host}`;
  } catch {
    return "https://yourechoagent.com";
  }
}

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signPayload(payload: string): Promise<string> {
  const secret = Deno.env.get("A2A_CALLBACK_SIGNING_SECRET");
  if (!secret) {
    throw new Error("A2A_CALLBACK_SIGNING_SECRET is not configured. Refusing to sign callbacks with an insecure default.");
  }
  return await hmacHex(secret, payload);
}

export async function signPayloadFor(partnerSecret: string | null | undefined, payload: string): Promise<string> {
  if (partnerSecret && partnerSecret.length >= 32) {
    return await hmacHex(partnerSecret, payload);
  }
  return await signPayload(payload);
}

// ---------- SSRF guard ----------

const PRIVATE_HOSTNAMES = new Set(["localhost", "0.0.0.0", "ip6-localhost", "ip6-loopback"]);

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true; // link-local / cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const low = ip.toLowerCase();
  if (low === "::1" || low === "::") return true;
  if (low.startsWith("fc") || low.startsWith("fd")) return true; // ULA
  if (low.startsWith("fe80:")) return true; // link-local
  if (low.startsWith("::ffff:")) {
    const v4 = low.slice(7);
    return isPrivateIPv4(v4);
  }
  return false;
}

/** Returns {ok:true} if the URL is publicly reachable and not internal. */
export async function isSafeCallbackUrl(rawUrl: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  let u: URL;
  try { u = new URL(rawUrl); } catch { return { ok: false, reason: "invalid_url" }; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return { ok: false, reason: "unsupported_protocol" };
  // Allow http only for explicit allowlist (testing)
  const allowlist = (Deno.env.get("A2A_CALLBACK_ALLOWLIST") || "")
    .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const host = u.hostname.toLowerCase();
  if (allowlist.includes(host)) return { ok: true };

  if (u.protocol === "http:") return { ok: false, reason: "http_not_allowed" };
  if (PRIVATE_HOSTNAMES.has(host)) return { ok: false, reason: "private_hostname" };
  if (host.endsWith(".internal") || host.endsWith(".local")) return { ok: false, reason: "private_tld" };

  // Resolve host and verify no result is private
  try {
    const [a, aaaa] = await Promise.all([
      Deno.resolveDns(host, "A").catch(() => [] as string[]),
      Deno.resolveDns(host, "AAAA").catch(() => [] as string[]),
    ]);
    const ips = [...a, ...aaaa];
    if (ips.length === 0) return { ok: false, reason: "dns_resolution_failed" };
    for (const ip of ips) {
      if (ip.includes(":") ? isPrivateIPv6(ip) : isPrivateIPv4(ip)) {
        return { ok: false, reason: "resolves_to_private_ip" };
      }
    }
  } catch (e) {
    return { ok: false, reason: `dns_error:${e instanceof Error ? e.message : String(e)}` };
  }
  return { ok: true };
}

// ---------- Event timeline ----------

export async function appendJobEvent(jobId: string, eventType: string, payload: unknown) {
  const sb = admin();
  await sb.from("a2a_job_events").insert({
    job_id: jobId,
    event_type: eventType,
    payload: (payload && typeof payload === "object") ? payload : { value: payload },
  }).then(() => {}, (e: unknown) => console.error("appendJobEvent failed", e));
}

// ---------- Callback delivery with retry queue ----------

const RETRY_DELAYS_SEC = [60, 300, 1800, 7200, 43200]; // 1m, 5m, 30m, 2h, 12h

function nextAttemptISO(attempt: number): string {
  const sec = RETRY_DELAYS_SEC[Math.min(attempt - 1, RETRY_DELAYS_SEC.length - 1)];
  return new Date(Date.now() + sec * 1000).toISOString();
}

async function resolvePartnerSecret(sb: ReturnType<typeof admin>, partnerId: string | null): Promise<string | null> {
  if (!partnerId) return null;
  const { data } = await sb.from("a2a_partners").select("webhook_secret").eq("id", partnerId).maybeSingle();
  return data?.webhook_secret ?? null;
}

/** Best-effort callback delivery + log to a2a_callbacks_log; enqueue retry on failure. */
export async function emitCallback(
  url: string | null | undefined,
  event: string,
  data: unknown,
  ctx?: { job_id?: string; api_key_id?: string | null; partner_id?: string | null },
) {
  const sb = admin();

  // Always append to job event timeline (even if no callback url)
  if (ctx?.job_id) {
    await appendJobEvent(ctx.job_id, event, data);
  }

  let partnerId = ctx?.partner_id || null;
  let apiKeyId = ctx?.api_key_id || null;

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
      partner_id: partnerId, api_key_id: apiKeyId, job_id: ctx?.job_id || null,
      event_type: event, callback_url: "", payload, delivered: false,
      error_message: "no_callback_url",
    });
    return;
  }

  // SSRF guard
  const safe = await isSafeCallbackUrl(url);
  if (!safe.ok) {
    await sb.from("a2a_callbacks_log").insert({
      partner_id: partnerId, api_key_id: apiKeyId, job_id: ctx?.job_id || null,
      event_type: event, callback_url: url, payload, delivered: false,
      error_message: `ssrf_blocked:${safe.reason}`,
    });
    return;
  }

  const partnerSecret = await resolvePartnerSecret(sb, partnerId);
  let sig: string;
  try {
    sig = await signPayloadFor(partnerSecret, body);
  } catch (e) {
    console.error("signPayload failed", e);
    return;
  }

  let status: number | null = null;
  let errMsg: string | null = null;
  let respBody = "";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Echo-Signature": `sha256=${sig}`,
        "X-Echo-Event": event,
        "X-Echo-Attempt": "1",
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    status = res.status;
    try { respBody = (await res.text()).slice(0, 500); } catch { /* ignore */ }
  } catch (e) {
    errMsg = e instanceof Error ? e.message : String(e);
    console.error("callback failed", url, errMsg);
  }

  const delivered = status !== null && status >= 200 && status < 300;
  const { data: logRow } = await sb.from("a2a_callbacks_log").insert({
    partner_id: partnerId, api_key_id: apiKeyId, job_id: ctx?.job_id || null,
    event_type: event, callback_url: url, payload,
    response_status: status, response_body: respBody, delivered,
    error_message: errMsg,
  }).select("id").single();

  // Enqueue retry on non-2xx / network error
  if (!delivered) {
    await sb.from("a2a_callback_queue").insert({
      callback_log_id: logRow?.id || null,
      partner_id: partnerId,
      api_key_id: apiKeyId,
      job_id: ctx?.job_id || null,
      callback_url: url,
      event_type: event,
      payload,
      signature: sig,
      attempt: 1,
      max_attempts: 5,
      next_attempt_at: nextAttemptISO(1),
      status: "pending",
      last_status_code: status,
      last_error: errMsg,
    });
  }
}

// ---------- Rate limiting (atomic) ----------

export async function checkRateLimit(apiKeyId: string, limitPerMin: number): Promise<{ allowed: boolean; count: number; limit: number }> {
  const sb = admin();
  const windowStart = new Date(Math.floor(Date.now() / 60000) * 60000).toISOString();
  const { data, error } = await sb.rpc("a2a_bump_rate", {
    _api_key_id: apiKeyId,
    _window_start: windowStart,
  });
  if (error) {
    console.error("a2a_bump_rate failed, allowing", error);
    return { allowed: true, count: 0, limit: limitPerMin };
  }
  const count = (typeof data === "number" ? data : Number(data)) || 0;
  return { allowed: count <= limitPerMin, count, limit: limitPerMin };
}

// ---------- Agent card ----------

export function toAgentCard(a: Record<string, unknown>, baseUrl: string, ratingAgg?: { avg: number; count: number }) {
  const card: Record<string, unknown> = {
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
    jobsCompleted: a.jobs_completed,
    niche: a.niche,
    tagline: a.tagline,
    persona: a.persona,
  };
  if (ratingAgg && ratingAgg.count >= 3) {
    card.rating = Math.round(ratingAgg.avg * 10) / 10;
    card.ratingCount = ratingAgg.count;
  } else {
    card.rating = null;
    card.ratingCount = ratingAgg?.count ?? 0;
  }
  return card;
}
