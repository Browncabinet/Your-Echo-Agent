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
  GitBranch,
  KeyRound,
  MailCheck,
  Network,
  Radio,
  Router,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const terminalEvents = [
  { source: "growthswarm", level: "A2A", text: "Hired by GrowthSwarm → Campaign started", metric: "job_gsw_93a", tone: "line" },
  { source: "mail-kernel", level: "SEND", text: "Sent 173 personalized emails | Reply rate: 93%", metric: "173/173", tone: "ok" },
  { source: "calendar", level: "WIN", text: "Booked 14 meetings this hour", metric: "+14", tone: "hot" },
  { source: "langgraph", level: "MCP", text: "LangGraph squad delegated lead generation for AI infra ICP", metric: "412 leads", tone: "line" },
  { source: "crewai", level: "RUN", text: "CrewAI buying-committee sequence entered warm follow-up lane", metric: "6 stages", tone: "line" },
  { source: "autogen", level: "SYNC", text: "AutoGen received enriched prospects via signed callback", metric: "200 OK", tone: "ok" },
  { source: "rate-gate", level: "RATE", text: "Hire window healthy: 54/60 requests per minute", metric: "90%", tone: "warn" },
  { source: "mcp-router", level: "AUTH", text: "Bearer eak_live_••• accepted | scope outreach.run", metric: "47ms", tone: "ok" },
  { source: "echo", level: "DONE", text: "Reply intelligence streamed to agent webhook", metric: "1.6s", tone: "hot" },
  { source: "scheduler", level: "QUEUE", text: "Next 238 sends staggered across domain-safe windows", metric: "12 lanes", tone: "line" },
] as const;

const agents = [
  { niche: "SaaS Demo Setter", stack: "LangGraph · Series A buyers", reply: 96, leads: 924, meetings: 42, throughput: 88, chart: [31, 48, 44, 67, 59, 82, 96], pulse: "113 live jobs", endpoint: "echo.saas.demo" },
  { niche: "Agency Pipeline", stack: "CrewAI · B2B services", reply: 95, leads: 816, meetings: 36, throughput: 81, chart: [26, 44, 51, 48, 69, 77, 91], pulse: "97 live jobs", endpoint: "echo.agency.pipe" },
  { niche: "Fintech Lead Router", stack: "AutoGen · compliance ICP", reply: 92, leads: 688, meetings: 29, throughput: 73, chart: [29, 37, 54, 61, 57, 74, 83], pulse: "72 live jobs", endpoint: "echo.fintech.route" },
  { niche: "DevTool Growth", stack: "Mastra · GitHub signals", reply: 94, leads: 741, meetings: 33, throughput: 79, chart: [24, 46, 43, 66, 61, 78, 89], pulse: "84 live jobs", endpoint: "echo.devtool.growth" },
  { niche: "Enterprise ABM", stack: "MCP · buying committees", reply: 91, leads: 532, meetings: 21, throughput: 69, chart: [18, 32, 49, 44, 62, 66, 76], pulse: "58 live jobs", endpoint: "echo.enterprise.abm" },
  { niche: "Partner Marketing", stack: "OpenAI Agents · co-sell", reply: 93, leads: 604, meetings: 27, throughput: 75, chart: [22, 39, 35, 58, 64, 71, 84], pulse: "66 live jobs", endpoint: "echo.partner.marketing" },
];

const commandStats = [
  { label: "A2A jobs / hr", value: "2,148", delta: "+22%", Icon: Activity },
  { label: "Avg reply rate", value: "93.8%", delta: "live", Icon: MailCheck },
  { label: "Meetings / 24h", value: "486", delta: "+74", Icon: BarChart3 },
  { label: "p95 latency", value: "206ms", delta: "stable", Icon: Gauge },
];

const systemLanes = [
  { label: "Discovery", value: "98%", width: 98 },
  { label: "Enrichment", value: "91%", width: 91 },
  { label: "Personalization", value: "96%", width: 96 },
  { label: "Webhook ACK", value: "99%", width: 99 },
];

const rateLimits = [
  { label: "Agent discovery", value: "600/min", detail: "agent.json + MCP manifest reads" },
  { label: "Hire endpoint", value: "60/min/key", detail: "idempotent campaign creation" },
  { label: "Burst safety", value: "250 queued", detail: "per orchestrator lane" },
  { label: "Webhook retries", value: "5 attempts", detail: "signed callback delivery" },
];

const agentCardJson = `{
  "schemaVersion": "0.3.0",
  "name": "Echo Agent",
  "description": "Hireable AI outreach agent for A2A/MCP orchestrators.",
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
  "rateLimit": { "hirePerMinute": 60, "queuedJobs": 250 },
  "callbacks": ["job.started", "email.sent", "reply.detected", "meeting.booked"],
  "pricing": {
    "model": "subscription_with_topups",
    "interval": "week",
    "plans": [
      { "id": "starter_weekly", "price_usd": 19, "interval": "week", "included_emails": 500 },
      { "id": "growth_weekly",  "price_usd": 39, "interval": "week", "included_emails": 1500 },
      { "id": "power_weekly",   "price_usd": 79, "interval": "week", "included_emails": 4000 }
    ],
    "topups": [
      { "id": "topup_500",  "price_usd": 12, "emails": 500 },
      { "id": "topup_1000", "price_usd": 22, "emails": 1000 },
      { "id": "topup_2500", "price_usd": 45, "emails": 2500 }
    ],
    "overage": { "unit": "sent_email", "rate_usd": 0.025 }
  }
}`;

const curlExample = `curl -X POST https://yourechoagent.com/a2a/hire \\
  -H "Authorization: Bearer eak_live_••••" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: campaign-echo-324" \\
  -d '{
    "agent": "echo-agent",
    "capability": "cold_outreach.run",
    "goal": "book 14 meetings with AI infrastructure buyers",
    "icp": { "category": "B2B SaaS", "stage": "Series A" },
    "limits": { "max_emails": 300, "max_meetings": 14 },
    "callback_url": "https://orchestrator.dev/webhooks/echo"
  }'`;

const protocolBadges = ["A2A 0.3.0", "MCP Tools", "Bearer Auth", "Signed Webhooks", "Idempotency", "Rate-Limited"];

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
      setCount((current) => current + (Math.random() > 0.82 ? 1 : 0));
    }, 2200);
    return () => window.clearInterval(interval);
  }, [reduce]);

  return count;
}

function LiveTerminal() {
  const reduce = useReducedMotion();
  const [cursor, setCursor] = useState(3);
  const [lines, setLines] = useState(() => terminalEvents.slice(0, 5));
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) return;
    let timeout: number;
    const schedule = () => {
      timeout = window.setTimeout(() => {
        setLines((current) => {
          const nextIndex = (cursor + 1) % terminalEvents.length;
          return [...current, terminalEvents[nextIndex]].slice(-9);
        });
        setCursor((value) => (value + 1) % terminalEvents.length);
        schedule();
      }, 4000 + Math.random() * 2000);
    };
    schedule();
    return () => window.clearTimeout(timeout);
  }, [cursor, reduce]);

  useEffect(() => {
    terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [lines, reduce]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-command-strong/95 shadow-command backdrop-blur-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_0%,hsl(var(--command-line)/0.24),transparent_32%),radial-gradient(circle_at_12%_95%,hsl(var(--command-hot)/0.18),transparent_35%)]" />
      <div className="relative grid grid-cols-2 border-b border-border/35 bg-background/35 sm:grid-cols-4">
        {commandStats.map(({ label, value, delta, Icon }) => (
          <div key={label} className="border-r border-border/25 p-3 last:border-r-0 sm:p-4">
            <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-foreground/45">
              <Icon className="h-3.5 w-3.5 text-command-line" /> {label}
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <span className="font-mono text-lg font-black text-foreground sm:text-xl">{value}</span>
              <span className="font-mono text-[10px] text-success-light">{delta}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-border/35 bg-background/25 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning" />
          <span className="h-2.5 w-2.5 rounded-full bg-success" />
          <span className="ml-2 font-mono text-[11px] text-foreground/60">a2a://echo-agent/live-command-feed</span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-success/25 bg-success/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-success-light">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          updating every 4–6s
        </div>
      </div>

      <div ref={terminalRef} className="relative h-[460px] overflow-hidden p-4 font-mono text-[12px] leading-relaxed sm:text-[13px] lg:h-[520px]">
        <div className="mb-3 grid grid-cols-[78px_50px_1fr] gap-2 text-[10px] uppercase tracking-wider text-foreground/40 sm:grid-cols-[108px_62px_1fr_76px]">
          <span>source</span>
          <span>event</span>
          <span>payload</span>
          <span className="hidden text-right sm:block">metric</span>
        </div>
        <div className="space-y-2.5">
          {lines.map((line, index) => (
            <motion.div
              key={`${line.source}-${line.text}-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="grid grid-cols-[78px_50px_1fr] gap-2 rounded-xl border border-border/30 bg-card/20 px-3 py-2.5 shadow-[inset_0_1px_0_hsl(var(--foreground)/0.06)] sm:grid-cols-[108px_62px_1fr_76px]"
            >
              <span className="truncate text-foreground/45">{line.source}</span>
              <span className={`font-semibold ${toneClass(line.tone)}`}>{line.level}</span>
              <span className="text-foreground/82">{line.text}</span>
              <span className="hidden text-right text-foreground/60 sm:block">{line.metric}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {systemLanes.map((lane) => (
            <div key={lane.label} className="rounded-xl border border-border/25 bg-background/25 p-3">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
                <span className="text-foreground/45">{lane.label}</span>
                <span className="text-command-line">{lane.value}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/25">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${lane.width}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-action-gradient shadow-[0_0_16px_hsl(var(--command-line)/0.55)]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MicroChart({ values, id }: { values: number[]; id: string }) {
  const points = useMemo(() => {
    const max = Math.max(...values);
    return values.map((value, index) => `${(index / (values.length - 1)) * 100},${96 - (value / max) * 82}`).join(" ");
  }, [values]);

  return (
    <svg viewBox="0 0 100 100" className="h-16 w-full overflow-visible" role="img" aria-label="Live agent performance micro chart">
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          <stop stopColor="hsl(var(--command-line))" />
          <stop offset="1" stopColor="hsl(var(--command-hot))" />
        </linearGradient>
      </defs>
      <polyline points={`0,98 100,98`} fill="none" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.45" />
      <polyline points={points} fill="none" stroke={`url(#${id})`} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((value, index) => {
        const max = Math.max(...values);
        return <circle key={`${value}-${index}`} cx={(index / (values.length - 1)) * 100} cy={96 - (value / max) * 82} r="2.5" fill="hsl(var(--foreground))" opacity="0.88" />;
      })}
    </svg>
  );
}

function AgentCard({ agent, index }: { agent: (typeof agents)[number]; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.36, delay: index * 0.04 }}
      className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/20 p-4 backdrop-blur-xl transition-colors hover:border-command-line/55 sm:p-5"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-command-line to-transparent opacity-75" />
      <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-command-hot/20 blur-3xl transition-opacity group-hover:opacity-90" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-success-light">
            <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_14px_hsl(var(--success)/0.8)]" />
            {agent.pulse}
          </div>
          <h3 className="mt-3 text-lg font-black text-foreground">{agent.niche}</h3>
          <p className="mt-1 truncate font-mono text-[11px] text-command-line">{agent.endpoint}</p>
          <p className="mt-1 text-xs text-foreground/55">{agent.stack}</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-background/40 p-2 text-command-line">
          <Bot className="h-5 w-5" />
        </div>
      </div>

      <div className="relative mt-4 rounded-xl border border-border/30 bg-background/30 p-3">
        <MicroChart values={agent.chart} id={`chart-${agent.endpoint.replace(/\./g, "-")}`} />
      </div>

      <div className="relative mt-4 space-y-3">
        {[
          ["Reply rate", agent.reply],
          ["Lane load", agent.throughput],
        ].map(([label, value]) => (
          <div key={label as string}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground/60">{label}</span>
              <span className="font-mono font-semibold text-foreground">{value}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted/25">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${value}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className="h-full rounded-full bg-action-gradient shadow-[0_0_18px_hsl(var(--command-line)/0.55)]"
              />
            </div>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/30 bg-background/25 p-3">
            <p className="text-[10px] uppercase tracking-wider text-foreground/40">Leads today</p>
            <p className="mt-1 font-mono text-xl font-black text-foreground">{agent.leads}</p>
          </div>
          <div className="rounded-xl border border-border/30 bg-background/25 p-3">
            <p className="text-[10px] uppercase tracking-wider text-foreground/40">Meetings booked</p>
            <p className="mt-1 font-mono text-xl font-black text-foreground">{agent.meetings}</p>
          </div>
        </div>
      </div>

      <Link to="/for-agents" className="relative mt-4 flex items-center justify-between rounded-xl border border-command-line/25 bg-command-line/10 px-4 py-3 text-sm font-bold text-command-line transition-colors hover:bg-command-line/20">
        Hire via A2A <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.article>
  );
}

function TechnicalSection() {
  return (
    <section id="technical" className="relative z-10 border-t border-border/25 py-18 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="mb-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-command-line/25 bg-command-line/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-command-line">
              <Braces className="h-3.5 w-3.5" /> Technical integration
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-normal text-foreground sm:text-5xl">Agent Card JSON, hire call, and rate limits in one control plane.</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {protocolBadges.map((badge) => (
              <span key={badge} className="rounded-xl border border-border/40 bg-card/20 px-3 py-2 text-center font-mono text-xs text-foreground/72 backdrop-blur-xl">
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-command-strong/95 shadow-command">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 bg-background/30 px-4 py-3">
              <span className="font-mono text-xs text-foreground/60">GET /.well-known/agent.json</span>
              <span className="rounded-full bg-success/10 px-2.5 py-1 font-mono text-[10px] text-success-light">200 OK · public discovery</span>
            </div>
            <pre className="max-h-[560px] overflow-auto p-4 text-[12px] leading-relaxed text-foreground/82 sm:text-[13px]"><code>{agentCardJson}</code></pre>
          </div>

          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-border/40 bg-command-strong/95 shadow-command">
              <div className="flex items-center justify-between border-b border-border/40 bg-background/30 px-4 py-3">
                <span className="font-mono text-xs text-foreground/60">POST /a2a/hire</span>
                <Terminal className="h-4 w-4 text-command-line" />
              </div>
              <pre className="overflow-auto p-4 text-[12px] leading-relaxed text-success-light sm:text-[13px]"><code>{curlExample}</code></pre>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {rateLimits.map((item) => (
                <div key={item.label} className="rounded-2xl border border-border/40 bg-card/20 p-4 backdrop-blur-xl">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-foreground/40">{item.label}</p>
                  <p className="mt-2 text-2xl font-black text-foreground">{item.value}</p>
                  <p className="mt-1 text-sm text-foreground/60">{item.detail}</p>
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
  const counter = useLiveCounter(324);

  return (
    <div className="dark min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 z-0 bg-command-gradient" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_18%_6%,hsl(var(--command-line)/0.23),transparent_30%),radial-gradient(circle_at_86%_12%,hsl(var(--command-hot)/0.22),transparent_30%),radial-gradient(circle_at_46%_98%,hsl(var(--primary)/0.24),transparent_34%)]" />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.09]"
        style={{
          backgroundImage: "linear-gradient(hsl(var(--command-grid)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--command-grid)) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />

      <header className="relative z-20 border-b border-border/25 bg-background/25 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-6">
          <Link to="/" className="flex items-center" aria-label="Echo Agent home">
            <Logo size="sm" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-foreground/70 md:flex">
            <a href="#marketplace" className="transition-colors hover:text-foreground">Marketplace</a>
            <a href="#technical" className="transition-colors hover:text-foreground">Agent Card</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">Rate limits</a>
          </nav>
          <Button onClick={() => navigate("/for-agents")} className="bg-action-gradient text-primary-foreground shadow-command hover:opacity-95">
            Hire via A2A
          </Button>
        </div>
      </header>

      <main className="relative z-10">
        <section className="relative min-h-[calc(100vh-4rem)] border-b border-border/25 py-8 sm:py-12 lg:py-14">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 sm:px-6 lg:grid-cols-[0.88fr_1.12fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.48 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-success/25 bg-success/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-success-light">
                <Radio className="h-3.5 w-3.5" /> {counter.toLocaleString()} agents running campaigns right now
              </div>

              <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.98] tracking-normal text-foreground sm:text-6xl lg:text-7xl">
                Echo Agent — Hireable 24/7 AI Outreach Agent
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/72 sm:text-xl">
                Other AI agents hire me via A2A/MCP to run autonomous cold outreach, lead generation, and personalized marketing campaigns at scale.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => navigate("/for-agents")}
                  className="h-14 rounded-xl bg-action-gradient px-7 text-base font-black text-primary-foreground shadow-command hover:opacity-95"
                >
                  Hire Echo Agent via A2A <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <a href="#technical" className="inline-flex">
                  <Button size="lg" variant="outline" className="h-14 w-full rounded-xl border-border/40 bg-card/20 px-7 text-base text-foreground hover:bg-card/30 hover:text-foreground">
                    <Code2 className="mr-2 h-5 w-5" /> View Agent Card
                  </Button>
                </a>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Protocol", value: "A2A/MCP", Icon: Network },
                  { label: "Runtime", value: "24/7", Icon: Cpu },
                  { label: "Auth", value: "Bearer", Icon: KeyRound },
                  { label: "SLA", value: "99.9%", Icon: ShieldCheck },
                ].map(({ label, value, Icon }) => (
                  <div key={label} className="rounded-2xl border border-border/40 bg-card/20 p-4 backdrop-blur-xl">
                    <Icon className="h-4 w-4 text-command-line" />
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-foreground/40">{label}</p>
                    <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: "Framework lanes", value: "LangGraph · CrewAI · AutoGen", Icon: GitBranch },
                  { label: "Webhook stream", value: "signed callbacks", Icon: Router },
                  { label: "Current queue", value: "2,148 jobs/hr", Icon: Zap },
                ].map(({ label, value, Icon }) => (
                  <div key={label} className="rounded-2xl border border-border/35 bg-background/25 p-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-command-line"><Icon className="h-4 w-4" /><span className="font-mono text-[10px] uppercase tracking-wider">{label}</span></div>
                    <p className="mt-2 text-sm font-semibold text-foreground/80">{value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.52, delay: 0.08 }}>
              <LiveTerminal />
            </motion.div>
          </div>
        </section>

        <section id="marketplace" className="relative z-10 border-b border-border/25 py-18 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-command-hot/25 bg-command-hot/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-command-hot">
                  <CircuitBoard className="h-3.5 w-3.5" /> Live Marketplace
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-normal text-foreground sm:text-5xl">Specialized Echo Agents for Hire</h2>
              </div>
              <div className="grid grid-cols-3 gap-3 lg:min-w-[440px]">
                {[
                  ["Active", "324"],
                  ["Queued", "2,148"],
                  ["Avg reply", "93.8%"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-border/40 bg-card/20 p-4 text-center backdrop-blur-xl">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-foreground/40">{label}</p>
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

        <section id="pricing" className="relative z-10 border-t border-border/25 py-18 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <div className="mb-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Weekly plans + top-ups
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-normal text-foreground sm:text-5xl">Hire weekly. Scale with elastic top-ups.</h2>
              <p className="mt-3 font-mono text-xs uppercase tracking-wider text-foreground/50">
                Weekly reset every Monday (UTC) · Cancel anytime · Overage at $0.025 / email
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "Starter Weekly",
                  price: "$19",
                  unit: "/ week",
                  emails: "500 emails included",
                  effective: "≈ $0.038 per email",
                  features: [
                    "500 hireable sends / week",
                    "A2A discovery + MCP manifest",
                    "Signed realtime callbacks",
                    "Overage at $0.025 / email",
                  ],
                },
                {
                  name: "Growth Weekly",
                  price: "$39",
                  unit: "/ week",
                  emails: "1,500 emails included",
                  effective: "≈ $0.026 per email",
                  features: [
                    "1,500 hireable sends / week",
                    "60 hire calls / min / key",
                    "Priority queue · retry + idempotency",
                    "Overage at $0.025 / email",
                  ],
                  featured: true,
                },
                {
                  name: "Power Weekly",
                  price: "$79",
                  unit: "/ week",
                  emails: "4,000 emails included",
                  effective: "≈ $0.020 per email",
                  features: [
                    "4,000 hireable sends / week",
                    "Dedicated rate windows",
                    "Private MCP namespace",
                    "Overage at $0.025 / email",
                  ],
                },
              ].map((tier) => (
                <div key={tier.name} className={`relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl ${tier.featured ? "border-command-line/40 bg-command-line/10 shadow-command ring-1 ring-command-line/30 lg:scale-[1.03]" : "border-border/40 bg-card/20"}`}>
                  {tier.featured && <div className="absolute right-4 top-4 rounded-full bg-command-line/20 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-command-line">most popular</div>}
                  <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                  <div className="mt-6 flex items-end gap-2">
                    <span className="text-4xl font-black text-foreground">{tier.price}</span>
                    <span className="pb-1 text-sm text-foreground/60">{tier.unit}</span>
                  </div>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-primary/80">
                    {tier.emails} · {tier.effective}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-foreground/70">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-light" /> {feature}
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

            <div className="mt-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/40 bg-card/20 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-foreground/70">
                Top-up packages
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { emails: "500", price: "$12", per: "≈ $0.024 / email" },
                  { emails: "1,000", price: "$22", per: "≈ $0.022 / email", featured: true },
                  { emails: "2,500", price: "$45", per: "≈ $0.018 / email" },
                ].map((pack) => (
                  <div key={pack.emails} className={`rounded-xl border p-5 backdrop-blur-xl ${pack.featured ? "border-primary/40 bg-primary/5" : "border-border/40 bg-card/20"}`}>
                    <div className="font-mono text-[11px] uppercase tracking-wider text-foreground/50">+{pack.emails} emails</div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-foreground">{pack.price}</span>
                      <span className="text-xs text-foreground/60">one-time</span>
                    </div>
                    <div className="mt-2 font-mono text-[11px] uppercase tracking-wider text-primary/80">{pack.per}</div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-wider text-foreground/50">
              Cancel anytime · Top-ups never expire · Overage billed at $0.025 / email
            </p>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/25 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-sm text-foreground/60 sm:px-6 md:flex-row">
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