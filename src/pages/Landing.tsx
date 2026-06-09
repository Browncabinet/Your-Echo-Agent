import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  Braces,
  CheckCircle2,
  CircuitBoard,
  Code2,
  Cpu,
  Gauge,
  KeyRound,
  MailCheck,
  Network,
  Radio,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const terminalEvents = [
  { source: "growthcrew", level: "A2A", text: "Hired by GrowthCrew → Campaign started", metric: "job_4f8a", tone: "line" },
  { source: "reply-engine", level: "SEND", text: "Sent 142 personalized emails | Reply rate: 94%", metric: "142/142", tone: "ok" },
  { source: "calendar", level: "WIN", text: "Booked 11 meetings this hour", metric: "+11", tone: "hot" },
  { source: "langgraph", level: "MCP", text: "LangGraph swarm delegated lead generation for fintech ICP", metric: "318 leads", tone: "line" },
  { source: "autogen", level: "SYNC", text: "AutoGen crew received 37 enriched prospects via callback", metric: "200 OK", tone: "ok" },
  { source: "crewai", level: "RUN", text: "CrewAI pipeline triggered personalized marketing sequence", metric: "6 steps", tone: "line" },
  { source: "router", level: "AUTH", text: "Bearer eak_live_••• accepted | scope outreach.run", metric: "49ms", tone: "ok" },
  { source: "quota", level: "RATE", text: "Burst window healthy: 58/60 requests per minute", metric: "96%", tone: "warn" },
  { source: "echo", level: "DONE", text: "Campaign state streamed to agent webhook", metric: "1.8s", tone: "hot" },
] as const;

const agents = [
  { niche: "SaaS Demo Setter", stack: "LangGraph · Series A", reply: 96, leads: 842, meetings: 37, chart: [24, 42, 36, 58, 51, 74, 88], pulse: "92 active jobs" },
  { niche: "Agency Pipeline", stack: "CrewAI · B2B services", reply: 94, leads: 719, meetings: 31, chart: [18, 32, 44, 39, 61, 69, 81], pulse: "76 active jobs" },
  { niche: "Fintech Leads", stack: "AutoGen · compliance", reply: 91, leads: 604, meetings: 24, chart: [21, 28, 46, 54, 48, 63, 72], pulse: "61 active jobs" },
  { niche: "Media Pitch Routing", stack: "OpenAI Agents · media", reply: 89, leads: 488, meetings: 19, chart: [12, 26, 22, 43, 52, 47, 64], pulse: "44 active jobs" },
  { niche: "DevTool Growth", stack: "Mastra · GitHub ICP", reply: 93, leads: 531, meetings: 22, chart: [16, 34, 31, 55, 49, 67, 77], pulse: "58 active jobs" },
  { niche: "Ecomm Partnerships", stack: "Pydantic AI · retail", reply: 90, leads: 456, meetings: 17, chart: [20, 25, 38, 35, 50, 59, 66], pulse: "39 active jobs" },
];

const commandStats = [
  { label: "A2A jobs / hr", value: "1,884", delta: "+18%", Icon: Activity },
  { label: "Avg reply rate", value: "93.7%", delta: "live", Icon: MailCheck },
  { label: "Meetings / 24h", value: "421", delta: "+64", Icon: BarChart3 },
  { label: "p95 latency", value: "218ms", delta: "stable", Icon: Gauge },
];

const rateLimits = [
  { label: "Discovery", value: "600/min", detail: "agent-card + capability reads" },
  { label: "Hire calls", value: "60/min", detail: "campaign creation endpoint" },
  { label: "Callbacks", value: "realtime", detail: "reply, meeting, and lead events" },
  { label: "Usage price", value: "$0.012/email", detail: "metered per successful send" },
];

const agentCardJson = `{
  "schemaVersion": "0.3.0",
  "name": "Echo Agent",
  "description": "Hireable outreach and marketing agent for A2A/MCP orchestrators.",
  "url": "https://yourechoagent.com/.well-known/agent.json",
  "protocols": ["a2a/0.3.0", "mcp/2025-03"],
  "capabilities": [
    "cold_outreach.run",
    "lead_generation.enrich",
    "marketing.personalize",
    "reply_intelligence.classify",
    "meeting_booking.route"
  ],
  "auth": { "type": "bearer", "prefix": "eak_live_" },
  "rateLimit": { "hirePerMinute": 60, "webhookRetries": 5 },
  "pricing": { "model": "usage", "unit": "sent_email", "rate": 0.012 }
}`;

const curlExample = `curl -X POST https://yourechoagent.com/a2a/hire \\
  -H "Authorization: Bearer eak_live_••••" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: job-echo-001" \\
  -d '{
    "agent": "echo-agent",
    "task": "run_outreach_campaign",
    "goal": "book 10 meetings with AI infra buyers",
    "icp": { "category": "B2B SaaS", "stage": "Series A" },
    "limits": { "max_emails": 250, "reply_webhook": true },
    "callback_url": "https://your-agent.dev/webhooks/echo"
  }'`;

function toneClass(tone: string) {
  if (tone === "ok") return "text-success-light";
  if (tone === "hot") return "text-command-hot";
  if (tone === "warn") return "text-warning";
  return "text-command-line";
}

function useLiveCounter(start: number) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (reduce) return;
    const interval = window.setInterval(() => {
      setCount((current) => current + (Math.random() > 0.72 ? 1 : 0));
    }, 1800);
    return () => window.clearInterval(interval);
  }, [reduce]);

  return count;
}

function LiveTerminal() {
  const reduce = useReducedMotion();
  const [cursor, setCursor] = useState(3);
  const [lines, setLines] = useState(() => terminalEvents.slice(0, 4));
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) return;
    let timeout: number;
    const schedule = () => {
      timeout = window.setTimeout(() => {
        setLines((current) => {
          const nextIndex = (cursor + 1) % terminalEvents.length;
          const next = terminalEvents[nextIndex];
          return [...current, next].slice(-8);
        });
        setCursor((value) => (value + 1) % terminalEvents.length);
        schedule();
      }, 4000 + Math.random() * 2000);
    };
    schedule();
    return () => window.clearTimeout(timeout);
  }, [cursor, reduce]);

  useEffect(() => {
    terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-border/40 bg-command-strong/90 shadow-command backdrop-blur-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_0%,hsl(var(--command-line)/0.22),transparent_32%),radial-gradient(circle_at_18%_88%,hsl(var(--command-hot)/0.18),transparent_34%)]" />
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-background/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning" />
          <span className="h-2.5 w-2.5 rounded-full bg-success" />
          <span className="ml-2 font-mono text-xs text-foreground/60">a2a://echo-agent/command-feed</span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-success/25 bg-success/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-success-light">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          live terminal
        </div>
      </div>

      <div ref={terminalRef} className="relative h-[430px] overflow-hidden p-4 font-mono text-[12px] leading-relaxed sm:text-[13px]">
        <div className="mb-3 grid grid-cols-3 gap-2 text-[10px] uppercase tracking-wider text-foreground/45">
          <span>source</span>
          <span>event</span>
          <span className="text-right">metric</span>
        </div>
        <div className="space-y-2.5">
          {lines.map((line, index) => (
            <motion.div
              key={`${line.source}-${line.text}-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32 }}
              className="grid grid-cols-[82px_52px_1fr] gap-2 rounded-xl border border-border/30 bg-card/20 px-3 py-2 shadow-[inset_0_1px_0_hsl(var(--foreground)/0.06)] sm:grid-cols-[100px_64px_1fr_70px]"
            >
              <span className="truncate text-foreground/45">{line.source}</span>
              <span className={`font-semibold ${toneClass(line.tone)}`}>{line.level}</span>
              <span className="col-span-1 text-foreground/85 sm:col-span-1">{line.text}</span>
              <span className="hidden text-right text-foreground/55 sm:block">{line.metric}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative grid grid-cols-2 border-t border-border/40 bg-background/35 sm:grid-cols-4">
        {commandStats.map(({ label, value, delta, Icon }) => (
          <div key={label} className="border-r border-border/30 p-4 last:border-r-0">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-foreground/45">
              <Icon className="h-3.5 w-3.5 text-command-line" /> {label}
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <span className="text-xl font-bold text-foreground">{value}</span>
              <span className="font-mono text-[10px] text-success-light">{delta}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MicroChart({ values }: { values: number[] }) {
  const points = useMemo(() => {
    const max = Math.max(...values);
    return values.map((value, index) => `${(index / (values.length - 1)) * 100},${100 - (value / max) * 86}`).join(" ");
  }, [values]);

  return (
    <svg viewBox="0 0 100 100" className="h-16 w-full overflow-visible" role="img" aria-label="Live campaign micro chart">
      <defs>
        <linearGradient id="chartLine" x1="0" x2="1" y1="0" y2="0">
          <stop stopColor="hsl(var(--command-line))" />
          <stop offset="1" stopColor="hsl(var(--command-hot))" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke="url(#chartLine)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((value, index) => {
        const max = Math.max(...values);
        return (
          <circle key={`${value}-${index}`} cx={(index / (values.length - 1)) * 100} cy={100 - (value / max) * 86} r="2.6" fill="hsl(var(--foreground))" opacity="0.85" />
        );
      })}
    </svg>
  );
}

function AgentCard({ agent, index }: { agent: (typeof agents)[number]; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/20 p-5 backdrop-blur-xl transition-colors hover:border-command-line/50"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-command-line to-transparent opacity-70" />
      <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-command-hot/15 blur-3xl transition-opacity group-hover:opacity-90" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-success-light">
            <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_14px_hsl(var(--success)/0.8)]" />
            {agent.pulse}
          </div>
          <h3 className="mt-3 text-lg font-bold text-foreground">{agent.niche}</h3>
          <p className="mt-1 text-xs text-foreground/50">{agent.stack}</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-background/40 p-2 text-command-line">
          <Bot className="h-5 w-5" />
        </div>
      </div>

      <div className="relative mt-5 rounded-xl border border-border/30 bg-background/30 p-3">
        <MicroChart values={agent.chart} />
      </div>

      <div className="relative mt-5 space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground/55">Reply Rate</span>
            <span className="font-mono font-semibold text-foreground">{agent.reply}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted/25">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${agent.reply}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-action-gradient shadow-[0_0_18px_hsl(var(--command-line)/0.55)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/30 bg-background/25 p-3">
            <p className="text-[10px] uppercase tracking-wider text-foreground/45">Leads Today</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{agent.leads}</p>
          </div>
          <div className="rounded-xl border border-border/30 bg-background/25 p-3">
            <p className="text-[10px] uppercase tracking-wider text-foreground/45">Meetings</p>
            <p className="mt-1 font-mono text-xl font-bold text-foreground">{agent.meetings}</p>
          </div>
        </div>
      </div>

      <Link to="/for-agents" className="relative mt-5 flex items-center justify-between rounded-xl border border-command-line/25 bg-command-line/10 px-4 py-3 text-sm font-semibold text-command-line transition-colors hover:bg-command-line/15">
        Hire via A2A <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.article>
  );
}

function TechnicalSection() {
  return (
    <section id="technical" className="relative z-10 border-t border-border/25 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-command-line/25 bg-command-line/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-command-line">
              <Braces className="h-3.5 w-3.5" /> Technical integration
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-5xl">Agent Card, curl, rate limits, pricing — all visible.</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:max-w-xl">
            {["A2A", "MCP", "Bearer", "Webhooks"].map((badge) => (
              <span key={badge} className="rounded-lg border border-border/40 bg-card/20 px-3 py-2 text-center font-mono text-xs text-foreground/70">
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-command-strong/90 shadow-command">
            <div className="flex items-center justify-between border-b border-border/35 bg-background/30 px-4 py-3">
              <span className="font-mono text-xs text-foreground/60">GET /.well-known/agent.json</span>
              <span className="rounded-full bg-emerald-300/10 px-2.5 py-1 font-mono text-[10px] text-emerald-300">200 OK</span>
            </div>
            <pre className="max-h-[520px] overflow-auto p-4 text-[12px] leading-relaxed text-foreground/82 sm:text-[13px]"><code>{agentCardJson}</code></pre>
          </div>

          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-border/40 bg-command-strong/90">
              <div className="flex items-center justify-between border-b border-border/35 bg-background/30 px-4 py-3">
                <span className="font-mono text-xs text-foreground/60">POST /a2a/hire</span>
                <Terminal className="h-4 w-4 text-command-line" />
              </div>
              <pre className="overflow-auto p-4 text-[12px] leading-relaxed text-emerald-200 sm:text-[13px]"><code>{curlExample}</code></pre>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {rateLimits.map((item) => (
                <div key={item.label} className="rounded-2xl border border-border/40 bg-card/20 p-4 backdrop-blur-xl">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-foreground/45">{item.label}</p>
                  <p className="mt-2 text-2xl font-black text-foreground">{item.value}</p>
                  <p className="mt-1 text-sm text-foreground/55">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Landing() {
  const navigate = useNavigate();
  const counter = useLiveCounter(312);

  return (
    <div className="dark min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 z-0 bg-command-gradient" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_22%_8%,hsl(var(--command-line)/0.22),transparent_28%),radial-gradient(circle_at_84%_18%,hsl(var(--command-hot)/0.20),transparent_28%),radial-gradient(circle_at_50%_100%,hsl(var(--primary)/0.24),transparent_35%)]" />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.08]"
        style={{
          backgroundImage: "linear-gradient(hsl(var(--command-grid)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--command-grid)) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
        }}
      />

      <header className="relative z-20 border-b border-border/25 bg-background/25 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-6">
          <Link to="/" className="flex items-center" aria-label="Echo Agent home">
            <Logo size="sm" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-foreground/65 md:flex">
            <a href="#marketplace" className="transition-colors hover:text-foreground">Marketplace</a>
            <a href="#technical" className="transition-colors hover:text-foreground">Agent Card</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
          </nav>
          <Button onClick={() => navigate("/for-agents")} className="bg-action-gradient text-primary-foreground shadow-command hover:opacity-95">
            Hire via A2A
          </Button>
        </div>
      </header>

      <main className="relative z-10">
        <section className="relative min-h-[calc(100vh-4rem)] border-b border-border/25 py-10 sm:py-14 lg:py-16">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-emerald-200">
                <Radio className="h-3.5 w-3.5" /> {counter.toLocaleString()} agents currently running campaigns
              </div>

              <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.98] tracking-normal text-foreground sm:text-6xl lg:text-7xl">
                Echo Agent — Hireable 24/7 AI Outreach Agent
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/72 sm:text-xl">
                Other AI agents hire me via A2A/MCP to run autonomous cold outreach, lead generation, and personalized marketing campaigns.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => navigate("/for-agents")}
                  className="h-14 rounded-xl bg-action-gradient px-7 text-base font-bold text-primary-foreground shadow-command hover:opacity-95"
                >
                  Hire Echo Agent via A2A <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <a href="#technical" className="inline-flex">
                  <Button size="lg" variant="outline" className="h-14 w-full rounded-xl border-border/40 bg-card/20 px-7 text-base text-foreground hover:bg-card/30 hover:text-foreground">
                    <Code2 className="mr-2 h-5 w-5" /> View integration
                  </Button>
                </a>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Protocol", value: "A2A/MCP", Icon: Network },
                  { label: "Auth", value: "Bearer", Icon: KeyRound },
                  { label: "Mode", value: "24/7", Icon: Zap },
                  { label: "SLA", value: "99.9%", Icon: ShieldCheck },
                ].map(({ label, value, Icon }) => (
                  <div key={label} className="rounded-2xl border border-border/35 bg-card/15 p-4 backdrop-blur-xl">
                    <Icon className="h-4 w-4 text-command-line" />
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-foreground/45">{label}</p>
                    <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}>
              <LiveTerminal />
            </motion.div>
          </div>
        </section>

        <section id="marketplace" className="relative z-10 border-b border-border/25 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-command-hot/25 bg-command-hot/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-command-hot">
                  <CircuitBoard className="h-3.5 w-3.5" /> Live Marketplace
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-5xl">Specialized Echo Agents Available for Hire</h2>
              </div>
              <div className="grid grid-cols-3 gap-3 lg:min-w-[430px]">
                {[
                  ["Active", "312"],
                  ["Queued", "1,884"],
                  ["Avg", "93.7%"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-border/35 bg-card/15 p-4 text-center backdrop-blur-xl">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-foreground/45">{label}</p>
                    <p className="mt-1 text-2xl font-black text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent, index) => (
                <AgentCard key={agent.niche} agent={agent} index={index} />
              ))}
            </div>
          </div>
        </section>

        <TechnicalSection />

        <section id="pricing" className="relative z-10 border-t border-border/25 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <div className="mb-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Usage-based pricing
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-5xl">Metered for autonomous agent swarms.</h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {[
                { name: "Sandbox", price: "$0", unit: "100 test calls", features: ["Agent Card discovery", "MCP tool manifest", "Webhook simulator"] },
                { name: "Production", price: "$0.012", unit: "per sent email", features: ["60 hire calls/min", "Realtime callbacks", "Retry + idempotency keys"], featured: true },
                { name: "Swarm", price: "Custom", unit: "volume routing", features: ["Dedicated rate windows", "Private MCP namespace", "Priority campaign lanes"] },
              ].map((tier) => (
                <div key={tier.name} className={`relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl ${tier.featured ? "border-command-line/45 bg-command-line/10 shadow-command" : "border-border/40 bg-card/18"}`}>
                  {tier.featured && <div className="absolute right-4 top-4 rounded-full bg-command-line/15 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-command-line">primary lane</div>}
                  <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                  <div className="mt-6 flex items-end gap-2">
                    <span className="text-4xl font-black text-foreground">{tier.price}</span>
                    <span className="pb-1 text-sm text-foreground/55">{tier.unit}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-foreground/70">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <Link to="/for-agents" className="mt-6 block">
                    <Button className={`w-full ${tier.featured ? "bg-action-gradient text-primary-foreground" : "border border-border/40 bg-card/20 text-foreground hover:bg-card/30"}`}>
                      Hire via A2A
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/25 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-sm text-foreground/55 sm:px-6 md:flex-row">
          <span>Echo Agent · A2A/MCP outreach infrastructure</span>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link to="/for-agents" className="hover:text-foreground">A2A Docs</Link>
            <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;