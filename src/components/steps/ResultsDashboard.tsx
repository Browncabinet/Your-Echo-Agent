import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Eye, MousePointerClick, MessageSquare, ArrowLeft, TrendingUp } from "lucide-react";
import { type Campaign } from "@/lib/campaign-data";
import { MetricsOverview } from "@/components/dashboard/MetricsOverview";
import { ABTestingCard } from "@/components/dashboard/ABTestingCard";
import { WeeklyInsightsCard } from "@/components/dashboard/WeeklyInsightsCard";

type Props = {
  campaign: Campaign;
  onBack: () => void;
};

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <Card className="p-5 flex items-center gap-4">
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
  const approvedCount = campaign.leads.filter((l) => l.approved).length;
  const stats = {
    sent: approvedCount,
    opened: Math.floor(approvedCount * 0.45),
    clicked: Math.floor(approvedCount * 0.12),
    replied: Math.floor(approvedCount * 0.08),
  };

  const openRate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Campaign Results</h2>
        <p className="text-sm text-muted-foreground mt-1">"{campaign.name}" — live performance</p>
      </div>

      {/* NEW: Visual metrics with donut charts + progress bars */}
      <MetricsOverview stats={stats} />

      {/* Existing stat cards preserved */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Mail} label="Emails Sent" value={stats.sent} color="bg-primary/10 text-primary" />
        <StatCard icon={Eye} label="Opened" value={stats.opened} color="bg-secondary text-secondary-foreground" />
        <StatCard icon={MousePointerClick} label="Clicked" value={stats.clicked} color="bg-success-light text-success" />
        <StatCard icon={MessageSquare} label="Replies" value={stats.replied} color="bg-accent text-accent-foreground" />
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Insights & Suggestions</h3>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✓ Your open rate is <strong className="text-foreground">{openRate}%</strong> — {Number(openRate) > 30 ? "above average!" : "try A/B testing subject lines."}</li>
          <li>✓ {stats.replied} people replied — follow up within 24 hours for best results.</li>
          <li>✓ Consider sending follow-up #{campaign.emails.length} to non-openers in 3 days.</li>
        </ul>
      </Card>


      {/* A/B Testing comparison */}
      <ABTestingCard campaign={campaign} />

      <Button variant="outline" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Campaigns
      </Button>
    </div>
  );
}
