import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Loader2, X } from "lucide-react";
import { type Campaign } from "@/lib/campaign-data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuickUpdateBarProps {
  campaigns: Campaign[];
}

export function QuickUpdateBar({ campaigns }: QuickUpdateBarProps) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filter campaigns: match by name or "Project #N"
  const filtered = campaigns.filter((c, i) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const nameMatch = c.name.toLowerCase().includes(q);
    const projectMatch = `project #${i + 1}`.includes(q);
    return nameMatch || projectMatch;
  });

  const fetchSummary = async (campaign: Campaign) => {
    setLoading(true);
    setSummary(null);
    setSelectedName(campaign.name || "Untitled Campaign");
    setShowDropdown(false);
    setQuery("");

    try {
      const { data, error } = await supabase.functions.invoke("campaign-summary", {
        body: {
          campaign: {
            name: campaign.name,
            niche: campaign.niche,
            goal: campaign.goal,
            leadCount: campaign.leads.length,
            emailCount: campaign.emails.length,
            stats: campaign.stats,
          },
        },
      });

      if (error) throw error;
      setSummary(data?.summary || "No summary available.");
    } catch (err: any) {
      console.error("Quick update error:", err);
      toast.error(err?.message || "Failed to get campaign summary");
      setSummary(null);
      setSelectedName(null);
    } finally {
      setLoading(false);
    }
  };

  const dismiss = () => {
    setSummary(null);
    setSelectedName(null);
  };

  const noCampaigns = campaigns.length === 0;

  return (
    <div ref={wrapperRef} className="w-full max-w-xl mx-auto mb-8 relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={noCampaigns ? "No campaigns yet" : "Search campaigns or type \"Project #1\"..."}
          disabled={noCampaigns}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className="pl-10"
        />
      </div>

      {/* Dropdown */}
      {showDropdown && !noCampaigns && filtered.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto p-1">
          {filtered.map((c, i) => {
            const displayIndex = campaigns.indexOf(c) + 1;
            return (
              <button
                key={c.id}
                className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                onClick={() => fetchSummary(c)}
              >
                <span className="font-medium text-foreground">{c.name || "Untitled"}</span>
                <span className="text-muted-foreground ml-2 text-xs">Project #{displayIndex}</span>
              </button>
            );
          })}
        </Card>
      )}

      {/* Loading state */}
      {loading && (
        <Card className="mt-3 p-4 flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Getting update for {selectedName}...</span>
        </Card>
      )}

      {/* Summary result */}
      {summary && !loading && (
        <Card className="mt-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-primary mb-1">{selectedName}</p>
              <p className="text-sm text-foreground leading-relaxed">{summary}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={dismiss} className="shrink-0 h-6 w-6 p-0">
              <X className="w-3 h-3" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
