// Discover groups, conferences, webinars, and podcasts via Firecrawl + Gemini.
// Auth: user JWT. Enforces weekly discoveries cap.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

type Kind = "group" | "conference" | "webinar" | "podcast" | "newsletter" | "forum";

const SITE_HINTS: Record<Kind, string[]> = {
  conference: [
    "site:eventbrite.com",
    "site:lu.ma",
    "site:sessionize.com",
    "site:cvent.com",
    "site:ti.to",
    "conference 2026",
  ],
  webinar: [
    "site:lu.ma webinar",
    "site:zoom.us webinar",
    "site:hopin.com",
    "site:eventbrite.com online",
    "webinar 2026",
  ],
  group: [
    "site:meetup.com",
    "site:reddit.com community",
    "slack community",
    "discord community",
    "association",
  ],
  podcast: [
    "site:podchaser.com",
    "site:listennotes.com",
    "site:open.spotify.com/show",
    "podcast",
  ],
  newsletter: [
    "site:substack.com",
    "site:beehiiv.com",
    "site:convertkit.com",
    "site:buttondown.email",
    "newsletter subscribe",
  ],
  forum: [
    "site:discourse.org",
    "site:reddit.com",
    "forum community",
    "site:community.hubspot.com",
    "site:news.ycombinator.com",
  ],
};

function startOfWeek(): string {
  const dt = new Date();
  const day = (dt.getUTCDay() + 6) % 7;
  dt.setUTCDate(dt.getUTCDate() - day);
  dt.setUTCHours(0, 0, 0, 0);
  return dt.toISOString().slice(0, 10);
}

function normUrl(u: string) {
  try {
    const x = new URL(u);
    x.hash = "";
    x.search = "";
    return x.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return u.toLowerCase();
  }
}

async function sha(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");
}

async function firecrawlSearch(apiKey: string, query: string, limit = 8) {
  const r = await fetch("https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, limit }),
  });
  if (!r.ok) return [];
  const d = await r.json();
  return (d?.data || d?.web || []) as Array<{ url?: string; title?: string; description?: string }>;
}

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
    const userId = userData?.user?.id;
    if (!userId) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const niche: string = String(body.niche || "").trim();
    const audience: string = String(body.audience || "").trim();
    const region: string = String(body.region || "Global").trim();
    const virtualOnly: boolean = !!body.virtual_only;
    const timeframeDays: number = Math.max(7, Math.min(365, Number(body.timeframe_days) || 90));
    const kinds: Kind[] = Array.isArray(body.kinds) && body.kinds.length
      ? body.kinds.filter((k: string): k is Kind => ["group", "conference", "webinar", "podcast", "newsletter", "forum"].includes(k))
      : ["group", "conference", "webinar", "podcast", "newsletter", "forum"];
    const campaignId: string | null = body.campaign_id || null;
    if (!niche) return json({ error: "niche required" }, 400);

    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Cap check
    const { data: caps } = await service.rpc("current_week_caps", { _user_id: userId });
    const row = Array.isArray(caps) ? caps[0] : caps;
    if (!row?.subscription_active) {
      return json({ error: "Active weekly plan required to use Discover." }, 402);
    }
    if ((row.discoveries_used ?? 0) >= (row.discoveries_cap ?? 0)) {
      return json({ error: "Weekly Discover limit reached. Upgrade or wait for the reset." }, 429);
    }

    const fcKey = Deno.env.get("FIRECRAWL_API_KEY");
    const aiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!fcKey || !aiKey) return json({ error: "Server not configured" }, 500);

    // Run a few targeted searches per kind
    const rawResults: Array<{ kind: Kind; url: string; title: string; description: string }> = [];
    const seen = new Set<string>();
    const baseQ = `${niche} ${audience || ""}`.trim();
    const regionQ = region && region !== "Global" ? ` ${region}` : "";
    const virtQ = virtualOnly ? " virtual online" : "";

    await Promise.all(kinds.map(async (k) => {
      const hints = SITE_HINTS[k].slice(0, 4);
      const queries = hints.map((h) => `${baseQ} ${h}${regionQ}${virtQ}`.trim());
      for (const q of queries) {
        const items = await firecrawlSearch(fcKey, q, 6);
        for (const it of items) {
          if (!it.url) continue;
          const n = normUrl(it.url);
          if (seen.has(n)) continue;
          seen.add(n);
          rawResults.push({
            kind: k,
            url: it.url,
            title: it.title || "",
            description: it.description || "",
          });
        }
      }
    }));

    if (rawResults.length === 0) return json({ inserted: 0, opportunities: [] });

    // Classify + score with Gemini
    const trimmed = rawResults.slice(0, 60);
    const prompt = `You are filtering web results for an outreach platform.

Niche: ${niche}
Target audience: ${audience || "n/a"}
Region: ${region}${virtualOnly ? " (virtual only)" : ""}
Timeframe: next ${timeframeDays} days

For each result below, return JSON with this exact shape:
{ "items": [ { "i": <index>, "keep": true|false, "kind": "group|conference|webinar|podcast", "host_org": "...", "location": "...", "is_virtual": true|false, "event_start": "YYYY-MM-DD" or null, "fit_score": 0-100, "fit_reason": "1 short sentence" } ] }

Rules:
- keep=false if result is unrelated, paywalled login, or generic homepage.
- fit_score reflects audience match.
- Only return JSON. No markdown.

Results:
${trimmed.map((r, i) => `${i}. [${r.kind}] ${r.title}\n${r.url}\n${r.description}`).join("\n\n")}`;

    let parsed: { items?: Array<Record<string, unknown>> } = {};
    try {
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
      const aj = await aiRes.json();
      const c = aj.choices?.[0]?.message?.content ?? "{}";
      parsed = JSON.parse(c.replace(/```json\n?|```/g, "").trim());
    } catch (e) {
      console.error("ai parse failed", e);
    }

    const items = Array.isArray(parsed.items) ? parsed.items : [];
    const toInsert: Array<Record<string, unknown>> = [];
    for (const it of items) {
      const i = Number(it.i);
      if (!Number.isFinite(i) || !trimmed[i]) continue;
      if (!it.keep) continue;
      const base = trimmed[i];
      const kind = (it.kind as Kind) || base.kind;
      const isVirtual = !!it.is_virtual;
      if (virtualOnly && kind === "conference" && !isVirtual) continue;
      const dedup = await sha(normUrl(base.url) + "|" + (it.event_start || ""));
      toInsert.push({
        user_id: userId,
        campaign_id: campaignId,
        kind,
        title: base.title || String(it.host_org || "Untitled"),
        url: base.url,
        host_org: it.host_org || null,
        location: it.location || null,
        is_virtual: isVirtual,
        event_start: it.event_start ? new Date(String(it.event_start)).toISOString() : null,
        source: new URL(base.url).hostname,
        contacts: [],
        fit_score: Math.max(0, Math.min(100, Number(it.fit_score) || 0)),
        fit_reason: String(it.fit_reason || "").slice(0, 240),
        dedup_hash: dedup,
        status: "new",
      });
    }

    let inserted: unknown[] = [];
    if (toInsert.length) {
      const { data, error } = await service
        .from("discovered_opportunities")
        .upsert(toInsert, { onConflict: "user_id,dedup_hash", ignoreDuplicates: true })
        .select("*");
      if (error) console.error("insert err", error);
      inserted = data || [];
    }

    // Increment cap counter
    const week = startOfWeek();
    const { data: existing } = await service
      .from("weekly_usage")
      .select("discoveries_used")
      .eq("user_id", userId).eq("week_start", week).maybeSingle();
    if (existing) {
      await service.from("weekly_usage")
        .update({ discoveries_used: (existing.discoveries_used ?? 0) + 1, updated_at: new Date().toISOString() })
        .eq("user_id", userId).eq("week_start", week);
    } else {
      await service.from("weekly_usage").insert({
        user_id: userId, week_start: week, discoveries_used: 1, emails_sent: 0, linkedin_actions: 0,
      });
    }

    return json({ inserted: inserted.length, opportunities: inserted });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("discover-communities", msg);
    return json({ error: msg }, 500);
  }
});
