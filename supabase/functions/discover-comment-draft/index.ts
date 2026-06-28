// Draft a platform-aware comment for a discovered opportunity.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function detectPlatform(url: string): { platform: string; tone: string } {
  const u = url.toLowerCase();
  if (u.includes("linkedin.com")) return { platform: "LinkedIn", tone: "professional, concise, value-add, no emojis" };
  if (u.includes("reddit.com")) return { platform: "Reddit", tone: "helpful, peer-to-peer, lowercase, no self-promo" };
  if (u.includes("youtube.com") || u.includes("youtu.be")) return { platform: "YouTube", tone: "friendly, specific reference to content" };
  if (u.includes("twitter.com") || u.includes("x.com")) return { platform: "X/Twitter", tone: "punchy, under 280 chars" };
  if (u.includes("meetup.com")) return { platform: "Meetup", tone: "warm, community-oriented" };
  if (u.includes("eventbrite.com") || u.includes("lu.ma") || u.includes("luma")) return { platform: "Event page", tone: "polite, curious, organizer-friendly" };
  if (u.includes("discord")) return { platform: "Discord", tone: "casual, community-aware" };
  if (u.includes("slack")) return { platform: "Slack", tone: "casual, professional" };
  return { platform: "Web", tone: "thoughtful and concise" };
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
    const { data: claims } = await userClient.auth.getClaims(auth.replace("Bearer ", ""));
    const userId = claims?.claims?.sub;
    if (!userId) return json({ error: "Unauthorized" }, 401);

    const { opportunity_id, niche, audience } = await req.json().catch(() => ({}));
    if (!opportunity_id) return json({ error: "opportunity_id required" }, 400);

    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: opp } = await service.from("discovered_opportunities")
      .select("*").eq("id", opportunity_id).eq("user_id", userId).maybeSingle();
    if (!opp) return json({ error: "Not found" }, 404);

    const { platform, tone } = detectPlatform(opp.url);
    const aiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!aiKey) return json({ error: "AI key missing" }, 500);

    const prompt = `Draft 3 ${platform} comments for this page. Tone: ${tone}.
Page: ${opp.title} — ${opp.url}
Host: ${opp.host_org || "n/a"}
My niche: ${niche || "n/a"}
My audience: ${audience || "n/a"}

Return JSON: { "drafts": ["...", "...", "..."] }. No markdown.`;

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
    let parsed: { drafts?: string[] } = {};
    try { parsed = JSON.parse(raw); } catch { parsed = { drafts: [] }; }
    return json({ platform, tone, drafts: parsed.drafts || [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("discover-comment-draft", msg);
    return json({ error: msg }, 500);
  }
});
