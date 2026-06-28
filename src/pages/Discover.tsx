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
import { CalendarPlus, MessageSquare, Users, Mail, Bookmark, Loader2, ExternalLink, Sparkles, Info } from "lucide-react";
import { SeoHead } from "@/components/SeoHead";

type Kind = "group" | "conference" | "webinar" | "podcast";
const KIND_LABEL: Record<Kind, string> = { group: "Groups", conference: "Conferences", webinar: "Webinars", podcast: "Podcasts" };

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
    const g: Record<Kind, DiscoverOpportunity[]> = { group: [], conference: [], webinar: [], podcast: [] };
    for (const it of items) g[it.kind]?.push(it);
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

  const remaining = Math.max(0, (caps?.["discoveries_cap" as keyof typeof caps] as number | undefined ?? 0) - (caps?.["discoveries_used" as keyof typeof caps] as number | undefined ?? 0));

  return (
    <PartnerShell width="wide">
      <SeoHead
        title="AI event & community discovery for your niche — Your Echo Agent"
        description="Find conferences, webinars, podcasts, and groups in your niche. AI fit-scores each one, drafts comments, and extracts contacts."
        path="/for-agents/discover"
      />
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-primary" /> Discover
            </h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              Find groups, conferences, webinars, and podcasts that match your niche — with an AI-scored fit.
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            Discoveries remaining this week: {remaining}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {[
            { n: "1", t: "Set niche" },
            { n: "2", t: "AI discovers" },
            { n: "3", t: "Fit-scored" },
            { n: "4", t: "Email / comment / save" },
          ].map((s) => (
            <div key={s.n} className="rounded-md border bg-muted/30 px-3 py-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center font-mono text-[10px]">{s.n}</span>
              <span className="text-muted-foreground">{s.t}</span>
            </div>
          ))}
        </div>

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

        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 rounded-md p-3">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Outreach compliance is your responsibility. Follow CAN-SPAM, GDPR, and each platform&apos;s rules. Only contact people whose info is publicly listed for outreach, and always include an opt-out.
          </span>
        </div>

        <Tabs value={activeKind} onValueChange={(v) => setActiveKind(v as Kind)}>
          <TabsList>
            {(["conference", "webinar", "group", "podcast"] as Kind[]).map((k) => (
              <TabsTrigger key={k} value={k}>
                {KIND_LABEL[k]} <span className="ml-1.5 text-xs opacity-70">{grouped[k].length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {(["conference", "webinar", "group", "podcast"] as Kind[]).map((k) => (
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
    </PartnerShell>
  );
}

function OpportunityCard({
  opp, onSave, onAttend, onComment, onExtract, inRadar,
}: {
  opp: DiscoverOpportunity;
  onSave: () => void; onAttend: () => void; onComment: () => void; onExtract: () => void;
  inRadar: boolean;
}) {
  const fitColor = opp.fit_score >= 75 ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
    : opp.fit_score >= 50 ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
    : "bg-muted text-muted-foreground";
  const date = opp.event_start ? new Date(opp.event_start).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : null;
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
          {opp.contacts?.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              {opp.contacts.length} contact{opp.contacts.length === 1 ? "" : "s"} extracted
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={onAttend}><CalendarPlus className="w-3.5 h-3.5 mr-1.5" /> Attend (.ics)</Button>
            <Button size="sm" variant="outline" onClick={onComment}><MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Draft comment</Button>
            <Button size="sm" variant="outline" onClick={onExtract}><Users className="w-3.5 h-3.5 mr-1.5" /> Find contacts</Button>
            {opp.contacts?.some((c) => c.email) && (
              <Button size="sm" variant="outline" asChild>
                <a href={`mailto:${opp.contacts.find((c) => c.email)!.email}`}><Mail className="w-3.5 h-3.5 mr-1.5" /> Email</a>
              </Button>
            )}
            <Button size="sm" variant={inRadar ? "secondary" : "ghost"} onClick={onSave}>
              <Bookmark className="w-3.5 h-3.5 mr-1.5" /> {inRadar ? "On radar" : "Save"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
