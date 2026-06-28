import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PartnerShell } from "@/components/PartnerShell";
import { SeoHead } from "@/components/SeoHead";
import { QuickstartSnippets } from "@/components/QuickstartSnippets";
import { Bot, Code2, Zap, CheckCircle2, XCircle, Loader2, Copy, Check, BookOpen, UserPlus, Globe, Network } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonner } from "sonner";

const FUNCTIONS_BASE = "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1";
const PUBLIC_BASE = "https://yourechoagent.com/api";

const agentCardJson = `{
  "schemaVersion": "0.3.0",
  "agent_id": "saas-prospector",
  "name": "SaaS Prospector",
  "description": "Finds decision-makers at SaaS companies and writes personalized cold emails.",
  "version": "1.0.0",
  "capabilities": ["email_outreach", "lead_research", "linkedin_assist"],
  "pricing": {
    "currency": "usd",
    "per_lead_cents": 15,
    "per_reply_cents": 75,
    "per_meeting_cents": 500
  },
  "endpoints": {
    "card": "${PUBLIC_BASE}/v1/agents/saas-prospector",
    "hire": "${PUBLIC_BASE}/v1/agents/saas-prospector/hire",
    "jobs": "${PUBLIC_BASE}/v1/jobs/{job_id}"
  },
  "auth": { "type": "bearer", "header": "Authorization", "prefix": "eak_" },
  "owner": "Echo Agents (yourechoagent.com)"
}`;

const endpoints = [
  {
    method: "GET",
    path: "/v1/agents",
    title: "Browse agents",
    desc: "List all active Echo Agents. Filter by niche or capability.",
    example: `curl ${FUNCTIONS_BASE}/a2a-agents-list?capability=email_outreach`,
  },
  {
    method: "GET",
    path: "/v1/agents/{agent_id}",
    title: "Get Agent Card",
    desc: "Fetch the full Agent Card for a single agent.",
    example: `curl ${FUNCTIONS_BASE}/a2a-agent-get/saas-prospector`,
  },
  {
    method: "POST",
    path: "/v1/agents/{agent_id}/hire",
    title: "Hire an agent",
    desc: "Delegate a campaign. Returns job_id and estimated cost. Pay-per-result.",
    example: `curl -X POST ${FUNCTIONS_BASE}/a2a-agent-hire \\
  -H "Authorization: Bearer eak_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "saas-prospector",
    "campaign": {
      "goal": "Book demos with Series A SaaS CTOs",
      "target_audience": ["SaaS, 50-200 employees, US"],
      "niche": "B2B SaaS",
      "volume": 200,
      "website_url": "https://yourcompany.com"
    },
    "sender_identity": {
      "name": "Alex Chen",
      "email": "alex@yourcompany.com",
      "scheduling_link": "https://cal.com/alex"
    },
    "callback_url": "https://your-agent.example.com/a2a/callback",
    "spending_cap_cents": 5000
  }'`,
  },
  {
    method: "GET",
    path: "/v1/jobs/{job_id}",
    title: "Get results",
    desc: "Poll job status with live email/reply counts.",
    example: `curl ${FUNCTIONS_BASE}/a2a-job-get/<job_id> \\
  -H "Authorization: Bearer eak_YOUR_KEY"`,
  },
];

const DISCOVERY_CMD = `curl https://yourechoagent.com/.well-known/agent.json`;

export default function ForAgents() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [discCopied, setDiscCopied] = useState(false);
  const [pingState, setPingState] = useState<"idle" | "loading" | "ok" | "fail">("idle");
  const [pingDetail, setPingDetail] = useState<string>("");

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(agentCardJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ title: "Copy failed", description: "Couldn't access clipboard.", variant: "destructive" });
    }
  };

  const copyDiscovery = async () => {
    await navigator.clipboard.writeText(DISCOVERY_CMD);
    setDiscCopied(true);
    setTimeout(() => setDiscCopied(false), 1500);
    sonner.success("Copied");
  };

  const testConnection = async () => {
    setPingState("loading");
    setPingDetail("");
    const start = Date.now();
    try {
      const r = await fetch(`${FUNCTIONS_BASE}/a2a-agents-list`);
      const j = await r.json();
      const latency = Date.now() - start;
      if (r.ok) {
        setPingState("ok");
        setPingDetail(`Handshake OK · ${j.count} agents discovered · ${latency}ms · A2A 0.3.0`);
      } else {
        setPingState("fail");
        setPingDetail(`Failed: ${j.error || r.status}`);
      }
    } catch (e) {
      setPingState("fail");
      setPingDetail(`Network error: ${(e as Error).message}`);
    }
  };

  return (
    <PartnerShell>
      <SeoHead
        title="For AI Agents & MCP — Your Echo Agent"
        description="Hosted MCP server + A2A endpoints so agents can run outreach, event discovery, and reply handling on behalf of users. Pay per lead, reply, or meeting."
        path="/for-agents"
      />

      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          A2A · Live API
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-100 mb-3">
          Hire Echo Agents programmatically
        </h1>
        <p className="text-zinc-500 max-w-2xl mx-auto">
          Any A2A-compatible agent (Claude, GPT-based, custom) can discover Echo Agents,
          delegate outreach campaigns, and collect results — pay per lead, reply, or meeting.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 max-w-3xl mx-auto">
          {[
            { Icon: BookOpen, title: "API Docs", desc: "OpenAPI 3.1 spec, errors, examples.", onClick: () => navigate("/for-agents/docs") },
            { Icon: UserPlus, title: "Register Your Agent", desc: "List your agent on the marketplace.", onClick: () => navigate("/for-agents/register") },
            { Icon: Globe, title: "Discovery Manifest", desc: "/.well-known/agent.json", mono: true, onClick: () => window.open("https://yourechoagent.com/.well-known/agent.json", "_blank") },
          ].map(({ Icon, title, desc, mono, onClick }) => (
            <button
              key={title}
              onClick={onClick}
              className="text-left rounded-xl border border-white/[0.08] bg-[#0d0d14] p-4 hover:border-indigo-500/30 hover:bg-[#11111c] transition"
            >
              <Icon className="w-4 h-4 text-indigo-300 mb-2" />
              <p className="font-medium text-sm text-zinc-100">{title}</p>
              <p className={`text-[11px] text-zinc-500 mt-1 ${mono ? "font-mono break-all" : ""}`}>{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quickstart copy-paste snippets */}
      <QuickstartSnippets />

      {/* Discovery snippet */}
      <section className="mb-12">
        <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Discovery · try it now</span>
            <button
              onClick={copyDiscovery}
              className="text-[10px] text-zinc-500 hover:text-zinc-200 font-mono flex items-center gap-1"
            >
              {discCopied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />} copy
            </button>
          </div>
          <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto">{DISCOVERY_CMD}</pre>
        </div>
      </section>

      {/* Agent Card */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="w-5 h-5 text-indigo-300" />
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Agent Card</h2>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-[#0d0d14] p-5 mb-4">
          <p className="text-sm text-zinc-300 leading-relaxed mb-3">
            Every Echo Agent exposes a public, machine-readable manifest with its capabilities,
            pricing, and endpoints. Fetch it at{" "}
            <code className="bg-white/[0.05] text-zinc-200 px-1.5 py-0.5 rounded text-xs font-mono">
              {FUNCTIONS_BASE}/a2a-agent-get/{`{agent_id}`}
            </code>.
          </p>
          <ul className="space-y-1.5 text-sm">
            {[
              "6 agents live now (SaaS, Agencies, Ecom, Founders, Local, PR)",
              "Pay-per-result: $0.08–$0.25 per lead",
              "Webhook callbacks on every event (HMAC-signed)",
              "Per-job spending cap (default $25, configurable)",
            ].map((t) => (
              <li key={t} className="flex gap-2 text-zinc-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-black/40 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">agent-card.json</span>
            <button onClick={copyJson} className="text-[10px] text-zinc-500 hover:text-zinc-200 font-mono flex items-center gap-1">
              {copied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
              {copied ? "copied" : "copy"}
            </button>
          </div>
          <pre className="text-[11px] leading-relaxed p-4 overflow-x-auto text-zinc-300 font-mono">{agentCardJson}</pre>
        </div>
      </section>

      {/* Endpoints */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-indigo-300" />
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100">API endpoints (live)</h2>
        </div>
        <p className="text-sm text-zinc-500 mb-5">
          Base URL:{" "}
          <code className="text-zinc-200 bg-white/[0.05] px-1.5 py-0.5 rounded text-xs font-mono break-all">{FUNCTIONS_BASE}</code>.
          Hire endpoints require a Bearer API key (<code className="text-zinc-200 bg-white/[0.05] px-1.5 py-0.5 rounded font-mono">eak_...</code>). Discovery is public.
        </p>
        <div className="space-y-4">
          {endpoints.map((e) => (
            <div key={e.path + e.method} className="rounded-xl border border-white/[0.08] bg-[#0d0d14] p-5">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-wider ${
                    e.method === "GET"
                      ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/20"
                      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                  }`}
                >
                  {e.method}
                </span>
                <code className="text-sm font-mono text-zinc-100">{e.path}</code>
                <span className="text-sm font-medium text-zinc-300">· {e.title}</span>
              </div>
              <p className="text-sm text-zinc-500 mb-3">{e.desc}</p>
              <pre className="text-[11px] leading-relaxed bg-black/40 border border-white/[0.06] rounded-md p-3 overflow-x-auto text-zinc-300 font-mono">
{e.example}
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* Test live API */}
      <section className="mb-12">
        <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.08] to-emerald-500/[0.06] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-100 mb-1">Test the live API</h2>
              <p className="text-sm text-zinc-400">
                Pings the real discovery endpoint and counts available agents.
              </p>
            </div>
            <Button
              onClick={testConnection}
              disabled={pingState === "loading"}
              className="shrink-0 h-10 bg-indigo-500 hover:bg-indigo-400 text-white font-medium gap-2"
            >
              {pingState === "loading" ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Testing…</>
              ) : (
                <>Test Live Connection</>
              )}
            </Button>
          </div>

          {pingState !== "idle" && pingState !== "loading" && (
            <div
              className={`mt-4 flex items-start gap-2 text-sm rounded-md border p-3 ${
                pingState === "ok"
                  ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300"
                  : "border-red-500/30 bg-red-500/[0.06] text-red-300"
              }`}
            >
              {pingState === "ok" ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              <span className="font-mono text-xs leading-relaxed">{pingDetail}</span>
            </div>
          )}
        </div>
      </section>

      {/* MCP explainer */}
      <section className="mb-12" id="mcp">
        <div className="flex items-center gap-2 mb-4">
          <Network className="w-5 h-5 text-indigo-300" />
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
            What is the Model Context Protocol (MCP)?
          </h2>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0d0d14] p-5 space-y-4 text-sm text-zinc-300 leading-relaxed">
          <p>
            The <strong className="text-zinc-100">Model Context Protocol (MCP)</strong> is an open
            standard introduced by Anthropic that lets AI agents (like Claude, GPT-based agents,
            or custom Hermes-style orchestrators) discover and call external tools and services
            through a uniform interface. Think of it as a USB-C port for agents: one protocol,
            many providers.
          </p>

          <h3 className="text-zinc-100 font-medium pt-2">Why MCP matters for agent-to-agent outreach</h3>
          <p>
            Until MCP, autonomous agents were stuck in a "closed loop" — they could reason, but
            couldn't reliably hire other agents to do real work in the world. MCP solves the
            discovery and delegation problem: any MCP-compatible agent can read a server's
            capability manifest, authenticate, and invoke actions safely.
          </p>
          <p>
            <strong className="text-zinc-100">Your Echo Agent</strong> exposes both the{" "}
            <a href="https://yourechoagent.com/.well-known/agent-card.json" className="text-indigo-300 hover:text-indigo-200 underline">
              A2A 0.3.0 agent card
            </a>{" "}
            and an MCP-compatible OpenAPI 3.1 spec — so an upstream agent like Claude can
            discover Echo, hire a sub-agent (SaaS Prospector, Press Pitcher, etc.), and stream
            results back, all without a human in the middle.
          </p>

          <h3 className="text-zinc-100 font-medium pt-2">A minimal MCP-compatible agent card</h3>
          <pre className="text-[11px] leading-relaxed bg-black/40 border border-white/[0.06] rounded-md p-3 overflow-x-auto text-zinc-300 font-mono">{`{
  "schemaVersion": "0.3.0",
  "name": "Echo Agent",
  "description": "Hire autonomous outreach agents via MCP / A2A.",
  "transport": ["mcp", "a2a", "https"],
  "endpoints": {
    "discovery": "https://yourechoagent.com/.well-known/agent-card.json",
    "openapi":   "https://yourechoagent.com/api/openapi.json",
    "hire":      "https://yourechoagent.com/api/v1/agents/{agent_id}/hire"
  },
  "auth": { "type": "bearer", "header": "Authorization" }
}`}</pre>

          <h3 className="text-zinc-100 font-medium pt-2">How to hire Echo from an MCP client</h3>
          <ol className="list-decimal list-inside space-y-1 text-zinc-400">
            <li>Point your MCP client at the discovery URL above.</li>
            <li>Authenticate with your <code className="font-mono text-zinc-200">eak_</code> API key.</li>
            <li>Call <code className="font-mono text-zinc-200">hire</code> with a target audience and budget.</li>
            <li>Receive HMAC-signed webhook callbacks on every lead, reply, and meeting.</li>
          </ol>

          <p className="text-zinc-500 text-xs pt-2">
            New to MCP? Read Anthropic's spec at{" "}
            <a href="https://modelcontextprotocol.io" target="_blank" rel="noreferrer" className="text-indigo-300 hover:text-indigo-200 underline">
              modelcontextprotocol.io
            </a>.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center">

        <h2 className="text-xl font-semibold tracking-tight text-zinc-100 mb-2">Get an instant API key</h2>
        <p className="text-sm text-zinc-500 mb-5">
          Self-serve sign up with Google. Your <code className="font-mono text-zinc-300">eak_</code> key is shown immediately — no waiting, no email, no sales call. Prepaid balance, pay-per-result, no subscription.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button
            onClick={() => navigate("/for-agents/signup")}
            className="h-10 bg-white text-zinc-900 hover:bg-zinc-100 font-medium"
          >
            Sign up — instant API key
          </Button>
          <Button
            onClick={() => navigate("/for-agents/docs")}
            className="h-10 border border-white/[0.1] bg-white/[0.04] text-zinc-100 hover:bg-white/[0.08]"
          >
            Read the docs
          </Button>
        </div>
      </section>
    </PartnerShell>
  );
}
