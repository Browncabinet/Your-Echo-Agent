import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, Bot, Check, Cpu, Globe, Link as LinkIcon, Mail,
  Sparkles, Terminal, Zap, ShieldCheck, Activity, Users, Code2,
  Building2, Rocket, Briefcase, Home as HomeIcon, GraduationCap, Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

/* ------------------------------------------------------------------ */
/*  Live terminal feed                                                */
/* ------------------------------------------------------------------ */
const FEED_LINES: { tone: "ok" | "info" | "warn" | "wow"; text: string }[] = [
  { tone: "ok",   text: "Sent personalized email to Sarah Chen @ AcmeCorp — 94% open probability" },
  { tone: "info", text: "Researching prospect: alex.rivera@northwind.io …" },
  { tone: "wow",  text: "Reply from Alex Rivera — meeting booked for Tue, Jun 18 @ 10:30" },
  { tone: "ok",   text: "Found 27 new leads in SaaS / Series-A vertical" },
  { tone: "info", text: "Drafting follow-up #2 for 14 cold prospects" },
  { tone: "ok",   text: "Sent personalized email to Priya Natarajan @ Loopwork — 88% open prob." },
  { tone: "warn", text: "Skipped 3 leads — failed deliverability check (good!)" },
  { tone: "ok",   text: "Cloned new agent: Indie-Hacker-Agent-#312 — online" },
  { tone: "wow",  text: "Closed deal: $4,800 MRR via outbound — agent #208" },
  { tone: "info", text: "A2A request received from claude-orchestrator — hiring agent" },
  { tone: "ok",   text: "Sent LinkedIn draft to Jordan Mehta — awaiting your 1-tap approval" },
  { tone: "wow",  text: "Reply rate today: 31.4% across 1,284 sends" },
];

function LiveTerminal() {
  const [lines, setLines] = useState(() => FEED_LINES.slice(0, 5));
  const [tick, setTick] = useState(0);
  const reduce = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setLines((prev) => {
        const next = FEED_LINES[(prev.length + tick) % FEED_LINES.length];
        const out = [...prev, next];
        return out.slice(-9);
      });
      setTick((t) => t + 1);
    }, 2200);
    return () => clearInterval(id);
  }, [tick, reduce]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  const toneColor = (tone: string) =>
    tone === "ok"   ? "text-emerald-400"
    : tone === "wow" ? "text-fuchsia-300"
    : tone === "warn"? "text-amber-300"
    : "text-sky-300";

  return (
    <div className="relative rounded-2xl border border-white/10 bg-slate-950/70 backdrop-blur-xl shadow-[0_0_60px_-15px_rgba(99,102,241,0.5)] overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-3 text-xs font-mono text-white/60">agent://echo/live</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          LIVE · 347 agents running
        </div>
      </div>
      {/* body */}
      <div
        ref={scrollRef}
        className="h-[340px] overflow-hidden px-4 py-3 font-mono text-[12.5px] leading-relaxed space-y-1.5"
      >
        {lines.map((l, i) => (
          <motion.div
            key={`${i}-${l.text}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex gap-2"
          >
            <span className="text-white/30 shrink-0">{new Date(Date.now() - (lines.length - i) * 2200).toLocaleTimeString([], {hour12: false})}</span>
            <span className={toneColor(l.tone)}>›</span>
            <span className="text-white/85">{l.text}</span>
          </motion.div>
        ))}
      </div>
      {/* footer metrics */}
      <div className="grid grid-cols-3 border-t border-white/10 bg-white/[0.02]">
        {[
          { k: "Emails / hr", v: "1,284" },
          { k: "Reply rate",  v: "31.4%" },
          { k: "Meetings",    v: "47" },
        ].map((m) => (
          <div key={m.k} className="px-4 py-3 border-r border-white/10 last:border-r-0">
            <div className="text-[10px] uppercase tracking-wider text-white/40">{m.k}</div>
            <div className="text-base font-semibold text-white">{m.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Agent cards                                                       */
/* ------------------------------------------------------------------ */
const AGENTS = [
  { icon: Rocket,        name: "SaaS Founder Agent",  niche: "B2B SaaS",       reply: 89, sent: 412, meetings: 14, score: 96, accent: "from-indigo-500 to-fuchsia-500" },
  { icon: HomeIcon,      name: "Real Estate Closer",  niche: "Realtors",       reply: 76, sent: 318, meetings: 22, score: 91, accent: "from-emerald-400 to-cyan-500" },
  { icon: Code2,         name: "Indie Hacker Agent",  niche: "Solo devs",      reply: 81, sent: 184, meetings:  9, score: 88, accent: "from-amber-400 to-rose-500" },
  { icon: Briefcase,     name: "Agency Growth Agent", niche: "Agencies",       reply: 72, sent: 521, meetings: 18, score: 93, accent: "from-sky-400 to-indigo-500" },
  { icon: GraduationCap, name: "Coach & Creator Bot", niche: "Course creators",reply: 84, sent: 247, meetings: 11, score: 90, accent: "from-fuchsia-400 to-pink-500" },
  { icon: Megaphone,     name: "PR / Media Pitcher",  niche: "Founders / PR",  reply: 68, sent: 196, meetings:  7, score: 87, accent: "from-violet-400 to-blue-500" },
];

function AgentCard({ a, i }: { a: (typeof AGENTS)[number]; i: number }) {
  const Icon = a.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, delay: i * 0.05 }}
      className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 overflow-hidden hover:border-white/20 transition-colors"
    >
      <div className={`absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${a.accent} opacity-20 blur-3xl group-hover:opacity-30 transition-opacity`} />
      <div className="flex items-start justify-between relative">
        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${a.accent} flex items-center justify-center shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          LIVE
        </div>
      </div>
      <h3 className="mt-4 text-white font-semibold">{a.name}</h3>
      <p className="text-xs text-white/50">{a.niche}</p>

      <div className="mt-4 space-y-2.5">
        <Metric label="Reply rate"      value={`${a.reply}%`} pct={a.reply} />
        <Metric label="Sent today"      value={a.sent.toString()} pct={Math.min(100, (a.sent / 600) * 100)} />
        <Metric label="Meetings booked" value={a.meetings.toString()} pct={Math.min(100, (a.meetings / 25) * 100)} />
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-wider text-white/40">Success score</div>
        <div className="text-sm font-mono text-white">{a.score}<span className="text-white/40">/100</span></div>
      </div>
    </motion.div>
  );
}

function Metric({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-white/50">{label}</span>
        <span className="text-white font-mono">{value}</span>
      </div>
      <div className="mt-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Clone box                                                         */
/* ------------------------------------------------------------------ */
function CloneBox() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<"idle" | "detecting" | "ready">("idle");
  const navigate = useNavigate();

  function go() {
    if (!url) { navigate("/auth"); return; }
    setPhase("detecting");
    setTimeout(() => setPhase("ready"), 1400);
  }

  return (
    <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/60 via-slate-950/80 to-slate-950/80 p-6 md:p-8 shadow-[0_0_80px_-20px_rgba(99,102,241,0.6)]">
      <div className="flex items-center gap-2 text-xs font-mono text-white/50 mb-3">
        <Sparkles className="h-3.5 w-3.5 text-fuchsia-300" />
        INSTANT CLONE · 60-second setup
      </div>
      <h3 className="text-2xl md:text-3xl font-bold text-white">Paste any URL to clone yourself</h3>
      <p className="mt-1.5 text-white/60 text-sm">Twitter, LinkedIn, your website — we detect your voice and build the agent.</p>

      <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
        <div className="flex-1 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 focus-within:border-indigo-400 transition-colors">
          <LinkIcon className="h-4 w-4 text-white/40" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://twitter.com/yourhandle"
            className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none text-sm"
          />
        </div>
        <Button
          onClick={go}
          size="lg"
          className="h-[50px] px-6 bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-400 hover:to-fuchsia-400 text-white shadow-[0_0_30px_-8px_rgba(168,85,247,0.7)] gap-2"
        >
          {phase === "ready" ? "​Fast Track Ready — Continue" : "​Fast Track Now"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {phase !== "idle" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 font-mono text-xs space-y-1.5"
        >
          <Detected ok label="Twitter handle detected — 2,418 posts indexed" />
          <Detected ok label="LinkedIn profile detected — voice profile built" />
          <Detected ok label="Website crawled — niche: B2B SaaS, ICP scored" />
          {phase === "ready" ? (
            <Detected ok bold label="Agent cloned. Ready to send first batch." />
          ) : (
            <div className="text-white/50 flex items-center gap-2 pt-1">
              <span className="h-2 w-2 rounded-full bg-fuchsia-400 animate-pulse" />
              Generating voice fingerprint…
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function Detected({ ok, label, bold }: { ok?: boolean; label: string; bold?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${bold ? "text-white" : "text-white/70"}`}>
      <Check className={`h-3.5 w-3.5 ${ok ? "text-emerald-400" : "text-white/40"}`} />
      <span className={bold ? "font-semibold" : ""}>{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Agent card preview (A2A)                                          */
/* ------------------------------------------------------------------ */
function A2ASection() {
  const cardJson = `{
  "schemaVersion": "0.3.0",
  "name": "Your Echo Agent",
  "homepage": "https://yourechoagent.com",
  "capabilities": [
    "email_outreach",
    "lead_research",
    "linkedin_assist"
  ],
  "protocol": "a2a/0.3.0",
  "auth": { "type": "bearer", "prefix": "eak_" },
  "rateLimit": { "defaultPerMinute": 60 }
}`;
  const curl = `curl -X POST https://yourechoagent.com/api/a2a/hire \\
  -H "Authorization: Bearer eak_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "agent": "saas-founder", "leads": 200 }'`;

  return (
    <section id="for-agents" className="relative py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-mono text-white/70">
            <Cpu className="h-3 w-3" /> FOR AI AGENTS · A2A / MCP NATIVE
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl font-bold text-white">
            Other agents can hire your clone
          </h2>
          <p className="mt-3 text-white/60">
            Echo Agent ships an A2A-compliant agent card. Discover, authenticate, and delegate outreach jobs programmatically — no human in the loop.
          </p>
        </div>

        <div className="mt-10 grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
              <span className="text-xs font-mono text-white/60">/.well-known/agent.json</span>
              <span className="text-[10px] font-mono text-emerald-300">200 OK</span>
            </div>
            <pre className="p-4 text-xs font-mono text-white/80 overflow-x-auto">{cardJson}</pre>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                <span className="text-xs font-mono text-white/60">$ hire agent</span>
                <Terminal className="h-3.5 w-3.5 text-white/40" />
              </div>
              <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap">{curl}</pre>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { k: "A2A 0.3.0",  v: "compliant" },
                { k: "MCP",         v: "ready" },
                { k: "Rate limit",  v: "60 / min" },
                { k: "Idempotency", v: "24h window" },
              ].map((b) => (
                <div key={b.k} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div className="text-[10px] uppercase tracking-wider text-white/40">{b.k}</div>
                  <div className="text-sm text-white font-medium">{b.v}</div>
                </div>
              ))}
            </div>

            <Link to="/for-agents" className="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200">
              Read the full A2A docs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Pricing                                                           */
/* ------------------------------------------------------------------ */
const TIERS = [
  {
    name: "Starter Clone",
    price: "$19",
    cadence: "/ week",
    desc: "Clone yourself + run one niche agent.",
    features: ["1 cloned agent", "500 emails/week", "Reply inbox + AI drafts", "Email tracking"],
    cta: "Start Clone",
  },
  {
    name: "Growth",
    price: "$39",
    cadence: "/ week",
    desc: "Most popular — for founders scaling outbound.",
    features: ["3 cloned agents", "2,000 emails/week", "LinkedIn assist + drafts", "Priority deliverability", "Lead discovery"],
    cta: "Go Growth",
    highlight: true,
  },
  {
    name: "Power / A2A",
    price: "$79",
    cadence: "/ week",
    desc: "For agencies + agent platforms hiring via A2A.",
    features: ["Unlimited agents", "10,000 emails/week", "A2A + MCP endpoints", "Usage-based A2A pricing", "White-label option"],
    cta: "Hire via A2A",
  },
];

function Pricing() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white">Pricing that scales with sends</h2>
          <p className="mt-3 text-white/60">Weekly billing. Cancel anytime. A2A jobs are metered per-run.</p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {TIERS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`relative rounded-2xl border p-6 backdrop-blur-xl ${
                t.highlight
                  ? "border-indigo-400/40 bg-gradient-to-br from-indigo-950/80 to-fuchsia-950/40 shadow-[0_0_60px_-15px_rgba(168,85,247,0.5)]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {t.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white tracking-wider">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-white text-lg font-semibold">{t.name}</h3>
              <p className="text-white/50 text-sm mt-1">{t.desc}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{t.price}</span>
                <span className="text-white/50 text-sm">{t.cadence}</span>
              </div>
              <ul className="mt-5 space-y-2.5 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-white/75">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="block mt-6">
                <Button
                  className={`w-full ${
                    t.highlight
                      ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-400 hover:to-fuchsia-400 text-white"
                      : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                  }`}
                >
                  {t.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Steps                                                             */
/* ------------------------------------------------------------------ */
const STEPS = [
  { icon: LinkIcon, t: "Paste your URL", d: "Twitter, LinkedIn, or website — we ingest your voice in seconds." },
  { icon: Bot,      t: "We clone you",   d: "An agent learns your tone, ICP, and writing style." },
  { icon: Mail,     t: "Agent goes live",d: "It sends, replies, and books meetings 24/7 — you approve hot ones." },
  { icon: Activity, t: "You review",     d: "Daily AI summary, hot replies, and one-tap escalations." },
];

/* ------------------------------------------------------------------ */
/*  Landing                                                           */
/* ------------------------------------------------------------------ */
export default function Landing() {
  const navigate = useNavigate();
  const counter = useLiveCounter(347, 0.04);

  return (
    <div className="dark min-h-screen bg-[#0a0a18] text-white overflow-x-hidden relative">
      {/* ambient backdrops */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-fuchsia-600/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(99,102,241,0.15),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      {/* NAV */}
      <header className="relative z-20 border-b border-white/5 backdrop-blur-md bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center"><Logo size="sm" /></Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-white/70">
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#agents" className="hover:text-white">Agents</a>
            <a href="#for-agents" className="hover:text-white">For AI agents</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="text-sm text-white/70 hover:text-white px-3 py-1.5">Sign in</Link>
            <Button onClick={() => navigate("/auth")} className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-400 hover:to-fuchsia-400 text-white">
              ​Fast Track
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10 pt-14 pb-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-mono text-white/70">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              {counter.toLocaleString()} agents already running
            </span>

            <h1 className="mt-5 text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight">
              Your Personal AI Outreach Agent{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-emerald-300 bg-clip-text text-transparent">
                That Never Sleeps
              </span>
            </h1>

            <p className="mt-5 text-lg text-white/70 max-w-xl leading-relaxed">
              Paste any URL — Twitter, LinkedIn, your website. We clone you into an autonomous agent that sends personalized cold emails, finds leads, and books meetings 24/7.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="h-14 px-7 text-base bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-400 hover:to-fuchsia-400 text-white shadow-[0_0_40px_-8px_rgba(168,85,247,0.8)] gap-2"
              >
                ​Fast Track <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/for-agents")}
                className="h-14 px-7 text-base bg-white/[0.04] border-white/15 text-white hover:bg-white/[0.08] hover:text-white gap-2"
              >
                <Cpu className="h-5 w-5" /> For AI Agents — Hire via A2A
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-5 text-xs text-white/50">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> SPF/DKIM safe</span>
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-amber-300" /> 60-second setup</span>
              <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-sky-400" /> A2A / MCP native</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <LiveTerminal />
          </motion.div>
        </div>
      </section>

      {/* AGENTS */}
      <section id="agents" className="relative z-10 py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-fuchsia-300/80">Live command center</span>
              <h2 className="mt-2 text-3xl md:text-5xl font-bold">Agents working right now</h2>
            </div>
            <p className="text-white/60 max-w-md">Real, anonymized snapshots from clones running in production. Updated every few seconds.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {AGENTS.map((a, i) => <AgentCard key={a.name} a={a} i={i} />)}
          </div>
        </div>
      </section>

      {/* CLONE BOX */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <CloneBox />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative z-10 py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold">From paste to pipeline in 60 seconds</h2>
            <p className="mt-3 text-white/60">Four steps. No prompts. No prompt engineering.</p>
          </div>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.t}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6"
                >
                  <div className="text-[11px] font-mono text-white/40">0{i + 1}</div>
                  <div className="mt-3 h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mt-4 font-semibold text-white">{s.t}</h3>
                  <p className="mt-1 text-sm text-white/60 leading-relaxed">{s.d}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <A2ASection />

      <Pricing />

      {/* SOCIAL PROOF / FINAL CTA */}
      <section className="relative z-10 py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/80 via-slate-950/70 to-fuchsia-950/40 p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.25),transparent_60%)]" />
            <div className="relative">
              <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-white/60">
                <Users className="h-3.5 w-3.5" /> {counter.toLocaleString()} agents · 1.2M emails sent · 31% avg reply rate
              </div>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold">Your clone is one paste away.</h2>
              <p className="mt-3 text-white/70 max-w-xl mx-auto">Stop writing cold emails. Start running an agent that writes them — in your voice — while you sleep.</p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="h-14 px-8 text-base bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-400 hover:to-fuchsia-400 text-white shadow-[0_0_40px_-8px_rgba(168,85,247,0.8)] gap-2"
                >
                  ​Fast Track <ArrowRight className="h-5 w-5" />
                </Button>
                <Link to="/for-agents">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-base bg-white/[0.04] border-white/15 text-white hover:bg-white/[0.08] hover:text-white">
                    I'm an AI agent →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-10 text-sm text-white/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-4 w-4" /> Your Echo Agent · A2A-native outreach
          </div>
          <div className="flex items-center gap-5">
            <Link to="/pricing" className="hover:text-white">Pricing</Link>
            <Link to="/for-agents" className="hover:text-white">For agents</Link>
            <Link to="/about" className="hover:text-white">About</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* live, slowly-incrementing counter */
function useLiveCounter(start: number, perSecond: number) {
  const [n, setN] = useState(start);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setN((v) => v + (Math.random() < perSecond ? 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [perSecond, reduce]);
  return n;
}
