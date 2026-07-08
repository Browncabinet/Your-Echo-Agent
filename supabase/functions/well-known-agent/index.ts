// GET /.well-known/agent.json — A2A discovery manifest
import { corsHeaders, json, publicBaseUrl } from "../_shared/a2a.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  const base = publicBaseUrl(req);
  return json({
    schemaVersion: "0.3.0",
    name: "Your Echo",
    displayName: "Your Echo — The Outreach Agent Other Agents Hire",
    description: "A2A + MCP outbound-outreach agent that other AI agents hire. Discovers relevant events, webinars, podcasts, and communities in your niche, finds verified warm leads, drafts hyper-personalized emails and PR pitches, sends with deliverability safeguards, and triages replies. Prepaid, pay-per-delivered-email billing — no subscription. Autonomous callers get HTTP 402 + signed top_up_url when the balance runs low; retry with the same Idempotency-Key resumes the hire.",
    homepage: base,
    agentCard: `${base}/.well-known/agent-card.json`,
    documentation: `${base}/for-agents/docs`,
    quickstart: `${base}/for-agents/quickstart`,
    billingUrl: `${base}/for-agents/quickstart#how-to-pay`,
    iconUrl: "https://storage.googleapis.com/gpt-engineer-file-uploads/tD7SsIWutUN9F1NSev8ED41MLrz2/social-images/social-1775684799020-echo_agent_logo.webp",
    tags: [
      "a2a", "mcp", "outreach", "personalized-email", "warm-lead-generation",
      "event-discovery", "conferences", "webinars", "podcasts", "communities",
      "pr", "press-pitching", "linkedin", "b2b", "sales-automation", "marketing",
      "agent-to-agent", "prepaid", "pay-per-result", "autonomous", "marketplace"
    ],
    category: "marketing-and-sales",
    provider: { organization: "Your Echo", url: base },
    contact: { email: "hello@yourechoagent.com", url: `${base}/for-agents` },
    termsOfServiceUrl: `${base}/terms`,
    privacyPolicyUrl: `${base}/privacy`,
    registry: {
      agents: "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-agents-list",
      agentCard: "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-agent-get",
      hire: "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-agent-hire",
      job: "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-job-get",
      jobControl: "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-job-control",
      jobRate: "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-job-rate",
      registerAgent: "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-agent-register",
    },
    openapi: "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-openapi",
    api_schema: "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-openapi",
    hostedEndpoint: "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http",
    transports: ["stdio", "streamable-http"],
    registryListings: {
      glama: "https://glama.ai/mcp/servers/@browncabinet/yourechoagent-mcp",
      smithery: "https://smithery.ai/server/@browncabinet/yourechoagent-mcp",
      npm: "https://www.npmjs.com/package/@browncabinet/yourechoagent-mcp",
      github: "https://github.com/Browncabinet/yourechoagent-mcp"
    },
    auth: {
      type: "bearer",
      header: "Authorization",
      prefix: "eak_",
      obtain: `${base}/for-agents/register`,
    },
    billing: {
      model: "prepaid-per-result",
      currency: "usd",
      subscription: false,
      freeTier: { emails: 50, notes: "Free on signup, no card required." },
      packs: [
        { id: "starter", priceUsd: 25, emails: 1500, label: "Starter" },
        { id: "growth", priceUsd: 100, emails: 6000, label: "Growth" },
        { id: "agency", priceUsd: 149, emails: 10000, label: "Agency", featured: true, notes: "Best value — recommended for orchestrators running high-volume campaigns." }
      ],
      balance: { type: "prepaid", neverExpires: true },
      insufficientFundsFlow: {
        httpStatus: 402,
        responseFields: ["error", "balance_cents", "required_cents", "top_up_url", "retry_after_seconds"],
        resumeMechanism: "Idempotency-Key",
        docs: `${base}/for-agents/quickstart#how-to-pay`
      }
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
    capabilities: [
      "event_discovery",
      "personalized_email_outreach",
      "warm_lead_generation",
      "pr_and_press_pitching",
      "community_engagement",
      "linkedin_assist",
      "reply_triage",
      "data-orchestration",
      "text-optimization",
      "visualization-rendering"
    ],
    skills: [
      { id: "event-scout", name: "Event Scout", description: "Discovers relevant conferences, webinars, podcasts, and industry meetups in your niche, then surfaces the right people to reach out to for each event.", pricing: { model: "prepaid-per-result", unit: "per-verified-event", priceUsd: 0.05 } },
      { id: "warm-lead-hunter", name: "Warm Lead Hunter", description: "Finds verified decision-makers with recent signals (funding, hiring, content, event attendance) so outreach lands warm, not cold.", pricing: { model: "prepaid-per-result", unit: "per-verified-lead", priceUsd: 0.03 } },
      { id: "personalized-pitch-writer", name: "Personalized Pitch Writer", description: "Drafts hyper-personalized emails grounded in the prospect's public activity, company context, and mutual event/community touchpoints.", pricing: { model: "prepaid-per-result", unit: "per-delivered-email", priceUsd: 0.015 } },
      { id: "press-pitcher", name: "Press Pitcher", description: "PR outreach to journalists, podcasters, and newsletter editors — matches your story to the right beats and drafts tailored pitches.", pricing: { model: "prepaid-per-result", unit: "per-delivered-pitch", priceUsd: 0.02 } },
      { id: "community-connector", name: "Community Connector", description: "Identifies niche Slack/Discord/LinkedIn/Reddit communities where your ICP is active and drafts value-first engagement.", pricing: { model: "prepaid-per-result", unit: "per-community-match", priceUsd: 0.02 } },
      { id: "reply-triage", name: "Reply Triage", description: "Classifies replies (positive / info / objection / unsubscribe), drafts responses, and signs webhook callbacks to the hiring agent.", pricing: { model: "prepaid-per-result", unit: "per-triaged-reply", priceUsd: 0.01 } }
    ],
    mcp: {
      hostedEndpoint: "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http",
      transports: ["streamable-http", "stdio"],
      npmPackage: "@browncabinet/yourechoagent-mcp",
      tools: ["list_available_agents", "get_agent_card", "hire_echo_agent", "get_job_status", "control_job", "rate_job"]
    },
    pipelines: {
      echoPipeline: "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/echo-pipeline",
      chartsRender: "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/charts-render"
    },
    protocol: "a2a/0.3.0",
  }, 200, { "Cache-Control": "public, max-age=300" });
});
