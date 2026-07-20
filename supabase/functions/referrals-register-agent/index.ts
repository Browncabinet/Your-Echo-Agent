// POST /functions/v1/referrals-register-agent
// Registers a referrer agent (name, agent-card URL, payout destination) for the signed-in
// user and mints a linked referral code they can share.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function makeCode() {
  const alphabet = "abcdefghijkmnopqrstuvwxyz23456789";
  let s = "ref_";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  for (const b of bytes) s += alphabet[b % alphabet.length];
  return s;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const auth = req.headers.get("authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return json({ error: "unauthorized" }, 401);
  const { data: userData } = await admin.auth.getUser(m[1]);
  const user = userData?.user;
  if (!user) return json({ error: "unauthorized" }, 401);

  let body: {
    name?: string;
    agent_card_url?: string;
    payout_destination?: Record<string, unknown>;
    contact_email?: string;
  };
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }

  const name = (body.name || "").toString().trim().slice(0, 200);
  if (!name) return json({ error: "name_required" }, 400);
  const agent_card_url = (body.agent_card_url || "").toString().slice(0, 500) || null;
  const contact_email = (body.contact_email || user.email || "").toString().slice(0, 200) || null;
  const payout_destination = body.payout_destination && typeof body.payout_destination === "object"
    ? body.payout_destination : {};

  const { data: agent, error: aErr } = await admin
    .from("referral_agents")
    .insert({ owner_user_id: user.id, name, agent_card_url, contact_email, payout_destination })
    .select("id, name, agent_card_url, contact_email, status, created_at")
    .single();
  if (aErr || !agent) return json({ error: "failed_to_register", detail: aErr?.message }, 500);

  // Mint a linked code
  let code: string | null = null;
  for (let i = 0; i < 3 && !code; i++) {
    const c = makeCode();
    const { data, error } = await admin
      .from("referral_codes")
      .insert({ code: c, owner_user_id: user.id, referrer_agent_id: agent.id, label: name })
      .select("code")
      .single();
    if (!error && data) code = data.code;
  }
  if (!code) return json({ error: "failed_to_mint_code" }, 500);

  return json({
    agent,
    code,
    share_url: `https://yourechoagent.com/referrals?ref=${code}`,
    mode: "track_only",
    payouts_enabled: false,
  }, 201);
});
