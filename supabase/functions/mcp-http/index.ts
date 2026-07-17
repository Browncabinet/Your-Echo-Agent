// Streamable HTTP MCP server for Echo Agent — hosted endpoint for Smithery & remote MCP clients.
import { Hono } from "npm:hono@4";
import { McpServer, StreamableHttpTransport } from "npm:mcp-lite@^0.10.0";
import { z } from "npm:zod@3";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-echo-api-key, mcp-session-id",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Expose-Headers": "mcp-session-id",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const A2A_BASE = `${SUPABASE_URL}/functions/v1`;

function extractApiKey(req: Request): string | null {
  const url = new URL(req.url);
  const qp =
    url.searchParams.get("apiKey") ||
    url.searchParams.get("echoApiKey") ||
    url.searchParams.get("ECHO_API_KEY");
  if (qp) return qp;
  const header = req.headers.get("x-echo-api-key") || req.headers.get("x-api-key");
  if (header) return header;
  const auth = req.headers.get("authorization") || "";
  const m = auth.match(/^Bearer\s+(eak_[A-Za-z0-9_-]+)$/i);
  return m ? m[1] : null;
}

async function callA2A(
  fn: string,
  init: { method: "GET" | "POST"; apiKey?: string | null; body?: unknown; query?: Record<string, string | undefined> },
): Promise<unknown> {
  const u = new URL(`${A2A_BASE}/${fn}`);
  if (init.query) {
    for (const [k, v] of Object.entries(init.query)) {
      if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, String(v));
    }
  }
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (init.apiKey) headers["Authorization"] = `Bearer ${init.apiKey}`;
  const res = await fetch(u.toString(), {
    method: init.method,
    headers,
    body: init.method === "POST" ? JSON.stringify(init.body ?? {}) : undefined,
  });
  const text = await res.text();
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { parsed = text; }
  if (!res.ok) {
    const msg = typeof parsed === "object" && parsed && "error" in (parsed as any) ? (parsed as any).error : `HTTP ${res.status}`;
    throw new Error(`${fn} failed: ${msg}`);
  }
  return parsed;
}

const BRAND_FOOTER =
  "\n\n— Powered by Your Echo Agent (event discovery + AI outreach). Upgrade for unlimited runs, contact extraction, and one-click campaigns: https://yourechoagent.com/for-agents/register";

function asText(result: unknown, opts?: { demo?: boolean; cta?: string }) {
  const payload = typeof result === "string" ? result : JSON.stringify(result, null, 2);
  const cta = opts?.cta ?? BRAND_FOOTER;
  return { content: [{ type: "text" as const, text: payload + cta }] };
}

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";
const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY") ?? "";

async function firecrawlSearch(query: string, limit = 5): Promise<Array<{ title: string; url: string; description?: string }>> {
  if (!FIRECRAWL_API_KEY) return [];
  try {
    const r = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${FIRECRAWL_API_KEY}` },
      body: JSON.stringify({ query, limit }),
    });
    const j = await r.json().catch(() => ({}));
    const data = Array.isArray(j?.data) ? j.data : [];
    return data.slice(0, limit).map((d: any) => ({ title: d.title ?? d.url, url: d.url, description: d.description }));
  } catch { return []; }
}

async function aiGenerate(system: string, user: string): Promise<string> {
  if (!LOVABLE_API_KEY) return "(AI generation unavailable — configure Your Echo Agent for full output: https://yourechoagent.com/for-agents/register)";
  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    const j = await r.json().catch(() => ({}));
    return j?.choices?.[0]?.message?.content ?? "(no output)";
  } catch (e) { return `(AI error: ${(e as Error).message})`; }
}

function buildServer(apiKey: string | null) {
  const mcp = new McpServer({ name: "yourechoagent-mcp", version: "0.4.0" });

  const needKey = () => {
    if (!apiKey) {
      throw new Error("Missing ECHO_API_KEY. Get one at https://yourechoagent.com/for-agents/register and configure it in your MCP client.");
    }
    return apiKey;
  };

  mcp.tool("list_available_agents", {
    title: "List Available Echo Agents",
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    description: "Browse Echo Agents available for hire. Optional filter by niche (saas, agency, ecom, founders, local, pr) or capability (email_outreach, lead_research, linkedin_assist).",
    inputSchema: {
      type: "object",
      properties: {
        niche: { type: "string", description: "Filter by niche substring." },
        capability: { type: "string", description: "Filter by capability." },
      },
    },
    handler: async (args: any) => {
      const parsed = z.object({ niche: z.string().optional(), capability: z.string().optional() }).parse(args ?? {});
      return asText(await callA2A("a2a-agents-list", {
        method: "GET",
        query: { niche: parsed.niche, capability: parsed.capability },
      }));
    },
  });

  mcp.tool("get_agent_card", {
    title: "Get Echo Agent Card",
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    description: "Retrieve the full A2A agent card for one Echo Agent (skills, pricing, modes, examples).",
    inputSchema: {
      type: "object",
      required: ["agent_id"],
      properties: { agent_id: { type: "string", description: "e.g. 'saas-prospector'" } },
    },
    handler: async (args: any) => {
      const parsed = z.object({ agent_id: z.string().min(1) }).parse(args ?? {});
      return asText(await callA2A("a2a-agent-get", { method: "GET", query: { agent_id: parsed.agent_id } }));
    },
  });

  mcp.tool("hire_echo_agent", {
    title: "Hire Echo Agent",
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    description: "Hire an Echo Agent to run an outreach campaign. Returns a job_id you can poll with get_job_status. Requires ECHO_API_KEY.",
    inputSchema: {
      type: "object",
      required: ["agent_id", "campaign", "sender_identity"],
      properties: {
        agent_id: { type: "string" },
        campaign: {
          type: "object",
          required: ["goal", "target_audience", "volume"],
          properties: {
            name: { type: "string" },
            goal: { type: "string" },
            target_audience: { oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }] },
            niche: { type: "string" },
            volume: { type: "integer", minimum: 1, maximum: 1000 },
            website_url: { type: "string" },
          },
        },
        sender_identity: {
          type: "object",
          required: ["name", "email"],
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            company: { type: "string" },
            scheduling_link: { type: "string" },
          },
        },
        spending_cap_cents: { type: "integer" },
        callback_url: { type: "string" },
      },
    },
    handler: async (args: any) => {
      const key = needKey();
      const parsed = z.object({
        agent_id: z.string().min(1),
        campaign: z.object({
          name: z.string().optional(),
          goal: z.string().min(1),
          target_audience: z.union([z.string(), z.array(z.string())]),
          niche: z.string().optional(),
          volume: z.number().int().min(1).max(1000),
          website_url: z.string().optional(),
        }),
        sender_identity: z.object({
          name: z.string().min(1),
          email: z.string().email(),
          company: z.string().optional(),
          scheduling_link: z.string().optional(),
        }),
        spending_cap_cents: z.number().int().positive().optional(),
        callback_url: z.string().url().optional(),
      }).parse(args ?? {});
      return asText(await callA2A("a2a-agent-hire", { method: "POST", apiKey: key, body: parsed }));
    },
  });

  mcp.tool("get_job_status", {
    description: "Poll a hired job. Returns status, progress, leads, emails sent, replies, and spend.",
    inputSchema: {
      type: "object",
      required: ["job_id"],
      properties: { job_id: { type: "string" } },
    },
    handler: async (args: any) => {
      const key = needKey();
      const parsed = z.object({ job_id: z.string().min(1) }).parse(args ?? {});
      return asText(await callA2A("a2a-job-get", { method: "GET", apiKey: key, query: { job_id: parsed.job_id } }));
    },
  });

  mcp.tool("control_job", {
    description: "Pause, resume, or cancel a running job.",
    inputSchema: {
      type: "object",
      required: ["job_id", "action"],
      properties: {
        job_id: { type: "string" },
        action: { type: "string", enum: ["pause", "resume", "cancel"] },
      },
    },
    handler: async (args: any) => {
      const key = needKey();
      const parsed = z.object({
        job_id: z.string().min(1),
        action: z.enum(["pause", "resume", "cancel"]),
      }).parse(args ?? {});
      return asText(await callA2A("a2a-job-control", { method: "POST", apiKey: key, body: parsed }));
    },
  });

  mcp.tool("rate_job", {
    description: "Submit a 1–5 star rating for a completed job, with optional written feedback.",
    inputSchema: {
      type: "object",
      required: ["job_id", "stars"],
      properties: {
        job_id: { type: "string" },
        stars: { type: "integer", minimum: 1, maximum: 5 },
        feedback: { type: "string" },
      },
    },
    handler: async (args: any) => {
      const key = needKey();
      const parsed = z.object({
        job_id: z.string().min(1),
        stars: z.number().int().min(1).max(5),
        feedback: z.string().optional(),
      }).parse(args ?? {});
      return asText(await callA2A("a2a-job-rate", { method: "POST", apiKey: key, body: parsed }));
    },
  });

  // ── Event & community discovery tools (demo-tier: no API key required) ──────

  mcp.tool("discover_events", {
    description:
      "Discover live conferences, webinars, meetups, and podcasts in a niche so an agent can target where its audience actually gathers. DEMO MODE: works without an API key (returns up to 5 results). For unlimited runs, fit-scoring, contact extraction, and one-click outreach, register at https://yourechoagent.com/for-agents/register.",
    inputSchema: {
      type: "object",
      required: ["niche"],
      properties: {
        niche: { type: "string", description: "Niche / industry, e.g. 'fintech founders', 'AI agents', 'climate SaaS'." },
        kind: { type: "string", enum: ["conference", "webinar", "group", "podcast", "any"], description: "Type of community to discover. Defaults to 'any'." },
        limit: { type: "integer", minimum: 1, maximum: 10, default: 5 },
      },
    },
    handler: async (args: any) => {
      const parsed = z.object({
        niche: z.string().min(1),
        kind: z.enum(["conference", "webinar", "group", "podcast", "any"]).optional(),
        limit: z.number().int().min(1).max(10).optional(),
      }).parse(args ?? {});
      const kind = parsed.kind ?? "any";
      const hint =
        kind === "conference" ? "site:lu.ma OR site:eventbrite.com conference 2026" :
        kind === "webinar" ? "site:lu.ma OR site:zoom.us webinar 2026" :
        kind === "group" ? "site:meetup.com OR slack community OR discord community" :
        kind === "podcast" ? "site:listennotes.com OR site:open.spotify.com/show podcast" :
        "conference OR webinar OR meetup OR podcast";
      const limit = parsed.limit ?? 5;
      const results = await firecrawlSearch(`${parsed.niche} ${hint}`, limit);
      return asText({
        niche: parsed.niche,
        kind,
        count: results.length,
        results,
        upgrade:
          "Hire Echo Agent for AI fit-scoring, contact extraction, calendar add, and 1-click outreach: https://yourechoagent.com/for-agents/register",
      });
    },
  });

  mcp.tool("draft_outreach_for_event", {
    description:
      "Generate a short, personalized cold email referencing a specific event/community (e.g. 'I saw you're speaking at SaaStr…'). Returns subject + body. Public demo — for sending, deliverability, and reply triage, use Your Echo Agent: https://yourechoagent.com/for-agents/register.",
    inputSchema: {
      type: "object",
      required: ["event_name", "recipient_role", "sender_pitch"],
      properties: {
        event_name: { type: "string" },
        event_url: { type: "string" },
        recipient_name: { type: "string" },
        recipient_role: { type: "string", description: "e.g. 'Head of Growth at a Series A SaaS'." },
        sender_pitch: { type: "string", description: "What you offer and why it matters." },
        tone: { type: "string", enum: ["friendly", "professional", "concise"], description: "Default: concise." },
      },
    },
    handler: async (args: any) => {
      const p = z.object({
        event_name: z.string().min(1),
        event_url: z.string().optional(),
        recipient_name: z.string().optional(),
        recipient_role: z.string().min(1),
        sender_pitch: z.string().min(1),
        tone: z.enum(["friendly", "professional", "concise"]).optional(),
      }).parse(args ?? {});
      const sys = "You write short, high-reply cold emails (under 90 words) that reference a specific event. Output JSON: {\"subject\":\"...\",\"body\":\"...\"}. No fluff, one clear CTA.";
      const usr = `Event: ${p.event_name}${p.event_url ? ` (${p.event_url})` : ""}
Recipient: ${p.recipient_name ?? "there"} — ${p.recipient_role}
My pitch: ${p.sender_pitch}
Tone: ${p.tone ?? "concise"}`;
      const out = await aiGenerate(sys, usr);
      return asText({ draft: out, tip: "Use Echo Agent to A/B test, send, track opens/replies, and auto-handle responses: https://yourechoagent.com/for-agents/register" });
    },
  });

  mcp.tool("generate_comment_for_community", {
    description:
      "Draft a value-first comment to post in a community/group/podcast thread (LinkedIn, Reddit, Slack, etc.) to build relationships before outreach. Returns 2 short variants. Public demo.",
    inputSchema: {
      type: "object",
      required: ["context"],
      properties: {
        context: { type: "string", description: "The post/thread/episode summary or quote you're commenting on." },
        angle: { type: "string", description: "Optional angle, e.g. 'agree and extend', 'gentle pushback', 'share a relevant stat'." },
        sender_role: { type: "string", description: "Your role/expertise for credibility." },
      },
    },
    handler: async (args: any) => {
      const p = z.object({
        context: z.string().min(1),
        angle: z.string().optional(),
        sender_role: z.string().optional(),
      }).parse(args ?? {});
      const sys = "Write 2 short community comments (each under 60 words) that add value, no self-promotion, no emojis. Output a JSON array of 2 strings.";
      const usr = `Thread/post:\n${p.context}\n\nAngle: ${p.angle ?? "agree and extend"}\nMy role: ${p.sender_role ?? "practitioner"}`;
      const out = await aiGenerate(sys, usr);
      return asText({ variants: out, tip: "Echo Agent tracks which comments lead to replies and meetings: https://yourechoagent.com/for-agents/register" });
    },
  });

  mcp.tool("add_to_radar", {
    description:
      "Save a discovered event/community to the user's Radar in Your Echo Agent for one-click calendar add, contact extraction, and AI-drafted outreach. Requires ECHO_API_KEY (free tier: 50 emails). Register: https://yourechoagent.com/for-agents/register.",
    inputSchema: {
      type: "object",
      required: ["title", "url"],
      properties: {
        title: { type: "string" },
        url: { type: "string" },
        kind: { type: "string", enum: ["conference", "webinar", "group", "podcast"] },
        niche: { type: "string" },
        notes: { type: "string" },
      },
    },
    handler: async (args: any) => {
      const p = z.object({
        title: z.string().min(1),
        url: z.string().url(),
        kind: z.enum(["conference", "webinar", "group", "podcast"]).optional(),
        niche: z.string().optional(),
        notes: z.string().optional(),
      }).parse(args ?? {});
      if (!apiKey) {
        return asText({
          saved: false,
          message: "Sign up free to save to your Radar (50 free emails included): https://yourechoagent.com/for-agents/register",
          item: p,
        });
      }
      try {
        const r = await callA2A("a2a-agent-hire", { method: "POST", apiKey, body: { action: "radar_add", item: p } });
        return asText({ saved: true, item: p, result: r });
      } catch (e) {
        return asText({ saved: false, message: (e as Error).message, manual_save_url: `https://yourechoagent.com/for-agents/radar?add=${encodeURIComponent(p.url)}` });
      }
    },
  });

  // ── Category-scoped discovery + LinkedIn groups + structured contacts (v0.3.0) ──

  const CATEGORY_HINTS: Record<string, string> = {
    conference: "site:lu.ma OR site:eventbrite.com OR site:sessionize.com conference 2026",
    webinar: "site:lu.ma OR site:zoom.us OR site:hopin.com webinar 2026",
    meetup: "site:meetup.com",
    networking_event: "networking event site:lu.ma OR site:eventbrite.com OR site:meetup.com",
    linkedin_group: "site:linkedin.com/groups",
    facebook_group: "site:facebook.com/groups",
    slack_community: "slack community invite",
    discord_server: "discord community invite",
    subreddit: "site:reddit.com/r",
    professional_association: "professional association OR trade organization",
    podcast: "site:podchaser.com OR site:listennotes.com OR site:open.spotify.com/show podcast",
    newsletter: "newsletter substack OR beehiiv",
    any: "conference OR webinar OR meetup OR community OR association OR podcast",
  };

  async function firecrawlScrape(url: string): Promise<string> {
    if (!FIRECRAWL_API_KEY) return "";
    try {
      const r = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${FIRECRAWL_API_KEY}` },
        body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
      });
      const j = await r.json().catch(() => ({}));
      return j?.data?.markdown || j?.markdown || "";
    } catch { return ""; }
  }

  async function extractContactsFromMarkdown(md: string, sourceUrl: string) {
    if (!md) return [];
    const sys = "Extract real contacts (organizers, speakers, hosts, admins). Return ONLY JSON: {\"contacts\":[{\"name\":\"...\",\"title\":\"...\",\"company\":\"...\",\"email\":\"...\",\"location\":\"...\",\"linkedin_url\":\"...\",\"twitter_url\":\"...\",\"confidence\":0-1}]}. Omit fields you cannot verify from the page. Skip generic 'info@' unless it's the only signal. Max 10.";
    const raw = await aiGenerate(sys, `Source: ${sourceUrl}\n\nPage (truncated):\n${md.slice(0, 10000)}`);
    try {
      const cleaned = raw.replace(/```json\n?|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      const arr = Array.isArray(parsed.contacts) ? parsed.contacts : [];
      return arr.slice(0, 10).map((c: any) => ({ ...c, source_url: sourceUrl }));
    } catch { return []; }
  }

  mcp.tool("discover_communities", {
    description:
      "Find where your audience gathers — filtered by category (conference, webinar, meetup, networking_event, linkedin_group, facebook_group, slack_community, discord_server, subreddit, professional_association, podcast, newsletter). Returns ranked results with url and description. Public demo, no API key required.",
    inputSchema: {
      type: "object",
      required: ["niche", "category"],
      properties: {
        niche: { type: "string", description: "Industry / audience, e.g. 'fintech founders', 'AI agents'." },
        category: {
          type: "string",
          enum: ["conference", "webinar", "meetup", "networking_event", "linkedin_group", "facebook_group", "slack_community", "discord_server", "subreddit", "professional_association", "podcast", "newsletter", "any"],
        },
        location: { type: "string", description: "Optional city/region or 'remote'." },
        limit: { type: "integer", minimum: 1, maximum: 10, default: 5 },
      },
    },
    handler: async (args: any) => {
      const p = z.object({
        niche: z.string().min(1),
        category: z.enum(["conference", "webinar", "meetup", "networking_event", "linkedin_group", "facebook_group", "slack_community", "discord_server", "subreddit", "professional_association", "podcast", "newsletter", "any"]),
        location: z.string().optional(),
        limit: z.number().int().min(1).max(10).optional(),
      }).parse(args ?? {});
      const q = `${p.niche} ${CATEGORY_HINTS[p.category]}${p.location ? ` ${p.location}` : ""}`.trim();
      const results = await firecrawlSearch(q, p.limit ?? 5);
      return asText({
        niche: p.niche,
        category: p.category,
        location: p.location ?? null,
        count: results.length,
        results,
        next_steps: [
          "Call extract_contacts_from_url on any result to get name/title/company/email/location.",
          "Call build_contact_list to run discovery + extraction in one shot.",
          "Call add_to_radar to save the best fits (needs ECHO_API_KEY).",
        ],
      });
    },
  });

  mcp.tool("find_linkedin_groups", {
    description:
      "Discover the most active LinkedIn Groups and professional associations for a niche. Returns group name, url, focus, and why it fits — assist-only (you review + join manually; LinkedIn TOS forbids automation). Public demo.",
    inputSchema: {
      type: "object",
      required: ["niche"],
      properties: {
        niche: { type: "string" },
        seniority: { type: "string", description: "Optional seniority e.g. 'founder', 'director', 'VP+'." },
        region: { type: "string", description: "Optional region e.g. 'North America', 'EMEA'." },
        limit: { type: "integer", minimum: 1, maximum: 10, default: 6 },
      },
    },
    handler: async (args: any) => {
      const p = z.object({
        niche: z.string().min(1),
        seniority: z.string().optional(),
        region: z.string().optional(),
        limit: z.number().int().min(1).max(10).optional(),
      }).parse(args ?? {});
      const raw = await firecrawlSearch(
        `site:linkedin.com/groups ${p.niche}${p.seniority ? ` ${p.seniority}` : ""}${p.region ? ` ${p.region}` : ""}`,
        (p.limit ?? 6) + 4,
      );
      const associations = await firecrawlSearch(`professional association ${p.niche}${p.region ? ` ${p.region}` : ""}`, 4);
      const context = [...raw, ...associations].slice(0, 20)
        .map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${r.description ?? ""}`).join("\n\n");
      const sys = "You are an outreach strategist. Return ONLY JSON: {\"groups\":[{\"name\":\"...\",\"url\":\"...\",\"type\":\"linkedin_group|association\",\"focus\":\"...\",\"why_fit\":\"...\",\"activity_signal\":\"high|medium|low\",\"first_action\":\"one concrete engagement tip\"}]}. Prefer decision-maker-dense, high-activity groups. Skip listicles.";
      const out = await aiGenerate(sys, `Niche: ${p.niche}\nSeniority: ${p.seniority ?? "any"}\nRegion: ${p.region ?? "any"}\n\nResults:\n${context}`);
      let parsed: any = { groups: [] };
      try { parsed = JSON.parse(out.replace(/```json\n?|```/g, "").trim()); } catch { /* keep empty */ }
      const groups = Array.isArray(parsed.groups) ? parsed.groups.slice(0, p.limit ?? 6) : [];
      return asText({
        niche: p.niche,
        count: groups.length,
        groups,
        assist_only_notice: "Assist-only. Open each group in a browser and join manually — LinkedIn automation violates TOS.",
        upgrade: "Full LinkedIn Activity queue (AI comments + connection notes + follow-ups) at https://yourechoagent.com/for-agents/register",
      });
    },
  });

  mcp.tool("extract_contacts_from_url", {
    description:
      "Scrape any public event/community/organization page and extract structured contacts: name, title, company, email, location, linkedin_url, twitter_url, confidence. Public demo (uses Firecrawl + AI, no auth). For enrichment, verification, and one-click outreach use ECHO_API_KEY.",
    inputSchema: {
      type: "object",
      required: ["url"],
      properties: {
        url: { type: "string", description: "Any public URL (event page, org 'about us', speaker list, LinkedIn group description page, etc.)." },
      },
    },
    handler: async (args: any) => {
      const p = z.object({ url: z.string().url() }).parse(args ?? {});
      const md = await firecrawlScrape(p.url);
      if (!md) return asText({ url: p.url, error: "Could not scrape page (Firecrawl unavailable or page blocked).", contacts: [] });
      const contacts = await extractContactsFromMarkdown(md, p.url);
      return asText({
        url: p.url,
        count: contacts.length,
        contacts,
        upgrade: "Get email verification, seniority tagging, and 1-click outreach at https://yourechoagent.com/for-agents/register",
      });
    },
  });

  mcp.tool("build_contact_list", {
    description:
      "One-shot lead list: discovers communities in a niche+category, then extracts contacts from the top results and returns a deduped list with name, title, company, email, location, source_url. Public demo — limited to 3 sources per call. Use ECHO_API_KEY for larger runs and export.",
    inputSchema: {
      type: "object",
      required: ["niche", "category"],
      properties: {
        niche: { type: "string" },
        category: {
          type: "string",
          enum: ["conference", "webinar", "meetup", "networking_event", "professional_association", "podcast", "any"],
        },
        location: { type: "string" },
        sources: { type: "integer", minimum: 1, maximum: 3, default: 3, description: "How many discovered pages to scrape (demo cap: 3)." },
      },
    },
    handler: async (args: any) => {
      const p = z.object({
        niche: z.string().min(1),
        category: z.enum(["conference", "webinar", "meetup", "networking_event", "professional_association", "podcast", "any"]),
        location: z.string().optional(),
        sources: z.number().int().min(1).max(3).optional(),
      }).parse(args ?? {});
      const n = p.sources ?? 3;
      const q = `${p.niche} ${CATEGORY_HINTS[p.category] ?? CATEGORY_HINTS.any}${p.location ? ` ${p.location}` : ""}`.trim();
      const discovered = await firecrawlSearch(q, n);
      const perSource = await Promise.all(discovered.map(async (r) => {
        const md = await firecrawlScrape(r.url);
        const contacts = await extractContactsFromMarkdown(md, r.url);
        return { source: r, contacts };
      }));
      const seen = new Set<string>();
      const merged: any[] = [];
      for (const { contacts } of perSource) {
        for (const c of contacts) {
          const k = (c.email || c.linkedin_url || `${c.name}|${c.company}`).toLowerCase();
          if (!k || seen.has(k)) continue;
          seen.add(k);
          merged.push(c);
        }
      }
      return asText({
        niche: p.niche,
        category: p.category,
        sources_scraped: perSource.map((s) => s.source.url),
        contact_count: merged.length,
        contacts: merged,
        upgrade: "Unlimited sources, CSV export, and inbox-ready sequences at https://yourechoagent.com/for-agents/register",
      });
    },
  });

  // ── v0.4.0: Personalized PR outreach loop (draft + queue for review + one-shot) ──

  const senderSchema = z.object({
    name: z.string().min(1),
    company: z.string().optional(),
    one_line_pitch: z.string().min(1),
    services_short: z.string().min(1),
    meeting_options: z.array(z.enum(["phone", "in_person", "online"])).optional(),
    scheduling_link: z.string().url().optional(),
    reply_email: z.string().email(),
  });

  mcp.tool("draft_pr_outreach_for_contacts", {
    description:
      "Draft personalized PR outreach emails per contact, grouped by source (event / conference / LinkedIn group / association / org). Each draft includes a personalized hook, one-line pitch, why-you reason, a 15-min meeting ask (phone/online/in-person as configured), and a reply-by-email CTA. Public demo — no API key needed. Returns groups + total_drafts + a 'needs_manual_review' bucket for low-confidence / generic mailboxes.",
    inputSchema: {
      type: "object",
      required: ["contacts", "sender"],
      properties: {
        contacts: {
          type: "array",
          description: "From build_contact_list or user-supplied. Include name, title, company, email, location, source_title, source_url, category, confidence.",
          items: {
            type: "object",
            required: ["email"],
            properties: {
              name: { type: "string" },
              title: { type: "string" },
              company: { type: "string" },
              email: { type: "string" },
              location: { type: "string" },
              source_title: { type: "string" },
              source_url: { type: "string" },
              category: { type: "string" },
              confidence: { type: "number" },
            },
          },
        },
        sender: {
          type: "object",
          required: ["name", "one_line_pitch", "services_short", "reply_email"],
          properties: {
            name: { type: "string" },
            company: { type: "string" },
            one_line_pitch: { type: "string", description: "e.g. 'Agent observability for AI-native teams'." },
            services_short: { type: "string", description: "1–2 sentences describing what you offer." },
            meeting_options: { type: "array", items: { type: "string", enum: ["phone", "in_person", "online"] } },
            scheduling_link: { type: "string" },
            reply_email: { type: "string", description: "Where replies should land." },
          },
        },
        tone: { type: "string", enum: ["friendly", "professional", "concise"], default: "professional" },
      },
    },
    handler: async (args: any) => {
      const p = z.object({
        contacts: z.array(z.any()).min(1).max(20),
        sender: senderSchema,
        tone: z.enum(["friendly", "professional", "concise"]).optional(),
      }).parse(args ?? {});
      const r = await fetch(`${A2A_BASE}/pr-outreach-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || `pr-outreach-draft failed (${r.status})`);
      return asText({
        ...data,
        tip: "Send them: call queue_pr_outreach_job with these `groups` (needs ECHO_API_KEY). Register: https://yourechoagent.com/for-agents/register",
      });
    },
  });

  mcp.tool("queue_pr_outreach_job", {
    description:
      "Save a set of PR outreach drafts (from draft_pr_outreach_for_contacts) as a job for review + send. Returns job_id + a dashboard URL where the user approves and sends. Every send uses the verified sender identity, respects weekly caps, honors the suppression list, and routes replies back to reply_email. Requires ECHO_API_KEY.",
    inputSchema: {
      type: "object",
      required: ["sender_identity", "groups"],
      properties: {
        sender_identity: {
          type: "object",
          required: ["name", "email"],
          properties: {
            name: { type: "string" },
            email: { type: "string", description: "Verified sender email (also used as Reply-To)." },
            company: { type: "string" },
            scheduling_link: { type: "string" },
          },
        },
        groups: {
          type: "array",
          description: "The `groups` array returned by draft_pr_outreach_for_contacts.",
          items: { type: "object" },
        },
        niche: { type: "string" },
        category: { type: "string" },
        spending_cap_cents: { type: "integer" },
        notes: { type: "string" },
      },
    },
    handler: async (args: any) => {
      const key = needKey();
      const p = z.object({
        sender_identity: z.object({
          name: z.string().min(1),
          email: z.string().email(),
          company: z.string().optional(),
          scheduling_link: z.string().url().optional(),
        }),
        groups: z.array(z.any()).min(1),
        niche: z.string().optional(),
        category: z.string().optional(),
        spending_cap_cents: z.number().int().positive().optional(),
        notes: z.string().optional(),
      }).parse(args ?? {});
      return asText(await callA2A("pr-outreach-create-job", { method: "POST", apiKey: key, body: p }));
    },
  });

  mcp.tool("find_and_pitch", {
    description:
      "One-shot personalized PR outreach: discover communities in a niche+category, extract contacts, draft a personalized email per contact (with meeting ask + reply CTA), grouped by source. If ECHO_API_KEY is present, also queues the job for review + send. Public demo returns drafts only. Perfect for 'find AI-agent conferences and draft a personalized pitch to each organizer from Alex at Lensora'.",
    inputSchema: {
      type: "object",
      required: ["niche", "category", "sender"],
      properties: {
        niche: { type: "string" },
        category: {
          type: "string",
          enum: ["conference", "webinar", "meetup", "networking_event", "professional_association", "podcast", "any"],
        },
        location: { type: "string" },
        sources: { type: "integer", minimum: 1, maximum: 3, default: 3 },
        sender: {
          type: "object",
          required: ["name", "one_line_pitch", "services_short", "reply_email"],
          properties: {
            name: { type: "string" },
            company: { type: "string" },
            one_line_pitch: { type: "string" },
            services_short: { type: "string" },
            meeting_options: { type: "array", items: { type: "string", enum: ["phone", "in_person", "online"] } },
            scheduling_link: { type: "string" },
            reply_email: { type: "string" },
          },
        },
        queue: { type: "boolean", description: "If true and ECHO_API_KEY is set, saves the job for review + send. Default false (drafts only)." },
      },
    },
    handler: async (args: any) => {
      const p = z.object({
        niche: z.string().min(1),
        category: z.enum(["conference", "webinar", "meetup", "networking_event", "professional_association", "podcast", "any"]),
        location: z.string().optional(),
        sources: z.number().int().min(1).max(3).optional(),
        sender: senderSchema,
        queue: z.boolean().optional(),
      }).parse(args ?? {});

      // 1. discover
      const q = `${p.niche} ${CATEGORY_HINTS[p.category] ?? CATEGORY_HINTS.any}${p.location ? ` ${p.location}` : ""}`.trim();
      const discovered = await firecrawlSearch(q, p.sources ?? 3);

      // 2. extract contacts per source
      const contactsPerSource = await Promise.all(discovered.map(async (r) => {
        const md = await firecrawlScrape(r.url);
        const contacts = await extractContactsFromMarkdown(md, r.url);
        return contacts.map((c: any) => ({
          ...c,
          source_title: r.title,
          source_url: r.url,
          category: p.category,
        }));
      }));
      const allContacts = contactsPerSource.flat();
      if (allContacts.length === 0) {
        return asText({
          niche: p.niche,
          category: p.category,
          sources: discovered.map((d) => d.url),
          message: "No contacts extracted from top results. Try a different niche/category or narrow the location.",
          groups: [],
        });
      }

      // 3. draft
      const draftRes = await fetch(`${A2A_BASE}/pr-outreach-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: allContacts, sender: p.sender, tone: "professional" }),
      });
      const draftData = await draftRes.json().catch(() => ({}));
      if (!draftRes.ok) throw new Error(draftData?.error || "draft failed");

      // 4. optionally queue
      let queued: any = null;
      if (p.queue && apiKey) {
        try {
          queued = await callA2A("pr-outreach-create-job", {
            method: "POST",
            apiKey,
            body: {
              sender_identity: { name: p.sender.name, email: p.sender.reply_email, company: p.sender.company, scheduling_link: p.sender.scheduling_link },
              groups: draftData.groups ?? [],
              niche: p.niche,
              category: p.category,
            },
          });
        } catch (e) {
          queued = { error: (e as Error).message };
        }
      }

      return asText({
        niche: p.niche,
        category: p.category,
        location: p.location ?? null,
        sources_scraped: discovered.map((d) => d.url),
        contacts_found: allContacts.length,
        total_drafts: draftData.total_drafts ?? 0,
        groups: draftData.groups ?? [],
        needs_manual_review: draftData.needs_manual_review ?? [],
        queued,
        tip: queued
          ? "Job saved. Approve & send from your Echo Agent dashboard."
          : (apiKey
            ? "Drafts ready. Call again with queue=true to save for review + send."
            : "Drafts ready. Get an ECHO_API_KEY at https://yourechoagent.com/for-agents/register to save + send."),
      });
    },
  });

  return mcp;
}


const app = new Hono();

// In-memory per-IP token bucket for unauthenticated demo-tier calls.
// Authenticated (eak_) calls skip this and use the per-key DB rate limit
// (a2a_bump_rate) applied inside the individual A2A endpoints they invoke.
// Buckets survive as long as the edge instance does; short outages just
// reset counters — that's fine for a demo tier.
const DEMO_RATE_LIMIT = Number(Deno.env.get("MCP_DEMO_RATE_LIMIT") ?? 15); // req / window
const DEMO_RATE_WINDOW_MS = 60_000; // 1 minute
const ipBuckets = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for") || "";
  const first = xf.split(",")[0]?.trim();
  return first || req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown";
}

function checkDemoRateLimit(ip: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const b = ipBuckets.get(ip);
  if (!b || b.resetAt <= now) {
    ipBuckets.set(ip, { count: 1, resetAt: now + DEMO_RATE_WINDOW_MS });
    // Opportunistic GC — cap map size.
    if (ipBuckets.size > 5000) {
      for (const [k, v] of ipBuckets) if (v.resetAt <= now) ipBuckets.delete(k);
    }
    return { ok: true };
  }
  if (b.count >= DEMO_RATE_LIMIT) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { ok: true };
}

app.options("/*", () => new Response(null, { headers: corsHeaders }));

app.all("/*", async (c) => {
  const apiKey = extractApiKey(c.req.raw);

  // Rate-limit demo-tier (no API key) callers per-IP. Authenticated callers
  // pass through — their per-key limit is enforced further downstream.
  if (!apiKey) {
    const ip = clientIp(c.req.raw);
    const check = checkDemoRateLimit(ip);
    if (!check.ok) {
      return new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32029,
            message: `Rate limit exceeded on the demo tier (${DEMO_RATE_LIMIT} requests / minute). Retry in ${check.retryAfter}s, or get a free ECHO_API_KEY at https://yourechoagent.com/for-agents/dashboard for higher limits (50 free emails on signup).`,
            data: { retry_after_seconds: check.retryAfter, upgrade_url: "https://yourechoagent.com/for-agents/dashboard" },
          },
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(check.retryAfter),
          },
        },
      );
    }
  }

  const mcp = buildServer(apiKey);
  const transport = new StreamableHttpTransport();
  const handler = transport.bind(mcp);
  const res = await handler(c.req.raw);
  const merged = new Headers(res.headers);
  for (const [k, v] of Object.entries(corsHeaders)) merged.set(k, v);
  return new Response(res.body, { status: res.status, headers: merged });
});

Deno.serve(app.fetch);
