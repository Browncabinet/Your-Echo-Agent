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

/** Validates `Authorization: Bearer <key>` against a2a_api_keys. Returns row or null. */
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
  // fire-and-forget last_used_at update
  sb.from("a2a_api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id).then(() => {});
  return data as ApiKeyRow;
}

/** Sign a webhook payload with HMAC-SHA256 using A2A_CALLBACK_SIGNING_SECRET. */
export async function signPayload(payload: string): Promise<string> {
  const secret = Deno.env.get("A2A_CALLBACK_SIGNING_SECRET") || "dev-secret-change-me";
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

/** Best-effort callback delivery. */
export async function emitCallback(url: string | null | undefined, event: string, data: unknown) {
  if (!url) return;
  try {
    const body = JSON.stringify({ event, data, ts: new Date().toISOString() });
    const sig = await signPayload(body);
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Echo-Signature": `sha256=${sig}`,
        "X-Echo-Event": event,
      },
      body,
    });
  } catch (e) {
    console.error("callback failed", url, e);
  }
}

/** Build an A2A-spec-shaped Agent Card from a DB row. */
export function toAgentCard(a: Record<string, unknown>, baseUrl: string) {
  return {
    agent_id: a.agent_id,
    name: a.name,
    tagline: a.tagline,
    description: a.description,
    niche: a.niche,
    persona: a.persona,
    version: a.version,
    capabilities: a.capabilities,
    pricing: {
      currency: "usd",
      per_lead_cents: a.pricing_per_lead_cents,
      per_reply_cents: a.pricing_per_reply_cents,
      per_meeting_cents: a.pricing_per_meeting_cents,
    },
    stats: { rating: a.rating, jobs_completed: a.jobs_completed },
    endpoints: {
      card: `${baseUrl}/v1/agents/${a.agent_id}`,
      hire: `${baseUrl}/v1/agents/${a.agent_id}/hire`,
      jobs: `${baseUrl}/v1/jobs/{job_id}`,
    },
    auth: { type: "bearer", header: "Authorization", prefix: "eak_" },
    owner: "Echo Agents (yourechoagent.com)",
    active: a.active,
  };
}

export function publicBaseUrl(req: Request) {
  // Prefer canonical brand URL for docs; functions still callable via SUPABASE_URL
  return "https://yourechoagent.com/api";
}

export function functionsBaseUrl() {
  const url = new URL(Deno.env.get("SUPABASE_URL")!);
  return `https://${url.host}/functions/v1`;
}
