// Draft a personalized outreach email for a discovered opportunity.
// Cached on the opportunity row (draft_subject/draft_body/draft_generated_at).
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
    const userId = userData?.user?.id;
    if (!userId) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const opportunityId: string = String(body.opportunity_id || "");
    const senderName: string = String(body.sender_name || "").trim();
    const senderCompany: string = String(body.sender_company || "").trim();
    const senderPitch: string = String(body.sender_pitch || "").trim();
    const regenerate: boolean = !!body.regenerate;
    if (!opportunityId) return json({ error: "opportunity_id required" }, 400);

    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: opp } = await service
      .from("discovered_opportunities")
      .select("*")
      .eq("id", opportunityId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!opp) return json({ error: "Not found" }, 404);

    if (!regenerate && opp.draft_subject && opp.draft_body) {
      return json({ subject: opp.draft_subject, body: opp.draft_body, cached: true });
    }

    const aiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!aiKey) return json({ error: "Server not configured" }, 500);

    const approach = opp.approach || defaultApproach(opp.kind);
    const contactName = (opp.contacts && opp.contacts[0]?.name) || "";

    const prompt = `You are drafting a short, personalized outreach email.

Opportunity:
- Title: ${opp.title}
- Kind: ${opp.kind} (${approach} approach)
- Host / org: ${opp.host_org || "unknown"}
- URL: ${opp.url}
- Why it's a fit: ${opp.fit_reason || "n/a"}
- Contact first name (if any): ${contactName ? contactName.split(/\s+/)[0] : ""}

Sender:
- Name: ${senderName || "[Your name]"}
- Company: ${senderCompany || "[Your company]"}
- One-line pitch: ${senderPitch || "[what you do / value you offer]"}

Task: Write a concise cold email (80-140 words) with a clear ask matching the "${approach}" approach:
- sponsor  -> ask about sponsorship packages
- speak    -> pitch a specific talk idea (invent a plausible topic based on the sender pitch)
- pitch    -> propose a guest post / interview / feature relevant to the outlet
- post     -> ask to contribute or post in the community
- comment  -> a warm intro asking to join / participate
- subscribe -> compliment the newsletter and propose collaboration
Rules: no fluff, no "I hope this email finds you well", no emojis, no markdown, one CTA. Include one specific detail from the opportunity to prove it's not a template.

Return ONLY JSON:
{ "subject": "...", "body": "Hi [First name],\\n\\n...\\n\\nBest,\\n${senderName || "[Your name]"}" }`;

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
      return json({ error: "AI draft failed", details: t }, aiRes.status);
    }
    const aj = await aiRes.json();
    let parsed: { subject?: string; body?: string } = {};
    try {
      const c = aj.choices?.[0]?.message?.content ?? "{}";
      parsed = JSON.parse(String(c).replace(/```json\n?|```/g, "").trim());
    } catch (e) {
      console.error("parse", e);
    }
    const subject = String(parsed.subject || "").slice(0, 200);
    const bodyText = String(parsed.body || "").slice(0, 4000);
    if (!subject || !bodyText) return json({ error: "Empty draft" }, 502);

    await service
      .from("discovered_opportunities")
      .update({
        draft_subject: subject,
        draft_body: bodyText,
        draft_generated_at: new Date().toISOString(),
      })
      .eq("id", opportunityId)
      .eq("user_id", userId);

    return json({ subject, body: bodyText, cached: false });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("radar-draft-outreach", msg);
    return json({ error: msg }, 500);
  }
});

function defaultApproach(kind: string): string {
  switch (kind) {
    case "conference": return "sponsor";
    case "webinar": return "speak";
    case "podcast": return "pitch";
    case "newsletter": return "subscribe";
    case "forum": return "post";
    case "group":
    default: return "post";
  }
}
