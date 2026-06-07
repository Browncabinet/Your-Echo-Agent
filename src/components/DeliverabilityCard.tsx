import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Shield, TrendingUp, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function DeliverabilityCard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ sent7d: number; bounce7d: number; suppressed: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const since = new Date(Date.now() - 7 * 86400000).toISOString();
      const [{ count: sentCount }, { count: bounceCount }, { count: unsubCount }] = await Promise.all([
        supabase.from("campaign_sends").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "sent").gte("sent_at", since),
        supabase.from("bounce_events").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", since),
        supabase.from("unsubscribes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      setStats({ sent7d: sentCount || 0, bounce7d: bounceCount || 0, suppressed: unsubCount || 0 });
    })();
  }, [user]);

  if (!stats || stats.sent7d === 0) return null;

  const bounceRate = stats.sent7d > 0 ? ((stats.bounce7d / stats.sent7d) * 100) : 0;
  const isHealthy = bounceRate < 3;

  return (
    <Card className="p-4 mb-4 flex items-center gap-4">
      <Shield className={`w-5 h-5 ${isHealthy ? "text-[hsl(var(--success))]" : "text-orange-500"}`} />
      <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
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
      </div>
    </Card>
  );
}
