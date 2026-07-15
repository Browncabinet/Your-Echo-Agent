import { useEffect, useMemo, useState } from "react";
import { PartnerShell } from "@/components/PartnerShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { toast } from "@/hooks/use-toast";
import { downloadICS, type DiscoverOpportunity } from "@/lib/ics";
import { CalendarPlus, MessageSquare, Users, Mail, Bookmark, Loader2, ExternalLink, Sparkles, Info, Linkedin, Search, ChevronDown, CheckCircle2, AlertCircle, Radar, Globe, RefreshCw } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useCredits } from "@/hooks/use-credits";
import { SeoHead } from "@/components/SeoHead";

type Kind = "group" | "conference" | "webinar" | "podcast" | "newsletter" | "forum";
const KIND_LABEL: Record<Kind, string> = { group: "Groups", conference: "Conferences", webinar: "Webinars", podcast: "Podcasts", newsletter: "Newsletters", forum: "Forums" };
const APPROACH_LABEL: Record<string, string> = { sponsor: "Sponsor", speak: "Speak", pitch: "Pitch", post: "Post", comment: "Comment", subscribe: "Subscribe" };

export default function Discover() {
  const { user } = useAuth();
  const { caps, refresh } = useSubscription();

  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [region, setRegion] = useState("Global");
  const [virtualOnly, setVirtualOnly] = useState(false);
  const [timeframe, setTimeframe] = useState("90");
  const [running, setRunning] = useState(false);
  const [items, setItems] = useState<DiscoverOpportunity[]>([]);
  const [activeKind, setActiveKind] = useState<Kind>("conference");
  const [radarIds, setRadarIds] = useState<Set<string>>(new Set());

  const [commentOpen, setCommentOpen] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState<string[]>([]);
  const [commentMeta, setCommentMeta] = useState<{ platform?: string; tone?: string }>({});
  const [commentLoading, setCommentLoading] = useState(false);

  const { balance, refresh: refreshCredits } = useCredits();
  const [enrichBusy, setEnrichBusy] = useState<string | null>(null); // `${oppId}:${idx|all}`
  const [confirm, setConfirm] = useState<null | { opp: DiscoverOpportunity; index: number | "all"; count: number }>(null);

  // URL onramp
  const [siteUrl, setSiteUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [siteSummary, setSiteSummary] = useState<string>("");

  // Sender profile (used when drafting outreach emails)
  const [senderName, setSenderName] = useState("");
  const [senderCompany, setSenderCompany] = useState("");
  const [senderPitch, setSenderPitch] = useState("");

  // Outreach draft dialog
  const [draftOpen, setDraftOpen] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftOpp, setDraftOpp] = useState<DiscoverOpportunity | null>(null);
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");

  const loadItems = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("discovered_opportunities")
      .select("*")
      .eq("user_id", user.id)
      .order("fit_score", { ascending: false })
      .order("event_start", { ascending: true, nullsFirst: false })
      .limit(200);
    setItems((data || []) as unknown as DiscoverOpportunity[]);
    const { data: r } = await supabase
      .from("radar_items").select("opportunity_id").eq("user_id", user.id);
    setRadarIds(new Set((r || []).map((x: { opportunity_id: string }) => x.opportunity_id)));
  };

  useEffect(() => { loadItems(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id]);

  const grouped = useMemo(() => {
    const g: Record<Kind, DiscoverOpportunity[]> = { group: [], conference: [], webinar: [], podcast: [], newsletter: [], forum: [] };
    for (const it of items) g[it.kind as Kind]?.push(it);
    return g;
  }, [items]);

  const runDiscover = async () => {
    if (!niche.trim()) {
      toast({ title: "Niche required", description: "Tell us your niche to focus the search." });
      return;
    }
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("discover-communities", {
        body: {
          niche, audience, region, virtual_only: virtualOnly,
          timeframe_days: Number(timeframe),
        },
      });
      if (error) throw error;
      toast({ title: "Discovery complete", description: `${data?.inserted ?? 0} new opportunities added.` });
      await Promise.all([loadItems(), refresh()]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Discovery failed";
      toast({ title: "Discovery failed", description: msg, variant: "destructive" });
    } finally { setRunning(false); }
  };

  const analyzeSite = async () => {
    if (!siteUrl.trim()) {
      toast({ title: "URL required", description: "Paste your website URL to auto-detect niche & audience." });
      return;
    }
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-site-for-radar", {
        body: { url: siteUrl.trim() },
      });
      if (error) throw error;
      if (data?.niche) setNiche(data.niche);
      if (data?.audience) setAudience(data.audience);
      if (data?.region) setRegion(data.region);
      if (data?.summary) setSiteSummary(data.summary);
      if (data?.positioning && !senderPitch) setSenderPitch(data.positioning);
      try {
        const host = new URL(siteUrl.trim()).hostname.replace(/^www\./, "");
        if (!senderCompany) setSenderCompany(host.split(".")[0].replace(/^\w/, (c) => c.toUpperCase()));
      } catch { /* ignore */ }
      toast({ title: "Site analyzed", description: "Niche, audience, and region prefilled — edit anything, then hit Find." });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Analysis failed";
      toast({ title: "Analysis failed", description: msg, variant: "destructive" });
    } finally { setAnalyzing(false); }
  };

  const onDraftEmail = async (opp: DiscoverOpportunity, regenerate = false) => {
    setDraftOpp(opp);
    setDraftOpen(true);
    setDraftLoading(true);
    setDraftSubject("");
    setDraftBody("");
    try {
      const { data, error } = await supabase.functions.invoke("radar-draft-outreach", {
        body: {
          opportunity_id: opp.id,
          sender_name: senderName,
          sender_company: senderCompany,
          sender_pitch: senderPitch || siteSummary,
          regenerate,
        },
      });
      if (error) throw error;
      setDraftSubject(data?.subject || "");
      setDraftBody(data?.body || "");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Draft failed";
      toast({ title: "Draft failed", description: msg, variant: "destructive" });
    } finally { setDraftLoading(false); }
  };

  const saveToRadar = async (opp: DiscoverOpportunity, status: "saved" | "attending" = "saved") => {
    if (!user) return;
    const { error } = await supabase.from("radar_items").upsert(
      { user_id: user.id, opportunity_id: opp.id, status },
      { onConflict: "user_id,opportunity_id" },
    );
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    setRadarIds((s) => new Set(s).add(opp.id));
    toast({ title: status === "attending" ? "Marked attending" : "Saved to radar" });
  };

  const onAttend = async (opp: DiscoverOpportunity) => {
    downloadICS(opp);
    await saveToRadar(opp, "attending");
  };

  const onComment = async (opp: DiscoverOpportunity) => {
    setCommentOpen(true); setCommentLoading(true); setCommentDrafts([]); setCommentMeta({});
    try {
      const { data, error } = await supabase.functions.invoke("discover-comment-draft", {
        body: { opportunity_id: opp.id, niche, audience },
      });
      if (error) throw error;
      setCommentDrafts(data?.drafts || []);
      setCommentMeta({ platform: data?.platform, tone: data?.tone });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      toast({ title: "Draft failed", description: msg, variant: "destructive" });
    } finally { setCommentLoading(false); }
  };

  const onExtract = async (opp: DiscoverOpportunity) => {
    toast({ title: "Extracting contacts…" });
    const { data, error } = await supabase.functions.invoke("discover-extract-contacts", {
      body: { opportunity_id: opp.id },
    });
    if (error) {
      toast({ title: "Extraction failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Found ${data?.contacts?.length ?? 0} contacts` });
    await loadItems();
  };

  const runEnrich = async (opp: DiscoverOpportunity, index: number | "all") => {
    const key = `${opp.id}:${index}`;
    setEnrichBusy(key);
    try {
      const { data, error } = await supabase.functions.invoke("discover-enrich-contact", {
        body: { opportunity_id: opp.id, contact_index: index === "all" ? undefined : index, mode: index === "all" ? "bulk" : "single" },
      });
      if (error) {
        // Try to parse the JSON body for a friendly message (rate_limited, not_warm_lead, etc.)
        let detail: { error?: string; message?: string } = {};
        try {
          const ctx = (error as { context?: { text?: () => Promise<string> } }).context;
          if (ctx?.text) detail = JSON.parse(await ctx.text());
        } catch { /* ignore */ }
        const title = detail.error === "rate_limited" ? "Slow down"
          : detail.error === "not_warm_lead" ? "Not available"
          : "Enrichment failed";
        toast({ title, description: detail.message || (error as Error).message, variant: "destructive" });
        return;
      }
      const found = (data?.results || []).filter((r: { email?: string }) => r.email).length;
      const charged = (data?.results || []).reduce((s: number, r: { charged?: number }) => s + (r.charged || 0), 0);
      const dailyLine = typeof data?.daily_remaining === "number"
        ? ` · ${data.daily_remaining}/${data.daily_cap} daily lookups left`
        : "";
      toast({
        title: `Found ${found} email${found === 1 ? "" : "s"}`,
        description: (charged ? `Charged ${charged} email unit${charged === 1 ? "" : "s"}` : "No charge — nothing verified") + dailyLine,
      });
      await Promise.all([loadItems(), refreshCredits()]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Enrichment failed";
      toast({ title: "Enrichment failed", description: msg, variant: "destructive" });
    } finally {
      setEnrichBusy(null);
      setConfirm(null);
    }
  };

  const remaining = Math.max(0, (caps?.["discoveries_cap" as keyof typeof caps] as number | undefined ?? 0) - (caps?.["discoveries_used" as keyof typeof caps] as number | undefined ?? 0));

  return (
    <PartnerShell width="wide">
      <SeoHead
        title="Community Radar — Your Echo Agent"
        description="Paste your site. Echo Agent finds communities, events, newsletters, forums, and podcasts in your niche — with fit scores, how-to-approach guidance, and ready-to-send outreach drafts."
        path="/for-agents/discover"
      />
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Radar className="w-7 h-7 text-primary" /> Community Radar
            </h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              Paste your site. We scan communities, events, newsletters, forums, and podcasts — score each fit, tell you how to approach, and draft the first message.
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            Discoveries remaining this week: {remaining}
          </Badge>
        </div>

        <Card className="border-primary/30 bg-primary/[0.03]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Start with your website
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="https://yoursite.com"
                onKeyDown={(e) => { if (e.key === "Enter") analyzeSite(); }}
              />
              <Button onClick={analyzeSite} disabled={analyzing} className="shrink-0">
                {analyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing…</> : <><Sparkles className="w-4 h-4 mr-2" /> Auto-detect niche</>}
              </Button>
            </div>
            {siteSummary && <p className="text-xs text-muted-foreground italic">{siteSummary}</p>}
            <p className="text-xs text-muted-foreground">Optional — you can also fill the search fields below by hand.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Search</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Niche*</Label>
              <Input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. fractional CFOs for SaaS" />
            </div>
            <div className="space-y-2">
              <Label>Target audience</Label>
              <Input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. seed-stage founders, $1-10M ARR" />
            </div>
            <div className="space-y-2">
              <Label>Region / city</Label>
              <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Global, USA, NYC, EU…" />
            </div>
            <div className="space-y-2">
              <Label>Timeframe</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Next 30 days</SelectItem>
                  <SelectItem value="90">Next 90 days</SelectItem>
                  <SelectItem value="180">Next 6 months</SelectItem>
                  <SelectItem value="365">Next 12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={virtualOnly} onCheckedChange={setVirtualOnly} id="virt" />
              <Label htmlFor="virt" className="cursor-pointer">Virtual only</Label>
            </div>
            <div className="flex items-center justify-end md:col-span-2">
              <Button onClick={runDiscover} disabled={running} size="lg">
                {running ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching…</> : <>Find opportunities</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Collapsible>
          <CollapsibleTrigger className="w-full flex items-center justify-between gap-2 text-left text-sm bg-muted/40 rounded-md p-3 hover:bg-muted/60 transition-colors">
            <span className="flex items-center gap-2 font-medium">
              <Info className="w-4 h-4 text-primary" /> Your name & pitch (used for email drafts)
            </span>
            <ChevronDown className="w-4 h-4 opacity-60" />
          </CollapsibleTrigger>
          <CollapsibleContent className="bg-muted/30 rounded-b-md p-3 -mt-1 grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs">Your name</Label>
              <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Alex Doe" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Company</Label>
              <Input value={senderCompany} onChange={(e) => setSenderCompany(e.target.value)} placeholder="Acme" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">One-line pitch</Label>
              <Input value={senderPitch} onChange={(e) => setSenderPitch(e.target.value)} placeholder="We help X do Y" />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible>
          <CollapsibleTrigger className="w-full flex items-center justify-between gap-2 text-left text-sm bg-muted/40 rounded-md p-3 hover:bg-muted/60 transition-colors">
            <span className="flex items-center gap-2 font-medium">
              <Info className="w-4 h-4 text-primary" /> What we can (and can't) get from an event page
            </span>
            <ChevronDown className="w-4 h-4 opacity-60" />
          </CollapsibleTrigger>
          <CollapsibleContent className="text-xs text-muted-foreground bg-muted/30 rounded-b-md p-3 -mt-1 space-y-2">
            <p><CheckCircle2 className="w-3.5 h-3.5 inline text-emerald-600 mr-1" /> <strong>What we extract:</strong> organizers, speakers, sponsors, and any emails/socials the event publicly lists. <em>Find email</em> then looks up work emails via Hunter.io using name + company domain.</p>
            <p><AlertCircle className="w-3.5 h-3.5 inline text-amber-600 mr-1" /> <strong>What we can't get:</strong> the attendee list. Zoom, Luma, Eventbrite, and Hopin keep registrant lists private — no legitimate API exposes them and scraping violates ToS + GDPR.</p>
            <p><Info className="w-3.5 h-3.5 inline mr-1" /> Outreach compliance is your responsibility (CAN-SPAM, GDPR). Only contact people whose info is publicly listed for outreach, and always include an opt-out.</p>
          </CollapsibleContent>
        </Collapsible>

        <Tabs value={activeKind} onValueChange={(v) => setActiveKind(v as Kind)}>
          <TabsList className="flex-wrap h-auto">
            {(["conference", "webinar", "group", "podcast", "newsletter", "forum"] as Kind[]).map((k) => (
              <TabsTrigger key={k} value={k}>
                {KIND_LABEL[k]} <span className="ml-1.5 text-xs opacity-70">{grouped[k].length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {(["conference", "webinar", "group", "podcast", "newsletter", "forum"] as Kind[]).map((k) => (
            <TabsContent key={k} value={k} className="space-y-3 mt-4">
              {grouped[k].length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-10 border rounded-md">
                  No {KIND_LABEL[k].toLowerCase()} yet. Run a discovery above.
                </div>
              ) : grouped[k].map((opp) => (
                <OpportunityCard
                  key={opp.id} opp={opp}
                  onSave={() => saveToRadar(opp)} onAttend={() => onAttend(opp)}
                  onComment={() => onComment(opp)} onExtract={() => onExtract(opp)}
                  onDraftEmail={() => onDraftEmail(opp)}
                  onRequestEnrich={(index, count) => setConfirm({ opp, index, count })}
                  enrichBusy={enrichBusy}
                  inRadar={radarIds.has(opp.id)}
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>


      <Dialog open={commentOpen} onOpenChange={setCommentOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Comment drafts {commentMeta.platform ? `· ${commentMeta.platform}` : ""}</DialogTitle>
          </DialogHeader>
          {commentMeta.tone && <p className="text-xs text-muted-foreground -mt-2">Tone: {commentMeta.tone}</p>}
          {commentLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
              <Loader2 className="w-4 h-4 animate-spin" /> Drafting…
            </div>
          ) : (
            <div className="space-y-3">
              {commentDrafts.length === 0 && <p className="text-sm text-muted-foreground">No drafts.</p>}
              {commentDrafts.map((d, i) => (
                <div key={i} className="space-y-2">
                  <Textarea value={d} readOnly rows={3} />
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(d); toast({ title: "Copied" }); }}>
                    Copy
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={draftOpen} onOpenChange={setDraftOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              Outreach draft {draftOpp?.approach && <span className="text-xs font-normal text-muted-foreground">· {APPROACH_LABEL[draftOpp.approach] || draftOpp.approach}</span>}
            </DialogTitle>
          </DialogHeader>
          {draftLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
              <Loader2 className="w-4 h-4 animate-spin" /> Drafting…
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Subject</Label>
                <Input value={draftSubject} onChange={(e) => setDraftSubject(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Body</Label>
                <Textarea value={draftBody} onChange={(e) => setDraftBody(e.target.value)} rows={12} />
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => draftOpp && onDraftEmail(draftOpp, true)}>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Regenerate
                </Button>
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(`Subject: ${draftSubject}\n\n${draftBody}`); toast({ title: "Copied" }); }}>
                  Copy
                </Button>
                {draftOpp && (
                  <Button size="sm" asChild>
                    <a
                      href={`mailto:${draftOpp.contacts?.[0]?.email || ""}?subject=${encodeURIComponent(draftSubject)}&body=${encodeURIComponent(draftBody)}`}
                    >
                      <Mail className="w-3.5 h-3.5 mr-1.5" /> Open in mail
                    </a>
                  </Button>
                )}
              </div>
              {!(draftOpp?.contacts?.[0]?.email) && (
                <p className="text-xs text-muted-foreground">Tip: run <em>Find contacts</em> + <em>Find email</em> first to populate the recipient.</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>


      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Look up {confirm?.index === "all" ? `${confirm?.count} emails` : "email"}?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.index === "all"
                ? <>We'll search Hunter.io for work emails on <strong>{confirm?.count}</strong> contact{confirm?.count === 1 ? "" : "s"} without one. Cost is <strong>1 email unit per verified match</strong> — no charge if we don't find it. Your balance: <strong>{balance}</strong> emails.</>
                : <>We'll search Hunter.io for the work email. Cost is <strong>1 email unit</strong> if found — <strong>no charge</strong> if not. Your balance: <strong>{balance}</strong> emails.</>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirm && runEnrich(confirm.opp, confirm.index)} disabled={balance < 1}>
              {balance < 1 ? "Balance too low" : "Find email"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PartnerShell>
  );
}

function OpportunityCard({
  opp, onSave, onAttend, onComment, onExtract, onRequestEnrich, enrichBusy, inRadar,
}: {
  opp: DiscoverOpportunity;
  onSave: () => void; onAttend: () => void; onComment: () => void; onExtract: () => void;
  onRequestEnrich: (index: number | "all", count: number) => void;
  enrichBusy: string | null;
  inRadar: boolean;
}) {
  const fitColor = opp.fit_score >= 75 ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
    : opp.fit_score >= 50 ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
    : "bg-muted text-muted-foreground";
  const date = opp.event_start ? new Date(opp.event_start).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : null;
  const contacts = opp.contacts || [];
  const missingEmail = contacts.filter((c) => c.name && !c.email && c.name.trim().split(/\s+/).length >= 2);
  const bulkBusy = enrichBusy === `${opp.id}:all`;
  return (
    <Card>
      <CardContent className="p-4 flex flex-col md:flex-row gap-4">
        <div className={`shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center font-bold ${fitColor}`}>
          <span className="text-xl leading-none">{opp.fit_score}</span>
          <span className="text-[10px] uppercase mt-0.5">fit</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <a href={opp.url} target="_blank" rel="noreferrer" className="font-semibold hover:underline truncate inline-flex items-center gap-1">
              {opp.title || opp.url} <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
            {opp.is_virtual && <Badge variant="secondary" className="text-[10px]">Virtual</Badge>}
            {opp.source && <Badge variant="outline" className="text-[10px]">{opp.source}</Badge>}
            {date && <Badge variant="outline" className="text-[10px]">{date}</Badge>}
            {opp.location && !opp.is_virtual && <Badge variant="outline" className="text-[10px]">{opp.location}</Badge>}
          </div>
          {opp.host_org && <p className="text-sm text-muted-foreground mt-1">Hosted by {opp.host_org}</p>}
          {opp.fit_reason && <p className="text-sm mt-2 italic text-muted-foreground">"{opp.fit_reason}"</p>}

          {contacts.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-medium text-muted-foreground">
                  {contacts.length} contact{contacts.length === 1 ? "" : "s"} · {contacts.filter((c) => c.email).length} with email
                </div>
                {missingEmail.length > 0 && (
                  <Button size="sm" variant="secondary" disabled={bulkBusy} onClick={() => onRequestEnrich("all", missingEmail.length)}>
                    {bulkBusy ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Search className="w-3.5 h-3.5 mr-1.5" />}
                    Find all emails ({missingEmail.length})
                  </Button>
                )}
              </div>
              <div className="rounded-md border divide-y">
                {contacts.map((c, i) => {
                  const linkedinUrl = c.linkedin
                    || (c.name ? `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${c.name} ${opp.host_org || ""}`.trim())}` : null);
                  const rowBusy = enrichBusy === `${opp.id}:${i}` || bulkBusy;
                  const scoreBadge = c.email && typeof c.score === "number"
                    ? (c.score >= 80
                        ? <Badge className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" variant="outline">Verified {c.score}%</Badge>
                        : c.score >= 50
                          ? <Badge className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" variant="outline">Guessed {c.score}%</Badge>
                          : <Badge className="text-[10px]" variant="outline">Generic</Badge>)
                    : null;
                  return (
                    <div key={i} className="p-2 flex flex-wrap items-center gap-2 text-sm">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{c.name || "—"}</div>
                        {c.role && <div className="text-xs text-muted-foreground truncate">{c.role}</div>}
                        {c.email && <div className="text-xs text-primary truncate">{c.email}</div>}
                      </div>
                      {scoreBadge}
                      {linkedinUrl && (
                        <Button size="sm" variant="ghost" asChild className="h-7 px-2">
                          <a href={linkedinUrl} target="_blank" rel="noreferrer" title="Open on LinkedIn"><Linkedin className="w-3.5 h-3.5" /></a>
                        </Button>
                      )}
                      {c.email ? (
                        <Button size="sm" variant="outline" asChild className="h-7">
                          <a href={`mailto:${c.email}`}><Mail className="w-3.5 h-3.5 mr-1" /> Email</a>
                        </Button>
                      ) : c.name && c.name.trim().split(/\s+/).length >= 2 ? (
                        <Button size="sm" variant="outline" disabled={rowBusy} onClick={() => onRequestEnrich(i, 1)} className="h-7">
                          {rowBusy ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Search className="w-3.5 h-3.5 mr-1" />}
                          Find email
                        </Button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={onAttend}><CalendarPlus className="w-3.5 h-3.5 mr-1.5" /> Attend (.ics)</Button>
            <Button size="sm" variant="outline" onClick={onComment}><MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Draft comment</Button>
            <Button size="sm" variant="outline" onClick={onExtract}><Users className="w-3.5 h-3.5 mr-1.5" /> Find contacts</Button>
            <Button size="sm" variant={inRadar ? "secondary" : "ghost"} onClick={onSave}>
              <Bookmark className="w-3.5 h-3.5 mr-1.5" /> {inRadar ? "On radar" : "Save"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
