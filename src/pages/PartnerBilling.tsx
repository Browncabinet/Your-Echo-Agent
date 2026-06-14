import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Wallet, ArrowLeft, Zap, Key, Plus, Mail, Shield } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import { TopupPacks, type TopupPack } from "@/components/TopupPacks";
import { TopupCheckoutDialog } from "@/components/TopupCheckoutDialog";

type Partner = {
  id: string;
  billing_email: string;
  balance_cents: number;
  total_spent_cents: number;
  default_spending_cap_cents?: number;
  auto_recharge_enabled?: boolean;
  auto_recharge_threshold_cents?: number;
  auto_recharge_amount_cents?: number;
};

type Job = {
  id: string;
  agent_id: string;
  status: string;
  spend_cents: number;
  leads_sent: number;
  created_at: string;
};

const CREDIT_PACKS = [
  { price_id: "a2a_credit_25_once", amount: 25, label: "$25", hint: "~5K emails" },
  { price_id: "a2a_credit_100_once", amount: 100, label: "$100", hint: "~20K emails", popular: true },
  { price_id: "a2a_credit_500_once", amount: 500, label: "$500", hint: "Best for production" },
];

export default function PartnerBilling() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [keyCount, setKeyCount] = useState(0);
  const [checkoutPriceId, setCheckoutPriceId] = useState<string | null>(null);
  const [emailTopupPriceId, setEmailTopupPriceId] = useState<TopupPack["priceId"] | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: ks }, { data: js }] = await Promise.all([
        supabase.from("a2a_partners").select("*").eq("owner_user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("a2a_api_keys").select("id").eq("owner_user_id", user.id),
        supabase.from("a2a_jobs").select("id, agent_id, status, spend_cents, leads_sent, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      ]);
      setPartner(p as Partner | null);
      setKeyCount((ks || []).length);
      setJobs((js || []) as Job[]);
      setLoading(false);
    })();
  }, [user]);

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/for-agents/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="font-bold">Partner Billing</h1>
        </div>
      </header>

      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8 space-y-6">
        {!partner && (
          <Card className="p-8 text-center space-y-3">
            <Key className="w-10 h-10 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-bold">No partner account yet</h2>
            <p className="text-muted-foreground text-sm">
              Hire an Echo Agent via the API at least once to create your partner billing record.
            </p>
            <Button asChild>
              <Link to="/for-agents">Browse Agents</Link>
            </Button>
          </Card>
        )}

        {partner && (
          <>
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="p-5">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide mb-2">
                  <Wallet className="w-4 h-4" /> Prepaid Balance
                </div>
                <div className="text-3xl font-bold">{fmt(partner.balance_cents)}</div>
              </Card>
              <Card className="p-5">
                <div className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Total Spent</div>
                <div className="text-3xl font-bold">{fmt(partner.total_spent_cents)}</div>
              </Card>
              <Card className="p-5">
                <div className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Active API Keys</div>
                <div className="text-3xl font-bold">{keyCount}</div>
              </Card>
            </div>

            <SpendingControls partner={partner} onSaved={(p) => setPartner(p)} />



            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Top up</h2>
                  <p className="text-sm text-muted-foreground">Credit drawn down per delivered email, reply, or meeting at the agent's posted price.</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {CREDIT_PACKS.map((p) => (
                  <button
                    key={p.price_id}
                    onClick={() => setCheckoutPriceId(p.price_id)}
                    className={`relative text-left p-5 rounded-lg border-2 transition hover:border-primary hover:bg-primary/5 ${
                      p.popular ? "border-primary" : "border-border"
                    }`}
                  >
                    {p.popular && (
                      <Badge className="absolute -top-2 right-3 text-[10px]">Popular</Badge>
                    )}
                    <div className="text-2xl font-bold">{p.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{p.hint}</div>
                    <Plus className="w-4 h-4 text-primary mt-3" />
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => setCheckoutPriceId("a2a_credit_test_1_once")}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Run $1 sandbox test top-up →
                </button>
              </div>
            </Card>

            {/* Email-volume top-ups — same SKUs humans buy, credited to balance_cents */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-primary" />
                <h2 className="font-bold">Email-volume top-ups</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Same packs human users buy. Credit converts to your prepaid balance at the pack price and never expires.
              </p>
              <TopupPacks
                title=""
                subtitle="Never expire · Auto-credit to your A2A balance"
                onSelect={(id) => setEmailTopupPriceId(id)}
              />
            </Card>



            <Card className="p-6">
              <h2 className="font-bold mb-3">Recent A2A Jobs</h2>
              {jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No jobs yet.</p>
              ) : (
                <div className="divide-y">
                  {jobs.map((j) => (
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
          </>
        )}
      </main>

      <Dialog open={!!checkoutPriceId} onOpenChange={(o) => !o && setCheckoutPriceId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Credit</DialogTitle>
          </DialogHeader>
          {checkoutPriceId && partner && (
            <PartnerCheckout
              priceId={checkoutPriceId}
              partnerId={partner.id}
              customerEmail={partner.billing_email || user?.email || undefined}
            />
          )}
        </DialogContent>
      </Dialog>
      <TopupCheckoutDialog
        priceId={emailTopupPriceId}
        onClose={() => setEmailTopupPriceId(null)}
        mode="a2a_partner"
        a2aPartnerId={partner?.id}
        customerEmail={partner?.billing_email || user?.email || undefined}
        returnPath="/for-agents/billing?topup=success"
      />
      <Footer />
    </div>
  );
}

function PartnerCheckout({ priceId, partnerId, customerEmail }: { priceId: string; partnerId: string; customerEmail?: string }) {
  const fetchClientSecret = async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        priceId,
        customerEmail,
        returnUrl: `${window.location.origin}/for-agents/billing?topup=success`,
        environment: getStripeEnvironment(),
        metadata: { a2a_partner_id: partnerId },
      },
    });
    if (error || !data?.clientSecret) throw new Error(error?.message || "Failed to create checkout");
    return data.clientSecret;
  };
  return (
    <div id="checkout" className="min-h-[500px]">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}

function SpendingControls({ partner, onSaved }: { partner: Partner; onSaved: (p: Partner) => void }) {
  const [capDollars, setCapDollars] = useState(((partner.default_spending_cap_cents ?? 2500) / 100).toString());
  const [autoEnabled, setAutoEnabled] = useState(!!partner.auto_recharge_enabled);
  const [thresholdDollars, setThresholdDollars] = useState(((partner.auto_recharge_threshold_cents ?? 1000) / 100).toString());
  const [amountDollars, setAmountDollars] = useState(((partner.auto_recharge_amount_cents ?? 5000) / 100).toString());
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const cap = Math.max(1, Math.min(Math.round(Number(capDollars) * 100), 100000));
    const threshold = Math.max(100, Math.round(Number(thresholdDollars) * 100));
    const amount = Math.max(500, Math.round(Number(amountDollars) * 100));
    const { data, error } = await supabase
      .from("a2a_partners")
      .update({
        default_spending_cap_cents: cap,
        auto_recharge_enabled: autoEnabled,
        auto_recharge_threshold_cents: threshold,
        auto_recharge_amount_cents: amount,
      })
      .eq("id", partner.id)
      .select("*")
      .maybeSingle();
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    if (data) onSaved(data as Partner);
  };

  return (
    <Card className="p-6">
      <h2 className="font-bold flex items-center gap-2 mb-1"><Shield className="w-4 h-4 text-primary" /> Spending controls</h2>
      <p className="text-sm text-muted-foreground mb-5">Used as defaults when your hire requests omit a spending cap, and to trigger auto-recharge.</p>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="cap" className="text-xs uppercase tracking-wide">Default per-job cap ($)</Label>
          <Input id="cap" type="number" min={1} max={1000} value={capDollars} onChange={(e) => setCapDollars(e.target.value)} />
          <p className="text-[11px] text-muted-foreground">Applied when hire payload omits <code>spending_cap_cents</code>.</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wide">Auto-recharge</Label>
            <Switch checked={autoEnabled} onCheckedChange={setAutoEnabled} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="thr" className="text-[10px] text-muted-foreground">When balance &lt; ($)</Label>
              <Input id="thr" type="number" min={1} value={thresholdDollars} onChange={(e) => setThresholdDollars(e.target.value)} disabled={!autoEnabled} />
            </div>
            <div>
              <Label htmlFor="amt" className="text-[10px] text-muted-foreground">Add ($)</Label>
              <Input id="amt" type="number" min={5} value={amountDollars} onChange={(e) => setAmountDollars(e.target.value)} disabled={!autoEnabled} />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">Requires a saved payment method. We'll prompt for one before charging.</p>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
          Save controls
        </Button>
      </div>
    </Card>
  );
}
