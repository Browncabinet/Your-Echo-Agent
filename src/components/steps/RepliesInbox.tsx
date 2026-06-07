import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  RefreshCw,
  Send,
  ArrowLeft,
  Inbox,
  Clock,
  CheckCircle,
  MessageSquare,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type EmailReply = Tables<"email_replies">;

type Props = {
  campaignId?: string;
  onBack: () => void;
};

const CLASSIFICATION_CONFIG: Record<
  string,
  { label: string; color: string; icon: typeof CheckCircle; bgClass: string }
> = {
  interested: {
    label: "Interested",
    color: "text-[hsl(var(--success))]",
    icon: CheckCircle,
    bgClass: "bg-[hsl(var(--success-light))] text-[hsl(var(--success))]",
  },
  not_interested: {
    label: "Not Interested",
    color: "text-destructive",
    icon: XCircle,
    bgClass: "bg-destructive/10 text-destructive",
  },
  question: {
    label: "Question",
    color: "text-[hsl(var(--warning))]",
    icon: HelpCircle,
    bgClass: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
  },
  objection: {
    label: "Objection",
    color: "text-orange-600",
    icon: AlertTriangle,
    bgClass: "bg-orange-100 text-orange-700",
  },
  unsubscribe: {
    label: "Unsubscribe",
    color: "text-destructive",
    icon: XCircle,
    bgClass: "bg-destructive/10 text-destructive",
  },
  wrong_person: {
    label: "Wrong Person",
    color: "text-muted-foreground",
    icon: AlertTriangle,
    bgClass: "bg-muted text-muted-foreground",
  },
  needs_info: {
    label: "Needs Info",
    color: "text-[hsl(var(--warning))]",
    icon: HelpCircle,
    bgClass: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
  },
  unknown: {
    label: "Unclassified",
    color: "text-muted-foreground",
    icon: MessageSquare,
    bgClass: "bg-muted text-muted-foreground",
  },
};

function getConfig(classification: string) {
  return CLASSIFICATION_CONFIG[classification] || CLASSIFICATION_CONFIG.unknown;
}

export function RepliesInbox({ campaignId, onBack }: Props) {
  const { user } = useAuth();
  const [replies, setReplies] = useState<EmailReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editedDraft, setEditedDraft] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const fetchReplies = async () => {
    if (!user) return;
    setLoading(true);
    let query = supabase
      .from("email_replies")
      .select("*")
      .eq("user_id", user.id)
      .order("received_at", { ascending: false });

    if (campaignId) {
      query = query.eq("campaign_id", campaignId);
    }

    const { data, error } = await query;
    if (error) {
      toast.error("Failed to load replies");
    } else {
      setReplies(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReplies();
  }, [user, campaignId]);

  const handleCheckReplies = async () => {
    if (!user) return;
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-replies", {
        body: campaignId ? { campaign_id: campaignId } : {},
      });

      if (error) throw error;

      const newCount = data?.new_replies ?? 0;
      toast.success(
        newCount > 0
          ? `Found ${newCount} new ${newCount === 1 ? "reply" : "replies"}!`
          : "No new replies found."
      );
      setLastChecked(new Date().toISOString());
      await fetchReplies();
    } catch (err: any) {
      const msg = err?.message || "Failed to check replies";
      if (msg.includes("IMAP") || msg.includes("connect") || msg.includes("Gmail")) {
        toast.error("Could not connect to Gmail — please verify your App Password or try again later.");
      } else {
        toast.error(msg);
      }
    } finally {
      setChecking(false);
    }
  };

  const handleSendReply = async (replyId: string) => {
    const body = editedDraft[replyId];
    if (!body?.trim()) {
      toast.error("Reply body cannot be empty");
      return;
    }

    setSendingId(replyId);
    try {
      const { data, error } = await supabase.functions.invoke("send-reply", {
        body: { reply_id: replyId, reply_body: body },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Reply sent successfully!");
      await fetchReplies();
      setExpandedId(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to send reply");
    } finally {
      setSendingId(null);
    }
  };

  const toggleExpand = (id: string, draftReply: string, suggestedReply?: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!editedDraft[id]) {
        setEditedDraft((prev) => ({ ...prev, [id]: suggestedReply || draftReply }));
      }
    }
  };

  const filteredReplies =
    filter === "all" ? replies : replies.filter((r) => r.classification === filter);

  const counts = replies.reduce(
    (acc, r) => {
      acc[r.classification] = (acc[r.classification] || 0) + 1;
      acc.total += 1;
      return acc;
    },
    { total: 0 } as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Inbox className="w-5 h-5 text-primary" />
            Replies Inbox
          </h2>
          {lastChecked && (
            <button
              onClick={handleCheckReplies}
              disabled={checking}
              className="text-xs text-muted-foreground mt-1 flex items-center gap-1 hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              <Clock className="w-3 h-3" />
              Last checked: {new Date(lastChecked).toLocaleString()}
              <RefreshCw className={`w-3 h-3 ml-0.5 ${checking ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckReplies}
            disabled={checking}
            className="gap-2"
          >
            {checking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {checking ? "Checking…" : "Check Replies Now"}
          </Button>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={filter === "all" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilter("all")}
        >
          All ({counts.total || 0})
        </Badge>
        {Object.entries(CLASSIFICATION_CONFIG)
          .filter(([key]) => key !== "unknown")
          .map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <Badge
                key={key}
                variant={filter === key ? "default" : "outline"}
                className={`cursor-pointer gap-1 ${filter === key ? "" : cfg.bgClass}`}
                onClick={() => setFilter(key)}
              >
                <Icon className="w-3 h-3" />
                {cfg.label} ({counts[key] || 0})
              </Badge>
            );
          })}
      </div>

      {/* Reply list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredReplies.length === 0 ? (
        <Card className="p-10 text-center">
          <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium mb-1">
            {replies.length === 0 ? "No replies received yet" : "No replies match this filter"}
          </p>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            {replies.length === 0
              ? 'Send a campaign first, then click "Check Replies Now" to fetch incoming replies from your inbox.'
              : "Try selecting a different classification filter above."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReplies.map((reply) => {
            const cfg = getConfig(reply.classification);
            const Icon = cfg.icon;
            const isExpanded = expandedId === reply.id;
            const isSent = reply.status === "sent";

            return (
              <Card
                key={reply.id}
                className={`overflow-hidden transition-shadow hover:shadow-md ${
                  isSent ? "opacity-70" : ""
                }`}
              >
                {/* Top color accent bar */}
                <div
                  className={`h-1 ${
                    reply.classification === "interested"
                      ? "bg-[hsl(var(--success))]"
                      : reply.classification === "not_interested"
                      ? "bg-destructive"
                      : reply.classification === "question"
                      ? "bg-[hsl(var(--warning))]"
                      : reply.classification === "objection"
                      ? "bg-orange-500"
                      : "bg-muted-foreground"
                  }`}
                />

                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpand(reply.id, reply.ai_draft_reply, (reply as any).suggested_reply)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${cfg.color}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm text-foreground truncate">
                            {reply.lead_name || reply.lead_email}
                          </p>
                          <Badge variant="outline" className={`text-[10px] ${cfg.bgClass}`}>
                            {cfg.label}
                          </Badge>
                          {((reply as any).intent_score ?? 0) > 0 && (
                            <Badge variant="outline" className="text-[10px] font-mono">
                              intent {(reply as any).intent_score}
                            </Badge>
                          )}
                          {isSent && (
                            <Badge variant="outline" className="text-[10px] bg-[hsl(var(--success-light))] text-[hsl(var(--success))]">
                              ✓ Replied
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {reply.subject}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          {new Date(reply.received_at).toLocaleDateString()} ·{" "}
                          {reply.lead_email}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>


                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t">
                    {/* Original email body */}
                    <div className="mt-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Their Reply:
                      </p>
                      <div className="text-sm text-foreground bg-muted/50 rounded-lg p-3 whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {reply.body || "(No body)"}
                      </div>
                    </div>

                    {/* AI suggested action */}
                    {reply.ai_suggested_action && (
                      <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                        <p className="text-xs font-medium text-primary mb-1">
                          ✦ AI Suggested Action
                        </p>
                        <p className="text-sm text-foreground">
                          {reply.ai_suggested_action}
                        </p>
                      </div>
                    )}

                    {/* Draft reply editor */}
                    {!isSent && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Your Reply (AI Draft — edit before sending):
                        </p>
                        <Textarea
                          value={editedDraft[reply.id] || ""}
                          onChange={(e) =>
                            setEditedDraft((prev) => ({
                              ...prev,
                              [reply.id]: e.target.value,
                            }))
                          }
                          rows={5}
                          className="text-sm"
                        />
                        <div className="flex justify-end mt-2">
                          <Button
                            size="sm"
                            onClick={() => handleSendReply(reply.id)}
                            disabled={
                              sendingId === reply.id ||
                              !editedDraft[reply.id]?.trim()
                            }
                            className="gap-2"
                          >
                            {sendingId === reply.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            {sendingId === reply.id ? "Sending…" : "Send Reply"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Button variant="outline" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
    </div>
  );
}
