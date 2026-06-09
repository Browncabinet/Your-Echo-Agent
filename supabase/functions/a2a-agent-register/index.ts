// POST /v1/agents/register — submit a new agent listing (admin must flip active=true).
import { corsHeaders, json, errorJson, admin, isSafeCallbackUrl } from "../_shared/a2a.ts";

type RegisterBody = {
  agent_id?: string;
  name?: string;
  tagline?: string;
  description?: string;
  niche?: string;
  persona?: string;
  capabilities?: string[];
  pricing_per_lead_cents?: number;
  pricing_per_reply_cents?: number;
  pricing_per_meeting_cents?: number;
  callback_url?: string;
  owner_email?: string;
  version?: string;
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return errorJson("method_not_allowed", "Use POST", 405);

  const sb = admin();

  // Require signed-in user (no API-key registration — must own a real account)
  const auth = req.headers.get("authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return errorJson("unauthorized", "Sign in to register an agent", 401);
  const { data: u } = await sb.auth.getUser(m[1]);
  const user = u?.user;
  if (!user) return errorJson("unauthorized", "Invalid or expired session", 401);

  let body: RegisterBody;
  try { body = await req.json(); } catch { return errorJson("validation_failed", "Invalid JSON body", 400); }

  const name = (body.name || "").trim();
  const description = (body.description || "").trim();
  const tagline = (body.tagline || "").trim().slice(0, 160);
  const niche = (body.niche || "").trim().slice(0, 120);
  const persona = (body.persona || "").trim().slice(0, 500);
  const capabilities = Array.isArray(body.capabilities) ? body.capabilities.map(String).slice(0, 10) : [];
  const callbackUrl = (body.callback_url || "").trim();
  const ownerEmail = (body.owner_email || user.email || "").trim();
  const perLead = Math.max(1, Math.min(Number(body.pricing_per_lead_cents) || 15, 5000));
  const perReply = Math.max(1, Math.min(Number(body.pricing_per_reply_cents) || 75, 50000));
  const perMeeting = Math.max(1, Math.min(Number(body.pricing_per_meeting_cents) || 500, 100000));

  if (!name || name.length < 3) return errorJson("validation_failed", "name must be at least 3 characters", 400);
  if (!description || description.length < 20) return errorJson("validation_failed", "description must be at least 20 characters", 400);
  if (!niche) return errorJson("validation_failed", "niche is required", 400);
  if (capabilities.length === 0) return errorJson("validation_failed", "at least one capability is required", 400);
  if (callbackUrl) {
    const safe = await isSafeCallbackUrl(callbackUrl);
    if (!safe.ok) return errorJson("invalid_callback_url", `Callback URL rejected: ${safe.reason}`, 400, "Use a public https URL");
  }

  const baseId = body.agent_id ? slugify(body.agent_id) : slugify(name);
  if (!baseId) return errorJson("validation_failed", "Could not derive agent_id from name", 400);
  let agentId = baseId;
  const { data: clash } = await sb.from("a2a_agents").select("agent_id").eq("agent_id", agentId).maybeSingle();
  if (clash) agentId = `${baseId}-${Math.random().toString(36).slice(2, 6)}`;

  const { error } = await sb.from("a2a_agents").insert({
    agent_id: agentId,
    name,
    tagline: tagline || name,
    description,
    niche,
    persona: persona || "A pragmatic outreach specialist.",
    capabilities,
    pricing_per_lead_cents: perLead,
    pricing_per_reply_cents: perReply,
    pricing_per_meeting_cents: perMeeting,
    rating: 0,
    jobs_completed: 0,
    active: false,
    version: body.version || "1.0.0",
    owner_user_id: user.id,
    owner_email: ownerEmail,
    callback_url: callbackUrl || null,
  });
  if (error) return errorJson("internal_error", error.message, 500);

  return json({
    ok: true,
    agent_id: agentId,
    status: "pending_review",
    message: "Your agent was submitted and is pending review. You'll be notified by email when it goes live.",
  }, 201);
});
