import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Reply = {
  id: string;
  lead_email: string;
  lead_name: string;
  subject: string;
  classification: string;
  intent_score: number;
  campaign_id: string;
};

export function HotRepliesCard({ onOpenReplies }: { onOpenReplies: (campaignId: string) => void }) {
  const { user } = useAuth();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("email_replies")
        .select("id, lead_email, lead_name, subject, classification, intent_score, campaign_id")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .gte("intent_score", 60)
        .order("intent_score", { ascending: false })
        .limit(5);
      setReplies((data || []) as Reply[]);
      setLoading(false);
    })();
  }, [user]);

  if (loading || replies.length === 0) return null;

  return (
    <Card className="p-5 mb-4 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-4 h-4 text-orange-500" />
        <h3 className="font-semibold text-foreground">Hot Replies</h3>
        <Badge variant="outline" className="text-[10px]">{replies.length} needs reply</Badge>
      </div>
      <div className="space-y-2">
        {replies.map((r) => (
          <button
            key={r.id}
            onClick={() => onOpenReplies(r.campaign_id)}
            className="w-full text-left p-3 rounded-lg border bg-card hover:border-primary hover:bg-primary/5 transition flex items-center justify-between gap-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground truncate">
                {r.lead_name || r.lead_email}
                <Badge variant="outline" className="text-[10px] capitalize">{r.classification.replace("_", " ")}</Badge>
              </div>
              <div className="text-xs text-muted-foreground truncate">{r.subject}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-primary">{r.intent_score}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
