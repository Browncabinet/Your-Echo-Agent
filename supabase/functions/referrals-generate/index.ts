// POST /functions/v1/referrals-generate
// Public: returns a fresh opaque referral code. Optionally links to signed-in user or a
// registered referrer agent. No auth required.
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
  // ref_ + 12 base32-ish chars
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

  let body: { label?: string; referrer_agent_id?: string } = {};
  try { body = await req.json(); } catch { /* body optional */ }

  // Optional signed-in user
  let ownerUserId: string | null = null;
  const auth = req.headers.get("authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (m) {
    const { data } = await admin.auth.getUser(m[1]);
    if (data?.user) ownerUserId = data.user.id;
  }

  // Retry on unique-collision (extremely rare)
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = makeCode();
    const { data, error } = await admin
      .from("referral_codes")
      .insert({
        code,
        owner_user_id: ownerUserId,
        referrer_agent_id: body.referrer_agent_id || null,
        label: (body.label || "").toString().slice(0, 120) || null,
      })
      .select("code, label, created_at")
      .single();
    if (!error && data) {
      return json({
        code: data.code,
        label: data.label,
        share_url: `https://yourechoagent.com/referrals?ref=${data.code}`,
        header_example: `X-Referral-Code: ${data.code}`,
        body_field_example: { referral_code: data.code },
        mode: "track_only",
        payouts_enabled: false,
        note: "Program is currently tracking-only. Conversions are logged; payouts will be enabled in a future phase.",
      }, 201);
    }
  }
  return json({ error: "failed_to_generate" }, 500);
});
