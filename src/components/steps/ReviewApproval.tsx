import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, CheckCheck, Loader2, AlertTriangle, ShieldCheck, Coins } from "lucide-react";
import { type Campaign } from "@/lib/campaign-data";
import { GmailConnect } from "@/components/GmailConnect";
import { BuyCreditsModal } from "@/components/BuyCreditsModal";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/use-credits";

type Props = {
  campaign: Campaign;
  onUpdate: (c: Partial<Campaign>) => void;
  onSend: () => void;
  onBack: () => void;
};

export function ReviewApproval({ campaign, onUpdate, onSend, onBack }: Props) {
  const [sending, setSending] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [todaySendCount, setTodaySendCount] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(500);
  const { user } = useAuth();
  const { balance, refresh: refreshCredits } = useCredits();

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase
        .from("campaign_sends")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "sent")
        .gte("sent_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
      supabase
        .from("user_email_settings")
        .select("email_address")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]).then(([sendsRes, settingsRes]) => {
      const count = sendsRes.count || 0;
      setTodaySendCount(count);
      const emailAddr = settingsRes.data?.email_address || "";
      const isWs = emailAddr.includes("@") && !emailAddr.endsWith("@gmail.com");
      setDailyLimit(isWs ? 2000 : 500);
    });
  }, [user]);

  const toggleLead = (id: string) => {
    const leads = campaign.leads.map((l) =>
      l.id === id ? { ...l, approved: !l.approved } : l
    );
    onUpdate({ leads });
  };

  const toggleAll = () => {
    const allApproved = campaign.leads.every((l) => l.approved);
    const leads = campaign.leads.map((l) => ({ ...l, approved: !allApproved }));
    onUpdate({ leads });
  };

  const approvedCount = campaign.leads.filter((l) => l.approved).length;
  const allApproved = campaign.leads.length > 0 && campaign.leads.every((l) => l.approved);
  const projectedTotal = todaySendCount + approvedCount;
  const isApproachingLimit = projectedTotal > dailyLimit * 0.8;
  const isOverLimit = projectedTotal > dailyLimit;

  const attemptSend = () => {
    if (balance < approvedCount) {
      setShowCreditsModal(true);
      return;
    }
    if (isApproachingLimit) {
      setShowLimitWarning(true);
    } else {
      handleSendEmails();
    }
  };

  const handleSendEmails = async () => {
    setShowLimitWarning(false);
    setSending(true);
    const approvedLeads = campaign.leads.filter((l) => l.approved);

    try {
      const { data, error } = await supabase.functions.invoke("send-campaign-emails", {
        body: {
          campaign_id: campaign.id,
          leads: approvedLeads,
          emails: campaign.emails,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success(`Sent ${data.sent} emails! ${data.failed > 0 ? `${data.failed} failed.` : ""}`);
        onSend();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send emails");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Review & Approve</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Check the leads you want to send to. {approvedCount}/{campaign.leads.length} approved.
        </p>
      </div>

      <GmailConnect />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox checked={allApproved} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subject</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaign.leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Checkbox
                      checked={lead.approved}
                      onCheckedChange={() => toggleLead(lead.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.company}</TableCell>
                  <TableCell className="text-sm">{lead.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {campaign.emails[0]?.subject.replace("{{company}}", lead.company) || "—"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-4 bg-secondary/50 border-primary/10">
        <div className="flex items-start gap-3">
          <CheckCheck className="w-5 h-5 text-primary mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Safe Sending Defaults</p>
            <p className="text-muted-foreground mt-1">
              • Rate limited to 15 emails per batch for warmup<br />
              • 1-second delay between each send<br />
              • Unsubscribe link included automatically<br />
              • Sends from your connected Gmail account
            </p>
          </div>
        </div>
      </Card>

      {/* Credit balance info */}
      {balance < approvedCount && (
        <Card className="p-4 border-destructive/30 bg-destructive/5 space-y-2">
          <div className="flex items-start gap-3">
            <Coins className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-foreground">Not enough credits</p>
              <p className="text-muted-foreground">
                You have <strong className="text-foreground">{balance}</strong> credits but need <strong className="text-foreground">{approvedCount}</strong> to send this campaign.
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => setShowCreditsModal(true)} className="ml-8 gap-1.5">
            <Coins className="w-3 h-3" /> Buy Credits
          </Button>
        </Card>
      )}

      {/* Pre-send safety warning */}
      {showLimitWarning && (
        <Card className="p-4 border-warning/30 bg-warning/5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-foreground">
                {isOverLimit ? "This would exceed your daily limit" : "You're approaching your daily limit"}
              </p>
              <p className="text-muted-foreground">
                You've sent <strong className="text-foreground">{todaySendCount}</strong> emails today. 
                Sending <strong className="text-foreground">{approvedCount}</strong> more would bring your total 
                to <strong className="text-foreground">{projectedTotal}</strong> out of your <strong className="text-foreground">{dailyLimit}</strong>/day limit.
              </p>
              <p className="text-muted-foreground">
                {isOverLimit 
                  ? "Exceeding your limit can temporarily suspend your Gmail sending. We recommend reducing the batch size or waiting until tomorrow." 
                  : "To keep your account safe, consider sending fewer emails now and spacing the rest across days."}
              </p>
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <Button variant="outline" size="sm" onClick={() => setShowLimitWarning(false)}>
              Reduce volume
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSendEmails} className="text-muted-foreground">
              <ShieldCheck className="w-3 h-3 mr-1" /> Proceed anyway
            </Button>
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={attemptSend} disabled={approvedCount === 0 || sending} size="lg" className="gap-2">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? "Sending..." : `Approve & Send (${approvedCount})`}
        </Button>
      </div>

      <BuyCreditsModal
        open={showCreditsModal}
        onOpenChange={setShowCreditsModal}
        requiredCredits={approvedCount}
      />
    </div>
  );
}
