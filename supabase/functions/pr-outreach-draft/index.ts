// Draft personalized PR outreach emails per contact, grouped by source.
// Public: no auth required (demo tier). Used by MCP `draft_pr_outreach_for_contacts`.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-echo-api-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

type Contact = {
  name?: string;
  title?: string;
  company?: string;
  email?: string;
  location?: string;
  source_title?: string;
  source_url?: string;
  category?: string;
  confidence?: number;
};

type Sender = {
  name: string;
  company?: string;
  one_line_pitch: string;
  services_short: string;
  meeting_options?: Array<"phone" | "in_person" | "online">;
  scheduling_link?: string;
  reply_email: string;
};

const GENERIC_EMAIL_PREFIXES = ["info@", "hello@", "contact@", "team@", "hi@", "admin@", "support@"];

function isGenericEmail(e?: string) {
  if (!e) return false;
  const lower = e.toLowerCase();
  return GENERIC_EMAIL_PREFIXES.some((p) => lower.startsWith(p));
}

async function aiJson(system: string, user: string): Promise<any> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return null;
  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!r.ok) return null;
    const j = await r.json();
    const raw = j?.choices?.[0]?.message?.content ?? "{}";
    try { return JSON.parse(raw.replace(/```json\n?|```/g, "").trim()); } catch { return null; }
  } catch { return null; }
}

async function draftForContact(c: Contact, sender: Sender, tone: string): Promise<{ subject: string; body: string } | null> {
  const meetingOpts = (sender.meeting_options && sender.meeting_options.length ? sender.meeting_options : ["phone", "online"])
    .map((m) => m === "in_person" ? "in-person" : m).join(", ");
  const sys = `You write short, high-reply cold emails for personalized PR/BD outreach. Rules:
- Under 110 words total.
- Line 1: personalized hook that references the specific source (group / event / conference / organization / LinkedIn group) — never generic.
- Line 2: one-sentence pitch of the sender's service.
- Line 3: one specific "why you" reason tied to the recipient's title/company.
- Line 4: ask for a 15-minute meeting; offer options (${meetingOpts})${sender.scheduling_link ? ` and a scheduling link` : ""}${c.location ? `; mention in-person if they're in ${c.location}` : ""}.
- Line 5: "Reply to this email and I'll send times." Route replies to ${sender.reply_email}.
- No emojis, no "Hope this finds you well", no exclamation marks.
- Output ONLY JSON: {"subject":"...","body":"..."}. Body may use \\n for line breaks.
- Tone: ${tone}.`;
  const usr = `Recipient:
- Name: ${c.name ?? "there"}
- Title: ${c.title ?? "(unknown)"}
- Company: ${c.company ?? "(unknown)"}
- Location: ${c.location ?? "(unknown)"}

Source they're connected to:
- ${c.source_title ?? "(unknown source)"} (${c.category ?? "community"})
- URL: ${c.source_url ?? "(n/a)"}

Sender:
- ${sender.name}${sender.company ? ` at ${sender.company}` : ""}
- One-line pitch: ${sender.one_line_pitch}
- Services: ${sender.services_short}
- Scheduling link: ${sender.scheduling_link ?? "(none — ask them to reply with times)"}
- Meeting options: ${meetingOpts}`;
  const out = await aiJson(sys, usr);
  if (!out || typeof out.subject !== "string" || typeof out.body !== "string") return null;
  return { subject: out.subject.slice(0, 140), body: out.body.slice(0, 1500) };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  try {
    const body = await req.json().catch(() => ({}));
    const contacts: Contact[] = Array.isArray(body.contacts) ? body.contacts.slice(0, 20) : [];
    const sender: Sender | undefined = body.sender;
    const tone: string = (body.tone === "friendly" || body.tone === "concise") ? body.tone : "professional";
    if (contacts.length === 0) return json({ error: "contacts array required" }, 400);
    if (!sender?.name || !sender?.reply_email || !sender?.one_line_pitch || !sender?.services_short) {
      return json({ error: "sender.name, sender.reply_email, sender.one_line_pitch, sender.services_short required" }, 400);
    }

    // Filter: skip low-confidence + generic emails (surface separately)
    const sendable: Contact[] = [];
    const needsReview: Array<{ contact: Contact; reason: string }> = [];
    for (const c of contacts) {
      if (!c.email) { needsReview.push({ contact: c, reason: "no email" }); continue; }
      if (typeof c.confidence === "number" && c.confidence < 0.6) {
        needsReview.push({ contact: c, reason: `low confidence (${c.confidence})` }); continue;
      }
      if (isGenericEmail(c.email)) { needsReview.push({ contact: c, reason: "generic mailbox — review before sending" }); continue; }
      sendable.push(c);
    }

    // Draft in parallel (cap concurrency at 5)
    const drafts: Array<any> = [];
    for (let i = 0; i < sendable.length; i += 5) {
      const chunk = sendable.slice(i, i + 5);
      const results = await Promise.all(chunk.map(async (c) => {
        const d = await draftForContact(c, sender, tone);
        if (!d) return null;
        return {
          to: {
            name: c.name ?? null,
            title: c.title ?? null,
            company: c.company ?? null,
            email: c.email!,
            location: c.location ?? null,
          },
          source: {
            title: c.source_title ?? null,
            url: c.source_url ?? null,
            category: c.category ?? null,
          },
          subject: d.subject,
          body: d.body,
          reply_to: sender.reply_email,
          meeting_options: sender.meeting_options ?? ["phone", "online"],
        };
      }));
      for (const r of results) if (r) drafts.push(r);
    }

    // Group by source
    const bySource = new Map<string, any>();
    for (const d of drafts) {
      const key = d.source.url || d.source.title || "unknown";
      if (!bySource.has(key)) {
        bySource.set(key, {
          source_title: d.source.title,
          source_url: d.source.url,
          category: d.source.category,
          drafts: [],
        });
      }
      bySource.get(key).drafts.push({
        to: d.to,
        subject: d.subject,
        body: d.body,
        reply_to: d.reply_to,
        meeting_options: d.meeting_options,
      });
    }

    return json({
      total_drafts: drafts.length,
      groups: Array.from(bySource.values()),
      needs_manual_review: needsReview,
      next_step: "Call queue_pr_outreach_job (requires ECHO_API_KEY) to save these drafts for review + send from https://yourechoagent.com/for-agents/dashboard",
    });
  } catch (e) {
    console.error("pr-outreach-draft error:", (e as Error).message);
    return json({ error: "Draft generation failed" }, 500);
  }
});
