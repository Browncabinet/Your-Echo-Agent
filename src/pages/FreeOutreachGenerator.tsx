import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Loader2, Sparkles, KeyRound, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { SeoHead } from "@/components/SeoHead";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MCP_ENDPOINT = "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http";
const CLAUDE_CONFIG = `{
  "mcpServers": {
    "your-echo": {
      "url": "${MCP_ENDPOINT}",
      "headers": { "Authorization": "Bearer eak_YOUR_KEY" }
    }
  }
}`;

const FAQS = [
  { q: "How do I pitch myself to a podcast?", a: "Mention a specific episode or topic, explain in one or two lines what you could add for their listeners, and ask for one simple next step. Keep it under 150 words." },
  { q: "Is this generator free?", a: "Yes. Up to 3 drafts a day with no signup. Nothing is sent—you copy and send the email yourself." },
  { q: "Does Your Echo scrape LinkedIn?", a: "No. Your Echo uses public event and community sources only." },
  { q: "Can my agent use this automatically?", a: "Yes. Add the Your Echo MCP endpoint or call it as an A2A sub-agent. It exposes discover_events, draft_outreach, handle_reply and report_campaign with structured JSON." },
  { q: "How does pricing work for agents?", a: "Each job takes a spending cap. When funds run low, the API returns HTTP 402 with a signed top-up link." },
];

const TIPS = [
  { t: "Reference one specific detail", d: "Name the episode, talk, or thread that caught your eye. It proves you're not mass-mailing." },
  { t: "Say why you fit", d: "One or two lines on what you'd add for their audience — not your whole bio." },
  { t: "Make one small ask", d: "A 15-minute call or a guest slot. One clear next step beats a list of options." },
  { t: "Send a short follow-up", d: "Five days later, a brief, friendly nudge. Add one new detail rather than repeating yourself." },
];

type Draft = {
  subject: string;
  alt_subjects: string[];
  body: string;
  why_this_works: string[];
  follow_up: { send_after_days?: number; subject?: string; body?: string } | null;
};

function CopyBtn({ text }: { text: string }) {
  const [c, setC] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => { await navigator.clipboard.writeText(text); setC(true); toast.success("Copied"); setTimeout(() => setC(false), 1500); }}
      className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-100 font-mono"
    >
      {c ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}{c ? "copied" : "copy"}
    </button>
  );
}

function Block({ label, text, mono }: { label: string; text: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a12] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-white/[0.02]">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">{label}</span>
        <CopyBtn text={text} />
      </div>
      <pre className={`p-4 text-[13px] leading-relaxed text-zinc-200 whitespace-pre-wrap overflow-x-auto ${mono ? "font-mono text-[12px]" : "font-sans"}`}>{text}</pre>
    </div>
  );
}

export default function FreeOutreachGenerator() {
  const [f, setF] = useState({
    outreach_type: "podcast_guest", event_name: "", event_url: "", hook: "",
    recipient_first_name: "", recipient_role: "", about_you: "", ask: "", tone: "friendly",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ draft: Draft; remaining_today: number } & Record<string, unknown> | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.event_name || !f.hook || !f.about_you || !f.ask) { toast.error("Please fill in the event, what caught your attention, about you, and the ask."); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("free-outreach-draft", { body: f });
      if (error) {
        let msg = "Drafting failed, please try again.";
        try { const b = await (error as any).context?.json(); if (b?.message) msg = b.message; } catch { /* ignore */ }
        toast.error(msg);
        return;
      }
      setResult(data);
    } finally { setLoading(false); }
  };

  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: FAQS.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })),
  };

  const d = result?.draft;
  const fieldCls = "bg-white/[0.03] border-white/10 text-zinc-100 placeholder:text-zinc-500";

  return (
    <div className="min-h-screen bg-[#06060c] text-zinc-100 flex flex-col">
      <SeoHead
        title="Free Event Outreach Email Generator — Warm Podcast & Conference Pitches | Your Echo"
        description="Paste an event, podcast or community and get a personalized outreach email that references it. Free, no signup. Same engine available as an A2A/MCP sub-agent."
        path="/free-event-outreach-email-generator"
        jsonLd={faqLd}
      />
      <header className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <Link to="/" className="text-sm text-zinc-400 hover:text-zinc-100 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Your Echo home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
        <section className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Free Event Outreach Email Generator</h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Give it an event or podcast episode and who you are. Get a warm, specific pitch email. Free, no signup.
          </p>
        </section>

        <div className="grid lg:grid-cols-2 gap-8">
          <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Outreach type</Label>
              <Select value={f.outreach_type} onValueChange={(v) => setF({ ...f, outreach_type: v })}>
                <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="podcast_guest">Podcast guest pitch</SelectItem>
                  <SelectItem value="conference_speaker">Conference speaker pitch</SelectItem>
                  <SelectItem value="sponsor_partner">Sponsor / partner</SelectItem>
                  <SelectItem value="community_intro">Community intro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Event / podcast name *</Label><Input className={fieldCls} value={f.event_name} onChange={set("event_name")} maxLength={200} placeholder="e.g. The SaaS Growth Show" /></div>
              <div className="space-y-1.5"><Label>URL (optional)</Label><Input className={fieldCls} value={f.event_url} onChange={set("event_url")} maxLength={500} placeholder="https://…" /></div>
            </div>
            <div className="space-y-1.5"><Label>What caught your attention *</Label><Textarea className={fieldCls} rows={2} value={f.hook} onChange={set("hook")} maxLength={400} placeholder="An episode topic, a talk, a thread…" /></div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Recipient first name</Label><Input className={fieldCls} value={f.recipient_first_name} onChange={set("recipient_first_name")} maxLength={60} /></div>
              <div className="space-y-1.5"><Label>Recipient role</Label><Input className={fieldCls} value={f.recipient_role} onChange={set("recipient_role")} maxLength={100} placeholder="Host, organizer…" /></div>
            </div>
            <div className="space-y-1.5"><Label>About you / your product *</Label><Textarea className={fieldCls} rows={3} value={f.about_you} onChange={set("about_you")} maxLength={600} placeholder="2–3 lines" /></div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>The ask *</Label><Input className={fieldCls} value={f.ask} onChange={set("ask")} maxLength={150} placeholder="15-min call, guest slot…" /></div>
              <div className="space-y-1.5">
                <Label>Tone</Label>
                <Select value={f.tone} onValueChange={(v) => setF({ ...f, tone: v })}>
                  <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="brief">Brief</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Drafting…</> : <><Sparkles className="w-4 h-4 mr-2" /> Draft my email</>}
            </Button>
            <p className="text-xs text-zinc-500 text-center">Drafts only. Nothing is sent. We don't scrape LinkedIn. Limit 3/day.</p>
          </form>

          <div className="space-y-4">
            {!d ? (
              <div className="h-full min-h-[300px] rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-sm text-zinc-500 p-6 text-center">
                Your draft will appear here.
              </div>
            ) : (
              <Tabs defaultValue="email">
                <TabsList>
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="json">JSON</TabsTrigger>
                </TabsList>
                <TabsContent value="email" className="space-y-4 mt-4">
                  <Block label="Subject" text={d.subject} />
                  {d.alt_subjects.length > 0 && <Block label="Alternative subjects" text={d.alt_subjects.join("\n")} />}
                  <Block label="Email body" text={d.body} />
                  {d.why_this_works.length > 0 && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Why this works</p>
                      <ul className="list-disc pl-5 text-sm text-zinc-300 space-y-1">{d.why_this_works.map((w, i) => <li key={i}>{w}</li>)}</ul>
                    </div>
                  )}
                  {d.follow_up?.body && (
                    <Block label={`Follow-up (day ${d.follow_up.send_after_days ?? 5})`} text={`Subject: ${d.follow_up.subject ?? ""}\n\n${d.follow_up.body}`} />
                  )}
                  <p className="text-xs text-zinc-500">{result!.remaining_today} free drafts left today.</p>
                </TabsContent>
                <TabsContent value="json" className="mt-4">
                  <Block label="draft_outreach response" text={JSON.stringify(result, null, 2)} mono />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>

        <section className="mt-16 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
          <h2 className="text-2xl font-semibold mb-3">Have your orchestrator find events, draft outreach and handle replies — with per-job spending caps.</h2>
          <div className="flex flex-wrap gap-3 mb-3">
            <Button asChild><Link to="/for-agents/signup"><KeyRound className="w-4 h-4 mr-2" />Get API key</Link></Button>
            <Button asChild variant="outline"><Link to="/for-agents/docs"><Plug className="w-4 h-4 mr-2" />Integrate as a sub-agent</Link></Button>
          </div>
          <p className="text-sm text-zinc-400 mb-6">Humans welcome too — start free with 50 emails. No credit card required.</p>
          <div className="grid md:grid-cols-2 gap-4">
            <Block label="MCP endpoint" text={MCP_ENDPOINT} mono />
            <Block label="Claude Desktop config" text={CLAUDE_CONFIG} mono />
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold mb-6">How to write a warm event outreach email</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {TIPS.map((t, i) => (
              <div key={t.t} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <p className="text-xs font-mono text-zinc-500 mb-1">0{i + 1}</p>
                <h3 className="font-semibold mb-1">{t.t}</h3>
                <p className="text-sm text-zinc-400">{t.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-semibold mb-4">Frequently asked questions</h2>
          <Accordion type="single" collapsible>
            {FAQS.map((x, i) => (
              <AccordionItem key={i} value={`f${i}`} className="border-white/10">
                <AccordionTrigger className="text-left">{x.q}</AccordionTrigger>
                <AccordionContent className="text-zinc-400">{x.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <p className="mt-16 text-center text-xs text-zinc-500">Built by the Your Echo team.</p>
      </main>
      <Footer />
    </div>
  );
}
