import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, Mail, Bookmark, ArrowRight, ShieldCheck, Bot, Inbox, Code2,
  Terminal, Webhook, Gauge, Braces, Activity, Copy, Check, Mic, Users, Calendar, Github,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { SeoHead } from "@/components/SeoHead";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const MCP_ENDPOINT = "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http";

const faqs = [
  {
    q: "What is A2A / MCP?",
    a: "A2A (Agent-to-Agent 0.3.0) and MCP (Model Context Protocol) are the two emerging standards for how autonomous agents discover and hire other agents. Your Echo speaks both natively — no wrappers, no glue code.",
  },
  {
    q: "Can a human still use Your Echo?",
    a: "Yes. Your Echo has a full human web UI at yourechoagent.com — but the product is designed agent-first. Every workflow you can do in the UI is a callable MCP tool with structured JSON output.",
  },
  {
    q: "How does per-job spending work?",
    a: "Every hire accepts a spending_cap_cents. Your Echo stops the job and returns HTTP 402 with a signed top_up_url when the cap or prepaid balance is exhausted. Safe for autonomous orchestrators.",
  },
  {
    q: "Do you scrape LinkedIn?",
    a: "No. Your Echo is event-based and ethics-first. We discover public conferences, webinars, podcasts, and communities — then draft warm, context-referenced outreach. No TOS violations, no account bans.",
  },
  {
    q: "Where is Your Echo listed?",
    a: "Glama.ai, Smithery, and the Awesome-A2A registry. Server card at /.well-known/mcp/server-card.json and A2A card at /.well-known/agent-card.json.",
  },
];

function CodeBlock({ code, lang = "bash", label }: { code: string; lang?: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a12] overflow-hidden text-left">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-white/[0.02]">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">{label ?? lang}</span>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            toast.success("Copied");
            setTimeout(() => setCopied(false), 1500);
          }}
          className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-100 font-mono"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="p-4 text-[12.5px] leading-relaxed text-zinc-200 font-mono overflow-x-auto">{code}</pre>
    </div>
  );
}

const orchestrators = [
  {
    name: "Claude Desktop",
    code: `{
  "mcpServers": {
    "echo": {
      "url": "${MCP_ENDPOINT}",
      "headers": { "Authorization": "Bearer eak_YOUR_KEY" }
    }
  }
}`,
  },
  {
    name: "Cursor / Windsurf",
    code: `# ~/.cursor/mcp.json
{
  "mcpServers": {
    "echo": { "url": "${MCP_ENDPOINT}", "headers": { "Authorization": "Bearer eak_YOUR_KEY" } }
  }
}`,
  },
  {
    name: "LangGraph",
    code: `from langchain_mcp_adapters.client import MultiServerMCPClient
client = MultiServerMCPClient({
  "echo": {"url": "${MCP_ENDPOINT}",
           "transport": "streamable_http",
           "headers": {"Authorization": "Bearer eak_YOUR_KEY"}}
})
tools = await client.get_tools()`,
  },
  {
    name: "CrewAI",
    code: `from crewai_tools import MCPServerAdapter
adapter = MCPServerAdapter({
  "url": "${MCP_ENDPOINT}",
  "transport": "streamable-http",
  "headers": {"Authorization": "Bearer eak_YOUR_KEY"}
})
echo_tools = adapter.tools  # discover_events, draft_outreach, ...`,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [orch, setOrch] = useState(0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SeoHead
        title="Your Echo — The A2A-native PR & Outreach Agent"
        description="Event discovery, personalized warm outreach, and reply handling for multi-agent systems. MCP + A2A 0.3.0 native. Hire from Claude, Cursor, LangGraph, CrewAI."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      {/* Top nav */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center -ml-2">
            <Logo size="sm" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/for-agents" className="hover:text-foreground transition-colors">For Agents</Link>
            <Link to="/gallery" className="hover:text-foreground transition-colors">Examples</Link>
            <Link to="/for-agents/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <a href="https://github.com/Browncabinet/yourechoagent-mcp" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
              <Github className="w-3.5 h-3.5" /> GitHub
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/for-agents/login")}>
              Log in
            </Button>
            <Button size="sm" onClick={() => navigate("/for-agents/signup")}>
              Get API key
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="absolute inset-0 -z-10 opacity-70 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--primary) / 0.18), transparent 70%), radial-gradient(ellipse 60% 40% at 80% 30%, hsl(160 84% 39% / 0.10), transparent 70%)",
          }}
        />
        <div className="container max-w-5xl mx-auto px-4 pt-20 pb-16 sm:pt-28 sm:pb-20 text-center">
          <motion.div {...fadeUp}>
            <Badge variant="secondary" className="mb-5 gap-1.5 font-mono">
              <Bot className="w-3 h-3" /> A2A 0.3.0 · MCP · Streamable HTTP
            </Badge>
          </motion.div>
          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] max-w-4xl mx-auto"
          >
            Your Echo —{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              the A2A-native PR &amp; Outreach Agent.
            </span>
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Event discovery, personalized warm outreach, and reply handling for multi-agent systems.
          </motion.p>

          {/* One-line MCP quickstart */}
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }} className="mt-8 max-w-2xl mx-auto">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 text-left">
              Point your orchestrator here →
            </p>
            <CodeBlock label="MCP endpoint · streamable-http" code={MCP_ENDPOINT} />
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
            className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button size="lg" onClick={() => navigate("/for-agents/signup")} className="gap-2">
              <Terminal className="w-4 h-4" /> Integrate in &lt; 60 seconds
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/gallery">Browse examples gallery <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
            </Button>
          </motion.div>
          <p className="mt-4 text-xs text-muted-foreground">
            Also usable by humans · Prepaid, pay per result · Free 50-email tier
          </p>
        </div>
      </section>

      {/* Integrate in any orchestrator */}
      <section id="integrations" className="border-b border-border/60 bg-card/30">
        <div className="container max-w-5xl mx-auto px-4 py-20">
          <motion.div {...fadeUp} className="text-center mb-8">
            <Badge className="mb-3 bg-indigo-500/10 text-indigo-500 border-indigo-500/20 font-mono">One-line setup</Badge>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Integrate in any orchestrator</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Native support for every major agent runtime. Streamable HTTP transport, dynamic client registration, and structured tool schemas.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-1.5 mb-4">
            {orchestrators.map((o, i) => (
              <button
                key={o.name}
                onClick={() => setOrch(i)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  orch === i ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {o.name}
              </button>
            ))}
          </div>
          <CodeBlock label={orchestrators[orch].name} code={orchestrators[orch].code} />

          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded-md border border-border bg-card font-mono">Claude Desktop</span>
            <span className="px-2 py-1 rounded-md border border-border bg-card font-mono">Cursor</span>
            <span className="px-2 py-1 rounded-md border border-border bg-card font-mono">Windsurf</span>
            <span className="px-2 py-1 rounded-md border border-border bg-card font-mono">LangGraph</span>
            <span className="px-2 py-1 rounded-md border border-border bg-card font-mono">CrewAI</span>
            <span className="px-2 py-1 rounded-md border border-border bg-card font-mono">AutoGen</span>
            <span className="px-2 py-1 rounded-md border border-border bg-card font-mono">Custom A2A</span>
          </div>
        </div>
      </section>

      {/* MCP tools */}
      <section className="border-b border-border/60">
        <div className="container max-w-5xl mx-auto px-4 py-20">
          <motion.div {...fadeUp} className="text-center mb-10">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 font-mono">MCP tools</Badge>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Four rich tools. Structured JSON in, structured JSON out.</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { name: "discover_events", desc: "Find conferences, webinars, podcasts, and communities in any niche. Returns scored, structured event objects with contacts when public.", Icon: Sparkles },
              { name: "draft_outreach", desc: "Generate a personalized email referencing a specific event, thread, or podcast episode. Returns subject + body + reasoning trace.", Icon: Mail },
              { name: "handle_reply", desc: "Classify inbound replies (interested / not-now / unsub / question) and pre-draft context-aware responses.", Icon: Inbox },
              { name: "report_campaign", desc: "Structured campaign report: sends, opens, replies, meetings booked, spend. Chain into your own dashboards.", Icon: Activity },
            ].map(({ name, desc, Icon }) => (
              <motion.div key={name} {...fadeUp} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <code className="text-sm font-mono font-semibold">{name}</code>
                </div>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why agents choose Your Echo */}
      <section className="border-b border-border/60 bg-card/30">
        <div className="container max-w-5xl mx-auto px-4 py-20">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Why agents choose Your Echo</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { Icon: Sparkles, title: "Event-based warmth", body: "Outreach references a real event, thread, or episode — 3–5× the reply rate of scraped cold lists." },
              { Icon: ShieldCheck, title: "Ethical, no scraping", body: "No LinkedIn/TOS violations. Only public event & community sources. Safe to embed in autonomous stacks." },
              { Icon: Gauge, title: "Per-job spending caps", body: "Every hire takes spending_cap_cents. HTTP 402 + signed top_up_url when funds run low." },
              { Icon: Braces, title: "Structured outputs", body: "Every tool returns typed JSON — no string parsing, no regex, chain directly into downstream agents." },
              { Icon: Inbox, title: "Reply handling built in", body: "Classification + auto-drafted responses close the loop. Your orchestrator only sees actionable events." },
              { Icon: Activity, title: "Observability & webhooks", body: "Signed webhooks (HMAC-SHA256) for job.started, lead.sent, reply.received, meeting.booked, job.completed." },
            ].map(({ Icon, title, body }) => (
              <motion.div key={title} {...fadeUp} className="rounded-xl border border-border bg-card p-5">
                <Icon className="w-5 h-5 text-primary mb-3" />
                <h3 className="font-medium mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Example PR workflows */}
      <section className="border-b border-border/60">
        <div className="container max-w-5xl mx-auto px-4 py-20">
          <motion.div {...fadeUp} className="text-center mb-10">
            <Badge className="mb-3 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono">Workflows</Badge>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Example PR workflows</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Compose Your Echo's tools into end-to-end PR loops. Each one is a copy-paste config in the <Link to="/gallery" className="underline">Examples Gallery</Link>.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                Icon: Mic, title: "Podcast Booking Swarm",
                flow: ["discover_events", "→ filter podcasts", "→ draft_outreach", "→ handle_reply → book"],
              },
              {
                Icon: Calendar, title: "Conference Outreach",
                flow: ["discover_events", "→ score ≥ 85", "→ extract speakers", "→ draft_outreach"],
              },
              {
                Icon: Users, title: "Community Engagement Loop",
                flow: ["discover_events(type=community)", "→ draft comment", "→ handle_reply", "→ report_campaign"],
              },
            ].map(({ Icon, title, flow }) => (
              <motion.div key={title} {...fadeUp} className="rounded-xl border border-border bg-card p-5">
                <Icon className="w-5 h-5 text-primary mb-3" />
                <h3 className="font-medium mb-3">{title}</h3>
                <div className="space-y-1.5">
                  {flow.map((step) => (
                    <div key={step} className="text-xs font-mono text-muted-foreground bg-background/60 border border-border rounded px-2 py-1.5">
                      {step}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/gallery">Open the full gallery <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Examples Gallery — GitHub */}
      <section className="border-b border-border/60 bg-card/30">
        <div className="container max-w-5xl mx-auto px-4 py-20">
          <motion.div {...fadeUp} className="text-center mb-8">
            <Badge className="mb-3 bg-zinc-500/10 text-zinc-300 border-zinc-500/20 font-mono">
              <Github className="w-3 h-3 mr-1" /> Open source examples
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Examples Gallery on GitHub</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Copy-paste MCP configs, LangGraph nodes, CrewAI adapters, and end-to-end multi-agent orchestrator recipes. MIT licensed, PRs welcome.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-3 mb-6">
            {[
              { name: "claude-desktop-cursor-quickstart", desc: "Wire Your Echo into Claude Desktop or Cursor in under 60 seconds." },
              { name: "langgraph-crewai-quickstart", desc: "Drop-in nodes for LangGraph and CrewAI orchestrators." },
              { name: "discover-and-draft", desc: "End-to-end discover_events → draft_outreach pipeline." },
              { name: "multi-agent-orchestrator", desc: "Compose Your Echo with research + scheduling sub-agents." },
            ].map((ex) => (
              <a
                key={ex.name}
                href={`https://github.com/Browncabinet/yourechoagent-mcp/blob/main/examples/${ex.name}.md`}
                target="_blank" rel="noopener noreferrer"
                className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition group text-left"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Code2 className="w-4 h-4 text-primary" />
                  <code className="text-sm font-mono font-semibold group-hover:text-primary transition">{ex.name}</code>
                </div>
                <p className="text-sm text-muted-foreground">{ex.desc}</p>
              </a>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" asChild>
              <a href="https://github.com/Browncabinet/yourechoagent-mcp" target="_blank" rel="noopener noreferrer" className="gap-2">
                <Github className="w-4 h-4" /> View repository on GitHub
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/gallery">Hosted examples gallery <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
            </Button>
          </div>

          <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center text-sm text-muted-foreground max-w-3xl mx-auto">
            <strong className="text-foreground">Open examples available on GitHub.</strong> The full production engine — with optimized performance, prepaid billing, per-job spending caps, and observability — is hosted at <a href="https://yourechoagent.com" className="text-primary underline">yourechoagent.com</a>.
          </div>
        </div>
      </section>



      {/* Trust / badges */}
      <section className="border-b border-border/60 bg-card/30">
        <div className="container max-w-5xl mx-auto px-4 py-12">
          <p className="text-center text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">
            Listed on
          </p>
          <div className="flex flex-wrap justify-center items-center gap-3 text-sm">
            {["Glama.ai", "Smithery", "Awesome-A2A", "MCP Registry", "A2A 0.3.0", "OpenAPI 3.1"].map((b) => (
              <span key={b} className="px-3 py-1.5 rounded-full border border-border bg-card font-mono text-xs">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border/60">
        <div className="container max-w-3xl mx-auto px-4 py-16">
          <motion.h2 {...fadeUp} className="text-center text-2xl sm:text-3xl font-semibold tracking-tight mb-8">
            Frequently asked
          </motion.h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`f-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container max-w-4xl mx-auto px-4 py-20 text-center">
        <motion.h2 {...fadeUp} className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Wire Your Echo into your agent stack.
        </motion.h2>
        <motion.p {...fadeUp} className="mt-3 text-muted-foreground">
          One MCP endpoint. Four rich tools. Prepaid, per-job spending caps. Start in under a minute.
        </motion.p>
        <motion.div {...fadeUp} className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" onClick={() => navigate("/for-agents/signup")} className="gap-2">
            <Terminal className="w-4 h-4" /> Get API key
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/for-agents/docs">Docs &amp; integrations</Link>
          </Button>
          <Button size="lg" variant="ghost" asChild>
            <Link to="/gallery">Examples gallery</Link>
          </Button>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
