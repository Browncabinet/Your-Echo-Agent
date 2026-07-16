import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bot, Copy, Check, Mic, Calendar, Users, Mail, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { SeoHead } from "@/components/SeoHead";
import { toast } from "sonner";

const MCP_ENDPOINT = "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http";

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a12] overflow-hidden text-left">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-white/[0.02]">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">{label ?? "config"}</span>
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

const examples = [
  {
    Icon: Mic,
    title: "Podcast Booking Swarm",
    desc: "Discover niche podcasts, filter by audience size, draft personalized guest pitches, and auto-triage replies.",
    tags: ["discover_events", "draft_outreach", "handle_reply"],
    code: `# Claude Desktop / MCP prompt
Use the echo MCP server to:
1. discover_events(niche="B2B SaaS founders", event_types=["podcast"], limit=25)
2. For each result with fit_score >= 80:
     draft_outreach(event_id, sender={name:"Alex", email:"alex@lensora.dev"},
                    pitch="Guest spot pitching Lensora — agent observability")
3. handle_reply on any inbound, auto-book when classification == "interested"
Cap spend at $25.`,
  },
  {
    Icon: Calendar,
    title: "Conference Outreach",
    desc: "Score upcoming conferences, extract speaker/organizer contacts, and send hyper-personalized emails referencing the event.",
    tags: ["discover_events", "draft_outreach"],
    code: `curl -X POST ${MCP_ENDPOINT} \\
  -H "Authorization: Bearer eak_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json, text/event-stream" \\
  -d '{
    "jsonrpc":"2.0","id":1,"method":"tools/call",
    "params":{"name":"discover_events",
      "arguments":{"niche":"AI agents","event_types":["conference"],"limit":10}}
  }'`,
  },
  {
    Icon: Users,
    title: "Community Engagement Loop",
    desc: "Find active Reddit / Slack / Discord communities in your niche, draft platform-appropriate comments, and close the loop with reply handling.",
    tags: ["discover_events", "handle_reply", "report_campaign"],
    code: `# LangGraph node
async def community_loop(state):
    events = await echo.discover_events(
        niche=state["niche"], event_types=["community"], limit=15)
    for c in events["result"]["events"]:
        state["drafts"].append(
            await echo.draft_outreach(event_id=c["id"], style="community-comment"))
    return state`,
  },
  {
    Icon: Mail,
    title: "Newsletter / Substack Pitch",
    desc: "Discover niche newsletters and podcasts, then pitch guest posts or sponsorships with a per-job spending cap.",
    tags: ["discover_events", "draft_outreach"],
    code: `# CrewAI task
Task(
  description="Pitch 20 climate-tech newsletters with a founder story",
  tools=[echo.discover_events, echo.draft_outreach],
  spending_cap_cents=1500,
)`,
  },
  {
    Icon: Inbox,
    title: "Autonomous Reply Triage",
    desc: "Point Echo at your inbox — every reply is classified and pre-drafted so your orchestrator only sees actionable events.",
    tags: ["handle_reply", "report_campaign"],
    code: `# Poll every 5 min from your agent
report = await echo.report_campaign(job_id)
for reply in report["new_replies"]:
    classified = await echo.handle_reply(reply_id=reply["id"])
    if classified["intent"] == "interested":
        await calendar.book(reply["from"], classified["suggested_time"])`,
  },
];

const agentsUsing = [
  { name: "Lensora Research Agent", note: "Autonomous PR outreach for agent-observability launches." },
  { name: "Your agent here", note: "Ship an integration → email hello@yourechoagent.com" },
];

export default function Gallery() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SeoHead
        title="Echo Examples Gallery — A2A / MCP Configs for PR Workflows"
        description="Copy-paste MCP configs for podcast booking, conference outreach, community engagement, and autonomous reply triage. Works with Claude, Cursor, LangGraph, CrewAI."
        path="/gallery"
      />

      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center -ml-2">
            <Logo size="sm" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/for-agents" className="hover:text-foreground transition-colors">For Agents</Link>
            <Link to="/gallery" className="text-foreground transition-colors">Examples Gallery</Link>
            <Link to="/for-agents/docs" className="hover:text-foreground transition-colors">Docs & Integrations</Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </nav>
          <Button size="sm" asChild>
            <Link to="/for-agents/signup">Get API key</Link>
          </Button>
        </div>
      </header>

      <section className="container max-w-5xl mx-auto px-4 pt-14 pb-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 font-mono">Examples Gallery</Badge>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
          Copy-paste PR workflows for your agent stack
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
          Every example below is a runnable MCP config. Drop into Claude Desktop, Cursor, LangGraph, or CrewAI in under a minute.
        </p>
      </section>

      <section className="container max-w-5xl mx-auto px-4 pb-16">
        <div className="grid gap-5">
          {examples.map(({ Icon, title, desc, tags, code }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {tags.map((t) => (
                      <code key={t} className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {t}
                      </code>
                    ))}
                  </div>
                </div>
              </div>
              <CodeBlock code={code} label={title} />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-t border-border/60 bg-card/30">
        <div className="container max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono">
              Agents using Echo
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Built with Echo</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Shipping an agent that uses Echo? Get featured — <a className="underline" href="mailto:hello@yourechoagent.com">hello@yourechoagent.com</a>
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {agentsUsing.map((a) => (
              <div key={a.name} className="rounded-xl border border-border bg-card p-5 flex items-center gap-3">
                <Bot className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">{a.name}</p>
                  <p className="text-sm text-muted-foreground">{a.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
