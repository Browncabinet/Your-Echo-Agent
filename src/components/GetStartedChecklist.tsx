import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Circle, Mail, Sparkles, Send, X, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Campaign } from "@/lib/campaign-data";
import { cn } from "@/lib/utils";

type Props = {
  campaigns: Campaign[];
  onNewCampaign: () => void;
  onFastMode: () => void;
};

type StepKey = "email" | "campaign" | "send";

export function GetStartedChecklist({ campaigns, onNewCampaign, onFastMode }: Props) {
  const { user } = useAuth();
  const [emailConnected, setEmailConnected] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDismissed(localStorage.getItem(`echo_checklist_dismissed_${user.id}`) === "1");
    (async () => {
      const { data } = await supabase
        .from("user_email_settings")
        .select("is_connected")
        .eq("user_id", user.id)
        .maybeSingle();
      setEmailConnected(!!data?.is_connected);
    })();
  }, [user]);

  const hasCampaign = campaigns.length > 0;
  const hasSent = campaigns.some(
    (c) => c.status === "active" || c.status === "completed" || c.status === "sending" || (c.stats?.sent ?? 0) > 0,
  );
  const allDone = emailConnected && hasCampaign && hasSent;
  const completedCount = [emailConnected, hasCampaign, hasSent].filter(Boolean).length;

  if (dismissed || allDone || emailConnected === null) return null;

  const dismiss = () => {
    if (user) localStorage.setItem(`echo_checklist_dismissed_${user.id}`, "1");
    setDismissed(true);
  };

  const goConnectEmail = () => onNewCampaign(); // Email connect lives inside campaign flow → kick them in

  const steps: { key: StepKey; label: string; help: string; done: boolean; icon: typeof Mail; cta?: { label: string; onClick: () => void } }[] = [
    {
      key: "email",
      label: "Connect your sending email",
      help: "We send from your inbox so replies come straight to you.",
      done: !!emailConnected,
      icon: Mail,
      cta: !emailConnected ? { label: "Connect", onClick: goConnectEmail } : undefined,
    },
    {
      key: "campaign",
      label: "Create your first campaign",
      help: "Use Fast Mode — paste your URL and we auto-fill everything.",
      done: hasCampaign,
      icon: Sparkles,
      cta: !hasCampaign ? { label: "Try Fast Mode", onClick: onFastMode } : undefined,
    },
    {
      key: "send",
      label: "Approve and send your first batch",
      help: "Start with 50 emails to test what works before scaling.",
      done: hasSent,
      icon: Send,
      cta: hasCampaign && !hasSent ? { label: "Open campaign", onClick: () => {} } : undefined,
    },
  ];

  return (
    <Card className="p-5 mb-6 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">Get started</h2>
            <span className="text-xs text-muted-foreground">
              {completedCount}/3 complete
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Finish these 3 quick steps to send your first outreach campaign.
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 -mt-1 -mr-1" onClick={dismiss} aria-label="Dismiss checklist">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {steps.map((s) => (
          <div
            key={s.key}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 transition-colors",
              s.done ? "border-success/30 bg-success/5" : "border-border bg-card",
            )}
          >
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                s.done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {s.done ? <Check className="w-4 h-4" /> : <Circle className="w-3.5 h-3.5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium", s.done ? "text-muted-foreground line-through" : "text-foreground")}>
                {s.label}
              </p>
              {!s.done && <p className="text-xs text-muted-foreground mt-0.5">{s.help}</p>}
            </div>
            {s.cta && (
              <Button size="sm" variant={s.key === "campaign" ? "default" : "outline"} onClick={s.cta.onClick} className="gap-1 shrink-0">
                {s.cta.label} <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
