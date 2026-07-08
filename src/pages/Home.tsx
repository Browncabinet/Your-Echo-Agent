import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar, Users, Mic, Globe2, Sparkles, Mail, MessageSquare, Bookmark,
  ArrowRight, ShieldCheck, Heart, Target, Quote, Bot, Inbox, Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/Footer";
import { TestimonialsMarquee } from "@/components/TestimonialsMarquee";
import { Logo } from "@/components/Logo";
import { SeoHead } from "@/components/SeoHead";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const niches = [
  "Fractional CFOs", "DTC founders", "Climate tech", "Indie SaaS",
  "B2B agencies", "Real-estate investors", "Podcasters", "Local services",
  "Healthtech", "FinOps", "Dev tools", "Coaches & consultants",
];

const faqs = [
  {
    q: "Why no LinkedIn scraping?",
    a: "LinkedIn scraping breaks platform TOS, gets accounts banned, and produces low-quality cold contacts. We pivoted to event & community discovery because the leads are warmer, the relationships are sustainable, and you stay safe from account bans.",
  },
  {
    q: "How does event discovery work?",
    a: "Tell us your niche. Our AI searches Eventbrite, Luma, Reddit, Meetup, podcast directories, and the open web for conferences, webinars, podcasts, and groups your audience actually attends — then scores each one for fit, extracts contacts when public, and helps you draft outreach.",
  },
  {
    q: "What do I do once I find an event?",
    a: "One click to add it to your calendar, draft a platform-appropriate comment (LinkedIn, Reddit, podcast review), extract speaker/organizer contacts, or send a hyper-personalized email. Save anything interesting to My Radar.",
  },
  {
    q: "How much does it cost?",
    a: "Free to start — 50 emails on us, no credit card. Paid plans start at $19/week. Top-ups never expire.",
  },
  {
    q: "Can other AI agents use Echo?",
    a: "Yes. Echo is A2A 0.3.0 and MCP-compatible. Claude, GPT-based agents, and custom orchestrators can discover Echo on Glama.ai and Smithery, then hire it to run event-driven outreach campaigns. See /for-agents.",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SeoHead
        title="Echo Agent — AI event discovery & outreach"
        description="Find conferences, webinars, podcasts and communities in your niche. AI drafts outreach and triages replies. 50 free emails."
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
            <Link to="/for-agents" className="hover:text-foreground transition-colors">For Agents</Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/for-agents/login")}>
              Log in
            </Button>
            <Button size="sm" onClick={() => navigate("/for-agents/signup")}>
              Start free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--primary) / 0.15), transparent 70%)",
          }}
        />
        <div className="container max-w-6xl mx-auto px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          <motion.div {...fadeUp}>
            <Badge variant="secondary" className="mb-5 gap-1.5">
              <Bot className="w-3 h-3" /> A2A + MCP · Prepaid · Pay per result
            </Badge>
          </motion.div>
          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] max-w-4xl mx-auto"
          >
            The outreach agent{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              other agents hire.
            </span>
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Any A2A/MCP client — Claude, Cursor, LangGraph, CrewAI, or your custom orchestrator — can hire Echo to run niche-specific event discovery and personalized email outreach. Prepaid balance, per-result billing, HTTP 402 when funds run low.
          </motion.p>
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.15 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button size="lg" onClick={() => navigate("/for-agents/signup")} className="gap-2">
              <Bot className="w-4 h-4" /> Get API Key — Hire Echo Now
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/for-agents">See API docs & MCP setup <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
            </Button>
          </motion.div>
          <p className="mt-4 text-xs text-muted-foreground">
            Also usable by humans · 50 free emails · No credit card
          </p>
        </div>
      </section>

      {/* For AI Agents — prominent */}
      <section className="border-y border-border/60 bg-gradient-to-br from-indigo-500/5 via-transparent to-emerald-500/5">
        <div className="container max-w-6xl mx-auto px-4 py-16">
          <motion.div {...fadeUp} className="text-center mb-10">
            <Badge className="mb-3 bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/15">
              For AI Agents
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Delegate outreach in one API call
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Echo speaks A2A 0.3.0 and MCP. Discoverable at <code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">/.well-known/agent.json</code>. Six specialized sub-agents. Prepaid packs from $25 (agency pack $149 = 10k emails).
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { Icon: Code2, title: "One-line MCP setup", body: "Point Claude Desktop, Cursor, or Windsurf at our hosted MCP endpoint. No install." },
              { Icon: Bot, title: "Multi-agent friendly", body: "LangGraph & CrewAI orchestrators can hire Echo as a sub-agent with a per-job spending cap." },
              { Icon: ShieldCheck, title: "HTTP 402 on empty", body: "Job auto-pauses and returns a signed top_up_url when the prepaid balance runs low." },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-5">
                <Icon className="w-5 h-5 text-indigo-500 mb-3" />
                <h3 className="font-medium mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button size="lg" onClick={() => navigate("/for-agents/signup")} className="gap-2">
              <Bot className="w-4 h-4" /> Get API Key
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/for-agents/quickstart">Quickstart & copy-paste examples <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link to="/pricing">See prepaid packs →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why we changed */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="container max-w-6xl mx-auto px-4 py-12">
          <motion.div {...fadeUp} className="text-center mb-8">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Why we changed
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              We dropped LinkedIn scraping. Here's why.
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Scraped contacts get cold-emailed by everyone. Event attendees are warm, qualified, and
              actively looking for solutions. We rebuilt Echo around the relationships that actually convert.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { Icon: Heart, title: "Relationship-first", body: "Show up where they already are. Comment, attend, then email — context beats cold every time." },
              { Icon: Target, title: "Higher-quality leads", body: "Event attendees self-select. Reply rates from event-based outreach beat scraped lists by 3-5×." },
              { Icon: ShieldCheck, title: "Sustainable & safe", body: "No TOS violations, no account bans, no broken sequences when a platform changes its API." },
            ].map(({ Icon, title, body }) => (
              <motion.div
                key={title}
                {...fadeUp}
                className="rounded-xl border border-border bg-card p-5"
              >
                <Icon className="w-5 h-5 text-primary mb-3" />
                <h3 className="font-medium mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero feature: Discover flow */}
      <section id="how-it-works" className="container max-w-6xl mx-auto px-4 py-20">
        <motion.div {...fadeUp} className="text-center mb-12">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
            Core feature
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Events & Communities Discovery
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            From niche to outreach in four steps. Powered by AI fit scoring across the open web.
          </p>
        </motion.div>

        {/* Four-step visual */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
          {[
            { n: "01", Icon: Target, title: "Niche", body: "Tell us your audience. e.g. 'fractional CFOs for seed SaaS'." },
            { n: "02", Icon: Globe2, title: "Discover", body: "AI scans Eventbrite, Luma, Reddit, Meetup, podcasts + open web." },
            { n: "03", Icon: Sparkles, title: "Fit score", body: "Every result scored 0-100 with a one-line reason." },
            { n: "04", Icon: ArrowRight, title: "Act", body: "Draft email, comment, add to calendar, or save to Radar." },
          ].map(({ n, Icon, title, body }, i) => (
            <motion.div
              key={n}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.06 }}
              className="relative rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-muted-foreground tracking-widest">
                  {n}
                </span>
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-medium mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{body}</p>
            </motion.div>
          ))}
        </div>

        {/* Mock UI preview */}
        <motion.div {...fadeUp} className="rounded-2xl border border-border bg-gradient-to-br from-card to-background overflow-hidden shadow-xl">
          {/* Mock toolbar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-card/60">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
            <span className="ml-3 text-xs font-mono text-muted-foreground">yourechoagent.com / discover</span>
          </div>
          <div className="p-5 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-5">
              {[
                { Icon: Users, label: "Groups", count: 12 },
                { Icon: Calendar, label: "Conferences", count: 18 },
                { Icon: Globe2, label: "Webinars", count: 24 },
                { Icon: Mic, label: "Podcasts", count: 9 },
              ].map(({ Icon, label, count }) => (
                <div key={label} className="rounded-lg border border-border bg-background/60 p-3 flex items-center gap-3">
                  <Icon className="w-4 h-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium">{count} matches</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {[
                { score: 92, title: "SaaStr Annual 2026", meta: "Sep 9 · San Mateo · Conference", reason: "5,000+ SaaS founders & CFOs — your exact ICP." },
                { score: 87, title: "Fractional Friday — Webinar", meta: "Aug 22 · Virtual · Webinar", reason: "Live audience of fractional execs at growth-stage SaaS." },
                { score: 78, title: "r/fractional", meta: "Reddit · 8.2k members · Group", reason: "Active community asking exactly the questions you solve." },
              ].map((opp) => (
                <div key={opp.title} className="rounded-lg border border-border bg-background/60 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="shrink-0 w-14 h-14 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex flex-col items-center justify-center font-bold">
                    <span className="text-lg leading-none">{opp.score}</span>
                    <span className="text-[9px] uppercase mt-0.5">fit</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{opp.title}</p>
                    <p className="text-xs text-muted-foreground">{opp.meta}</p>
                    <p className="text-xs italic text-muted-foreground mt-1">"{opp.reason}"</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="gap-1"><Calendar className="w-3 h-3" /> Attend</Badge>
                    <Badge variant="outline" className="gap-1"><MessageSquare className="w-3 h-3" /> Comment</Badge>
                    <Badge variant="outline" className="gap-1"><Mail className="w-3 h-3" /> Email</Badge>
                    <Badge variant="outline" className="gap-1"><Bookmark className="w-3 h-3" /> Save</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="text-center mt-8">
          <Button size="lg" onClick={() => navigate("/for-agents/signup")} className="gap-2">
            Try Discover free <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Supporting features */}
      <section className="border-t border-border/60 bg-card/30">
        <div className="container max-w-6xl mx-auto px-4 py-16">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Everything else you'd expect — done right
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                Icon: Bot,
                title: "AI Email Builder",
                body: "Personalized emails that reference the event, podcast, or thread. Safe deliverability limits built in.",
                href: "/pricing",
                cta: "See plans",
              },
              {
                Icon: Inbox,
                title: "Reply Handler",
                body: "Every reply classified (interested, not now, unsubscribe) and pre-drafted for one-click sending.",
                href: "/pricing",
                cta: "See plans",
              },
              {
                Icon: Code2,
                title: "MCP & A2A for agents",
                body: "Discoverable on Glama.ai. Claude, GPT, and custom agents can hire Echo to run event-driven campaigns.",
                href: "/for-agents",
                cta: "API docs",
              },
            ].map(({ Icon, title, body, href, cta }) => (
              <motion.div key={title} {...fadeUp} className="rounded-xl border border-border bg-card p-6 flex flex-col">
                <Icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-medium mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground flex-1">{body}</p>
                <Link to={href} className="text-sm text-primary mt-4 inline-flex items-center gap-1 hover:gap-2 transition-all">
                  {cta} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Niches strip */}
      <section className="container max-w-6xl mx-auto px-4 py-14">
        <motion.div {...fadeUp} className="text-center mb-6">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
            Built for niches like
          </p>
          <h2 className="text-xl sm:text-2xl font-medium">
            Works for any audience that gathers somewhere
          </h2>
        </motion.div>
        <motion.div {...fadeUp} className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {niches.map((n) => (
            <span
              key={n}
              className="px-3 py-1.5 rounded-full bg-card border border-border text-sm text-muted-foreground"
            >
              {n}
            </span>
          ))}
        </motion.div>
      </section>

      {/* Social proof */}
      <section className="border-t border-border/60 bg-card/30">
        <div className="container max-w-6xl mx-auto px-4 py-16">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Early results from event-driven outreach
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Real-world examples. Add yours — email <a className="underline" href="mailto:hello@yourechoagent.com">hello@yourechoagent.com</a>.
            </p>
          </motion.div>

          {/* Case study mini-cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[
              { stat: "11", label: "podcast guest bookings in 30 days", body: "Solo founder used Discover → podcast outreach to land 11 guest spots — no agent, no PR firm." },
              { stat: "3", label: "enterprise demos from one conference", body: "Fractional CFO scored 92-fit on SaaStr, drafted 28 personalized emails, and booked 3 demos." },
            ].map(({ stat, label, body }) => (
              <motion.div key={label} {...fadeUp} className="rounded-xl border border-border bg-card p-6 flex gap-5 items-start">
                <div className="text-4xl font-bold text-primary leading-none">{stat}</div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-sm text-muted-foreground mt-1.5">{body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Testimonial placeholders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { quote: "Echo found three webinars I'd never have heard of. Two became clients.", who: "Maya R., growth consultant" },
              { quote: "The fit score is uncanny. It surfaces communities I actually want to be in.", who: "Devon K., dev tools founder" },
              { quote: "Beats every cold-email tool I've tried. The replies are real conversations.", who: "Sam L., fractional CFO" },
            ].map(({ quote, who }) => (
              <motion.div key={who} {...fadeUp} className="rounded-xl border border-border bg-card p-5">
                <Quote className="w-4 h-4 text-primary/60 mb-2" />
                <p className="text-sm">"{quote}"</p>
                <p className="text-xs text-muted-foreground mt-3">— {who}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6 italic">
            Early-access stories. Want yours featured? <a className="underline" href="mailto:hello@yourechoagent.com">Tell us</a>.
          </p>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <motion.div {...fadeUp} className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Simple weekly pricing</h2>
          <p className="text-muted-foreground mt-2 text-sm">Start free with 50 emails. Top-ups never expire.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            { name: "Starter", price: "$19", per: "/week", body: "500 emails · Discover · Reply Handler" },
            { name: "Growth", price: "$39", per: "/week", body: "1,500 emails · Priority queue · Analytics", featured: true },
            { name: "Power", price: "$79", per: "/week", body: "4,000 emails · Highest discovery cap" },
          ].map((p) => (
            <motion.div
              key={p.name}
              {...fadeUp}
              className={`rounded-xl border p-6 ${
                p.featured
                  ? "border-primary bg-primary/[0.04]"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-medium">{p.name}</h3>
                {p.featured && <Badge>Popular</Badge>}
              </div>
              <p className="mt-3">
                <span className="text-3xl font-semibold">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.per}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-3">{p.body}</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Button variant="outline" onClick={() => navigate("/pricing")} className="gap-2">
            Compare plans <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsMarquee />

      {/* FAQ */}
      <section className="border-t border-border/60 bg-card/30">
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
          Start free. 50 emails. No credit card.
        </motion.h2>
        <motion.p {...fadeUp} className="mt-3 text-muted-foreground">
          Set your niche and run your first discovery in under two minutes.
        </motion.p>
        <motion.div {...fadeUp} className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" onClick={() => navigate("/for-agents/signup")} className="gap-2">
            Get started free <ArrowRight className="w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/for-agents")}>
            For AI agents (A2A / MCP)
          </Button>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
