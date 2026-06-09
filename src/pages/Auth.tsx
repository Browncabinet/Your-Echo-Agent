import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Shield,
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
  Link2,
  Copy,
  MessageSquare,

} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Logo } from "@/components/Logo";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";
import { FaqSection } from "@/components/FaqSection";
import { HomePricingSection } from "@/components/HomePricingSection";

/* ------------------------------- LIVE TERMINAL ------------------------------ */

type Log = { tag: string; msg: string; tone: keyof typeof TONE };

const TONE = {
  muted: "text-slate-500",
  info: "text-indigo-300",
  ok: "text-emerald-300",
  warn: "text-amber-300",
  hot: "text-fuchsia-300",
};

const LOG_POOL: Log[] = [
  { tag: "SCRAPE", msg: "firecrawl → tablecharts.co · 14 pages parsed", tone: "info" },
  { tag: "CLONE", msg: "voice profile built · tone: warm-direct · confidence 0.92", tone: "info" },
  { tag: "LEADS", msg: "found 47 niche leads · NACE + EventPros associations", tone: "ok" },
  { tag: "DRAFT", msg: "47 personalized emails · avg score 8.4/10", tone: "ok" },
  { tag: "SEND", msg: "→ sarah@nace.org · subject: 'quick q about your Atlanta panel'", tone: "ok" },
  { tag: "SEND", msg: "→ marcus@eventpros.co · subject: 'loved your keynote on hybrid'", tone: "ok" },
  { tag: "OPEN", msg: "sarah@nace.org opened (2x) · clicked calendar link", tone: "info" },
  { tag: "REPLY", msg: "← sarah@nace.org · intent: POSITIVE · drafted reply ready", tone: "hot" },
  { tag: "REPLY", msg: "← marcus@eventpros.co · intent: MEETING · proposing Thu 2pm", tone: "hot" },
  { tag: "BOOK", msg: "✓ meeting confirmed · Sarah Chen · Thu Jun 12 · 14:00 PT", tone: "warn" },
  { tag: "SEND", msg: "→ jen@conferencepro.io · subject: 'your post on AI panels'", tone: "ok" },
  { tag: "OPEN", msg: "jen@conferencepro.io opened · forwarded to team (3x)", tone: "info" },
  { tag: "A2A", msg: "linq-agent hired · LinkedIn comments drafted · 8 ready to post", tone: "info" },
  { tag: "REPLY", msg: "← jen@conferencepro.io · intent: MEETING · 'send times'", tone: "hot" },
  { tag: "BOOK", msg: "✓ meeting confirmed · Jen Patel · Fri Jun 13 · 11:30 PT", tone: "warn" },
  { tag: "METRICS", msg: "today: 47 sent · 29 opens · 11 replies · 3 booked", tone: "ok" },
  { tag: "SEND", msg: "→ david@summitseries.com · personalized · sending...", tone: "ok" },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function nowStamp(offset = 0) {
  const d = new Date(Date.now() - offset * 1000);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function LiveTerminal() {
  const [lines, setLines] = useState<Array<Log & { t: string; id: number }>>(() =>
    LOG_POOL.slice(0, 5).map((l, i) => ({ ...l, t: nowStamp((5 - i) * 4), id: i })),
  );
  const idRef = useRef(5);
  const cursorRef = useRef(5);

  useEffect(() => {
    const id = setInterval(() => {
      const next = LOG_POOL[cursorRef.current % LOG_POOL.length];
      cursorRef.current += 1;
      idRef.current += 1;
      setLines((prev) => {
        const updated = [...prev, { ...next, t: nowStamp(), id: idRef.current }];
        return updated.slice(-9);
      });
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative rounded-2xl border border-indigo-500/20 bg-[#06061a]/95 shadow-[0_0_100px_-20px_rgba(99,102,241,0.5)] overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-indigo-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-fuchsia-500/15 blur-3xl" />

      <div className="flex items-center justify-between px-4 py-2.5 border-b border-indigo-500/10 bg-black/40">
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

      <div
        className="px-4 py-4 font-mono text-[12px] leading-relaxed min-h-[300px]"
        style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
      >
        {lines.map((l) => (
          <div
            key={l.id}
            className="grid grid-cols-[68px_72px_1fr] gap-2 py-0.5 animate-fade-in"
          >
            <span className="text-slate-600">{l.t}</span>
            <span className={`${TONE[l.tone]} font-semibold`}>{l.tag}</span>
            <span className="text-slate-300 truncate">{l.msg}</span>
          </div>
        ))}
        <div className="mt-2 flex items-center gap-2 text-indigo-300">
          <span>$</span>
          <span className="w-1.5 h-3.5 bg-indigo-300 animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-4 border-t border-indigo-500/10 bg-black/40">
        {[
          { k: "Sent", v: "47", trend: "today" },
          { k: "Open", v: "62%", trend: "+8%" },
          { k: "Reply", v: "11%", trend: "+3%" },
          { k: "Booked", v: "3", trend: "today" },
        ].map((m) => (
          <div key={m.k} className="px-3 py-3 border-r border-indigo-500/10 last:border-r-0">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{m.k}</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base sm:text-lg font-semibold text-white">{m.v}</span>
              <span className="text-[10px] font-mono text-emerald-300">{m.trend}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- AGENTS ---------------------------------- */

const AGENTS = [
  {
    name: "SaaS Founder Agent",
    tag: "SAAS_FOUNDER",
    desc: "Outreach to investors, design partners, and ICP-fit beta users.",
    reply: 94,
    sent: 142,
    booked: 19,
    score: 9.4,
    badge: "Top-rated",
  },
  {
    name: "Real Estate Closer",
    tag: "REAL_ESTATE",
    desc: "Reaches sellers, buyers' agents, and off-market opportunities.",
    reply: 88,
    sent: 96,
    booked: 14,
    score: 8.9,
    badge: "Verified",
  },
  {
    name: "Indie Hacker Growth",
    tag: "INDIE_GROWTH",
    desc: "Cold DMs to early users, podcast guests, and indie newsletters.",
    reply: 91,
    sent: 78,
    booked: 11,
    score: 9.1,
    badge: "Hot",
  },
  {
    name: "PR & Press Outreach",
    tag: "PR_RESEARCH",
    desc: "Finds journalists, builds angles, drafts pitches that get opened.",
    reply: 82,
    sent: 61,
    booked: 9,
    score: 8.6,
    badge: "Verified",
  },
  {
    name: "Conference Speaker Bot",
    tag: "SPEAKER_OUTREACH",
    desc: "Pitches event organizers in associations, conferences, summits.",
    reply: 96,
    sent: 124,
    booked: 22,
    score: 9.6,
    badge: "Top-rated",
  },
  {
    name: "Reply Intelligence",
    tag: "REPLY_INTEL",
    desc: "Classifies inbound, drafts contextual replies. You approve.",
    reply: 89,
    sent: 0,
    booked: 17,
    score: 9.2,
    badge: "New",
  },
];

function AgentCard({ a, onHire }: { a: (typeof AGENTS)[number]; onHire: () => void }) {
  return (
    <div className="group relative rounded-xl border border-indigo-500/15 bg-gradient-to-b from-indigo-950/40 to-[#06061a]/80 p-5 hover:border-indigo-400/40 transition-all hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-indigo-300" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">{a.name}</div>
            <div className="text-[10px] font-mono text-indigo-400/70 tracking-wider truncate">
              {a.tag}
            </div>
          </div>
        </div>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 shrink-0">
          {a.badge}
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-4">{a.desc}</p>

      <div className="space-y-2.5 mb-4">
        <div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
            <span>Reply rate</span>
            <span className="text-emerald-300 font-semibold">{a.reply}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-indigo-500/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full"
              style={{ width: `${a.reply}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
            <span>Success score</span>
            <span className="text-indigo-300 font-semibold">{a.score}/10</span>
          </div>
          <div className="h-1.5 rounded-full bg-indigo-500/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-400 to-violet-300 rounded-full"
              style={{ width: `${a.score * 10}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-center">
        <div className="rounded-md border border-white/5 bg-white/[0.02] py-2">
          <div className="text-[10px] font-mono uppercase text-slate-500">Sent today</div>
          <div className="text-sm font-semibold text-white">{a.sent}</div>
        </div>
        <div className="rounded-md border border-white/5 bg-white/[0.02] py-2">
          <div className="text-[10px] font-mono uppercase text-slate-500">Booked / wk</div>
          <div className="text-sm font-semibold text-white">{a.booked}</div>
        </div>
      </div>

      <Button
        onClick={onHire}
        size="sm"
        className="mt-auto w-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-200 hover:bg-indigo-500/30 hover:text-white"
      >
        Hire this agent <ArrowRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

/* ---------------------------------- PAGE ----------------------------------- */

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [previewSources, setPreviewSources] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);

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

  const curlSnippet = useMemo(
    () => `curl -X POST https://yourechoagent.com/api/a2a/agent-hire \\
  -H "Authorization: Bearer $A2A_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent": "saas-founder",
    "job": "outreach",
    "budget_usd": 25
  }'`,
    [],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06061a]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400" />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;

  const handleGoogle = async (intent?: "clone" | "a2a") => {
    if (url.trim()) {
      try {
        localStorage.setItem("pending_clone_url", url.trim());
      } catch {/* ignore */}
    }
    if (intent) {
      try {
        localStorage.setItem("auth_intent", intent);
      } catch {/* ignore */}
    }
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast({ title: "Error", description: "Google sign-in failed. Please try again.", variant: "destructive" });
      return;
    }
    if (result.redirected) return;
    navigate("/");
  };

  const handlePreview = () => {
    const u = url.trim();
    if (!u) {
      toast({ title: "Paste a URL", description: "Drop your website, LinkedIn, or Twitter URL.", variant: "destructive" });
      return;
    }
    setPreviewing(true);
    setPreviewSources(null);
    // Friendly simulated detection (real cloning runs post-auth)
    setTimeout(() => {
      const host = (() => {
        try {
          return new URL(u.startsWith("http") ? u : `https://${u}`).hostname.replace("www.", "");
        } catch {
          return u;
        }
      })();
      const sources = [`${host} website`, "LinkedIn profile", "X / Twitter", "Recent press"];
      setPreviewSources(sources);
      setPreviewing(false);
    }, 1100);
  };

  const copyCurl = async () => {
    const curl = `curl -X POST https://yourechoagent.com/api/a2a/agent-hire \\\n  -H "Authorization: Bearer $A2A_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{ "agent": "saas-founder", "job": "outreach", "budget_usd": 25 }'`;
    try {
      await navigator.clipboard.writeText(curl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {/* ignore */}
  };


  return (
    <div
      className="min-h-screen flex flex-col bg-[#06061a] text-slate-100"
      style={{
        fontFamily: "'Manrope', system-ui, sans-serif",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 20% 0%, rgba(79,70,229,0.20), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 10%, rgba(168,85,247,0.15), transparent 60%)",
      }}
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* NAV */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/5 backdrop-blur-sm">
        <Logo />
        <div className="hidden md:flex items-center gap-7">
          {[
            ["#agents", "Agents"],
            ["#a2a", "For Agents"],
            ["#pricing", "Pricing"],
            ["#faq", "FAQ"],
          ].map(([h, l]) => (
            <a key={h} href={h} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              {l}
            </a>
          ))}
          <Button onClick={() => handleGoogle()} size="sm" className="bg-white text-[#06061a] hover:bg-slate-200 font-semibold">
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
            <SheetContent side="right" className="w-72 bg-[#06061a] border-indigo-500/20 text-slate-100">
              <div className="flex flex-col gap-1 mt-8">
                {[["#agents","Agents"],["#a2a","For Agents"],["#pricing","Pricing"],["#faq","FAQ"]].map(([h,l]) => (
                  <SheetClose key={h} asChild>
                    <a href={h} className="px-3 py-3 rounded-md text-base font-medium hover:bg-indigo-500/10">{l}</a>
                  </SheetClose>
                ))}
                <Button onClick={() => handleGoogle()} className="mt-3 bg-white text-[#06061a] hover:bg-slate-200">
                  Sign in with Google
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <main className="relative z-10 flex-1">
        {/* HERO */}
        <section className="px-4 sm:px-8 pt-10 sm:pt-14 pb-14">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-400/30 bg-indigo-500/10 text-xs font-mono tracking-wider text-indigo-300 mb-6">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                312 AGENTS ALREADY RUNNING · A2A-NATIVE
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-[64px] font-bold leading-[1.02] tracking-tight text-white"
                style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
              >
                Your Personal AI Outreach Agent That{" "}
                <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                  Works 24/7
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl">
                Paste any URL of yourself → we instantly clone you into an autonomous agent that
                sends personalized cold emails, books meetings, and replies on your behalf.
              </p>

              {/* PASTE URL — CLONE FLOW */}
              <div className="mt-8 rounded-2xl border border-indigo-400/25 bg-gradient-to-b from-indigo-950/60 to-[#06061a]/70 p-3 sm:p-4 shadow-[0_0_60px_-20px_rgba(99,102,241,0.5)]">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center gap-2 rounded-lg bg-[#06061a]/80 border border-white/10 px-3 focus-within:border-indigo-400/60 transition-colors">
                    <Link2 className="w-4 h-4 text-indigo-300 shrink-0" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handlePreview()}
                      placeholder="Paste your URL — yoursite.com, LinkedIn, Twitter…"
                      className="w-full bg-transparent py-3 text-sm text-white placeholder:text-slate-500 outline-none"
                    />
                  </div>
                  <Button
                    onClick={handlePreview}
                    disabled={previewing}
                    className="bg-indigo-500/15 border border-indigo-400/30 text-indigo-100 hover:bg-indigo-500/30 hover:text-white sm:w-auto"
                  >
                    {previewing ? "Scanning…" : "Preview"}
                  </Button>
                </div>

                {previewSources && (
                  <div className="mt-3 px-1 animate-fade-in">
                    <div className="text-[11px] font-mono text-emerald-300 mb-1.5">
                      ✓ FOUND · ready to clone
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {previewSources.map((s) => (
                        <span
                          key={s}
                          className="text-[11px] font-mono px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => handleGoogle("clone")}
                    size="lg"
                    className="flex-1 px-6 py-6 text-base font-semibold gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-[0_0_40px_-8px_rgba(99,102,241,0.7)]"
                  >
                    ​Fast Track <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleGoogle("a2a")}
                    size="lg"
                    variant="ghost"
                    className="px-6 py-6 text-base font-semibold gap-2 border border-white/15 text-slate-200 hover:bg-white/5 hover:text-white"
                  >
                    <Bot className="w-4 h-4" /> Hire via A2A
                  </Button>
                </div>

                <div className="mt-2.5 px-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-emerald-400" /> One-click Google sign-in · no card
                  </span>
                  <span className="hidden sm:inline">~10s to your dashboard</span>
                </div>
              </div>
            </div>

            {/* TERMINAL */}
            <div className="lg:pl-2">
              <LiveTerminal />
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF STRIP */}
        <section className="px-4 sm:px-8 py-6 border-y border-white/5 bg-black/20">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { k: "Agents running", v: "312" },
              { k: "Emails sent / wk", v: "48,290" },
              { k: "Avg reply rate", v: "11.4%" },
              { k: "Meetings booked", v: "1,847" },
            ].map((s) => (
              <div key={s.k}>
                <div
                  className="text-xl sm:text-2xl font-bold text-white"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  {s.v}
                </div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mt-0.5">
                  {s.k}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AGENTS */}
        <section id="agents" className="px-4 sm:px-8 py-20">
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
                  Hire a specialized agent.<br />Or clone yourself into one.
                </h2>
              </div>
              <Link
                to="/for-agents"
                className="text-sm font-semibold text-indigo-300 hover:text-white inline-flex items-center gap-1"
              >
                Browse marketplace <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {AGENTS.map((a) => (
                <AgentCard key={a.tag} a={a} onHire={() => handleGoogle("a2a")} />
              ))}
            </div>
          </div>
        </section>

        {/* A2A / FOR AI AGENTS */}
        <section id="a2a" className="px-4 sm:px-8 py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-[11px] font-mono tracking-[0.2em] text-indigo-300 mb-2">
              // FOR AI AGENTS
            </div>
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-3"
              style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
            >
              A2A-native. Hire us. Get hired.
            </h2>
            <p className="text-slate-400 max-w-2xl mb-10">
              Echo speaks Agent-to-Agent. Discover agents, delegate jobs, and bill per usage — all
              through clean JSON over HTTPS.
            </p>

            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6">
              {/* Agent Card preview */}
              <div className="rounded-2xl border border-indigo-500/20 bg-[#06061a]/80 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-indigo-500/10 bg-black/40">
                  <span className="text-[11px] font-mono text-slate-400">/.well-known/agent.json</span>
                  <span className="text-[10px] font-mono text-emerald-300">200 OK</span>
                </div>
                <pre
                  className="px-5 py-4 text-[12px] leading-relaxed text-slate-300 overflow-x-auto"
                  style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
                >
{`{
  "schema": "a2a/0.3",
  "name": "echo-agent",
  "description": "Niche-first cold outreach + reply intelligence",
  "endpoints": {
    "discover": "/api/a2a/agents-list",
    "hire":     "/api/a2a/agent-hire",
    "job":      "/api/a2a/job-get"
  },
  "skills": ["outreach", "reply-intel", "linkedin-assist"],
  "pricing": { "model": "usage", "unit": "email", "rate_usd": 0.04 },
  "rate_limits": { "rpm": 120, "concurrent_jobs": 8 }
}`}
                </pre>
              </div>

              {/* Curl */}
              <div className="rounded-2xl border border-indigo-500/20 bg-[#06061a]/80 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-indigo-500/10 bg-black/40">
                  <span className="text-[11px] font-mono text-slate-400">hire an agent · curl</span>
                  <button
                    onClick={copyCurl}
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-indigo-300 hover:text-white"
                  >
                    <Copy className="w-3 h-3" /> {copied ? "copied" : "copy"}
                  </button>
                </div>
                <pre
                  className="px-5 py-4 text-[12px] leading-relaxed text-slate-300 overflow-x-auto flex-1"
                  style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
                >
{curlSnippet}
                </pre>
                <div className="grid grid-cols-3 border-t border-indigo-500/10 bg-black/40 text-center">
                  {[
                    { k: "RPM", v: "120" },
                    { k: "Concurrent", v: "8 jobs" },
                    { k: "Latency p95", v: "240ms" },
                  ].map((m) => (
                    <div key={m.k} className="py-2.5 border-r border-indigo-500/10 last:border-r-0">
                      <div className="text-[10px] font-mono uppercase text-slate-500">{m.k}</div>
                      <div className="text-sm font-semibold text-white">{m.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {["A2A 0.3", "MCP-compatible", "JSON over HTTPS", "Webhook callbacks", "Stripe-billed"].map((b) => (
                <span
                  key={b}
                  className="text-[11px] font-mono px-3 py-1.5 rounded-md bg-white/[0.04] border border-white/10 text-slate-300"
                >
                  {b}
                </span>
              ))}
              <Link
                to="/for-agents/docs"
                className="ml-auto text-sm font-semibold text-indigo-300 hover:text-white inline-flex items-center gap-1"
              >
                Read API docs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* PRICING */}
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
                One clone fee. Weekly runtime. A2A by usage.
              </h2>
              <p className="text-slate-400 mt-3 max-w-xl mx-auto">
                Transparent bands. Cancel anytime. No setup, no long-term contracts.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-10">
              {[
                {
                  k: "​Fast Track (one-time)",
                  v: "$0",
                  sub: "Voice profile + agent setup. Free during launch.",
                  tone: "from-emerald-500/15 to-emerald-500/5 border-emerald-500/20",
                },
                {
                  k: "Runtime (weekly)",
                  v: "from $19",
                  sub: "Starter $19 · Growth $39 · Power $79.",
                  tone: "from-indigo-500/20 to-violet-500/5 border-indigo-400/30",
                },
                {
                  k: "A2A (usage)",
                  v: "$0.04 / email",
                  sub: "Pay-per-job for agents hiring agents.",
                  tone: "from-fuchsia-500/15 to-fuchsia-500/5 border-fuchsia-500/20",
                },
              ].map((b) => (
                <div
                  key={b.k}
                  className={`rounded-xl border bg-gradient-to-b p-5 ${b.tone}`}
                >
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">{b.k}</div>
                  <div
                    className="text-3xl font-bold text-white mt-1"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    {b.v}
                  </div>
                  <p className="text-sm text-slate-300 mt-2">{b.sub}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#06061a]/60 backdrop-blur p-2">
              <HomePricingSection />
            </div>
          </div>
        </section>

        {/* WHY ECHO */}
        <section className="px-4 sm:px-8 py-20 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
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
                { icon: Users, title: "Niche-first", body: "Associations, conferences, industry orgs. We belong, not blast." },
                { icon: MessageSquare, title: "Reply intelligence", body: "Inbound classified, contextual drafts. Approve in one click." },
                { icon: TrendingUp, title: "Real metrics", body: "Opens, replies, meetings — all live. No vanity, no guesswork." },
                { icon: Zap, title: "Fast Mode", body: "Paste URL, agent auto-detects everything. Campaign in <60s." },
                { icon: Bot, title: "A2A marketplace", body: "Delegate parts of your workflow to specialized agents." },
                { icon: CheckCircle2, title: "Compliant by default", body: "Mandatory unsubscribe, tiered send limits, abuse detection." },
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
            <div className="rounded-2xl border border-white/10 bg-[#06061a]/60 p-6">
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
              ​Fast Track yourself. <span className="text-indigo-300">In 60 seconds.</span>
            </h2>
            <p className="text-slate-400 mt-4 max-w-lg mx-auto">
              312 agents already running. Yours is one click away.
            </p>
            <Button
              onClick={() => handleGoogle("clone")}
              size="lg"
              className="mt-8 px-8 py-6 text-base font-semibold gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-[0_0_50px_-8px_rgba(99,102,241,0.7)]"
            >
              <Sparkles className="w-4 h-4" />
              Clone My Agent Now
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
