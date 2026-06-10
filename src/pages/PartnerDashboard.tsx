import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { ArrowLeft, Key, Copy, RefreshCw, Wallet, BookOpen, Loader2, CheckCircle2, XCircle, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";

type Partner = { id: string; balance_cents: number; total_spent_cents: number; billing_email: string; api_key_id: string };
type ApiKey = { id: string; key_prefix: string; status: string; rate_limit_per_min: number; last_used_at: string | null };
type Job = { id: string; agent_id: string; status: string; spend_cents: number; leads_sent: number; created_at: string };
type Callback = { id: string; event_type: string; response_status: number | null; delivered: boolean; created_at: string; callback_url: string };
type RetryRow = { id: string; event_type: string; callback_url: string; attempt: number; max_attempts: number; status: string; next_attempt_at: string; last_error: string | null };

export default function PartnerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [callbacks, setCallbacks] = useState<Callback[]>([]);
  const [retries, setRetries] = useState<RetryRow[]>([]);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [rotating, setRotating] = useState(false);
  const [rotatingSecret, setRotatingSecret] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: p }, { data: ks }, { data: js }, { data: cbs }] = await Promise.all([
      supabase.from("a2a_partners").select("id, balance_cents, total_spent_cents, billing_email, api_key_id").eq("owner_user_id", user.id).maybeSingle(),
      supabase.from("a2a_api_keys").select("id, key_prefix, status, rate_limit_per_min, last_used_at").eq("owner_user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("a2a_jobs").select("id, agent_id, status, spend_cents, leads_sent, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(15),
      supabase.from("a2a_callbacks_log").select("id, event_type, response_status, delivered, created_at, callback_url").order("created_at", { ascending: false }).limit(20),
    ]);
    setPartner(p as Partner | null);
    setKeys((ks || []) as ApiKey[]);
    setJobs((js || []) as Job[]);
    setCallbacks((cbs || []) as Callback[]);

    if (p?.id) {
      const { data: rq } = await supabase
        .from("a2a_callback_queue")
        .select("id, event_type, callback_url, attempt, max_attempts, status, next_attempt_at, last_error")
        .eq("partner_id", p.id)
        .order("updated_at", { ascending: false })
        .limit(15);
      setRetries((rq || []) as RetryRow[]);
    } else {
      setRetries([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleRotate = async () => {
    if (!confirm("Rotate API key? Your current key will stop working immediately.")) return;
    setRotating(true);
    const { data, error } = await supabase.functions.invoke("a2a-rotate-key", { body: {} });
    setRotating(false);
    if (error || !data?.key) { toast.error(error?.message || "Failed to rotate"); return; }
    setRevealedKey(data.key);
    toast.success("New key generated — copy it now");
    load();
  };

  const handleRotateSecret = async () => {
    if (!confirm("Rotate webhook secret? Future callbacks will be signed with the new secret. Update your verifier before proceeding.")) return;
    setRotatingSecret(true);
    const { data, error } = await supabase.functions.invoke("a2a-rotate-webhook-secret", { body: {} });
    setRotatingSecret(false);
    if (error || !data?.webhook_secret) { toast.error(error?.message || "Failed to rotate"); return; }
    setRevealedSecret(data.webhook_secret);
    toast.success("New webhook secret generated");
  };

  const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="cursor-pointer"><Logo /></Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/for-agents/docs" className="gap-1"><BookOpen className="w-3.5 h-3.5" /> API Docs</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/for-agents/billing" className="gap-1"><Wallet className="w-3.5 h-3.5" /> Billing</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/for-agents" className="gap-1 text-muted-foreground"><ArrowLeft className="w-3.5 h-3.5" /> Marketplace</Link></Button>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Partner Dashboard</h1>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="text-xs uppercase text-muted-foreground mb-1">Balance</div>
            <div className="text-3xl font-bold">{fmt(partner?.balance_cents || 0)}</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs uppercase text-muted-foreground mb-1">Spent</div>
            <div className="text-3xl font-bold">{fmt(partner?.total_spent_cents || 0)}</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs uppercase text-muted-foreground mb-1">Active Keys</div>
            <div className="text-3xl font-bold">{keys.filter(k => k.status === "active").length}</div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold flex items-center gap-2"><Key className="w-4 h-4 text-primary" /> API Keys</h2>
            <Button size="sm" onClick={handleRotate} disabled={rotating} className="gap-2">
              {rotating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {keys.length === 0 ? "Generate Key" : "Rotate Key"}
            </Button>
          </div>
          {revealedKey && (
            <div className="mb-4 p-3 rounded-lg bg-[hsl(var(--success-light))] border border-[hsl(var(--success))]/30">
              <p className="text-xs font-semibold text-[hsl(var(--success))] mb-2">⚠ Copy this key — it won't be shown again:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-card p-2 rounded font-mono break-all">{revealedKey}</code>
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(revealedKey); toast.success("Copied"); }}><Copy className="w-3 h-3" /></Button>
              </div>
            </div>
          )}
          {keys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No keys yet. Click "Generate Key" to create your first one.</p>
          ) : (
            <div className="divide-y">
              {keys.map(k => (
                <div key={k.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <code className="font-mono text-xs">{k.key_prefix}…</code>
                    <div className="text-xs text-muted-foreground">{k.rate_limit_per_min}/min · {k.last_used_at ? `used ${new Date(k.last_used_at).toLocaleDateString()}` : "never used"}</div>
                  </div>
                  <Badge variant={k.status === "active" ? "default" : "outline"} className="capitalize">{k.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {partner && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Webhook Signing Secret</h2>
              <Button size="sm" variant="outline" onClick={handleRotateSecret} disabled={rotatingSecret} className="gap-2">
                {rotatingSecret ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Rotate Secret
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              All A2A callbacks to your callback_url are signed with HMAC-SHA256 in <code className="bg-muted px-1 rounded">X-Echo-Signature: sha256=…</code> using this secret. Verify it on your side to confirm authenticity.
            </p>
            {revealedSecret ? (
              <div className="p-3 rounded-lg bg-[hsl(var(--success-light))] border border-[hsl(var(--success))]/30">
                <p className="text-xs font-semibold text-[hsl(var(--success))] mb-2">⚠ Copy this secret — it won't be shown again:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-card p-2 rounded font-mono break-all">{revealedSecret}</code>
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(revealedSecret); toast.success("Copied"); }}><Copy className="w-3 h-3" /></Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Secret is hidden. Click "Rotate Secret" to regenerate and reveal a new one.</p>
            )}
          </Card>
        )}

        <Card className="p-6">
          <h2 className="font-bold mb-3">Recent Jobs</h2>
          {jobs.length === 0 ? <p className="text-sm text-muted-foreground">No jobs yet.</p> : (
            <div className="divide-y">
              {jobs.map(j => (
                <div key={j.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{j.agent_id}</div>
                    <div className="text-xs text-muted-foreground">{new Date(j.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="capitalize">{j.status}</Badge>
                    <div className="text-right">
                      <div>{fmt(j.spend_cents)}</div>
                      <div className="text-xs text-muted-foreground">{j.leads_sent} sent</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-bold mb-3">Callback Log</h2>
          {callbacks.length === 0 ? <p className="text-sm text-muted-foreground">No callbacks yet.</p> : (
            <div className="divide-y">
              {callbacks.map(c => (
                <div key={c.id} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    {c.delivered ? <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(var(--success))]" /> : <XCircle className="w-3.5 h-3.5 text-destructive" />}
                    <code className="font-mono">{c.event_type}</code>
                    <span className="text-muted-foreground truncate">{c.callback_url || "(no url)"}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-muted-foreground">{c.response_status ?? "—"}</span>
                    <span className="text-muted-foreground">{new Date(c.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {retries.length > 0 && (
          <Card className="p-6">
            <h2 className="font-bold mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Webhook Retry Queue</h2>
            <p className="text-xs text-muted-foreground mb-3">Failed deliveries retry with exponential backoff. After 5 attempts they're marked failed_permanent.</p>
            <div className="divide-y">
              {retries.map(r => (
                <div key={r.id} className="py-2 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className={
                      r.status === "delivered" ? "border-[hsl(var(--success))]/40 text-[hsl(var(--success))]"
                        : r.status === "failed_permanent" ? "border-destructive/40 text-destructive"
                        : "border-amber-500/40 text-amber-600"
                    }>{r.status}</Badge>
                    <code className="font-mono">{r.event_type}</code>
                    <span className="text-muted-foreground truncate">{r.callback_url}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-muted-foreground">attempt {r.attempt}/{r.max_attempts}</span>
                    {r.status === "pending" && <span className="text-muted-foreground">next: {new Date(r.next_attempt_at).toLocaleTimeString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
