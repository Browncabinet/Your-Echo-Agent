// Analyze a website URL and infer niche, audience, positioning, keywords, region.
// Used by the Community Radar URL onramp to prefill the Discover form.
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
    const { data: userData } = await userClient.auth.getUser(auth.replace("Bearer ", ""));
    if (!userData?.user?.id) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const url = String(body.url || "").trim();
    if (!url || !/^https?:\/\//i.test(url)) return json({ error: "Valid https URL required" }, 400);

    const fcKey = Deno.env.get("FIRECRAWL_API_KEY");
    const aiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!fcKey || !aiKey) return json({ error: "Server not configured" }, 500);

    // 1) Scrape
    let markdown = "";
    let summary = "";
    let title = "";
    try {
      const r = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: { Authorization: `Bearer ${fcKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ url, formats: ["markdown", "summary"], onlyMainContent: true }),
      });
      const d = await r.json();
      const payload = d?.data || d;
      markdown = String(payload?.markdown || "").slice(0, 8000);
      summary = String(payload?.summary || "");
      title = String(payload?.metadata?.title || "");
    } catch (e) {
      console.error("firecrawl", e);
    }

    if (!markdown && !summary) return json({ error: "Could not read the page" }, 422);

    // 2) Analyze
    const prompt = `Analyze this website and return ONLY JSON:
{
  "niche": "concise niche/industry, 3-8 words",
  "audience": "who they sell to, 3-10 words",
  "positioning": "one sentence value prop",
  "keywords": ["5-10 search keywords"],
  "region": "Global | USA | EU | UK | ... best guess",
  "summary": "2 sentence description of the company"
}

Page title: ${title}
Summary: ${summary}
Content:
${markdown}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Return only valid JSON, no markdown." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("ai", aiRes.status, t);
      return json({ error: "AI analysis failed", details: t }, aiRes.status);
    }
    const aj = await aiRes.json();
    let parsed: Record<string, unknown> = {};
    try {
      const c = aj.choices?.[0]?.message?.content ?? "{}";
      parsed = JSON.parse(String(c).replace(/```json\n?|```/g, "").trim());
    } catch (e) {
      console.error("parse", e);
    }

    return json({
      niche: String(parsed.niche || ""),
      audience: String(parsed.audience || ""),
      positioning: String(parsed.positioning || ""),
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 10) : [],
      region: String(parsed.region || "Global"),
      summary: String(parsed.summary || summary || ""),
      source_title: title,
      source_url: url,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("analyze-site-for-radar", msg);
    return json({ error: msg }, 500);
  }
});
