import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  MessageSquare, UserPlus, Send, Eye, Copy, ExternalLink, Check, X,
  Loader2, Sparkles, ListChecks,
} from "lucide-react";

type Action = {
  id: string;
  kind: "comment" | "connection_request" | "follow_up_message" | "profile_view";
  target_group: string;
  target_person: string;
  draft_text: string;
  context_url: string;
  status: "pending" | "done" | "skipped";
  created_at: string;
};

const KIND_META: Record<Action["kind"], { label: string; icon: any; color: string }> = {
  comment: { label: "Group Comment", icon: MessageSquare, color: "text-blue-600 border-blue-500/30 bg-blue-500/10" },
  connection_request: { label: "Connection Note", icon: UserPlus, color: "text-emerald-600 border-emerald-500/30 bg-emerald-500/10" },
  follow_up_message: { label: "Follow-up DM", icon: Send, color: "text-purple-600 border-purple-500/30 bg-purple-500/10" },
  profile_view: { label: "Profile Warm-up", icon: Eye, color: "text-amber-600 border-amber-500/30 bg-amber-500/10" },
};

export function LinkedInActivityTab({
  campaignId,
  niche,
  leads = [],
}: {
  campaignId?: string;
  niche: string;
  leads?: any[];
}) {
  const { user } = useAuth();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const primaryKey = `lk_primary_${campaignId || "default"}`;
  const [primaryGroup, setPrimaryGroup] = useState<{ name: string; url: string } | null>(() => {
    if (typeof window === "undefined") return null;
    const name = localStorage.getItem(primaryKey + "_name");
    if (!name) return null;
    return { name, url: localStorage.getItem(primaryKey + "_url") || "" };
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d?.campaignId === campaignId || (!d?.campaignId && !campaignId)) {
        setPrimaryGroup({ name: d.name, url: d.url || "" });
      }
    };
    window.addEventListener("lk-primary-changed", handler);
    return () => window.removeEventListener("lk-primary-changed", handler);
  }, [campaignId]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    let q = supabase.from("linkedin_actions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    if (campaignId) q = q.eq("campaign_id", campaignId);
    const { data } = await q;
    setActions((data || []) as Action[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id, campaignId]);

  const generate = async () => {
    if (!primaryGroup?.name) return toast.error("Pick a LinkedIn group first (Group Finder above)");
    setGenerating(true);
    const { data, error } = await supabase.functions.invoke("linkedin-generate-actions", {
      body: { campaign_id: campaignId, group: primaryGroup, niche, leads },
    });
    setGenerating(false);
    if (error || data?.error) return toast.error(data?.error || error?.message || "Failed");
    toast.success(`Generated ${data?.actions?.length || 0} actions`);
    load();
  };

  const updateStatus = async (id: string, status: "done" | "skipped") => {
    const { error } = await supabase.from("linkedin_actions")
      .update({ status, completed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    setActions((a) => a.map((x) => x.id === id ? { ...x, status } : x));
  };

  const updateDraft = async (id: string, draft_text: string) => {
    setActions((a) => a.map((x) => x.id === id ? { ...x, draft_text } : x));
    await supabase.from("linkedin_actions").update({ draft_text }).eq("id", id);
  };

  const copyAndOpen = (a: Action) => {
    navigator.clipboard.writeText(a.draft_text);
    toast.success("Copied — opening LinkedIn");
    if (a.context_url) window.open(a.context_url, "_blank", "noopener,noreferrer");
  };

  const pending = actions.filter((a) => a.status === "pending");
  const done = actions.filter((a) => a.status === "done");
  const skipped = actions.filter((a) => a.status === "skipped");

  return (
    <div className="space-y-5">
      {/* Metrics strip */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Pending</div>
          <div className="text-2xl font-bold">{pending.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Done</div>
          <div className="text-2xl font-bold text-emerald-600">{done.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Skipped</div>
          <div className="text-2xl font-bold text-muted-foreground">{skipped.length}</div>
        </Card>
      </div>

      {/* Generate */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-bold flex items-center gap-2"><ListChecks className="w-4 h-4 text-primary" /> Action Queue</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {primaryGroup
                ? <>Primary group: <span className="font-medium text-foreground">{primaryGroup.name}</span></>
                : "Pick a primary LinkedIn group above to generate actions."}
            </p>
          </div>
          <Button onClick={generate} disabled={generating || !primaryGroup}>
            {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {generating ? "Drafting…" : "Generate Actions"}
          </Button>
        </div>
      </Card>

      {loading && <div className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>}

      {pending.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No pending actions. Generate a batch above.</p>
        </Card>
      )}

      {pending.map((a, i) => {
        const meta = KIND_META[a.kind];
        const Icon = meta.icon;
        return (
          <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={meta.color}>
                    <Icon className="w-3 h-3 mr-1" /> {meta.label}
                  </Badge>
                  {a.target_person && <span className="text-sm font-medium">{a.target_person}</span>}
                  {a.target_group && <span className="text-xs text-muted-foreground">in {a.target_group}</span>}
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => updateStatus(a.id, "skipped")}>
                    <X className="w-4 h-4 mr-1" /> Skip
                  </Button>
                  <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => updateStatus(a.id, "done")}>
                    <Check className="w-4 h-4 mr-1" /> Done
                  </Button>
                </div>
              </div>
              <Textarea
                value={a.draft_text}
                onChange={(e) => updateDraft(a.id, e.target.value)}
                rows={3}
                className="text-sm"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <Button size="sm" onClick={() => copyAndOpen(a)}>
                  <Copy className="w-3 h-3 mr-1" /> Copy & Open LinkedIn
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
                <span className="text-xs text-muted-foreground">Assist-only — you'll paste & post manually</span>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
