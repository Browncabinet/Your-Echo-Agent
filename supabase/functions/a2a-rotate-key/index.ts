// POST /a2a-rotate-key — rotate an A2A API key for the logged-in owner.
// Returns the new plaintext key ONCE.
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

  // Deactivate existing keys for this owner
  await sb.from("a2a_api_keys").update({ status: "rotated" }).eq("owner_user_id", userId).eq("status", "active");

  const newKey = genKey();
  const hash = await sha256Hex(newKey);
  const prefix = newKey.slice(0, 12);

  const { data: inserted, error } = await sb.from("a2a_api_keys").insert({
    key_hash: hash,
    key_prefix: prefix,
    owner_user_id: userId,
    owner_email: email,
    owner_name: userData?.user?.user_metadata?.full_name || email,
    status: "active",
    rate_limit_per_min: 60,
  }).select("id").single();

  if (error || !inserted) return json({ error: error?.message || "failed" }, 500);

  // Re-link partner row to new key if one exists
  await sb.from("a2a_partners").update({ api_key_id: inserted.id }).eq("owner_user_id", userId);

  return json({ ok: true, key: newKey, key_prefix: prefix, key_id: inserted.id, message: "Save this key — it will not be shown again." }, 201);
});
