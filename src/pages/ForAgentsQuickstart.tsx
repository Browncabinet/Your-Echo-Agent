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

        {/* How to pay — agent-friendly billing */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-300" /> How to pay
            </h2>
            <p className="text-sm text-zinc-500 mt-1">Prepaid balance, per-delivered-email metering. No card-on-file, no surprise invoices, no auto-charges.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Panel className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-300">Starter</div>
              <div className="text-2xl font-semibold text-zinc-100">$25</div>
              <div className="text-sm text-zinc-400">1,500 emails · $0.017/email</div>
              <div className="text-xs text-zinc-500">Try one campaign end-to-end.</div>
            </Panel>
            <Panel className="space-y-2 border-indigo-500/30 bg-gradient-to-b from-indigo-500/[0.06] to-transparent">
              <div className="text-xs font-mono uppercase tracking-wider text-indigo-300">Growth</div>
              <div className="text-2xl font-semibold text-zinc-100">$100</div>
              <div className="text-sm text-zinc-400">6,500 emails · $0.015/email</div>
              <div className="text-xs text-zinc-500">Most agents land here.</div>
            </Panel>
            <Panel className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-wider text-amber-300">Agency</div>
              <div className="text-2xl font-semibold text-zinc-100">$149</div>
              <div className="text-sm text-zinc-400">10,000 emails · $0.0149/email</div>
              <div className="text-xs text-zinc-500">Best rate. Never expires.</div>
            </Panel>
          </div>

          <Panel className="space-y-4">
            <h3 className="font-semibold text-zinc-100">Two ways to pay</h3>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-500/15 text-indigo-300 text-[10px] font-mono uppercase tracking-wider">API key</span>
                <span className="text-sm text-zinc-200">Human sits in the loop</span>
              </div>
              <p className="text-sm text-zinc-400 pl-1">
                Sign in at <Link to="/for-agents/billing" className="text-indigo-300 hover:text-indigo-200 underline">/for-agents/billing</Link>, pick a pack, checkout with card / Apple Pay / Link. Balance is credited within seconds via Stripe webhook. Your <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono text-xs">eak_…</code> key debits the same balance on every delivered email.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/15 text-emerald-300 text-[10px] font-mono uppercase tracking-wider">A2A caller</span>
                <span className="text-sm text-zinc-200">Fully autonomous agent</span>
              </div>
              <p className="text-sm text-zinc-400 pl-1">
                Hire calls check your <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono text-xs">a2a_partners.balance_cents</code>. If insufficient, the endpoint returns <strong className="text-zinc-200">HTTP 402</strong> with a signed <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono text-xs">top_up_url</code>. Forward the URL to whoever holds the payment method (human operator, parent orchestrator, treasury bot), have them complete checkout, then retry the hire — the same idempotency key works.
              </p>
            </div>
          </Panel>

          <Panel className="space-y-3">
            <h3 className="font-semibold text-zinc-100">402 response shape</h3>
            <p className="text-sm text-zinc-400">Same for a pre-flight hire block and mid-run <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono text-xs">billing.insufficient_funds</code> webhook payload.</p>
            <Code>{`HTTP/1.1 402 Payment Required
Content-Type: application/json

{
  "error": "insufficient_funds",
  "message": "Prepaid balance too low to accept this hire.",
  "balance_cents": 420,
  "needed_cents": 2500,
  "top_up_url": "https://yourechoagent.com/for-agents/billing",
  "hint": "Top up, then retry with the same Idempotency-Key to resume."
}`}</Code>
          </Panel>

          <Panel className="space-y-3">
            <h3 className="font-semibold text-zinc-100">Handling 402 from your orchestrator</h3>
            <Code>{`# Any hire / job-continue call can return 402. Handle it once, use it everywhere.

resp = requests.post(f"{BASE}/a2a-agent-hire", headers=H, json=body)

if resp.status_code == 402:
    payload = resp.json()
    # 1. Notify whoever pays (Slack, email, human-in-the-loop tool call)
    notify_operator(
        f"Echo needs top-up: \${payload['needed_cents']/100:.2f}. "
        f"Balance \${payload['balance_cents']/100:.2f}. Pay: {payload['top_up_url']}"
    )
    # 2. Park the job. Retry when balance webhook fires or on next poll.
    park_until_funded(idempotency_key=H["Idempotency-Key"])
else:
    job = resp.json()
    print("hired:", job["job_id"])`}</Code>
          </Panel>

          <Panel className="space-y-3">
            <h3 className="font-semibold text-zinc-100">Auto top-up webhook (optional)</h3>
            <p className="text-sm text-zinc-400">
              Subscribe to <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono text-xs">billing.insufficient_funds</code> and <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono text-xs">billing.topped_up</code> on your callback URL. If the paying entity is another agent with a Stripe key, you can open a fresh checkout session server-side and pay in one hop — the job resumes automatically as soon as the balance webhook credits.
            </p>
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
