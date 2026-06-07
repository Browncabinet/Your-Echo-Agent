// Generates a batch of 5-10 concrete LinkedIn actions (comments, connection requests,
// follow-up messages, profile views) for a campaign + chosen group, stores them in
// linkedin_actions, and returns them.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

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

    const { campaign_id, group, niche, leads = [] } = await req.json().catch(() => ({}));
    if (!group || typeof group !== "object") return json({ error: "group required (name + url)" }, 400);
    if (!niche) return json({ error: "niche required" }, 400);

    const lovKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovKey) return json({ error: "LOVABLE_API_KEY missing" }, 500);

    const leadSample = (Array.isArray(leads) ? leads : []).slice(0, 8).map((l: any) =>
      `- ${l.name || "Unknown"} (${l.title || "—"} at ${l.company || "—"})`
    ).join("\n") || "(no leads provided yet)";

    const sys = `You are an outreach strategist. Produce 6-8 LinkedIn assist-only actions (no auto-posting). Each action must be specific, value-first, and ready to copy. Return ONLY valid JSON.`;

    const userPrompt = `Niche: ${niche}
Primary LinkedIn group: ${group.name} (${group.url || "no url"})
Sample leads:
${leadSample}

Generate a mix of these kinds: "comment" (thoughtful reply on a recent group thread topic), "connection_request" (note <300 chars referencing the group), "follow_up_message" (after-acceptance message), "profile_view" (a person to warm with a profile view + like).

Return JSON: {"actions":[{"kind":"comment"|"connection_request"|"follow_up_message"|"profile_view","target_group":"${group.name}","target_person":"<name or empty>","draft_text":"<the exact text to copy, < 600 chars>","context_url":"<group url or profile search url>"}]}`;

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
      if (aiRes.status === 402) return json({ error: "AI credits exhausted" }, 402);
      return json({ error: `AI error: ${t.slice(0, 200)}` }, 500);
    }
    const aiJson = await aiRes.json();
    let parsed: { actions: any[] } = { actions: [] };
    try {
      parsed = JSON.parse(aiJson.choices?.[0]?.message?.content || "{}");
    } catch {}
    const actions = (Array.isArray(parsed.actions) ? parsed.actions : []).slice(0, 8);

    if (actions.length === 0) return json({ error: "No actions generated", actions: [] }, 200);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const rows = actions.map((a: any) => ({
      user_id: userId,
      campaign_id: campaign_id || null,
      kind: ["comment", "connection_request", "follow_up_message", "profile_view"].includes(a.kind) ? a.kind : "comment",
      target_group: String(a.target_group || group.name || "").slice(0, 200),
      target_person: String(a.target_person || "").slice(0, 200),
      draft_text: String(a.draft_text || "").slice(0, 2000),
      context_url: String(a.context_url || group.url || "").slice(0, 500),
      status: "pending",
    }));

    const { data: inserted, error } = await admin.from("linkedin_actions").insert(rows).select("*");
    if (error) return json({ error: error.message }, 500);

    return json({ actions: inserted });
  } catch (e) {
    console.error("linkedin-generate-actions error", e);
    return json({ error: String(e) }, 500);
  }
});
