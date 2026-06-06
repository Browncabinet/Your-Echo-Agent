import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Eye,
  MousePointerClick,
  MessageSquare,
  ArrowLeft,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { type Campaign } from "@/lib/campaign-data";
import { MetricsOverview } from "@/components/dashboard/MetricsOverview";
import { ABTestingCard } from "@/components/dashboard/ABTestingCard";
import { WeeklyInsightsCard } from "@/components/dashboard/WeeklyInsightsCard";
import { SendsTimeline } from "@/components/dashboard/SendsTimeline";
import { RecipientsTable } from "@/components/dashboard/RecipientsTable";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useCallback, useRef } from "react";

type Props = {
  campaign: Campaign;
  onBack: () => void;
};

type FailedSend = { lead_email: string; lead_name: string; error_message: string | null };

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  onClick,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`p-5 flex items-center gap-4 ${onClick ? "cursor-pointer hover:border-primary/40 transition-colors" : ""}`}
      onClick={onClick}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}

export function ResultsDashboard({ campaign, onBack }: Props) {
  const [stats, setStats] = useState({ sent: 0, opened: 0, clicked: 0, replied: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [failedList, setFailedList] = useState<FailedSend[]>([]);
  const [showFailed, setShowFailed] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data: sends } = await supabase
        .from("campaign_sends")
        .select("status, opened_at, clicked_at, lead_email, lead_name, error_message")
        .eq("campaign_id", campaign.id);

      const { data: replyRows } = await supabase
        .from("email_replies")
        .select("lead_email")
        .eq("campaign_id", campaign.id);

      const sentCount = sends?.filter((s) => s.status === "sent").length || 0;
      const openedCount = sends?.filter((s) => s.opened_at).length || 0;
      const clickedCount = sends?.filter((s) => s.clicked_at).length || 0;
      const failed = (sends || []).filter((s) => s.status === "failed");

      // Dedupe replies by lead_email so multiple replies from one person count once
      const uniqueRepliers = new Set((replyRows || []).map((r) => r.lead_email).filter(Boolean));

      setStats({
        sent: sentCount,
        opened: openedCount,
        clicked: clickedCount,
        replied: uniqueRepliers.size,
        failed: failed.length,
      });
      setFailedList(
        failed.map((f) => ({
          lead_email: f.lead_email,
          lead_name: f.lead_name,
          error_message: f.error_message,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }, [campaign.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Realtime: refresh when campaign_sends or email_replies change for this campaign.
  // Debounce bursts so a batch of 15 sends triggers one refetch, not 15.
  useEffect(() => {
    const scheduleRefetch = () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        fetchStats();
      }, 800);
    };

    const channel = supabase
      .channel(`dashboard:${campaign.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "campaign_sends",
          filter: `campaign_id=eq.${campaign.id}`,
        },
        scheduleRefetch
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "email_replies",
          filter: `campaign_id=eq.${campaign.id}`,
        },
        scheduleRefetch
      )
      .subscribe();

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [campaign.id, fetchStats]);

  // Auto-poll every 30s while the campaign is actively sending (belt + suspenders).
  useEffect(() => {
    if (campaign.status !== "active" && campaign.status !== "sending") return;
    const id = window.setInterval(fetchStats, 30000);
    return () => window.clearInterval(id);
  }, [campaign.status, fetchStats]);

  const openRate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Campaign Results</h2>
          <p className="text-sm text-muted-foreground mt-1">"{campaign.name}" — live performance</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading} className="gap-2">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <MetricsOverview stats={stats} />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Mail} label="Emails Sent" value={stats.sent} color="bg-primary/10 text-primary" />
        <StatCard icon={Eye} label="Opened" value={stats.opened} color="bg-secondary text-secondary-foreground" />
        <StatCard icon={MousePointerClick} label="Clicked" value={stats.clicked} color="bg-success-light text-success" />
        <StatCard icon={MessageSquare} label="Replies" value={stats.replied} color="bg-accent text-accent-foreground" />
        <StatCard
          icon={AlertTriangle}
          label={stats.failed > 0 ? "Failed — tap to see" : "Failed"}
          value={stats.failed}
          color="bg-destructive/10 text-destructive"
          onClick={stats.failed > 0 ? () => setShowFailed((v) => !v) : undefined}
        />
      </div>

      <SendsTimeline campaignId={campaign.id} />

      <RecipientsTable campaignId={campaign.id} campaignName={campaign.name} />

      {showFailed && stats.failed > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h3 className="font-semibold text-sm text-foreground">
                Failed sends ({stats.failed})
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setShowFailed(false)}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            These emails didn't go out. Most failures are caused by a disconnected Gmail or an
            invalid recipient address.
          </p>
          <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {failedList.map((f, i) => (
              <li
                key={`${f.lead_email}-${i}`}
                className="text-xs border border-border rounded-md p-2 bg-muted/30"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground truncate">
                    {f.lead_name || f.lead_email}
                  </span>
                  <span className="text-muted-foreground truncate">{f.lead_email}</span>
                </div>
                {f.error_message && (
                  <p className="text-destructive mt-1 leading-snug">{f.error_message}</p>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Insights & Suggestions</h3>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {stats.sent === 0 && (
            <li>✓ No emails sent yet — once sending starts, results appear here in real time.</li>
          )}
          {stats.sent > 0 && (
            <li>
              ✓ Your open rate is <strong className="text-foreground">{openRate}%</strong> —{" "}
              {Number(openRate) > 30
                ? "above average!"
                : "try A/B testing subject lines."}
            </li>
          )}
          {stats.replied > 0 && (
            <li>
              ✓ {stats.replied} {stats.replied === 1 ? "person" : "people"} replied — follow up
              within 24 hours for best results.
            </li>
          )}
          {stats.sent >= 10 && stats.opened / stats.sent < 0.2 && campaign.emails.length > 1 && (
            <li>
              ✓ Open rate is low — consider sending a follow-up to non-openers in a few days.
            </li>
          )}
          {stats.failed > 0 && (
            <li className="text-destructive">
              ⚠ {stats.failed} {stats.failed === 1 ? "send" : "sends"} failed — tap the Failed card
              above to see why.
            </li>
          )}
        </ul>
      </Card>

      <ABTestingCard campaign={campaign} />

      <WeeklyInsightsCard campaign={campaign} stats={stats} />

      <Button variant="outline" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Campaigns
      </Button>
    </div>
  );
}
