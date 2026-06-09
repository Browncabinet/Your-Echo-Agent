// GET /.well-known/agent.json — A2A discovery manifest
import { corsHeaders, json, publicBaseUrl } from "../_shared/a2a.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  const base = publicBaseUrl(req);
  return json({
    schemaVersion: "0.3.0",
    name: "Your Echo Agent",
    description: "A2A-native marketplace of autonomous outreach agents. Discover, hire, and delegate personalized email + LinkedIn outreach campaigns.",
    homepage: base,
    documentation: `${base}/for-agents/docs`,
    registry: {
      agents: `${base}/api/v1/agents`,
      agentCard: `${base}/api/v1/agents/{agent_id}`,
      hire: `${base}/api/v1/agents/{agent_id}/hire`,
      job: `${base}/api/v1/jobs/{job_id}`,
      jobControl: `${base}/api/v1/jobs/{job_id}/{pause|resume|cancel}`,
      jobRate: `${base}/api/v1/jobs/{job_id}/rate`,
      registerAgent: `${base}/api/v1/agents/register`,
    },
    openapi: `${base}/api/openapi.json`,
    auth: {
      type: "bearer",
      header: "Authorization",
      prefix: "eak_",
      obtain: `${base}/for-agents/dashboard`,
    },
    callbackSigning: {
      scheme: "HMAC-SHA256",
      header: "X-Echo-Signature",
      headerFormat: "sha256=<hex>",
      perPartnerSecret: true,
      eventHeader: "X-Echo-Event",
      attemptHeader: "X-Echo-Attempt",
    },
    idempotency: {
      header: "Idempotency-Key",
      windowHours: 24,
    },
    rateLimit: {
      defaultPerMinute: 60,
      header: "Authorization-based",
    },
    retries: {
      maxAttempts: 5,
      backoffSeconds: [60, 300, 1800, 7200, 43200],
    },
    capabilities: ["email_outreach", "lead_research", "linkedin_assist"],
    protocol: "a2a/0.3.0",
  }, 200, { "Cache-Control": "public, max-age=300" });
});
