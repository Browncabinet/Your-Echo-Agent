import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FlaskConical, Trophy } from "lucide-react";
import { type Campaign } from "@/lib/campaign-data";
import { supabase } from "@/integrations/supabase/client";

interface ABTestingCardProps {
  campaign: Campaign;
}

type VariantStats = {
  variant: "A" | "B";
  sent: number;
  opened: number;
  openRate: number;
};

const MIN_PER_VARIANT = 5;

export function ABTestingCard({ campaign }: ABTestingCardProps) {
  const abEmail = campaign.emails.find((e) => e.subjectB && String(e.subjectB).trim());
  const [stats, setStats] = useState<{ A: VariantStats; B: VariantStats } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!abEmail) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("campaign_sends")
        .select("variant, status, opened_at")
        .eq("campaign_id", campaign.id)
        .in("variant", ["A", "B"]);

      if (cancelled) return;

      const tally = (v: "A" | "B"): VariantStats => {
        const rows = (data || []).filter((r: any) => r.variant === v);
        const sent = rows.filter((r: any) => r.status === "sent").length;
        const opened = rows.filter((r: any) => r.opened_at).length;
        return {
          variant: v,
          sent,
          opened,
          openRate: sent > 0 ? (opened / sent) * 100 : 0,
        };
      };

      setStats({ A: tally("A"), B: tally("B") });
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel(`abtest:${campaign.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "campaign_sends", filter: `campaign_id=eq.${campaign.id}` },
        () => load()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [campaign.id, abEmail]);

  if (!abEmail) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">A/B Subject Testing</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          No A/B tests running yet. Add a "Subject B" variant in the Email Builder to start testing.
        </p>
      </Card>
    );
  }

  const enoughData =
    stats && stats.A.sent >= MIN_PER_VARIANT && stats.B.sent >= MIN_PER_VARIANT;
  const winner = enoughData
    ? stats!.A.openRate >= stats!.B.openRate
      ? "A"
      : "B"
    : null;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">A/B Subject Testing</h3>
          <Badge variant="secondary" className="text-[10px]">1 test</Badge>
        </div>
        {!enoughData && !loading && (
          <span className="text-[10px] text-muted-foreground">
            Need {MIN_PER_VARIANT}+ sends per variant
          </span>
        )}
      </div>

      <div className="space-y-3">
        <VariantRow
          letter="A"
          subject={abEmail.subject}
          stats={stats?.A}
          isWinner={winner === "A"}
          enoughData={!!enoughData}
        />
        <VariantRow
          letter="B"
          subject={abEmail.subjectB!}
          stats={stats?.B}
          isWinner={winner === "B"}
          enoughData={!!enoughData}
        />
      </div>
    </Card>
  );
}

function VariantRow({
  letter,
  subject,
  stats,
  isWinner,
  enoughData,
}: {
  letter: "A" | "B";
  subject: string;
  stats?: VariantStats;
  isWinner: boolean;
  enoughData: boolean;
}) {
  const rate = stats?.openRate ?? 0;
  const sent = stats?.sent ?? 0;
  const opened = stats?.opened ?? 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant={isWinner ? "default" : "outline"} className="text-[10px] h-5 shrink-0">
            {letter}
          </Badge>
          <span className="text-sm text-foreground truncate">{subject}</span>
          {isWinner && <Trophy className="w-3 h-3 text-warning shrink-0" />}
        </div>
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
          {sent === 0
            ? "no sends yet"
            : `${rate.toFixed(0)}% · ${opened}/${sent}`}
        </span>
      </div>
      <Progress value={rate} className="h-2" />
      {!enoughData && sent > 0 && (
        <p className="text-[10px] text-muted-foreground italic">Gathering data…</p>
      )}
    </div>
  );
}
