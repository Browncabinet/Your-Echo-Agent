import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Shield, TrendingUp, AlertCircle, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Stats = {
  sent7d: number;
  bounce7d: number;
  suppressed: number;
  warmupDay: number | null;
  warmupLimit: number | null;
  warmupSentToday: number | null;
};

export function DeliverabilityCard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const since = new Date(Date.now() - 7 * 86400000).toISOString();
      const [{ count: sentCount }, { count: bounceCount }, { count: unsubCount }, { data: warm }] = await Promise.all([
        supabase.from("campaign_sends").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "sent").gte("sent_at", since),
        supabase.from("bounce_events").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", since),
        supabase.from("unsubscribes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("sender_warmup").select("day_index, daily_limit, sent_today").eq("user_id", user.id).order("started_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      setStats({
        sent7d: sentCount || 0,
        bounce7d: bounceCount || 0,
        suppressed: unsubCount || 0,
        warmupDay: warm?.day_index ?? null,
        warmupLimit: warm?.daily_limit ?? null,
        warmupSentToday: warm?.sent_today ?? null,
      });
    })();
  }, [user]);

  if (!stats || (stats.sent7d === 0 && !stats.warmupDay)) return null;

  const bounceRate = stats.sent7d > 0 ? ((stats.bounce7d / stats.sent7d) * 100) : 0;
  const isHealthy = bounceRate < 3;

  return (
    <Card className="p-4 mb-4 flex items-center gap-4">
      <Shield className={`w-5 h-5 ${isHealthy ? "text-[hsl(var(--success))]" : "text-orange-500"}`} />
      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">Sent (7d)</div>
          <div className="font-semibold text-foreground flex items-center gap-1">{stats.sent7d}<TrendingUp className="w-3 h-3 text-[hsl(var(--success))]" /></div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Bounce rate</div>
          <div className={`font-semibold ${isHealthy ? "text-foreground" : "text-orange-600"}`}>
            {bounceRate.toFixed(1)}%
            {!isHealthy && <AlertCircle className="inline w-3 h-3 ml-1" />}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Unsubscribed</div>
          <div className="font-semibold text-foreground">{stats.suppressed}</div>
        </div>
        {stats.warmupDay !== null && (
          <div>
            <div className="text-xs text-muted-foreground flex items-center gap-1"><Flame className="w-3 h-3" /> Warm-up</div>
            <div className="font-semibold text-foreground">
              Day {stats.warmupDay} · {stats.warmupSentToday ?? 0}/{stats.warmupLimit ?? 0}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
