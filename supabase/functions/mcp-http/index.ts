// Streamable HTTP MCP server for Echo Agent — hosted endpoint for Smithery & remote MCP clients.
// Mirrors the stdio mcp-server/ tools, but forwards to the existing a2a-* edge functions.
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

function asText(result: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
}

function buildServer(apiKey: string | null) {
  const mcp = new McpServer({
    name: "yourechoagent-mcp",
    version: "0.1.0",
    schemaAdapter: (schema) => z.toJSONSchema(schema as z.ZodType),
  });

  const needKey = () => {
    if (!apiKey) {
      throw new Error("Missing ECHO_API_KEY. Get one at https://yourechoagent.com/for-agents/register and configure it in your MCP client.");
    }
    return apiKey;
  };

  mcp.tool("list_available_agents", {
    description: "Browse Echo Agents available for hire. Optional filter by niche (saas, agency, ecom, founders, local, pr) or capability (email_outreach, lead_research, linkedin_assist).",
    inputSchema: z.object({
      niche: z.string().optional(),
      capability: z.string().optional(),
    }),
    handler: async (args) => asText(await callA2A("a2a-agents-list", {
      method: "GET",
      query: { niche: args?.niche, capability: args?.capability },
    })),
  });

  mcp.tool("get_agent_card", {
    description: "Retrieve the full A2A agent card for one Echo Agent (skills, pricing, modes, examples).",
    inputSchema: z.object({
      agent_id: z.string().min(1).describe("e.g. 'saas-prospector'"),
    }),
    handler: async (args) => asText(await callA2A("a2a-agent-get", {
      method: "GET",
      query: { agent_id: args.agent_id },
    })),
  });

  mcp.tool("hire_echo_agent", {
    description: "Hire an Echo Agent to run an outreach campaign. Returns a job_id you can poll with get_job_status. Requires ECHO_API_KEY config.",
    inputSchema: z.object({
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
    }),
    handler: async (args) => {
      const key = needKey();
      return asText(await callA2A("a2a-agent-hire", { method: "POST", apiKey: key, body: args }));
    },
  });

  mcp.tool("get_job_status", {
    description: "Poll a hired job. Returns status, progress, leads, emails sent, replies, and spend.",
    inputSchema: z.object({ job_id: z.string().min(1) }),
    handler: async (args) => {
      const key = needKey();
      return asText(await callA2A("a2a-job-get", { method: "GET", apiKey: key, query: { job_id: args.job_id } }));
    },
  });

  mcp.tool("control_job", {
    description: "Pause, resume, or cancel a running job.",
    inputSchema: z.object({
      job_id: z.string().min(1),
      action: z.enum(["pause", "resume", "cancel"]),
    }),
    handler: async (args) => {
      const key = needKey();
      return asText(await callA2A("a2a-job-control", { method: "POST", apiKey: key, body: args }));
    },
  });

  mcp.tool("rate_job", {
    description: "Submit a 1–5 star rating for a completed job, with optional written feedback.",
    inputSchema: z.object({
      job_id: z.string().min(1),
      stars: z.number().int().min(1).max(5),
      feedback: z.string().optional(),
    }),
    handler: async (args) => {
      const key = needKey();
      return asText(await callA2A("a2a-job-rate", { method: "POST", apiKey: key, body: args }));
    },
  });

  return mcp;
}

const app = new Hono();

app.options("/*", () => new Response(null, { headers: corsHeaders }));

app.all("/*", async (c) => {
  const apiKey = extractApiKey(c.req.raw);
  const mcp = buildServer(apiKey);
  const transport = new StreamableHttpTransport();
  const handler = transport.bind(mcp);
  const res = await handler(c.req.raw);
  const merged = new Headers(res.headers);
  for (const [k, v] of Object.entries(corsHeaders)) merged.set(k, v);
  return new Response(res.body, { status: res.status, headers: merged });
});

Deno.serve(app.fetch);
