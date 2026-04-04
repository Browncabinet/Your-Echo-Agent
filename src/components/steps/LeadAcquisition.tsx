import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowRight, ArrowLeft, Loader2, Check, Link2, Search, Info, MapPin, ChevronDown, X, Plus, Sparkles } from "lucide-react";
import { type Campaign, BATCH_TIERS } from "@/lib/campaign-data";
import { firecrawlApi, extractLeadsFromMarkdown, extractLeadsFromSearchResults } from "@/lib/api/firecrawl";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { type Lead } from "@/lib/campaign-data";

type Props = {
  campaign: Campaign;
  onUpdate: (c: Partial<Campaign>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function LeadAcquisition({ campaign, onUpdate, onNext, onBack }: Props) {
  const [url, setUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState(campaign.location || "");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [fields, setFields] = useState({ name: true, company: true, email: true, linkedin: false });
  const [scrapeOpen, setScrapeOpen] = useState(false);
  const [newPointInput, setNewPointInput] = useState("");
  const { toast } = useToast();

  const selectedBatch = campaign.batchSize || 50;
  const sellingPoints = campaign.sellingPoints || [];

  const buildQuery = (base: string) => {
    const loc = location.trim();
    return loc ? `${base} ${loc}` : base;
  };

  const suggestedQuery = campaign.niche && campaign.targetAudience.length > 0
    ? `${campaign.targetAudience.join(" ")} ${campaign.niche} directory contact list email`
    : "";

  const removeSellingPoint = (point: string) => {
    onUpdate({ sellingPoints: sellingPoints.filter((p) => p !== point) });
  };

  const addSellingPoint = () => {
    const point = newPointInput.trim();
    if (point && !sellingPoints.includes(point) && sellingPoints.length < 5) {
      onUpdate({ sellingPoints: [...sellingPoints, point] });
      setNewPointInput("");
    }
  };

  const extractSellingPoints = async (): Promise<boolean> => {
    if (!campaign.websiteUrl) return true;
    if (sellingPoints.length > 0) return true;

    setProgress((p) => [...p, "Analyzing your website..."]);

    try {
      const scrapeResult = await firecrawlApi.scrape(campaign.websiteUrl);
      if (!scrapeResult.success) {
        setProgress((p) => [...p, "Website analysis skipped (couldn't reach site) ✓"]);
        return true;
      }

      const summary = scrapeResult.data?.summary || scrapeResult.data?.markdown?.slice(0, 2000) || (scrapeResult as any).summary || (scrapeResult as any).markdown?.slice(0, 2000) || "";

      if (!summary) {
        setProgress((p) => [...p, "Website analysis skipped (no content found) ✓"]);
        return true;
      }

      const { data, error } = await supabase.functions.invoke('extract-selling-points', {
        body: { summary, niche: campaign.niche, goal: campaign.goal },
      });

      if (error || !data?.success) {
        setProgress((p) => [...p, "Website analysis skipped ✓"]);
        return true;
      }

      onUpdate({ sellingPoints: data.sellingPoints });
      setProgress((p) => [...p, `Found ${data.sellingPoints.length} selling points from your website ✓`]);
      return true;
    } catch (err) {
      console.error("Selling points extraction error:", err);
      setProgress((p) => [...p, "Website analysis skipped ✓"]);
      return true;
    }
  };

  const handleScrapeUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setProgress(["Scraping page..."]);

    try {
      const result = await firecrawlApi.scrape(url.trim());
      if (!result.success) throw new Error(result.error || "Failed to scrape page");

      setProgress((p) => [...p, "Scraping page ✓", "Extracting contacts..."]);
      const markdown = result.data?.markdown || (result as any).markdown || "";
      const allLeads = extractLeadsFromMarkdown(markdown);
      const leads = allLeads.slice(0, selectedBatch);

      setProgress([]);

      if (leads.length > 0) {
        onUpdate({ leads });
        toast({ title: "Success!", description: `Found ${leads.length} contacts from the page (capped at ${selectedBatch}).` });
      } else {
        toast({ title: "No contacts found", description: "Try a different URL with listed contacts.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Scrape error:", error);
      toast({ title: "Scraping failed", description: error instanceof Error ? error.message : "Something went wrong", variant: "destructive" });
      setProgress([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSearch = async () => {
    const rawQuery = searchQuery.trim() || suggestedQuery;
    if (!rawQuery) return;

    setLoading(true);
    setProgress([]);

    if (location.trim()) {
      onUpdate({ location: location.trim() });
    }

    // Step 1: Auto-extract selling points from website
    await extractSellingPoints();

    // Step 2: Search for leads
    setProgress((prev) => [...prev, "Starting smart search..."]);

    const seenEmails = new Set<string>();
    let allLeads: Lead[] = [];

    const audience = campaign.targetAudience.join(" ");
    const niche = campaign.niche;

    const queries = [
      buildQuery(rawQuery.includes("directory") ? rawQuery : `${rawQuery} email contact directory`),
      buildQuery(`${audience} ${niche} list members email`),
      buildQuery(`${niche} association directory emails ${audience}`),
    ];

    const uniqueQueries = [...new Set(queries)];

    try {
      for (let i = 0; i < uniqueQueries.length; i++) {
        if (allLeads.length >= selectedBatch) break;

        const q = uniqueQueries[i];
        setProgress((prev) => [...prev, `Round ${i + 1}: Searching "${q.slice(0, 60)}${q.length > 60 ? '…' : ''}"...`]);

        const result = await firecrawlApi.search(q, { limit: 20 });
        if (!result.success) {
          setProgress((prev) => [...prev, `Round ${i + 1}: Search failed ✓`]);
          continue;
        }

        const searchData = result.data || result;
        const results = Array.isArray(searchData) ? searchData : (searchData.data || searchData.results || []);
        const roundLeads = extractLeadsFromSearchResults(results);

        let newCount = 0;
        for (const lead of roundLeads) {
          if (!seenEmails.has(lead.email) && allLeads.length < selectedBatch) {
            seenEmails.add(lead.email);
            allLeads.push(lead);
            newCount++;
          }
        }

        setProgress((prev) => [...prev, `Round ${i + 1}: Found ${newCount} new leads (${allLeads.length} total) ✓`]);
      }

      setProgress([]);

      if (allLeads.length > 0) {
        onUpdate({ leads: allLeads });
        toast({ title: "Success!", description: `Found ${allLeads.length} contacts across ${uniqueQueries.length} search rounds.` });
      } else {
        toast({ title: "No contacts found", description: "Try a more specific query or different location.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({ title: "Search failed", description: error instanceof Error ? error.message : "Something went wrong", variant: "destructive" });
      setProgress([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Find Your Leads</h2>
        <p className="text-sm text-muted-foreground mt-1">Choose your batch size, then search the web to find contacts.</p>
      </div>

      {/* Batch size selector */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">How many contacts do you want to find?</Label>
        <div className="grid grid-cols-2 gap-2">
          {BATCH_TIERS.map((tier) => (
            <button
              key={tier.value}
              onClick={() => onUpdate({ batchSize: tier.value })}
              className={`relative rounded-lg border-2 p-3 text-left transition-all ${
                selectedBatch === tier.value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-semibold text-sm text-foreground">{tier.label}</span>
                <span className="text-xs text-muted-foreground">{tier.tier}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{tier.range} contacts</p>
              <p className="text-xs text-primary/80 mt-1">{tier.description}</p>
            </button>
          ))}
        </div>
        <div className="flex items-start gap-2 rounded-md bg-accent/50 border border-accent p-3">
          <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Start with a small batch to test your emails before scaling up. You can always add more contacts later.
          </p>
        </div>
      </div>

      {/* Location input */}
      <div>
        <Label className="text-sm font-semibold">Target Location</Label>
        <div className="relative mt-1.5">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder='e.g. "Miami, FL" or "California" or "United States"'
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">Narrow results to a specific city, state, or country</p>
      </div>

      {/* Search input — always visible */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-semibold">Search for leads</Label>
          <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">We'll run multiple rounds automatically to find as many contacts as possible.</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={suggestedQuery || "e.g. real estate agents contact email directory"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAutoSearch} disabled={loading || (!searchQuery.trim() && !suggestedQuery)} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Find Leads</>}
            </Button>
          </div>
          {suggestedQuery && !searchQuery && (
            <p className="text-xs text-muted-foreground mt-1">
              Suggested: <button className="text-primary underline" onClick={() => setSearchQuery(suggestedQuery)}>{suggestedQuery}</button>
            </p>
          )}
        </div>

        {/* Collapsible scrape option */}
        <Collapsible open={scrapeOpen} onOpenChange={setScrapeOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className={`w-4 h-4 transition-transform ${scrapeOpen ? "rotate-180" : ""}`} />
            Or paste a URL to scrape
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="https://example.com/directory" value={url} onChange={(e) => setUrl(e.target.value)} className="pl-10" />
              </div>
              <Button variant="outline" onClick={handleScrapeUrl} disabled={loading || !url.trim()}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Scrape"}
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Progress */}
        {progress.length > 0 && (
          <Card className="p-4 space-y-2">
            {progress.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {p.includes("✓") ? <Check className="w-4 h-4 text-success flex-shrink-0" /> : <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />}
                <span className={p.includes("✓") ? "text-success font-medium" : "text-foreground"}>{p.replace(" ✓", "")}</span>
              </div>
            ))}
          </Card>
        )}

        {/* Selling Points — always visible */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <Label className="text-sm font-semibold">Key Selling Points</Label>
          </div>
          {sellingPoints.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {sellingPoints.map((point) => (
                <Badge key={point} variant="default" className="gap-1 pr-1.5 cursor-default">
                  {point}
                  <button
                    onClick={() => removeSellingPoint(point)}
                    className="ml-1 rounded-full hover:bg-primary-foreground/20 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No selling points yet — click Find Leads to auto-extract from your website, or add manually below.</p>
          )}
          {sellingPoints.length < 5 && (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add a selling point..."
                value={newPointInput}
                onChange={(e) => setNewPointInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSellingPoint(); } }}
                className="h-8 text-sm flex-1"
              />
              <Button variant="outline" size="sm" className="h-8 gap-1" onClick={addSellingPoint} disabled={!newPointInput.trim()}>
                <Plus className="w-3 h-3" /> Add
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">These personalize your emails. Click ✕ to remove.</p>
        </div>

        {/* Data fields */}
        <div>
          <Label className="mb-2 block">Data Fields to Extract</Label>
          <div className="flex flex-wrap gap-4">
            {Object.entries(fields).map(([key, val]) => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={val} disabled={key === "email"} onCheckedChange={(v) => setFields((f) => ({ ...f, [key]: !!v }))} />
                <span className="capitalize">{key === "linkedin" ? "LinkedIn Profile" : key}</span>
                {key === "email" && <span className="text-xs text-muted-foreground">(required)</span>}
              </label>
            ))}
          </div>
        </div>

        {/* Success indicator */}
        {campaign.leads.length > 0 && (
          <Card className="p-4 bg-success-light border-success/20">
            <p className="text-sm font-medium text-success">
              ✓ {campaign.leads.length} leads found and ready!
            </p>
          </Card>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} disabled={campaign.leads.length === 0} size="lg" className="gap-2">
          Build Email Campaign <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
