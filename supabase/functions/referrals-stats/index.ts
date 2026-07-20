// GET /functions/v1/referrals-stats  (auth required)
// Returns the signed-in user's referral codes, registered referrer agents, and recent conversions.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

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

  const [{ data: codes }, { data: agents }] = await Promise.all([
    admin.from("referral_codes")
      .select("code, label, clicks, conversions, referrer_agent_id, created_at")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false }),
    admin.from("referral_agents")
      .select("id, name, agent_card_url, contact_email, status, created_at")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const codeList = (codes || []).map((c) => c.code);
  const agentIds = (agents || []).map((a) => a.id);

  let conversions: unknown[] = [];
  if (codeList.length || agentIds.length) {
    const or = [
      codeList.length ? `referrer_code.in.(${codeList.map((c) => `"${c}"`).join(",")})` : null,
      agentIds.length ? `referrer_agent_id.in.(${agentIds.join(",")})` : null,
    ].filter(Boolean).join(",");
    const { data } = await admin
      .from("referral_conversions")
      .select("id, referrer_code, referrer_agent_id, agent_id, task_id, event_type, amount_cents, currency, status, created_at")
      .or(or)
      .order("created_at", { ascending: false })
      .limit(100);
    conversions = data || [];
  }

  const totalConversions = conversions.length;
  const totalAttributedCents = (conversions as { amount_cents: number }[])
    .reduce((s, r) => s + (r.amount_cents || 0), 0);

  return json({
    mode: "track_only",
    payouts_enabled: false,
    payouts_note: "Program is currently tracking-only. Estimated earnings shown for reference; nothing is paid out yet.",
    codes: codes || [],
    referrer_agents: agents || [],
    conversions,
    totals: {
      conversions: totalConversions,
      attributed_cents: totalAttributedCents,
      currency: "usd",
      // Placeholder future payout rate (10%) so referrers see indicative numbers.
      estimated_future_earnings_cents: Math.round(totalAttributedCents * 0.1),
    },
  });
});
