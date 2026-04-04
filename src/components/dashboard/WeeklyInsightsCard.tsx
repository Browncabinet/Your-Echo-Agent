import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { type Campaign } from "@/lib/campaign-data";

interface WeeklyInsightsCardProps {
  campaign: Campaign;
  stats: { sent: number; opened: number; clicked: number; replied: number };
}

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getCacheKey(campaignId: string) {
  return `weekly-insights-${campaignId}`;
}

function getCachedInsight(campaignId: string): string | null {
  try {
    const raw = localStorage.getItem(getCacheKey(campaignId));
    if (!raw) return null;
    const { text, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(getCacheKey(campaignId));
      return null;
    }
    return text;
  } catch {
    return null;
  }
}

function setCachedInsight(campaignId: string, text: string) {
  localStorage.setItem(
    getCacheKey(campaignId),
    JSON.stringify({ text, timestamp: Date.now() })
  );
}

export function WeeklyInsightsCard({ campaign, stats }: WeeklyInsightsCardProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsight = async (force = false) => {
    if (!force) {
      const cached = getCachedInsight(campaign.id);
      if (cached) {
        setInsight(cached);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("campaign-summary", {
        body: {
          campaign: {
            name: campaign.name,
            niche: campaign.niche,
            goal: campaign.goal,
            leadCount: campaign.leads.length,
            emailCount: campaign.emails.length,
            stats,
          },
          type: "weekly",
        },
      });

      if (fnError) throw fnError;

      const text = data?.summary || "No insights available right now.";
      setInsight(text);
      setCachedInsight(campaign.id, text);
    } catch (e: any) {
      setError("Couldn't load insights — try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, [campaign.id]);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Weekly AI Insights</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchInsight(true)}
          disabled={loading}
          className="h-7 gap-1.5 text-xs text-muted-foreground"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          Refresh
        </Button>
      </div>

      {loading && !insight && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating insights…
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {insight && (
        <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
      )}
    </Card>
  );
}
