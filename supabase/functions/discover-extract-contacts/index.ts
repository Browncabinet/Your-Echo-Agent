// Scrape an opportunity URL and extract contacts (emails, names, roles, socials).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: claims } = await userClient.auth.getClaims(auth.replace("Bearer ", ""));
    const userId = claims?.claims?.sub;
    if (!userId) return json({ error: "Unauthorized" }, 401);

    const { opportunity_id } = await req.json().catch(() => ({}));
    if (!opportunity_id) return json({ error: "opportunity_id required" }, 400);

    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: opp, error: oppErr } = await service
      .from("discovered_opportunities").select("*")
      .eq("id", opportunity_id).eq("user_id", userId).maybeSingle();
    if (oppErr || !opp) return json({ error: "Not found" }, 404);

    const fcKey = Deno.env.get("FIRECRAWL_API_KEY");
    const aiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!fcKey || !aiKey) return json({ error: "Server not configured" }, 500);

    const fr = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${fcKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url: opp.url, formats: ["markdown"], onlyMainContent: true }),
    });
    if (!fr.ok) return json({ error: `Firecrawl ${fr.status}` }, 502);
    const fd = await fr.json();
    const md: string = fd?.data?.markdown || fd?.markdown || "";
    if (!md) return json({ error: "No content scraped" }, 502);

    const prompt = `Extract contacts/organizers from this page. Return JSON:
{ "contacts": [ { "name": "...", "role": "...", "email": "...", "linkedin": "...", "twitter": "..." } ] }
Only include real names/emails. Omit fields you can't find. Max 12.

PAGE (truncated):
${md.slice(0, 12000)}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Return only valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });
    const aj = await aiRes.json();
    const raw = (aj.choices?.[0]?.message?.content ?? "{}").replace(/```json\n?|```/g, "").trim();
    let parsed: { contacts?: unknown[] } = {};
    try { parsed = JSON.parse(raw); } catch { parsed = { contacts: [] }; }
    const contacts = Array.isArray(parsed.contacts) ? parsed.contacts.slice(0, 12) : [];

    await service.from("discovered_opportunities")
      .update({ contacts, status: "extracted", updated_at: new Date().toISOString() })
      .eq("id", opportunity_id);

    return json({ contacts });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("discover-extract-contacts", msg);
    return json({ error: msg }, 500);
  }
});
