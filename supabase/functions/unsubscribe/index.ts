// GET /unsubscribe?u=<send_id> — public, no auth. Adds email to unsubscribes table.
import { createClient } from "npm:@supabase/supabase-js@2";

const html = (title: string, msg: string) => `<!doctype html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;background:#0F172A;color:#F1F5F9;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center}
.box{max-width:480px;padding:32px;background:#1E293B;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.3)}
h1{margin:0 0 12px;font-size:22px}p{margin:0;color:#94A3B8;line-height:1.5}</style>
</head><body><div class="box"><h1>${title}</h1><p>${msg}</p></div></body></html>`;

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const sendId = url.searchParams.get("u");
  if (!sendId) return new Response(html("Invalid link", "Missing identifier."), { status: 400, headers: { "Content-Type": "text/html" } });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

  const { data: send } = await sb.from("campaign_sends").select("user_id, lead_email").eq("id", sendId).maybeSingle();
  if (!send?.lead_email) return new Response(html("Already unsubscribed", "We couldn't find this email — you're already removed."), { headers: { "Content-Type": "text/html" } });

  await sb.from("unsubscribes").upsert({ user_id: send.user_id, email: send.lead_email.toLowerCase(), source: "link" }, { onConflict: "user_id,email" });

  // Suppress any queued sends to this address
  await sb.from("campaign_sends").update({ status: "suppressed" }).eq("user_id", send.user_id).eq("lead_email", send.lead_email).eq("status", "queued");

  return new Response(html("You're unsubscribed", `${send.lead_email} will no longer receive emails from this sender.`), { headers: { "Content-Type": "text/html" } });
});
