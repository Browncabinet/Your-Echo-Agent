import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Building2,
} from "lucide-react";

export function GmailConnect() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [schedulingLink, setSchedulingLink] = useState("");
  const [connected, setConnected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todaySendCount, setTodaySendCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Fetch settings and today's send count in parallel
    Promise.all([
      supabase
        .from("user_email_settings")
        .select("email_address, is_connected, scheduling_link")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("campaign_sends")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "sent")
        .gte("sent_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    ]).then(([settingsRes, sendsRes]) => {
      if (settingsRes.data) {
        setEmail(settingsRes.data.email_address || "");
        setConnected(settingsRes.data.is_connected || false);
        setSchedulingLink(settingsRes.data.scheduling_link || "");
      }
      setTodaySendCount(sendsRes.count || 0);
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user || !email || !appPassword) return;
    setSaving(true);

    const { error } = await supabase.from("user_email_settings").upsert(
      {
        user_id: user.id,
        provider: "gmail",
        email_address: email,
        smtp_host: "smtp.gmail.com",
        smtp_port: 587,
        smtp_username: email,
        smtp_password: appPassword,
        scheduling_link: schedulingLink,
        is_connected: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      toast.error("Failed to save email settings");
    } else {
      setConnected(true);
      toast.success("Gmail connected!");
    }
    setSaving(false);
  };

  if (loading) return null;

  const isWorkspace = email.includes("@") && !email.endsWith("@gmail.com");
  const dailyLimit = isWorkspace ? 2000 : 500;
  const usagePercent = dailyLimit > 0 ? (todaySendCount / dailyLimit) * 100 : 0;

  if (connected) {
    return (
      <Card className="p-4 space-y-3">
        {/* Connected status */}
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">Gmail Connected</p>
              <Badge variant="secondary" className="text-[10px]">
                {isWorkspace ? "Workspace" : "Personal"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => setConnected(false)}
          >
            Change
          </Button>
        </div>

        {/* Daily usage meter */}
        <div className="rounded-lg bg-secondary/50 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Today's sends
            </span>
            <span className="font-medium text-foreground">
              {todaySendCount} / {dailyLimit}
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usagePercent > 80
                  ? "bg-destructive"
                  : usagePercent > 50
                  ? "bg-warning"
                  : "bg-primary"
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          {usagePercent > 80 && (
            <p className="text-[11px] text-destructive flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Approaching daily limit — consider spacing sends across days
            </p>
          )}
        </div>

        {/* Workspace recommendation for personal Gmail */}
        {!isWorkspace && (
          <div className="rounded-lg border border-primary/10 bg-primary/5 p-3 text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5 text-primary font-medium">
              <Building2 className="w-3.5 h-3.5" />
              Upgrade to Google Workspace for better results
            </div>
            <p>
              Personal Gmail has a 500 email/day limit. Google Workspace gives you up to 2,000/day, plus better
              deliverability and a professional sender address.
            </p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Mail className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-sm">Connect Gmail</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          Works with personal Gmail or Google Workspace
        </span>
      </div>

      {/* Sending limits info */}
      <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs space-y-2">
        <div className="flex items-center gap-1.5 text-warning font-medium">
          <AlertTriangle className="w-3.5 h-3.5" />
          Important: Gmail sending limits
        </div>
        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3 h-3" />
            <span><strong className="text-foreground">Personal Gmail:</strong> ~500/day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3 h-3" />
            <span><strong className="text-foreground">Workspace:</strong> ~2,000/day</span>
          </div>
        </div>
        <p className="text-muted-foreground">
          Start with small batches (15–20/day) to warm up your account and avoid spam flags.
        </p>
      </div>

      {/* App password instructions */}
      <div className="rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          <span className="font-medium">You'll need a Gmail App Password:</span>
        </div>
        <ol className="list-decimal ml-5 space-y-0.5">
          <li>
            Go to{" "}
            <a
              href="https://myaccount.google.com/apppasswords"
              target="_blank"
              rel="noopener"
              className="text-primary underline inline-flex items-center gap-0.5"
            >
              Google App Passwords <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </li>
          <li>Select "Mail" and generate a password</li>
          <li>Paste the 16-character password below</li>
        </ol>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs">Gmail Address</Label>
          <Input
            type="email"
            placeholder="you@gmail.com or you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">App Password</Label>
          <Input
            type="password"
            placeholder="xxxx xxxx xxxx xxxx"
            value={appPassword}
            onChange={(e) => setAppPassword(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">Scheduling Link (optional — used in AI reply drafts)</Label>
          <Input
            type="url"
            placeholder="https://calendly.com/you"
            value={schedulingLink}
            onChange={(e) => setSchedulingLink(e.target.value)}
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving || !email || !appPassword} className="w-full gap-2">
        <Mail className="w-4 h-4" />
        {saving ? "Connecting..." : "Connect Gmail"}
      </Button>

      {/* Future ESP note */}
      <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground flex items-start gap-2">
        <Zap className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <p>
          <strong className="text-foreground">Scaling up?</strong> For high-volume campaigns, we'll soon support
          dedicated email providers like SendGrid and Resend for better deliverability and higher limits.
        </p>
      </div>
    </Card>
  );
}
