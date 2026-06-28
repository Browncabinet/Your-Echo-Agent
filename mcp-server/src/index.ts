import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { EchoClient } from "./client.js";
import { callHostedTool } from "./client.js";

const apiKey = process.env.ECHO_API_KEY || "";
const apiBase = process.env.ECHO_API_BASE;

// Lazily construct so `--help`/`list_tools` introspection still works without a key.
let _client: EchoClient | null = null;
function client(): EchoClient {
  if (!_client) _client = new EchoClient(apiKey, apiBase);
  return _client;
}

const tools = [
  {
    name: "list_available_agents",
    description:
      "Browse Echo Agents available for hire. Returns each agent's id, name, description, pricing, and skills. Optionally filter by niche (e.g. 'saas', 'ecommerce') or capability (e.g. 'email_outreach', 'linkedin_assist').",
    inputSchema: {
      type: "object",
      properties: {
        niche: { type: "string", description: "Filter by niche substring (saas, agency, ecom, founders, local, pr)." },
        capability: { type: "string", description: "Filter by capability (email_outreach, lead_research, linkedin_assist)." },
      },
    },
    zod: z.object({ niche: z.string().optional(), capability: z.string().optional() }),
    run: async (a: any) => client().listAgents(a),
  },
  {
    name: "get_agent_card",
    description: "Retrieve the full A2A agent card for one Echo Agent (skills, pricing, modes, examples).",
    inputSchema: {
      type: "object",
      required: ["agent_id"],
      properties: { agent_id: { type: "string", description: "Agent id (e.g. 'saas-prospector')." } },
    },
    zod: z.object({ agent_id: z.string().min(1) }),
    run: async (a: any) => client().getAgent(a.agent_id),
  },
  {
    name: "hire_echo_agent",
    description:
      "Hire an Echo Agent to run an outreach campaign. The agent finds leads, writes personalized emails, and sends them. Returns a job_id you can poll with get_job_status.",
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
            goal: { type: "string", description: "What success looks like (e.g. 'Book discovery calls')." },
            target_audience: {
              oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
              description: "ICP description, e.g. 'Heads of Growth at Series A SaaS in fintech'.",
            },
            niche: { type: "string" },
            volume: { type: "integer", minimum: 1, maximum: 1000 },
            website_url: { type: "string", description: "Your website — used for context and selling points." },
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
        spending_cap_cents: { type: "integer", description: "Maximum spend in USD cents (defaults to partner cap)." },
        callback_url: { type: "string", description: "Optional webhook for job events (HMAC-SHA256 signed)." },
      },
    },
    zod: z.object({
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
    run: async (a: any) => client().hire(a),
  },
  {
    name: "get_job_status",
    description: "Poll a hired job. Returns status (queued/running/paused/completed/failed/canceled), progress, leads found, emails sent, replies, and spend.",
    inputSchema: {
      type: "object",
      required: ["job_id"],
      properties: { job_id: { type: "string" } },
    },
    zod: z.object({ job_id: z.string().min(1) }),
    run: async (a: any) => client().getJob(a.job_id),
  },
  {
    name: "control_job",
    description: "Pause, resume, or cancel a running job.",
    inputSchema: {
      type: "object",
      required: ["job_id", "action"],
      properties: {
        job_id: { type: "string" },
        action: { type: "string", enum: ["pause", "resume", "cancel"] },
      },
    },
    zod: z.object({ job_id: z.string().min(1), action: z.enum(["pause", "resume", "cancel"]) }),
    run: async (a: any) => client().controlJob(a.job_id, a.action),
  },
  {
    name: "rate_job",
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
    zod: z.object({ job_id: z.string().min(1), stars: z.number().int().min(1).max(5), feedback: z.string().optional() }),
    run: async (a: any) => client().rateJob(a.job_id, a.stars, a.feedback),
  },
];

const server = new Server(
  { name: "yourechoagent-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const tool = tools.find((t) => t.name === req.params.name);
  if (!tool) {
    return { isError: true, content: [{ type: "text", text: `Unknown tool: ${req.params.name}` }] };
  }
  try {
    const args = tool.zod.parse(req.params.arguments ?? {});
    const result = await tool.run(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (err: any) {
    return {
      isError: true,
      content: [{ type: "text", text: err?.message || String(err) }],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("yourechoagent-mcp v0.1.0 ready on stdio");
