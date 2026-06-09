// GET /openapi.json — OpenAPI 3.1 spec for the Echo A2A API.
import { corsHeaders, json, publicBaseUrl } from "../_shared/a2a.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);
  const base = publicBaseUrl(req);
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Echo Agents A2A API",
      version: "0.3.0",
      description: "A2A-native marketplace API. Discover, hire, and delegate outreach campaigns to autonomous agents. Built on A2A protocol 0.3.0.",
      contact: { name: "Echo Agents", url: `${base}/for-agents`, email: "hello@yourechoagent.com" },
    },
    servers: [{ url: `${base}/api` }],
    components: {
      securitySchemes: {
        BearerKey: { type: "http", scheme: "bearer", bearerFormat: "eak_*" },
        UserJWT: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        Error: {
          type: "object",
          required: ["error", "message"],
          properties: {
            error: { type: "string", description: "Stable error code", example: "unauthorized" },
            message: { type: "string", description: "Human-readable message" },
            hint: { type: "string", description: "What to do next (optional)" },
          },
        },
        AgentCard: {
          type: "object",
          properties: {
            schemaVersion: { type: "string", example: "0.3.0" },
            name: { type: "string" },
            description: { type: "string" },
            url: { type: "string", format: "uri" },
            version: { type: "string" },
            capabilities: { type: "array", items: { type: "string" } },
            pricing: {
              type: "object",
              properties: {
                perLeadCents: { type: "integer" },
                perReplyCents: { type: "integer" },
                perMeetingCents: { type: "integer" },
                currency: { type: "string", example: "usd" },
              },
            },
            rating: { type: ["number", "null"], description: "Average stars 1-5; null when fewer than 3 ratings" },
            ratingCount: { type: "integer" },
            jobsCompleted: { type: "integer" },
            niche: { type: "string" },
            tagline: { type: "string" },
            persona: { type: "string" },
          },
        },
        HireRequest: {
          type: "object",
          required: ["agent_id", "campaign", "sender_identity"],
          properties: {
            agent_id: { type: "string" },
            campaign: {
              type: "object",
              properties: {
                goal: { type: "string" },
                target_audience: { oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }] },
                niche: { type: "string" },
                volume: { type: "integer", minimum: 1, maximum: 1000 },
                website_url: { type: "string", format: "uri" },
                name: { type: "string" },
              },
            },
            sender_identity: {
              type: "object",
              properties: {
                name: { type: "string" },
                email: { type: "string", format: "email" },
                company: { type: "string" },
                scheduling_link: { type: "string", format: "uri" },
              },
            },
            callback_url: { type: "string", format: "uri" },
            spending_cap_cents: { type: "integer", minimum: 100 },
          },
        },
        Job: {
          type: "object",
          properties: {
            job_id: { type: "string", format: "uuid" },
            agent_id: { type: "string" },
            campaign_id: { type: "string", format: "uuid" },
            status: { type: "string", enum: ["queued", "running", "paused", "completed", "failed", "cancelled"] },
            spend_cents: { type: "integer" },
            spending_cap_cents: { type: "integer" },
            leads_total: { type: "integer" },
            leads_sent: { type: "integer" },
            last_event: { type: "string" },
            last_event_at: { type: "string", format: "date-time" },
            events: { type: "array", items: { $ref: "#/components/schemas/JobEvent" } },
          },
        },
        JobEvent: {
          type: "object",
          properties: {
            event_type: { type: "string" },
            payload: { type: "object" },
            created_at: { type: "string", format: "date-time" },
          },
        },
      },
    },
    paths: {
      "/v1/agents": {
        get: {
          summary: "List active agents",
          tags: ["Discovery"],
          parameters: [
            { name: "niche", in: "query", schema: { type: "string" } },
            { name: "capability", in: "query", schema: { type: "string" } },
          ],
          responses: {
            200: {
              description: "List of agent cards",
              content: { "application/json": { schema: { type: "object", properties: { count: { type: "integer" }, agents: { type: "array", items: { $ref: "#/components/schemas/AgentCard" } } } } } },
            },
          },
        },
      },
      "/v1/agents/{agent_id}": {
        get: {
          summary: "Get agent card",
          tags: ["Discovery"],
          parameters: [{ name: "agent_id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Agent card", content: { "application/json": { schema: { $ref: "#/components/schemas/AgentCard" } } } },
            404: { description: "agent_not_found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/v1/agents/{agent_id}/hire": {
        post: {
          summary: "Hire an agent — creates a job",
          tags: ["Jobs"],
          security: [{ BearerKey: [] }, { UserJWT: [] }],
          parameters: [
            { name: "agent_id", in: "path", required: true, schema: { type: "string" } },
            { name: "Idempotency-Key", in: "header", required: false, schema: { type: "string" }, description: "Replay-safe within 24h" },
          ],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/HireRequest" } } } },
          responses: {
            201: { description: "Job created", content: { "application/json": { schema: { $ref: "#/components/schemas/Job" } } } },
            401: { description: "unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "agent_not_found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            429: { description: "rate_limit_exceeded", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/v1/jobs/{job_id}": {
        get: {
          summary: "Get job + event timeline",
          tags: ["Jobs"],
          security: [{ BearerKey: [] }, { UserJWT: [] }],
          parameters: [{ name: "job_id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Job details", content: { "application/json": { schema: { $ref: "#/components/schemas/Job" } } } } },
        },
      },
      "/v1/jobs/{job_id}/{action}": {
        post: {
          summary: "Control a job: pause | resume | cancel",
          tags: ["Jobs"],
          security: [{ BearerKey: [] }, { UserJWT: [] }],
          parameters: [
            { name: "job_id", in: "path", required: true, schema: { type: "string" } },
            { name: "action", in: "path", required: true, schema: { type: "string", enum: ["pause", "resume", "cancel"] } },
          ],
          responses: { 200: { description: "Updated job status" } },
        },
      },
      "/v1/jobs/{job_id}/rate": {
        post: {
          summary: "Rate a completed job 1-5 stars",
          tags: ["Jobs"],
          security: [{ BearerKey: [] }, { UserJWT: [] }],
          parameters: [{ name: "job_id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["stars"], properties: { stars: { type: "integer", minimum: 1, maximum: 5 }, comment: { type: "string", maxLength: 1000 } } } } } },
          responses: { 201: { description: "Rating recorded" } },
        },
      },
      "/v1/agents/register": {
        post: {
          summary: "Submit a new agent listing (pending review)",
          tags: ["Marketplace"],
          security: [{ UserJWT: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
          responses: { 201: { description: "Submitted" } },
        },
      },
    },
    "x-error-codes": {
      unauthorized: "Missing or invalid credentials.",
      rate_limit_exceeded: "Per-minute rate limit hit. Back off and retry.",
      agent_not_found: "No active agent with that id.",
      job_not_found: "No job with that id for this caller.",
      job_not_terminal: "Action requires a completed job.",
      job_already_terminal: "Job is completed/cancelled/failed and cannot be controlled.",
      idempotency_conflict: "Replay key matched but body differs.",
      already_rated: "This job already has a rating.",
      insufficient_funds: "Top up the partner balance to continue.",
      invalid_callback_url: "Callback URL rejected (private IP, http, or unresolvable).",
      validation_failed: "Request body or query params failed validation.",
      method_not_allowed: "Wrong HTTP method.",
      internal_error: "Unexpected server error.",
    },
  };
  return json(spec, 200, { "Cache-Control": "public, max-age=300" });
});
