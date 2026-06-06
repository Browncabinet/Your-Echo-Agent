import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import { Sparkles, Settings2, Mail, Linkedin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function WeeklyUsageStrip() {
  const { caps, loading, tierLabel, isActive, openPortal } = useSubscription();
  const navigate = useNavigate();

  if (loading || !caps) return null;

  if (!isActive) {
    return (
      <Card className="p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-primary/30 bg-primary/5">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-foreground">You're on the Free plan</p>
            <p className="text-sm text-muted-foreground">
              Subscribe to a weekly plan to keep sending after your welcome emails.
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => navigate("/pricing")}>
          See weekly plans
        </Button>
      </Card>
    );
  }

  const emailPct = caps.email_cap ? Math.min(100, Math.round((caps.emails_used / caps.email_cap) * 100)) : 0;
  const liPct = caps.linkedin_cap ? Math.min(100, Math.round((caps.linkedin_used / caps.linkedin_cap) * 100)) : 0;
  const reset = new Date(new Date(caps.week_start).getTime() + 7 * 86400000).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">{tierLabel}</span>
          <span className="text-xs text-muted-foreground">· resets {reset}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={openPortal} className="gap-1.5">
          <Settings2 className="w-3.5 h-3.5" /> Manage
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="flex items-center gap-1.5 text-foreground">
              <Mail className="w-3.5 h-3.5 text-primary" /> Emails this week
            </span>
            <span className="text-muted-foreground">
              {caps.emails_used.toLocaleString()} / {caps.email_cap.toLocaleString()}
            </span>
          </div>
          <Progress value={emailPct} />
        </div>
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="flex items-center gap-1.5 text-foreground">
              <Linkedin className="w-3.5 h-3.5 text-primary" /> LinkedIn assists
            </span>
            <span className="text-muted-foreground">
              {caps.linkedin_used.toLocaleString()} / {caps.linkedin_cap.toLocaleString()}
            </span>
          </div>
          <Progress value={liPct} />
        </div>
      </div>
    </Card>
  );
}
