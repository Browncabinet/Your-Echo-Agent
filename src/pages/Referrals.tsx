import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SeoHead } from "@/components/SeoHead";
import { Footer } from "@/components/Footer";

type Code = { code: string; label: string | null; clicks: number; conversions: number; created_at: string };
type Conversion = {
  id: string;
  referrer_code: string | null;
  agent_id: string | null;
  task_id: string | null;
  event_type: string;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
};
type Stats = {
  mode: string;
  payouts_enabled: boolean;
  payouts_note: string;
  codes: Code[];
  referrer_agents: { id: string; name: string; agent_card_url: string | null; contact_email: string | null }[];
  conversions: Conversion[];
  totals: { conversions: number; attributed_cents: number; currency: string; estimated_future_earnings_cents: number };
};

function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function Referrals() {
  const { user, session } = useAuth();
  const [params] = useSearchParams();
  const incomingRef = params.get("ref");

  const [label, setLabel] = useState("");
  const [minting, setMinting] = useState(false);
  const [mintedCode, setMintedCode] = useState<string | null>(null);

  const [agentName, setAgentName] = useState("");
  const [agentCardUrl, setAgentCardUrl] = useState("");
  const [payoutEmail, setPayoutEmail] = useState("");
  const [registering, setRegistering] = useState(false);

  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Remember incoming ref so callers who eventually /hire pick it up client-side too.
  useEffect(() => {
    if (incomingRef) {
      try { localStorage.setItem("echo_referral_code", incomingRef); } catch { /* ignore */ }
    }
  }, [incomingRef]);

  const loadStats = async () => {
    if (!session) return;
    setLoadingStats(true);
    try {
      const { data, error } = await supabase.functions.invoke("referrals-stats", { method: "GET" });
      if (error) throw error;
      setStats(data as Stats);
    } catch (e) {
      console.error(e);
      toast.error("Could not load referral stats");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => { if (session) loadStats(); }, [session]);

  const mintCode = async () => {
    setMinting(true);
    try {
      const { data, error } = await supabase.functions.invoke("referrals-generate", {
        body: { label: label || undefined },
      });
      if (error) throw error;
      const code = (data as { code: string }).code;
      setMintedCode(code);
      setLabel("");
      toast.success("Referral code created");
      if (session) loadStats();
    } catch (e) {
      console.error(e);
      toast.error("Could not create code");
    } finally {
      setMinting(false);
    }
  };

  const registerAgent = async () => {
    if (!session) { toast.error("Please sign in to register an agent"); return; }
    if (!agentName.trim()) { toast.error("Agent name required"); return; }
    setRegistering(true);
    try {
      const { data, error } = await supabase.functions.invoke("referrals-register-agent", {
        body: {
          name: agentName.trim(),
          agent_card_url: agentCardUrl.trim() || undefined,
          payout_destination: payoutEmail ? { paypal_email: payoutEmail } : {},
        },
      });
      if (error) throw error;
      toast.success(`Registered — code ${(data as { code: string }).code} created`);
      setAgentName(""); setAgentCardUrl(""); setPayoutEmail("");
      loadStats();
    } catch (e) {
      console.error(e);
      toast.error("Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  const shareUrl = useMemo(() => mintedCode
    ? `${window.location.origin}/referrals?ref=${mintedCode}`
    : null, [mintedCode]);

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast.success("Copied"); }
    catch { toast.error("Copy failed"); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SeoHead
        title="Referral & Attribution — Your Echo"
        description="Earn attribution for every A2A agent hire you refer. Track-only launch. Registered Agents supported."
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 space-y-10">
        <header className="space-y-3">
          <Badge variant="secondary" className="uppercase tracking-wide">Track-only launch</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Refer autonomous agents. Get credit for every hire.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Share a referral code, or register your own referrer agent. Every A2A hire that
            includes your code — via <code className="rounded bg-muted px-1.5 py-0.5">X-Referral-Code</code> header
            or <code className="rounded bg-muted px-1.5 py-0.5">referral_code</code> body field — is attributed to you.
            <span className="block mt-2 text-sm">
              Program is currently <strong>tracking only</strong>. Conversions are logged and estimated future earnings
              (indicative 10%) are shown so you can gauge value. Payouts will be enabled in a future phase.
            </span>
          </p>
          {incomingRef && (
            <div className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
              You arrived with referral code <code className="font-mono">{incomingRef}</code> — saved locally.
            </div>
          )}
        </header>

        {/* Quick generate */}
        <Card>
          <CardHeader>
            <CardTitle>Generate a referral code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <Label htmlFor="label">Label (optional)</Label>
                <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Twitter launch thread" />
              </div>
              <Button onClick={mintCode} disabled={minting}>
                {minting ? "Creating…" : "Create code"}
              </Button>
            </div>
            {mintedCode && shareUrl && (
              <div className="rounded-md border p-4 space-y-3 bg-muted/40">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Code:</span>
                  <code className="font-mono text-base">{mintedCode}</code>
                  <Button size="sm" variant="outline" onClick={() => copy(mintedCode)}>Copy</Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Share URL:</span>
                  <code className="font-mono text-xs break-all">{shareUrl}</code>
                  <Button size="sm" variant="outline" onClick={() => copy(shareUrl)}>Copy</Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Agents that hire Your Echo should send:
                  <pre className="mt-1 rounded bg-background border p-2 overflow-auto">
{`X-Referral-Code: ${mintedCode}
# or in JSON body:
{ "referral_code": "${mintedCode}", ... }`}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registered Agent mode */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Referrer Agent</CardTitle>
            <p className="text-sm text-muted-foreground">
              For orchestrators & marketplaces: register your agent, pin a payout destination,
              and get a dedicated code tied to your agent identity.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!session && (
              <div className="text-sm text-muted-foreground">
                Sign in to register a referrer agent.
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="agent-name">Agent name</Label>
                <Input id="agent-name" value={agentName} onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Acme Orchestrator" disabled={!session} />
              </div>
              <div>
                <Label htmlFor="agent-card">Agent card URL (optional)</Label>
                <Input id="agent-card" value={agentCardUrl} onChange={(e) => setAgentCardUrl(e.target.value)}
                  placeholder="https://acme.ai/.well-known/agent-card.json" disabled={!session} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="payout">Payout destination (email — held for future payouts)</Label>
                <Input id="payout" value={payoutEmail} onChange={(e) => setPayoutEmail(e.target.value)}
                  placeholder="payments@acme.ai" disabled={!session} />
              </div>
            </div>
            <Button onClick={registerAgent} disabled={!session || registering}>
              {registering ? "Registering…" : "Register agent & mint code"}
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        {session && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your attribution</CardTitle>
              <Button size="sm" variant="outline" onClick={loadStats} disabled={loadingStats}>
                {loadingStats ? "Loading…" : "Refresh"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {stats && (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-md border p-4">
                      <div className="text-xs uppercase text-muted-foreground">Conversions</div>
                      <div className="text-2xl font-semibold">{stats.totals.conversions}</div>
                    </div>
                    <div className="rounded-md border p-4">
                      <div className="text-xs uppercase text-muted-foreground">Attributed volume</div>
                      <div className="text-2xl font-semibold">{formatUsd(stats.totals.attributed_cents)}</div>
                    </div>
                    <div className="rounded-md border p-4">
                      <div className="text-xs uppercase text-muted-foreground">Est. future earnings</div>
                      <div className="text-2xl font-semibold">{formatUsd(stats.totals.estimated_future_earnings_cents)}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">Indicative 10% — track-only</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Your codes</h3>
                    {stats.codes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No codes yet.</p>
                    ) : (
                      <div className="border rounded-md divide-y">
                        {stats.codes.map((c) => (
                          <div key={c.code} className="flex items-center justify-between p-3 gap-3">
                            <div className="min-w-0">
                              <div className="font-mono text-sm">{c.code}</div>
                              {c.label && <div className="text-xs text-muted-foreground truncate">{c.label}</div>}
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {c.conversions} conv · {c.clicks} clicks
                            </div>
                            <Button size="sm" variant="outline"
                              onClick={() => copy(`${window.location.origin}/referrals?ref=${c.code}`)}>
                              Copy link
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Recent conversions</h3>
                    {stats.conversions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No conversions yet.</p>
                    ) : (
                      <div className="border rounded-md divide-y text-sm">
                        {stats.conversions.map((c) => (
                          <div key={c.id} className="p-3 grid grid-cols-2 md:grid-cols-5 gap-2">
                            <div className="text-muted-foreground">{new Date(c.created_at).toLocaleString()}</div>
                            <div>{c.event_type}</div>
                            <div className="font-mono text-xs truncate">{c.agent_id ?? "—"}</div>
                            <div className="font-mono text-xs truncate">{c.referrer_code ?? "—"}</div>
                            <div className="text-right">{formatUsd(c.amount_cents)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {!user && (
          <div className="text-sm text-muted-foreground text-center">
            Sign in to view your codes and conversions.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
