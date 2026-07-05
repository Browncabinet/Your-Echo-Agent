import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function startOfWeek(d = new Date()): string {
  const dt = new Date(d);
  const day = (dt.getUTCDay() + 6) % 7; // Mon=0
  dt.setUTCDate(dt.getUTCDate() - day);
  dt.setUTCHours(0, 0, 0, 0);
  return dt.toISOString().slice(0, 10);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await userClient.auth.getUser(token);
    const userId = userData?.user?.id;
    if (!userId) return json({ error: "Unauthorized" }, 401);

    const { niche, leadContext, audience } = await req.json();
    if (!niche || typeof niche !== "string") return json({ error: "niche required" }, 400);

    const service = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check weekly cap
    const { data: caps } = await service.rpc("current_week_caps", { _user_id: userId });
    const row = Array.isArray(caps) ? caps[0] : caps;
    if (!row?.subscription_active) {
      return json({ error: "Active weekly plan required. Upgrade to use LinkedIn Assist." }, 402);
    }
    if ((row.linkedin_used ?? 0) >= (row.linkedin_cap ?? 0)) {
      return json({ error: "You've used all your LinkedIn Assist actions this week. Upgrade or wait for the reset." }, 429);
    }

    // Generate via Lovable AI Gateway
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "LOVABLE_API_KEY missing" }, 500);

    const prompt = `You are a niche-outreach strategist helping someone engage on LinkedIn manually (no automation).

Niche: ${niche}
Target audience: ${audience || "Not specified"}
Lead context: ${leadContext || "Not specified"}

Return STRICT JSON, no markdown, with this shape:
{
  "groups": [{"name": "Group/org name", "search_url": "https://www.linkedin.com/search/results/groups/?keywords=..."}, ...3 items],
  "comment_drafts": ["short, value-add comment 1", "comment 2", "comment 3"],
  "dm_drafts": ["warm DM opener 1 (1-3 sentences)", "DM 2", "DM 3"]
}

Rules:
- Groups: suggest realistic LinkedIn group/association names a user could search for; include a working search URL.
- Comments: insightful, non-promotional, 1-2 sentences.
- DMs: personable, mentions specific niche pain, ends with a soft ask.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You return only valid JSON. No markdown fences." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      return json({ error: `AI gateway failed: ${aiRes.status} ${t}` }, 502);
    }
    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content ?? "{}";
    const cleaned = content.replace(/```json\n?|```/g, "").trim();
    let suggestions: any;
    try {
      suggestions = JSON.parse(cleaned);
    } catch {
      return json({ error: "AI returned invalid JSON", raw: cleaned }, 502);
    }

    // Increment counter
    const week = startOfWeek();
    const { data: existing } = await service
      .from("weekly_usage")
      .select("linkedin_actions")
      .eq("user_id", userId)
      .eq("week_start", week)
      .maybeSingle();
    if (existing) {
      await service
        .from("weekly_usage")
        .update({ linkedin_actions: (existing.linkedin_actions ?? 0) + 1, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("week_start", week);
    } else {
      await service.from("weekly_usage").insert({
        user_id: userId,
        week_start: week,
        linkedin_actions: 1,
        emails_sent: 0,
      });
    }

    return json({
      suggestions,
      remaining: Math.max(0, (row.linkedin_cap ?? 0) - ((row.linkedin_used ?? 0) + 1)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("linkedin-assist error:", message);
    return json({ error: message }, 500);
  }
});
