import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Loader2, Check, Link2, Search, Info, MapPin } from "lucide-react";
import { type Campaign, BATCH_TIERS } from "@/lib/campaign-data";
import { firecrawlApi, extractLeadsFromMarkdown, extractLeadsFromSearchResults } from "@/lib/api/firecrawl";
import { useToast } from "@/components/ui/use-toast";
import { type Lead } from "@/lib/campaign-data";

type Props = {
  campaign: Campaign;
  onUpdate: (c: Partial<Campaign>) => void;
  onNext: () => void;
  onBack: () => void;
};

type Mode = "url" | "search";

export function LeadAcquisition({ campaign, onUpdate, onNext, onBack }: Props) {
  const [mode, setMode] = useState<Mode>("search");
  const [url, setUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState(campaign.location || "");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [fields, setFields] = useState({ name: true, company: true, email: true, linkedin: false });
  const { toast } = useToast();

  const selectedBatch = campaign.batchSize || 50;

  const buildQuery = (base: string) => {
    const loc = location.trim();
    return loc ? `${base} ${loc}` : base;
  };

  const suggestedQuery = campaign.niche && campaign.targetAudience.length > 0
    ? `${campaign.targetAudience.join(" ")} ${campaign.niche} directory contact list email`
    : "";

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

      setProgress((p) => [...p, "Extracting contacts ✓"]);

      if (leads.length > 0) {
        onUpdate({ leads });
        setProgress([]);
        toast({ title: "Success!", description: `Found ${leads.length} contacts from the page (capped at ${selectedBatch}).` });
      } else {
        setProgress([]);
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
    setProgress(["Starting smart search..."]);

    // Save location to campaign
    if (location.trim()) {
      onUpdate({ location: location.trim() });
    }

    const seenEmails = new Set<string>();
    let allLeads: Lead[] = [];

    // Build multiple query variations for more results
    const audience = campaign.targetAudience.join(" ");
    const niche = campaign.niche;
    const loc = location.trim();

    const queries = [
      buildQuery(rawQuery.includes("directory") ? rawQuery : `${rawQuery} email contact directory`),
      buildQuery(`${audience} ${niche} list members email`),
      buildQuery(`${niche} association directory emails ${audience}`),
    ];

    // Remove duplicate queries
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
        <p className="text-sm text-muted-foreground mt-1">Choose your batch size, then search the web or scrape a page to extract contacts.</p>
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

      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button variant={mode === "search" ? "default" : "outline"} size="sm" onClick={() => setMode("search")} className="gap-2">
          <Search className="w-4 h-4" /> Smart Search
        </Button>
        <Button variant={mode === "url" ? "default" : "outline"} size="sm" onClick={() => setMode("url")} className="gap-2">
          <Link2 className="w-4 h-4" /> Scrape a Page
        </Button>
      </div>

      <div className="space-y-4">
        {mode === "search" ? (
          <div>
            <Label>Search for leads (we'll run multiple rounds automatically)</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                placeholder={suggestedQuery || "e.g. real estate agents contact email directory"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={handleAutoSearch} disabled={loading || (!searchQuery.trim() && !suggestedQuery)}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
              </Button>
            </div>
            {suggestedQuery && !searchQuery && (
              <p className="text-xs text-muted-foreground mt-1">
                Suggested: <button className="text-primary underline" onClick={() => setSearchQuery(suggestedQuery)}>{suggestedQuery}</button>
              </p>
            )}
          </div>
        ) : (
          <div>
            <Label>Paste a URL (directory, Google search, association page, etc.)</Label>
            <div className="flex gap-2 mt-1.5">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="https://example.com/directory" value={url} onChange={(e) => setUrl(e.target.value)} className="pl-10" />
              </div>
              <Button onClick={handleScrapeUrl} disabled={loading || !url.trim()}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Scrape"}
              </Button>
            </div>
          </div>
        )}

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
