// POST /a2a-onboard — create partner record + mint first eak_ key for logged-in user.
// Auth: Supabase user JWT in Authorization header.
import { corsHeaders, json, admin, sha256Hex } from "../_shared/a2a.ts";

function genKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const b64 = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `eak_${b64}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const sb = admin();
  const authHeader = req.headers.get("authorization") || "";
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!m) return json({ error: "unauthorized" }, 401);
  const { data: userData } = await sb.auth.getUser(m[1]);
  const userId = userData?.user?.id;
  const email = userData?.user?.email || "";
  if (!userId) return json({ error: "unauthorized" }, 401);

  let body: { display_name?: string; use_case?: string } = {};
  try { body = await req.json(); } catch { /* allow empty */ }
  const displayName = (body.display_name || "").toString().slice(0, 120).trim() || (userData?.user?.user_metadata?.full_name as string) || email;
  const useCase = (body.use_case || "testing").toString().slice(0, 40);

  // Check if partner already exists for this user
  const { data: existingPartner } = await sb
    .from("a2a_partners")
    .select("id, api_key_id")
    .eq("owner_user_id", userId)
    .maybeSingle();

  // If partner has an active key already, do NOT mint a new one — direct them to rotate.
  if (existingPartner?.api_key_id) {
    const { data: existingKey } = await sb
      .from("a2a_api_keys")
      .select("id, status")
      .eq("id", existingPartner.api_key_id)
      .maybeSingle();
    if (existingKey?.status === "active") {
      // Update display fields then return without exposing a key
      await sb.from("a2a_partners").update({
        display_name: displayName,
        use_case: useCase,
      }).eq("id", existingPartner.id);
      return json({
        ok: true,
        already_onboarded: true,
        partner_id: existingPartner.id,
        message: "Partner already onboarded. Rotate your key from the dashboard if you've lost it.",
      }, 200);
    }
  }

  // Mint a fresh key
  const newKey = genKey();
  const hash = await sha256Hex(newKey);
  const prefix = newKey.slice(0, 12);

  // Deactivate any previous keys
  await sb.from("a2a_api_keys").update({ status: "rotated" }).eq("owner_user_id", userId).eq("status", "active");

  const { data: inserted, error: keyErr } = await sb.from("a2a_api_keys").insert({
    key_hash: hash,
    key_prefix: prefix,
    owner_user_id: userId,
    owner_email: email,
    owner_name: displayName,
    status: "active",
    rate_limit_per_min: 60,
  }).select("id").single();

  if (keyErr || !inserted) return json({ error: keyErr?.message || "key_creation_failed" }, 500);

  // Upsert partner row
  if (existingPartner) {
    await sb.from("a2a_partners").update({
      api_key_id: inserted.id,
      display_name: displayName,
      use_case: useCase,
      billing_email: email,
    }).eq("id", existingPartner.id);
  } else {
    await sb.from("a2a_partners").insert({
      owner_user_id: userId,
      api_key_id: inserted.id,
      billing_email: email,
      display_name: displayName,
      use_case: useCase,
      balance_cents: 0,
      total_spent_cents: 0,
    });
  }

  return json({
    ok: true,
    key: newKey,
    key_prefix: prefix,
    key_id: inserted.id,
    message: "Save this key — it will not be shown again.",
  }, 201);
});
