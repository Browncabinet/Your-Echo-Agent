import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Mail, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

export function GmailConnect() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [schedulingLink, setSchedulingLink] = useState("");
  const [connected, setConnected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_email_settings")
      .select("email_address, is_connected")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setEmail(data.email_address || "");
          setConnected(data.is_connected || false);
        }
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

  if (connected) {
    return (
      <Card className="p-4 border-primary/20 bg-primary/5">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Gmail Connected</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-xs"
            onClick={() => setConnected(false)}
          >
            Change
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Mail className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-sm">Connect Gmail</h3>
        <span className="text-xs text-muted-foreground ml-auto">Works with personal Gmail or Google Workspace</span>
      </div>

      <div className="rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          <span className="font-medium">You'll need a Gmail App Password:</span>
        </div>
        <ol className="list-decimal ml-5 space-y-0.5">
          <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener" className="text-primary underline inline-flex items-center gap-0.5">Google App Passwords <ExternalLink className="w-2.5 h-2.5" /></a></li>
          <li>Select "Mail" and generate a password</li>
          <li>Paste the 16-character password below</li>
        </ol>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs">Gmail Address</Label>
          <Input
            type="email"
            placeholder="you@gmail.com"
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
      </div>

      <Button onClick={handleSave} disabled={saving || !email || !appPassword} className="w-full gap-2">
        <Mail className="w-4 h-4" />
        {saving ? "Connecting..." : "Connect Gmail"}
      </Button>
    </Card>
  );
}
