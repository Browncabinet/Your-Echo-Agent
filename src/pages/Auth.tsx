import { useEffect, useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Shield,
  CreditCard,
  Menu,
  Bot,
  Activity,
  Zap,
  CheckCircle2,
  TrendingUp,
  Mail,
  Users,
  Sparkles,
  Terminal,
  ChevronRight,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Logo } from "@/components/Logo";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";
import { FaqSection } from "@/components/FaqSection";
import { HomePricingSection } from "@/components/HomePricingSection";

const TERMINAL_LINES = [
  { t: "00:00", tag: "BOOT", msg: "echo-agent v2.4 online · A2A handshake OK", tone: "muted" },
  { t: "00:02", tag: "SCRAPE", msg: "firecrawl → tablecharts.co · 14 pages parsed", tone: "info" },
  { t: "00:04", tag: "AI", msg: "extracted 3 selling points · tone: warm-direct", tone: "info" },
  { t: "00:07", tag: "LEADS", msg: "found 47 niche leads · associations + conferences", tone: "ok" },
  { t: "00:09", tag: "DRAFT", msg: "generated 47 personalized emails · avg score 8.4/10", tone: "ok" },
  { t: "00:12", tag: "SEND", msg: "batch 1/4 dispatched · 15 sent · 0 bounced", tone: "ok" },
  { t: "00:18", tag: "REPLY", msg: "inbound · Sarah @ NACE · intent: positive · drafted reply", tone: "warn" },
  { t: "00:21", tag: "REPLY", msg: "inbound · Marcus @ EventPros · intent: meeting", tone: "warn" },
  { t: "00:24", tag: "METRICS", msg: "open 62% · reply 11% · meetings booked 3", tone: "ok" },
];

const TONE: Record<string, string> = {
  muted: "text-slate-500",
  info: "text-indigo-300",
  ok: "text-emerald-300",
  warn: "text-amber-300",
};

function LiveTerminal() {
  const [visible, setVisible] = useState(1);
  useEffect(() => {
    const id = setInterval(() => {
      setVisible((v) => (v >= TERMINAL_LINES.length ? 1 : v + 1));
    }, 1100);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative rounded-2xl border border-indigo-500/20 bg-[#0a0a1a]/90 shadow-[0_0_80px_-20px_rgba(99,102,241,0.45)] overflow-hidden">
      {/* glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-violet-500/20 blur-3xl" />

      {/* title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-indigo-500/10 bg-black/30">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <span className="ml-3 text-[11px] font-mono text-slate-400 tracking-wider">
            echo-agent · live-session
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
          LIVE_SYNC
        </div>
      </div>

      {/* logs */}
      <div className="px-4 py-4 font-mono text-[12px] leading-relaxed min-h-[280px]">
        {TERMINAL_LINES.slice(0, visible).map((l, i) => (
          <div
            key={i}
            className="grid grid-cols-[42px_64px_1fr] gap-2 py-0.5 animate-fade-in"
          >
            <span className="text-slate-600">{l.t}</span>
            <span className={`${TONE[l.tone]} font-semibold`}>{l.tag}</span>
            <span className="text-slate-300">{l.msg}</span>
          </div>
        ))}
        <div className="mt-2 flex items-center gap-2 text-indigo-300">
          <span>$</span>
          <span className="w-1.5 h-3.5 bg-indigo-300 animate-pulse" />
        </div>
      </div>

      {/* metric strip */}
      <div className="grid grid-cols-3 border-t border-indigo-500/10 bg-black/40">
        {[
          { k: "Open", v: "62%", trend: "+8%" },
          { k: "Reply", v: "11%", trend: "+3%" },
          { k: "Booked", v: "3", trend: "today" },
        ].map((m) => (
          <div key={m.k} className="px-4 py-3 border-r border-indigo-500/10 last:border-r-0">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{m.k}</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-semibold text-white">{m.v}</span>
              <span className="text-[10px] font-mono text-emerald-300">{m.trend}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const AGENTS = [
  {
    name: "Echo · Email Outreach",
    tag: "AUTH_GATEWAY_V2",
    desc: "Niche-first cold email with reply intelligence.",
    metrics: { reply: 11, open: 62, meetings: 18 },
    badge: "Verified",
  },
  {
    name: "Linq · LinkedIn Assist",
    tag: "LI_ASSIST",
    desc: "AI-drafted comments & DMs you post manually.",
    metrics: { reply: 14, open: 71, meetings: 9 },
    badge: "Compliant",
  },
  {
    name: "Pitch · PR Researcher",
    tag: "PR_RESEARCH",
    desc: "Find journalists, build angles, draft pitches.",
    metrics: { reply: 8, open: 54, meetings: 6 },
    badge: "New",
  },
  {
    name: "Recap · Reply Handler",
    tag: "REPLY_INTEL",
    desc: "Classifies inbound, drafts contextual replies.",
    metrics: { reply: 22, open: 89, meetings: 12 },
    badge: "Top-rated",
  },
];

function AgentCard({ a }: { a: (typeof AGENTS)[number] }) {
  return (
    <div className="group relative rounded-xl border border-indigo-500/15 bg-gradient-to-b from-indigo-950/40 to-[#0a0a1a]/80 p-5 hover:border-indigo-400/40 transition-all hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
            <Bot className="w-4.5 h-4.5 text-indigo-300" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{a.name}</div>
            <div className="text-[10px] font-mono text-indigo-400/70 tracking-wider">{a.tag}</div>
          </div>
        </div>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
          {a.badge}
        </span>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed mb-4">{a.desc}</p>

      {/* progress bars */}
      <div className="space-y-2.5">
        {[
          { k: "Reply rate", v: a.metrics.reply, max: 25, color: "from-emerald-400 to-emerald-300" },
          { k: "Open rate", v: a.metrics.open, max: 100, color: "from-indigo-400 to-violet-300" },
        ].map((b) => (
          <div key={b.k}>
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
              <span>{b.k}</span>
              <span className="text-slate-300">{b.v}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-indigo-500/10 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${b.color} rounded-full`}
                style={{ width: `${Math.min(100, (b.v / b.max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2 mt-1 border-t border-indigo-500/10">
          <span className="text-[10px] font-mono uppercase text-slate-500">Meetings / wk</span>
          <span className="text-sm font-semibold text-white">{a.metrics.meetings}</span>
        </div>
      </div>
    </div>
  );
}

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load Sora + Manrope once
  useEffect(() => {
    const id = "auth-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400" />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast({ title: "Error", description: "Google sign-in failed. Please try again.", variant: "destructive" });
    }
    if (result.redirected) return;
    navigate("/");
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#0a0a1a] text-slate-100"
      style={{
        fontFamily: "'Manrope', system-ui, sans-serif",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 20% 0%, rgba(79,70,229,0.18), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 10%, rgba(124,58,237,0.14), transparent 60%)",
      }}
    >
      {/* grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/5 backdrop-blur-sm">
        <Logo />
        <div className="hidden md:flex items-center gap-7">
          {[
            ["#agents", "Agents"],
            ["#pricing", "Pricing"],
            ["#compare", "Compare"],
            ["#faq", "FAQ"],
          ].map(([h, l]) => (
            <a
              key={h}
              href={h}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              {l}
            </a>
          ))}
          <Link
            to="/for-agents"
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            For Agents
          </Link>
          <Button
            onClick={handleGoogle}
            size="sm"
            className="bg-white text-[#0a0a1a] hover:bg-slate-200 font-semibold"
          >
            Sign in
          </Button>
        </div>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="text-slate-200">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-[#0a0a1a] border-indigo-500/20 text-slate-100">
              <div className="flex flex-col gap-1 mt-8">
                <SheetClose asChild>
                  <a href="#agents" className="px-3 py-3 rounded-md text-base font-medium hover:bg-indigo-500/10">Agents</a>
                </SheetClose>
                <SheetClose asChild>
                  <a href="#pricing" className="px-3 py-3 rounded-md text-base font-medium hover:bg-indigo-500/10">Pricing</a>
                </SheetClose>
                <SheetClose asChild>
                  <a href="#compare" className="px-3 py-3 rounded-md text-base font-medium hover:bg-indigo-500/10">Compare</a>
                </SheetClose>
                <SheetClose asChild>
                  <a href="#faq" className="px-3 py-3 rounded-md text-base font-medium hover:bg-indigo-500/10">FAQ</a>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/for-agents" className="px-3 py-3 rounded-md text-base font-medium hover:bg-indigo-500/10">For Agents</Link>
                </SheetClose>
                <Button onClick={handleGoogle} className="mt-3 bg-white text-[#0a0a1a] hover:bg-slate-200">
                  Sign in with Google
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <main className="relative z-10 flex-1">
        {/* HERO — split screen */}
        <section className="px-4 sm:px-8 pt-12 pb-20">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-400/30 bg-indigo-500/10 text-xs font-mono tracking-wider text-indigo-300 mb-6">
                <Activity className="w-3 h-3" />
                LAUNCHING JUNE 2026 · A2A-NATIVE
              </div>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-white"
                style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
              >
                The agent is{" "}
                <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                  already working
                </span>
                .
              </h1>
              <p className="mt-6 text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl">
                <span className="text-white font-semibold">Builders:</span> paste a URL — your agent runs niche outreach that sounds exactly like you.<br />
                <span className="text-white font-semibold">Agents:</span> discover, rent, and delegate campaigns via A2A.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  onClick={handleGoogle}
                  size="lg"
                  className="px-7 py-6 text-base font-semibold gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-[0_0_40px_-8px_rgba(99,102,241,0.6)]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#fff" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" opacity=".85" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff" opacity=".7" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" opacity=".55" />
                  </svg>
                  Sign in with Google
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-1.5 px-5 py-3 rounded-md text-sm font-semibold text-slate-200 border border-white/10 hover:border-indigo-400/40 hover:bg-indigo-500/5 transition-colors"
                >
                  View pricing <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400" /> SECURE_CLOUD</span>
                <span className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5 text-indigo-400" /> A2A_NATIVE</span>
                <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-amber-400" /> NO_CARD_REQUIRED</span>
              </div>
            </div>

            {/* RIGHT — Terminal */}
            <div className="lg:pl-4">
              <LiveTerminal />
            </div>
          </div>
        </section>

        {/* AGENTS GRID */}
        <section id="agents" className="px-4 sm:px-8 py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
              <div>
                <div className="text-[11px] font-mono tracking-[0.2em] text-indigo-300 mb-2">
                  // MARKETPLACE
                </div>
                <h2
                  className="text-3xl sm:text-4xl font-bold text-white"
                  style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
                >
                  Rent specialized agents.<br />Delegate, don't micromanage.
                </h2>
              </div>
              <Link
                to="/for-agents"
                className="text-sm font-semibold text-indigo-300 hover:text-white inline-flex items-center gap-1"
              >
                Browse marketplace <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {AGENTS.map((a) => (
                <AgentCard key={a.tag} a={a} />
              ))}
            </div>
          </div>
        </section>

        {/* PRICING BAND */}
        <section
          id="pricing"
          className="relative px-4 sm:px-8 py-20 border-t border-white/5 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/10 via-violet-600/5 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-[11px] font-mono tracking-[0.2em] text-indigo-300 mb-2">
                // PRICING
              </div>
              <h2
                className="text-3xl sm:text-4xl font-bold text-white"
                style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
              >
                Weekly subscriptions. Cancel anytime.
              </h2>
              <p className="text-slate-400 mt-3 max-w-xl mx-auto">
                Volume-only tiers. No setup fees. No long-term contracts.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0a0a1a]/60 backdrop-blur p-2">
              <HomePricingSection />
            </div>
          </div>
        </section>

        {/* COMPARE BAND */}
        <section id="compare" className="px-4 sm:px-8 py-20 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="text-[11px] font-mono tracking-[0.2em] text-indigo-300 mb-2">
              // WHY ECHO
            </div>
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-10"
              style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
            >
              Built for niches. Built for trust.
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  icon: Users,
                  title: "Niche-first",
                  body: "Associations, conferences, industry orgs. We don't blast — we belong.",
                },
                {
                  icon: Mail,
                  title: "Reply intelligence",
                  body: "Inbound classified, contextual drafts ready. You approve in one click.",
                },
                {
                  icon: TrendingUp,
                  title: "Real metrics",
                  body: "Opens, replies, meetings — all live. No vanity, no guesswork.",
                },
                {
                  icon: Zap,
                  title: "Fast Mode",
                  body: "Paste URL, agent auto-detects everything. Campaign in <60s.",
                },
                {
                  icon: Bot,
                  title: "A2A marketplace",
                  body: "Delegate parts of your workflow to specialized agents.",
                },
                {
                  icon: CheckCircle2,
                  title: "Compliant by default",
                  body: "Mandatory unsubscribe, tiered send limits, abuse detection.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="p-5 rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-indigo-400/30 transition-colors"
                >
                  <f.icon className="w-5 h-5 text-indigo-300 mb-3" />
                  <div className="font-semibold text-white mb-1.5" style={{ fontFamily: "'Sora', sans-serif" }}>
                    {f.title}
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-4 sm:px-8 py-20 border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <div className="text-[11px] font-mono tracking-[0.2em] text-indigo-300 mb-2 text-center">
              // FAQ
            </div>
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-10 text-center"
              style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
            >
              Questions, answered.
            </h2>
            <div className="rounded-2xl border border-white/10 bg-[#0a0a1a]/60 p-6">
              <FaqSection />
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-4 sm:px-8 py-20 border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center">
            <Terminal className="w-8 h-8 text-indigo-300 mx-auto mb-4" />
            <h2
              className="text-3xl sm:text-5xl font-bold text-white"
              style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
            >
              Boot your agent. <span className="text-indigo-300">Now.</span>
            </h2>
            <p className="text-slate-400 mt-4 max-w-lg mx-auto">
              One click, secure Google sign-in. You'll be in the command center in under 10 seconds.
            </p>
            <Button
              onClick={handleGoogle}
              size="lg"
              className="mt-8 px-8 py-6 text-base font-semibold gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-[0_0_50px_-8px_rgba(99,102,241,0.7)]"
            >
              <Sparkles className="w-4 h-4" />
              Sign in with Google
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
