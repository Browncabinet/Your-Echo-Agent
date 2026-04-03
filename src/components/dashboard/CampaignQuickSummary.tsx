import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Loader2, ChevronUp } from "lucide-react";
import { type Campaign } from "@/lib/campaign-data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CampaignQuickSummaryProps {
  campaign: Campaign;
}

export function CampaignQuickSummary({ campaign }: CampaignQuickSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const { sent = 0, opened = 0, clicked = 0, replied = 0 } = campaign.stats || {};
  const openRate = sent > 0 ? Math.round((opened / sent) * 100) : 0;
  const clickRate = sent > 0 ? Math.round((clicked / sent) * 100) : 0;
  const replyRate = sent > 0 ? Math.round((replied / sent) * 100) : 0;

  const fetchSummary = async () => {
    if (summary) {
      setExpanded(!expanded);
      return;
    }

    setExpanded(true);
    setLoading(true);

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
      console.error("Campaign summary error:", err);
      toast.error(err?.message || "Failed to get summary");
      setExpanded(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            fetchSummary();
          }}
          className="gap-1 text-xs h-7"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
          {expanded ? "Hide Update" : "Get Update"}
        </Button>
      </div>

      {expanded && (
        <div
          className="mt-2 p-3 rounded-md bg-muted/50 space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bars */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-16">Opened</span>
              <Progress value={openRate} className="h-2 flex-1" />
              <span className="text-xs font-medium w-10 text-right">{openRate}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-16">Clicked</span>
              <Progress value={clickRate} className="h-2 flex-1" />
              <span className="text-xs font-medium w-10 text-right">{clickRate}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-16">Replied</span>
              <Progress value={replyRate} className="h-2 flex-1" />
              <span className="text-xs font-medium w-10 text-right">{replyRate}%</span>
            </div>
          </div>

          {/* AI Summary */}
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Generating summary...
            </div>
          ) : summary ? (
            <p className="text-sm text-foreground leading-relaxed">{summary}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
