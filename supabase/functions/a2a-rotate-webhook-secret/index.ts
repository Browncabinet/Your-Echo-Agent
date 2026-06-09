// POST /partner/rotate-webhook-secret — regenerate a partner's HMAC secret.
import { corsHeaders, json, errorJson, admin } from "../_shared/a2a.ts";

function randomHex(bytes: number): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return Array.from(a).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return errorJson("method_not_allowed", "Use POST", 405);

  const sb = admin();
  const auth = req.headers.get("authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return errorJson("unauthorized", "Sign in to rotate the webhook secret", 401);
  const { data: u } = await sb.auth.getUser(m[1]);
  const user = u?.user;
  if (!user) return errorJson("unauthorized", "Invalid session", 401);

  const { data: partner } = await sb.from("a2a_partners").select("id").eq("owner_user_id", user.id).maybeSingle();
  if (!partner) return errorJson("partner_not_found", "Hire an agent first to create your partner account", 404);

  const newSecret = randomHex(32);
  const { error } = await sb.from("a2a_partners").update({ webhook_secret: newSecret }).eq("id", partner.id);
  if (error) return errorJson("internal_error", error.message, 500);

  return json({ ok: true, webhook_secret: newSecret, message: "Copy this secret — it won't be shown again." });
});
