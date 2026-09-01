// Temporary diagnostic: verifies the server-side Echo API key secret resolves
// to an active a2a_api_keys row. Never returns the key itself.
import { createClient } from "npm:@supabase/supabase-js@2";

function sanitizeKey(raw: string | null | undefined): string {
  return (raw ?? "").replace(/[^\x21-\x7E]/g, "").trim();
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async () => {
  const key = sanitizeKey(Deno.env.get("ECHO_API_KEY") || Deno.env.get("GROK_ECHO_KEY"));
  if (!key) return Response.json({ ok: false, reason: "no server secret set" });
  const hash = await sha256Hex(key);
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data, error } = await sb
    .from("a2a_api_keys")
    .select("id, status")
    .eq("key_hash", hash)
    .maybeSingle();
  return Response.json({
    ok: !!data,
    prefix_ok: key.startsWith("eak_"),
    key_length: key.length,
    status: data?.status ?? null,
    error: error?.message ?? null,
  });
});
