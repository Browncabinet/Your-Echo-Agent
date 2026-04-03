import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Loader2, Check, Link2, Search } from "lucide-react";
import { type Campaign } from "@/lib/campaign-data";
import { firecrawlApi, extractLeadsFromMarkdown, extractLeadsFromSearchResults } from "@/lib/api/firecrawl";
import { useToast } from "@/components/ui/use-toast";

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
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [fields, setFields] = useState({ name: true, company: true, email: true, linkedin: false });
  const { toast } = useToast();

  // Auto-generate a search query suggestion based on campaign data
  const suggestedQuery = campaign.niche && campaign.targetAudience.length > 0
    ? `${campaign.targetAudience.join(" ")} ${campaign.niche} directory contact list email`
    : "";

  const handleScrapeUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setProgress(["Scraping page..."]);

    try {
      const result = await firecrawlApi.scrape(url.trim());

      if (!result.success) {
        throw new Error(result.error || "Failed to scrape page");
      }

      setProgress((p) => [...p, "Scraping page ✓"]);
      setProgress((p) => [...p, "Extracting contacts..."]);

      const markdown = result.data?.markdown || (result as any).markdown || "";
      const leads = extractLeadsFromMarkdown(markdown);

      setProgress((p) => [...p, "Extracting contacts ✓"]);

      if (leads.length > 0) {
        onUpdate({ leads });
        toast({ title: "Success!", description: `Found ${leads.length} contacts from the page.` });
      } else {
        toast({
          title: "No contacts found",
          description: "We scraped the page but couldn't find email addresses. Try a different URL with listed contacts.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Scrape error:", error);
      toast({
        title: "Scraping failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      setProgress([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSearch = async () => {
    const rawQuery = searchQuery.trim() || suggestedQuery;
    if (!rawQuery) return;
    // Auto-append targeting keywords if not already present
    const hasKeywords = /directory|contact|email|list/i.test(rawQuery);
    const query = hasKeywords ? rawQuery : `${rawQuery} email contact directory`;
    
    setLoading(true);
    setProgress(["Searching the web..."]);

    try {
      const result = await firecrawlApi.search(query);

      if (!result.success) {
        throw new Error(result.error || "Search failed");
      }

      setProgress((p) => [...p, "Searching the web ✓"]);
      setProgress((p) => [...p, "Extracting contacts from results..."]);

      const searchData = result.data || result;
      const results = searchData.data || searchData.results || [];
      console.log("[LeadSearch] Raw search results:", results);
      const leads = extractLeadsFromSearchResults(results);

      setProgress((p) => [...p, "Extracting contacts ✓"]);

      if (leads.length > 0) {
        onUpdate({ leads });
        toast({ title: "Success!", description: `Found ${leads.length} contacts from search results.` });
      } else {
        toast({
          title: `Searched ${results.length} pages — no emails found`,
          description: "Try a more specific query like 'real estate agents Miami directory email' to target pages with contact info.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      setProgress([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Find Your Leads</h2>
        <p className="text-sm text-muted-foreground mt-1">Search the web or paste a URL to extract contact info automatically.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === "search" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("search")}
          className="gap-2"
        >
          <Search className="w-4 h-4" /> Auto Search
        </Button>
        <Button
          variant={mode === "url" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("url")}
          className="gap-2"
        >
          <Link2 className="w-4 h-4" /> Paste URL
        </Button>
      </div>

      <div className="space-y-4">
        {mode === "search" ? (
          <div>
            <Label>Search for leads (we'll find contacts automatically)</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                placeholder={suggestedQuery || "e.g. real estate agents in Miami email"}
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
                <Input
                  placeholder="https://example.com/directory"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10"
                />
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
                {p.includes("✓") ? (
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />
                )}
                <span className={p.includes("✓") ? "text-success font-medium" : "text-foreground"}>
                  {p.replace(" ✓", "")}
                </span>
              </div>
            ))}
          </Card>
        )}

        <div>
          <Label className="mb-2 block">Data Fields to Extract</Label>
          <div className="flex flex-wrap gap-4">
            {Object.entries(fields).map(([key, val]) => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={val}
                  disabled={key === "email"}
                  onCheckedChange={(v) => setFields((f) => ({ ...f, [key]: !!v }))}
                />
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
