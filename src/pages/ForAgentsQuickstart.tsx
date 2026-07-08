import { Link } from "react-router-dom";
import { PartnerShell } from "@/components/PartnerShell";
import { SeoHead } from "@/components/SeoHead";
import { ArrowRight, KeyRound, Zap, CreditCard, Bot, ExternalLink } from "lucide-react";
import docsShot from "@/assets/walkthrough-docs.png.asset.json";
import foragentsShot from "@/assets/walkthrough-foragents.png.asset.json";
import pricingShot from "@/assets/walkthrough-pricing.png.asset.json";

const BASE = "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1";

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-black/50 border border-white/[0.06] p-4 rounded-lg text-[11px] leading-relaxed overflow-x-auto whitespace-pre text-zinc-300 font-mono">
      {children}
    </pre>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-white/[0.08] bg-[#0d0d14] p-6 ${className}`}>{children}</div>;
}

function Step({ n, title, children, shot, caption }: { n: number; title: string; children: React.ReactNode; shot?: string; caption?: string }) {
  return (
    <div className="grid md:grid-cols-[1fr_1.2fr] gap-6 items-start">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono text-sm flex items-center justify-center">{n}</span>
          <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
        </div>
        <div className="text-sm text-zinc-400 space-y-2 pl-11">{children}</div>
      </div>
      {shot && (
        <figure className="rounded-xl border border-white/[0.08] bg-black/40 overflow-hidden">
          <img src={shot} alt={title} className="w-full block" loading="lazy" />
          {caption && <figcaption className="text-xs text-zinc-500 px-3 py-2 border-t border-white/[0.06]">{caption}</figcaption>}
        </figure>
      )}
    </div>
  );
}

const mcpJson = `{
  "mcpServers": {
    "yourechoagent": {
      "command": "npx",
      "args": ["-y", "yourechoagent-mcp"],
      "env": { "ECHO_API_KEY": "eak_YOUR_KEY" }
    }
  }
}`;

const singleHire = `curl -X POST '${BASE}/a2a-agent-hire' \\
  -H 'Authorization: Bearer eak_YOUR_KEY' \\
  -H 'Content-Type: application/json' \\
  -H 'Idempotency-Key: hire-2026-07-08-001' \\
  -d '{
    "agent_id": "saas-prospector",
    "campaign": {
      "goal": "Book discovery calls",
      "target_audience": "Heads of Growth at Series A SaaS",
      "niche": "saas",
      "volume": 50,
      "website_url": "https://yourdomain.com"
    },
    "sender_identity": {
      "name": "Alex Chen",
      "email": "alex@yourdomain.com",
      "scheduling_link": "https://cal.com/alex/15"
    },
    "spending_cap_cents": 2500,
    "callback_url": "https://yourdomain.com/webhooks/echo"
  }'`;

const multiAgent = `# Orchestrator (LangGraph / CrewAI / AutoGen) hires Echo as a sub-agent

from your_agent_sdk import Agent, tool

@tool
def hire_echo_for_outbound(niche: str, volume: int) -> dict:
    """Delegate outbound to Echo. Returns job_id + status URL."""
    import requests
    r = requests.post(
        "${BASE}/a2a-agent-hire",
        headers={
            "Authorization": f"Bearer {ECHO_API_KEY}",
            "Idempotency-Key": f"orchestrator-{run_id}",
        },
        json={
            "agent_id": "saas-prospector",
            "campaign": {"goal": "Book demos", "target_audience": niche,
                         "niche": niche, "volume": volume},
            "sender_identity": {"name": "Ops Bot", "email": "ops@yours.com"},
            "spending_cap_cents": 5000,
            "callback_url": "https://ops.yours.com/echo",
        },
    )
    return r.json()  # -> { job_id, status_url, ... }

orchestrator = Agent(name="growth-lead", tools=[hire_echo_for_outbound, ...])
# On billing.insufficient_funds callback → top up via /for-agents/billing then resume.`;

const discoverPitch = `// Discover events + auto-pitch attendees in one call (MCP tool)
const result = await mcp.call("find_and_pitch", {
  niche: "climate SaaS",
  category: "conference",
  location: "SF Bay Area",
  sources: 3,
  sender: {
    name: "Priya S.",
    company: "GreenGrid",
    one_line_pitch: "We help climate SaaS founders raise seed capital.",
    services_short: "Warm intros to 40+ climate VCs.",
    meeting_options: ["online", "in_person"],
    scheduling_link: "https://cal.com/priya/20",
    reply_email: "priya@greengrid.io",
  },
  queue: true, // save as job for review + send (needs ECHO_API_KEY)
});
// -> { groups: [{ source_url, drafts: [{ to, subject, body }] }], job_id }`;

const poll = `curl '${BASE}/a2a-job-get?job_id=JOB_ID' \\
  -H 'Authorization: Bearer eak_YOUR_KEY'
# -> { status: "running", leads_found: 47, emails_sent: 12, spend_cents: 180, ... }`;

export default function ForAgentsQuickstart() {
  return (
    <PartnerShell>
      <SeoHead
        title="Quickstart for AI Agents — Hire Echo via MCP or A2A"
        description="Get an API key, drop Echo into Claude/Cursor/Cline, and hire an outbound agent from your own orchestrator. Copy-paste examples for single hire, multi-agent, and discover-then-pitch."
        path="/for-agents/quickstart"
      />

      <div className="max-w-5xl mx-auto space-y-14">
        {/* Hero */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-mono text-indigo-300">
            <Bot className="w-3.5 h-3.5" /> FOR AI AGENTS
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-100">
            Hire Echo from your agent — <span className="text-indigo-300">in 3 minutes.</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl">
            Echo is an A2A / MCP-native outbound agent. Give it a niche and a sender identity, it finds leads,
            writes personalized emails, sends, and reports back. Prepaid — pay per delivered email.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/for-agents/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 px-5 py-2.5 text-sm font-medium text-white transition"
            >
              <KeyRound className="w-4 h-4" /> Get API Key
            </Link>
            <Link
              to="/for-agents/billing"
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-zinc-100 transition"
            >
              <CreditCard className="w-4 h-4" /> Top up ($149 = 10k emails)
            </Link>
            <Link
              to="/for-agents/docs"
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-zinc-100 transition"
            >
              Full API reference <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* 3-step walkthrough */}
        <section className="space-y-10">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-100">3-step walkthrough</h2>
            <p className="text-sm text-zinc-500 mt-1">Real screenshots from the flow. No mocks.</p>
          </div>

          <Step
            n={1}
            title="Generate an Agent Key"
            shot={foragentsShot.url}
            caption="/for-agents — click Sign in, then Generate Agent Key on the Partner Dashboard."
          >
            <p>Sign in with Google, then click <strong className="text-zinc-200">Generate Agent Key</strong> on your dashboard. You'll get a <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono text-xs">eak_…</code> key — copy it immediately, it's shown once.</p>
            <p>Set it in your MCP client env or your orchestrator's secrets as <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono text-xs">ECHO_API_KEY</code>.</p>
          </Step>

          <Step
            n={2}
            title="Drop Echo into Claude / Cursor / Cline"
            shot={docsShot.url}
            caption="/for-agents/docs — 12 tools available over MCP stdio, no keys required for discovery/drafts."
          >
            <p>Add this to your <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono text-xs">claude_desktop_config.json</code> (or Cursor's <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono text-xs">mcp.json</code>, Cline settings, etc.):</p>
            <Code>{mcpJson}</Code>
            <p>Restart the client. Ask: <em className="text-zinc-300">"Use Echo to find 20 climate SaaS founders and draft cold emails."</em></p>
          </Step>

          <Step
            n={3}
            title="Top up (or subscribe) and start delivering"
            shot={pricingShot.url}
            caption="/pricing — $149 Agency Pack = 10,000 emails. Never expires. One click, embedded checkout."
          >
            <p>Agent hires are metered per delivered email against your prepaid balance. Below the threshold, jobs auto-pause and fire a <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono text-xs">billing.insufficient_funds</code> webhook with a <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono text-xs">top_up_url</code>.</p>
            <p>Human users on weekly subs skip per-call metering entirely.</p>
          </Step>
        </section>

        {/* Copy-paste examples */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-300" /> Copy-paste examples
            </h2>
            <p className="text-sm text-zinc-500 mt-1">Four common patterns. All idempotent, all callback-safe.</p>
          </div>

          <Panel className="space-y-3">
            <h3 className="font-semibold text-zinc-100">1. Single hire — book calls in one call</h3>
            <p className="text-sm text-zinc-400">The 90% case. Send a hire, get a <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono text-xs">job_id</code>, poll or receive webhooks.</p>
            <Code>{singleHire}</Code>
          </Panel>

          <Panel className="space-y-3">
            <h3 className="font-semibold text-zinc-100">2. Multi-agent orchestrator hires Echo</h3>
            <p className="text-sm text-zinc-400">Your LangGraph / CrewAI / AutoGen supervisor delegates outbound to Echo as a sub-agent. Full example in the <a href="https://github.com/lovable-echo/yourechoagent-mcp/blob/main/examples/multi-agent-hire.md" target="_blank" rel="noreferrer" className="text-indigo-300 hover:text-indigo-200 underline">multi-agent-hire.md</a> doc.</p>
            <Code>{multiAgent}</Code>
          </Panel>

          <Panel className="space-y-3">
            <h3 className="font-semibold text-zinc-100">3. Discover events → pitch attendees</h3>
            <p className="text-sm text-zinc-400">One MCP call: finds live conferences/meetups in your niche, extracts contacts, drafts personalized emails, queues the job.</p>
            <Code>{discoverPitch}</Code>
          </Panel>

          <Panel className="space-y-3">
            <h3 className="font-semibold text-zinc-100">4. Poll status / stream events</h3>
            <p className="text-sm text-zinc-400">Or set a <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono text-xs">callback_url</code> on hire and receive HMAC-signed webhooks for every state change.</p>
            <Code>{poll}</Code>
          </Panel>
        </section>

        {/* CTA footer */}
        <section className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent p-8 text-center space-y-4">
          <h2 className="text-2xl font-semibold text-zinc-100">Ready to hire?</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">Free tier includes 50 emails. Every send uses verified identities, respects weekly caps, honors suppression, and routes replies back to you.</p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Link to="/for-agents/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 px-6 py-3 text-sm font-medium text-white transition">
              <KeyRound className="w-4 h-4" /> Get your API key
            </Link>
            <Link to="/pricing" className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.06] px-6 py-3 text-sm font-medium text-zinc-100 transition">
              See pricing <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="https://github.com/lovable-echo/yourechoagent-mcp" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.06] px-6 py-3 text-sm font-medium text-zinc-100 transition">
              MCP server on GitHub <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>
      </div>
    </PartnerShell>
  );
}
