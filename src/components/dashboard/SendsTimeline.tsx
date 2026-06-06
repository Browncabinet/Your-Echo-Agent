import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";

type Bucket = { label: string; ts: number; count: number };

function buildBuckets(sentAts: string[]): { buckets: Bucket[]; granularity: "hour" | "day" } {
  if (sentAts.length === 0) {
    return { buckets: [], granularity: "day" };
  }
  const now = Date.now();
  const earliest = Math.min(...sentAts.map((s) => new Date(s).getTime()));
  const ageMs = now - earliest;
  const twoDays = 2 * 24 * 60 * 60 * 1000;

  if (ageMs < twoDays) {
    // 24h by hour
    const buckets: Bucket[] = [];
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now - i * 60 * 60 * 1000);
      d.setMinutes(0, 0, 0);
      buckets.push({
        label: d.getHours().toString().padStart(2, "0") + ":00",
        ts: d.getTime(),
        count: 0,
      });
    }
    sentAts.forEach((s) => {
      const t = new Date(s).getTime();
      const bucket = buckets.find(
        (b) => t >= b.ts && t < b.ts + 60 * 60 * 1000
      );
      if (bucket) bucket.count += 1;
    });
    return { buckets, granularity: "hour" };
  }

  // 14d by day
  const buckets: Bucket[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    d.setHours(0, 0, 0, 0);
    buckets.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      ts: d.getTime(),
      count: 0,
    });
  }
  sentAts.forEach((s) => {
    const t = new Date(s).getTime();
    const bucket = buckets.find(
      (b) => t >= b.ts && t < b.ts + 24 * 60 * 60 * 1000
    );
    if (bucket) bucket.count += 1;
  });
  return { buckets, granularity: "day" };
}

export function SendsTimeline({ campaignId }: { campaignId: string }) {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [granularity, setGranularity] = useState<"hour" | "day">("day");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data } = await supabase
        .from("campaign_sends")
        .select("sent_at")
        .eq("campaign_id", campaignId)
        .eq("status", "sent")
        .not("sent_at", "is", null);

      if (cancelled) return;
      const sentAts = (data || []).map((r: any) => r.sent_at).filter(Boolean);
      const { buckets, granularity } = buildBuckets(sentAts);
      setBuckets(buckets);
      setGranularity(granularity);
      setTotal(sentAts.length);
    };

    load();

    const channel = supabase
      .channel(`timeline:${campaignId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "campaign_sends",
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => load()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [campaignId]);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Sending activity</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {total === 0
            ? "No sends yet"
            : `${total} sent · last ${granularity === "hour" ? "24 hours" : "14 days"}`}
        </span>
      </div>
      {total === 0 ? (
        <p className="text-xs text-muted-foreground">
          Once your campaign starts sending, you'll see a live chart of activity here.
        </p>
      ) : (
        <div className="h-[100px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={buckets} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="sendsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                formatter={(v: any) => [`${v} sent`, ""]}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#sendsFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
