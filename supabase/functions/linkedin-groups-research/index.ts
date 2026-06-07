// LinkedIn Groups & Associations research engine.
// Uses Firecrawl to discover candidates, then AI to rank, dedupe, and enrich.
// Cached per (user_id, niche) for 7 days.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function firecrawlSearch(query: string, limit = 10) {
  const key = Deno.env.get("FIRECRAWL_API_KEY");
  if (!key) return [];
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit, scrapeOptions: { formats: ["markdown"] } }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.data || data?.web || []) as Array<{ title?: string; url?: string; description?: string; markdown?: string }>;
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims } = await sb.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (!claims?.claims?.sub) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub;

    const { niche = "", audience = "", force = false } = await req.json().catch(() => ({}));
    if (!niche || typeof niche !== "string" || niche.length > 200) return json({ error: "niche required" }, 400);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Cache hit?
    if (!force) {
      const { data: cached } = await admin
        .from("linkedin_groups_research")
        .select("*")
        .eq("user_id", userId)
        .ilike("niche", niche)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cached?.results && Array.isArray(cached.results) && cached.results.length > 0) {
        return json({ results: cached.results, cached: true, generated_at: cached.created_at });
      }
    }

    // Firecrawl: groups + associations in parallel
    const queries = [
      `most active LinkedIn groups for ${niche} professionals ${audience}`.trim(),
      `top professional associations and trade organizations for ${niche} ${audience}`.trim(),
      `LinkedIn group site:linkedin.com/groups ${niche}`,
    ];
    const searchResults = (await Promise.all(queries.map((q) => firecrawlSearch(q, 8)))).flat();

    if (searchResults.length === 0) {
      return json({ error: "No search results — Firecrawl may be unavailable.", results: [] }, 200);
    }

    // Build compact context for AI
    const context = searchResults
      .slice(0, 25)
      .map((r, i) => `[${i + 1}] ${r.title || ""}\nURL: ${r.url || ""}\n${(r.description || r.markdown || "").slice(0, 400)}`)
      .join("\n\n");

    // AI curation
    const lovKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovKey) return json({ error: "LOVABLE_API_KEY missing" }, 500);

    const sys = `You are an outreach strategist. From the raw web results below, return the 8-12 BEST LinkedIn Groups and professional associations for someone doing outreach in this niche. Prefer high-activity, decision-maker-dense, geo-relevant groups. Reject generic/spammy listicles. Output ONLY valid JSON.`;

    const userPrompt = `Niche: ${niche}\nAudience: ${audience || "(not specified)"}\n\nRaw results:\n${context}\n\nReturn JSON: {"results":[{"name":"...","type":"group"|"association","url":"https://...","members_estimate":"e.g. 12K members or null","focus":"one-sentence focus","why_fit":"one-sentence why this matches the niche","activity_signal":"high"|"medium"|"low","engagement_tip":"one concrete first action (e.g. comment on the weekly thread about X)"}]}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      if (aiRes.status === 429) return json({ error: "Rate limit, try in a moment" }, 429);
      if (aiRes.status === 402) return json({ error: "AI credits exhausted — top up in Settings" }, 402);
      return json({ error: `AI error: ${t.slice(0, 200)}` }, 500);
    }
    const aiJson = await aiRes.json();
    let parsed: { results: any[] } = { results: [] };
    try {
      parsed = JSON.parse(aiJson.choices?.[0]?.message?.content || "{}");
    } catch {
      parsed = { results: [] };
    }
    const results = Array.isArray(parsed.results) ? parsed.results.slice(0, 12) : [];

    // Cache
    if (results.length > 0) {
      await admin.from("linkedin_groups_research").insert({
        user_id: userId, niche, audience, results,
      });
    }

    return json({ results, cached: false, generated_at: new Date().toISOString() });
  } catch (e) {
    console.error("linkedin-groups-research error", e);
    return json({ error: String(e) }, 500);
  }
});
