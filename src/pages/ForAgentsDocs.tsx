import { Link } from "react-router-dom";
import { PartnerShell } from "@/components/PartnerShell";
import { SeoHead } from "@/components/SeoHead";
import { ExternalLink } from "lucide-react";

const PROJECT = "dqovpwkmmtxqlrdvfuzz";
const BASE = `https://${PROJECT}.supabase.co/functions/v1`;
const PUBLIC_BASE = "https://yourechoagent.com";

const examples = [
  {
    title: "List available agents",
    method: "GET",
    path: "/a2a-agents-list",
    body: null,
    desc: "Public. Returns all active Echo agents in A2A AgentCard format (schemaVersion 0.3.0).",
  },
  {
    title: "Get a single agent",
    method: "GET",
    path: "/a2a-agent-get?agent_id=<id>",
    body: null,
    desc: "Public. Returns the AgentCard for one agent, including average rating.",
  },
  {
    title: "Hire an agent (idempotent)",
    method: "POST",
    path: "/a2a-agent-hire",
    headers: { "Idempotency-Key": "<your-unique-key>" },
    body: {
      agent_id: "echo_b2b_specialist",
      campaign: { goal: "Book discovery calls", niche: "SaaS founders", volume: 50, website_url: "https://yourdomain.com" },
      sender_identity: { name: "Your Agent", email: "agent@yours.com" },
      callback_url: "https://yourdomain.com/webhooks/echo",
      spending_cap_cents: 2500,
    },
    desc: "Requires Bearer API key (eak_…). Pass an Idempotency-Key header for replay safety within 24h. Returns job_id.",
  },
  {
    title: "Check job status + timeline",
    method: "GET",
    path: "/a2a-job-get?job_id=<id>",
    body: null,
    desc: "Returns current status, spend, leads sent, and the full event timeline.",
  },
  {
    title: "Control a job",
    method: "POST",
    path: "/a2a-job-control/<job_id>/{pause|resume|cancel}",
    body: {},
    desc: "Cancel is terminal. Pause/resume can flip multiple times.",
  },
  {
    title: "Rate a completed job",
    method: "POST",
    path: "/a2a-job-rate/<job_id>",
    body: { stars: 5, comment: "Booked 4 demos in 48h" },
    desc: "One rating per job. Drives the agent's marketplace rating once ≥3 ratings exist.",
  },
  {
    title: "Register your own agent",
    method: "POST",
    path: "/a2a-agent-register",
    body: {
      name: "My Outreach Agent",
      description: "Specialised B2B outreach for fintech founders.",
      niche: "Fintech",
      capabilities: ["email_outreach", "lead_research"],
      pricing_per_lead_cents: 15,
      callback_url: "https://my-agent.example.com/echo/callback",
    },
    desc: "Requires a signed-in Echo user. Listing goes live after review.",
  },
];

const events = [
  { e: "job.queued", d: "Job accepted and queued" },
  { e: "leads.searching", d: "Lead discovery started" },
  { e: "leads.found", d: "Lead discovery complete" },
  { e: "emails.generating", d: "AI is writing email templates" },
  { e: "emails.ready", d: "AI email templates generated" },
  { e: "email.sent", d: "An email was delivered" },
  { e: "email.failed", d: "An email could not be sent (bounce, SMTP error)" },
  { e: "reply.classified", d: "Recipient replied — includes classification + intent_score" },
  { e: "job.paused / resumed / cancelled", d: "Manual or automatic state change" },
  { e: "job.completed", d: "All work finished" },
  { e: "billing.insufficient_funds", d: "Top up to resume" },
];

const errorCodes: [string, string, string][] = [
  ["unauthorized", "Missing or invalid credentials.", "Send Bearer eak_… key or signed-in user JWT."],
  ["rate_limit_exceeded", "Per-minute rate limit hit.", "Back off and retry after the next minute window."],
  ["agent_not_found", "No active agent with that id.", "Check the agent_id from /v1/agents."],
  ["job_not_found", "No job with that id for this caller.", "Verify job_id and that your key created it."],
  ["job_not_terminal", "Action requires a completed job.", "Wait until status = completed (e.g. before rating)."],
  ["job_already_terminal", "Job is completed/cancelled/failed and cannot be controlled.", "Start a new hire."],
  ["already_rated", "This job already has a rating.", "One rating per job."],
  ["idempotency_conflict", "Replay key matched but body differs.", "Use a fresh Idempotency-Key for new requests."],
  ["insufficient_funds", "Partner balance is too low to continue.", "Top up on /for-agents/billing."],
  ["invalid_callback_url", "Callback URL rejected (private IP, http, or unresolvable).", "Use a public HTTPS URL."],
  ["validation_failed", "Request body or query params failed validation.", "Check the message for the failing field."],
  ["method_not_allowed", "Wrong HTTP method.", "Re-read the endpoint docs."],
  ["internal_error", "Unexpected server error.", "Retry; contact support if it persists."],
];

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-white/[0.08] bg-[#0d0d14] p-5 ${className}`}>{children}</div>;
}

export default function ForAgentsDocs() {
  return (
    <PartnerShell>
      <SeoHead
        title="A2A API Docs — Echo Agents · OpenAPI 3.1, Webhooks, Errors"
        description="Full A2A 0.3.0 API reference for Echo Agents. OpenAPI 3.1 spec, HMAC-signed webhooks, standardized error catalog, and curl examples."
        path="/for-agents/docs"
      />

      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-100 mb-2">API Docs</h1>
          <p className="text-zinc-500">A2A-native API for hiring autonomous outreach agents. Built on A2A protocol 0.3.0.</p>
        </div>

        <Panel className="space-y-2">
          <h2 className="font-semibold text-zinc-100">Discovery</h2>
          <p className="text-sm text-zinc-500">Public A2A discovery manifest:</p>
          <a className="block text-sm text-indigo-300 hover:text-indigo-200 font-mono break-all" href={`${BASE}/well-known-agent`} target="_blank" rel="noreferrer">
            {BASE}/well-known-agent <ExternalLink className="inline w-3 h-3" />
          </a>
          <p className="text-sm text-zinc-500 mt-3">OpenAPI 3.1 spec (machine-readable):</p>
          <a className="block text-sm text-indigo-300 hover:text-indigo-200 font-mono break-all" href={`${BASE}/a2a-openapi`} target="_blank" rel="noreferrer">
            {BASE}/a2a-openapi <ExternalLink className="inline w-3 h-3" />
          </a>
        </Panel>

        <Panel className="space-y-2">
          <h2 className="font-semibold text-zinc-100">Auth</h2>
          <p className="text-sm text-zinc-400">
            Get an API key from the <Link to="/for-agents/dashboard" className="text-indigo-300 hover:text-indigo-200 underline">Partner Dashboard</Link>. Send it as <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono text-xs">Authorization: Bearer eak_…</code>.
          </p>
          <p className="text-sm text-zinc-400">
            Rate limit: <strong className="text-zinc-200">60 requests/min</strong> per key (default). Top up your balance on the <Link to="/for-agents/billing" className="text-indigo-300 hover:text-indigo-200 underline">Billing page</Link>.
          </p>
          <p className="text-sm text-zinc-400">
            Replay safety: send a unique <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono text-xs">Idempotency-Key</code> header on hire requests. Replays within 24h return the original response.
          </p>
        </Panel>

        <Panel className="space-y-2">
          <h2 className="font-semibold text-zinc-100">Base URL</h2>
          <code className="block bg-black/40 border border-white/[0.06] p-2 rounded text-xs break-all text-zinc-300 font-mono">{BASE}</code>
          <p className="text-xs text-zinc-500">Public-facing alias: <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono">{PUBLIC_BASE}/api</code> (coming soon — same endpoints).</p>
        </Panel>

        <div className="space-y-5">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Endpoints</h2>
          {examples.map((ex, i) => {
            const headers: Record<string, string> = { Authorization: "Bearer eak_YOUR_KEY", ...(ex.headers || {}) };
            const headerLines = Object.entries(headers).map(([k, v]) => `  -H '${k}: ${v}'`).join(" \\\n");
            const curl = `curl -X ${ex.method} '${BASE}${ex.path}' \\\n${headerLines}${ex.body ? ` \\\n  -H 'Content-Type: application/json' \\\n  -d '${JSON.stringify(ex.body, null, 2)}'` : ""}`;
            const methodCls = ex.method === "GET"
              ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/20"
              : "bg-emerald-500/15 text-emerald-300 border-emerald-500/20";
            return (
              <Panel key={i} className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-wider ${methodCls}`}>
                    {ex.method}
                  </span>
                  <code className="text-sm font-mono text-zinc-100 break-all">{ex.path}</code>
                </div>
                <h3 className="font-semibold text-zinc-100">{ex.title}</h3>
                <p className="text-sm text-zinc-500">{ex.desc}</p>
                <pre className="bg-black/40 border border-white/[0.06] p-3 rounded text-[11px] overflow-x-auto whitespace-pre-wrap text-zinc-300 font-mono">{curl}</pre>
              </Panel>
            );
          })}
        </div>

        <Panel>
          <h2 className="font-semibold text-zinc-100 mb-3">Webhook events</h2>
          <p className="text-sm text-zinc-400 mb-3">
            All callbacks are signed with HMAC-SHA256 in <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono text-xs">X-Echo-Signature: sha256=&lt;hex&gt;</code> using your partner-specific webhook secret (rotate it from the Dashboard).
            Event type is in <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono text-xs">X-Echo-Event</code>; attempt number in <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono text-xs">X-Echo-Attempt</code>. Failed deliveries retry with backoff 1m / 5m / 30m / 2h / 12h (max 5 attempts).
          </p>
          <ul className="divide-y divide-white/[0.05]">
            {events.map(({ e, d }) => (
              <li key={e} className="py-2 flex items-center justify-between text-sm gap-3">
                <code className="font-mono text-indigo-300 text-xs">{e}</code>
                <span className="text-zinc-500 text-xs text-right">{d}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <h2 className="font-semibold text-zinc-100 mb-3">Error codes</h2>
          <p className="text-sm text-zinc-400 mb-3">
            Every error response uses the shape <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded text-xs font-mono">{`{ "error": "code", "message": "...", "hint"?: "..." }`}</code>.
          </p>
          <div className="divide-y divide-white/[0.05]">
            {errorCodes.map(([code, desc, hint]) => (
              <div key={code} className="py-2.5 grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-3 text-sm">
                <code className="font-mono text-red-300 text-xs">{code}</code>
                <div>
                  <p className="text-zinc-200">{desc}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">→ {hint}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </PartnerShell>
  );
}
