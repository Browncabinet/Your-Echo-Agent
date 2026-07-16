import { motion } from "framer-motion";
import { Play, Zap, ArrowRight, CheckCircle2, RefreshCw, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroVideo from "../../public/hero-demo.mp4.asset.json";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const integrations: { name: string; note?: string; live?: boolean }[] = [
  { name: "HubSpot", live: true },
  { name: "Pipedrive", live: true },
  { name: "Zapier", live: true },
  { name: "Make", note: "via Zapier" },
  { name: "Salesforce", note: "Beta" },
  { name: "Attio", note: "Soon" },
  { name: "Notion", note: "via Zapier" },
  { name: "Slack", note: "via Zapier" },
];

const zapTriggers = [
  "New Lead Discovered",
  "Email Sent",
  "Positive Reply Received",
  "Meeting Booked",
  "High-Fit Event Found",
];

export function DemoSection() {
  return (
    <section id="demo" className="border-t border-border/60 bg-gradient-to-b from-background to-card/30">
      <div className="container max-w-5xl mx-auto px-4 py-20">
        <motion.div {...fadeUp} className="text-center mb-8">
          <Badge className="mb-3 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15 gap-1.5">
            <Play className="w-3 h-3" /> Watch it work
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            See Your Echo in Action <span className="text-muted-foreground font-normal">(1:45)</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            From niche → high-fit event → personalized draft → reply handler → one-click action.
            No slides, just the product.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp}
          className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-2xl"
        >
          <video
            className="w-full aspect-video object-cover bg-black"
            src={heroVideo.url}
            autoPlay
            loop
            muted
            playsInline
            controls
            preload="metadata"
          />
        </motion.div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          {[
            "Enter niche",
            "Discover fit-scored events",
            "AI drafts personalized email",
            "Reply handler classifies",
            "One-click email / comment / calendar",
          ].map((step, i) => (
            <div
              key={step}
              className="rounded-lg border border-border bg-background/60 px-3 py-2 flex items-center gap-2"
            >
              <span className="font-mono text-[10px] text-primary">0{i + 1}</span>
              <span className="text-muted-foreground">{step}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" asChild className="gap-2">
            <a href={heroVideo.url} target="_blank" rel="noreferrer">
              <Play className="w-4 h-4" /> Watch full demo
            </a>
          </Button>
          <p className="text-xs text-muted-foreground max-w-md text-center italic">
            "So I typed 'fractional CFOs for seed SaaS' — Your Echo pulled a SaaStr side-event with an 92 fit score
            and drafted an email referencing the actual talk. I sent it. She replied in 40 minutes."
          </p>
        </div>
      </div>
    </section>
  );
}

export function IntegrationsSection() {
  return (
    <section id="integrations" className="border-t border-border/60">
      <div className="container max-w-6xl mx-auto px-4 py-20">
        <motion.div {...fadeUp} className="text-center mb-10">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 gap-1.5">
            <Link2 className="w-3 h-3" /> Integrations
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Push warm event leads straight into your CRM
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Seamlessly sync leads, emails sent, replies, and meeting bookings into HubSpot, Pipedrive,
            or 5,000+ apps via Zapier. No more manual copy-paste.
          </p>
        </motion.div>

        {/* Logo grid */}
        <motion.div
          {...fadeUp}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10"
        >
          {integrations.map((i) => (
            <div
              key={i.name}
              className="rounded-xl border border-border bg-card px-4 py-5 flex flex-col items-center justify-center text-center hover:border-primary/40 transition-colors"
            >
              <span className="font-semibold text-lg tracking-tight">{i.name}</span>
              {i.live ? (
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
              ) : (
                <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {i.note}
                </span>
              )}
            </div>
          ))}
        </motion.div>

        {/* Two-column feature detail */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <motion.div {...fadeUp} className="rounded-2xl border border-border bg-card p-6">
            <RefreshCw className="w-5 h-5 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Auto-sync to HubSpot & Pipedrive</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "New leads pushed as Contacts with source = event name",
                "Every email sent logged on the contact timeline",
                "Replies mirrored as Notes with AI sentiment tag",
                "Meeting bookings created as Deals or Activities",
              ].map((f) => (
                <li key={f} className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button size="sm" variant="outline" className="mt-4 gap-2" asChild>
              <a href="/for-agents/dashboard">
                <Link2 className="w-3.5 h-3.5" /> Connect CRM
              </a>
            </Button>
          </motion.div>

          <motion.div {...fadeUp} className="rounded-2xl border border-border bg-card p-6">
            <Zap className="w-5 h-5 text-amber-500 mb-3" />
            <h3 className="font-semibold mb-2">Native Zapier triggers</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Fire any workflow the moment Your Echo finds a lead or gets a reply.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {zapTriggers.map((t) => (
                <Badge key={t} variant="outline" className="font-mono text-[11px]">
                  {t}
                </Badge>
              ))}
            </div>
            <Button size="sm" variant="outline" className="mt-4 gap-2" asChild>
              <a href="/for-agents/dashboard">
                <Zap className="w-3.5 h-3.5" /> Set up Zap
              </a>
            </Button>
          </motion.div>
        </div>

        {/* Comparison note */}
        <motion.div
          {...fadeUp}
          className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground text-center"
        >
          <span className="font-medium text-foreground">Works alongside tools like Gojiberry:</span>{" "}
          use Your Echo for event discovery & outreach, sync the results to your existing stack automatically.
        </motion.div>

        {/* Trust badge */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Integrates with your existing stack
          </Badge>
          <Button size="lg" asChild className="gap-2">
            <a href="/for-agents/signup">
              Start syncing free <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
