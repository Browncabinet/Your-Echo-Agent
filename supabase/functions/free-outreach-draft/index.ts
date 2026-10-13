// Public, rate-limited (3/day per IP) demo of draft_outreach. No auth, nothing is sent.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

const DAILY_LIMIT = 3;
const TYPES = ["podcast_guest", "conference_speaker", "sponsor_partner", "community_intro"];
const TONES = ["friendly", "professional", "brief"];
const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

async function sha256(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  try {
    const b = await req.json().catch(() => ({}));
    const input = {
      outreach_type: TYPES.includes(b.outreach_type) ? b.outreach_type : "podcast_guest",
      event_name: clip(b.event_name, 200),
      event_url: clip(b.event_url, 500),
      hook: clip(b.hook, 400),
      recipient_first_name: clip(b.recipient_first_name, 60),
      recipient_role: clip(b.recipient_role, 100),
      about_you: clip(b.about_you, 600),
      ask: clip(b.ask, 150),
      tone: TONES.includes(b.tone) ? b.tone : "friendly",
    };
    if (!input.event_name || !input.hook || !input.about_you || !input.ask) {
      return json({ error: "validation_failed", message: "Event name, what caught your attention, about you, and the ask are required." }, 400);
    }

    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
    const ipHash = await sha256(ip + "|free-outreach");
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: used, error: rlErr } = await admin.rpc("bump_free_tool_usage", { _ip_hash: ipHash, _limit: DAILY_LIMIT });
    if (rlErr) throw rlErr;
    if (used === -1) {
      return json({ error: "rate_limit_exceeded", message: "You've used your 3 free drafts today. Come back tomorrow, or get an API key for unlimited drafts." }, 429);
    }

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "internal_error" }, 500);
    const sys = `You write warm, specific outreach emails. Rules:
- Body under 150 words. Reference the specific event detail provided. One clear ask. No false claims, no invented stats, numbers, or names beyond what's provided.
- No emojis, no "hope this finds you well".
- Tone: ${input.tone}.
Return ONLY JSON: {"subject":"...","alt_subjects":["...","..."],"body":"...","why_this_works":["...","...","..."],"follow_up":{"send_after_days":5,"subject":"...","body":"..."}}. follow_up body under 70 words. Use \\n for line breaks.`;
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: sys }, { role: "user", content: JSON.stringify(input) }],
        response_format: { type: "json_object" },
      }),
    });
    if (r.status === 429) return json({ error: "rate_limit_exceeded", message: "We're busy right now, try again in a minute." }, 429);
    if (!r.ok) return json({ error: "internal_error", message: "Drafting failed, please try again." }, 502);
    const j = await r.json();
    const raw = (j?.choices?.[0]?.message?.content ?? "{}").replace(/```json\n?|```/g, "").trim();
    const d = JSON.parse(raw);
    return json({
      tool: "draft_outreach",
      status: "drafted",
      sent: false,
      input,
      draft: {
        subject: String(d.subject ?? ""),
        alt_subjects: Array.isArray(d.alt_subjects) ? d.alt_subjects.slice(0, 2).map(String) : [],
        body: String(d.body ?? ""),
        why_this_works: Array.isArray(d.why_this_works) ? d.why_this_works.slice(0, 4).map(String) : [],
        follow_up: d.follow_up ?? null,
      },
      remaining_today: Math.max(0, DAILY_LIMIT - (used as number)),
    });
  } catch (e) {
    console.error("free-outreach-draft:", (e as Error).message);
    return json({ error: "internal_error", message: "Drafting failed, please try again." }, 500);
  }
});
