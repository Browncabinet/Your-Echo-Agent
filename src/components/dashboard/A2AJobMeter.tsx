import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pause, Play, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Job = {
  id: string;
  status: string;
  spend_cents: number;
  spending_cap_cents: number;
  leads_total: number;
  leads_sent: number;
  last_event: string | null;
  last_event_at: string | null;
};

export function A2AJobMeter({ campaignId }: { campaignId: string }) {
  const [job, setJob] = useState<Job | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("a2a_jobs")
      .select("id, status, spend_cents, spending_cap_cents, leads_total, leads_sent, last_event, last_event_at")
      .eq("campaign_id", campaignId)
      .maybeSingle();
    if (data) setJob(data as Job);
  };

  useEffect(() => {
    load();
    const live = ["queued", "running"].includes(job?.status || "");
    if (!live) return;
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [campaignId, job?.status]);

  if (!job) return null;

  const pct = job.spending_cap_cents > 0 ? Math.min(100, (job.spend_cents / job.spending_cap_cents) * 100) : 0;
  const leadPct = job.leads_total > 0 ? Math.min(100, (job.leads_sent / job.leads_total) * 100) : 0;

  const callControl = async (action: "pause" | "resume" | "cancel") => {
    setBusy(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      const projectId = (import.meta.env.VITE_SUPABASE_PROJECT_ID as string) || "";
      const url = `https://${projectId}.supabase.co/functions/v1/a2a-job-control/${job.id}/${action}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(
        action === "pause" ? "Job paused" : action === "resume" ? "Job resumed" : "Job cancelled",
      );
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  const toggle = () => callControl(job.status === "paused" ? "resume" : "pause");

  const live = ["queued", "running"].includes(job.status);
  const canControl = ["queued", "running", "paused"].includes(job.status);
  const statusColor: Record<string, string> = {
    queued: "bg-blue-500/15 text-blue-600 border-blue-500/30",
    running: "bg-green-500/15 text-green-600 border-green-500/30",
    paused: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    completed: "bg-muted text-muted-foreground border-border",
    failed: "bg-red-500/15 text-red-600 border-red-500/30",
    cancelled: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Card className="p-4 mt-3 border-primary/20 bg-primary/[0.02]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">A2A JOB</span>
          <Badge variant="outline" className={statusColor[job.status] || ""}>
            {live && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            {job.status}
          </Badge>
          {job.last_event && (
            <span className="text-[11px] text-muted-foreground">· {job.last_event}</span>
          )}
        </div>
        {canControl && (
          <div className="flex items-center gap-1.5">
            {(job.status === "running" || job.status === "paused") && (
              <Button size="sm" variant="outline" onClick={toggle} disabled={busy} className="gap-1 h-7 text-xs">
                {job.status === "paused" ? <><Play className="w-3 h-3" /> Resume</> : <><Pause className="w-3 h-3" /> Pause</>}
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={busy} className="gap-1 h-7 text-xs text-destructive hover:text-destructive">
                  <X className="w-3 h-3" /> Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this job?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This stops the agent permanently. Already-sent emails stay sent, but no new outreach will go out. You can't resume a cancelled job — you'd have to start a new campaign.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep running</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => callControl("cancel")}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, cancel job
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Spend</span>
            <span>${(job.spend_cents / 100).toFixed(2)} / ${(job.spending_cap_cents / 100).toFixed(2)}</span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>
        {job.leads_total > 0 && (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Leads contacted</span>
              <span>{job.leads_sent} / {job.leads_total}</span>
            </div>
            <Progress value={leadPct} className="h-1.5" />
          </div>
        )}
      </div>
    </Card>
  );
}
