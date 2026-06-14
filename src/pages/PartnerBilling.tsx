import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PartnerShell } from "@/components/PartnerShell";
import { Loader2, Wallet, Zap, Key, Plus, Mail, Shield } from "lucide-react";
import { toast } from "sonner";
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

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-white/[0.08] bg-[#0d0d14] ${className}`}>{children}</div>;
}

function PanelHeader({ icon: Icon, title, subtitle }: { icon?: typeof Wallet; title: string; subtitle?: string }) {
  return (
    <div className="px-5 py-3.5 border-b border-white/[0.06]">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
        {Icon && <Icon className="w-3.5 h-3.5 text-indigo-300" />}
        {title}
      </div>
      {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

const inputCls = "h-10 bg-black/40 border-white/[0.08] focus-visible:border-white/30 focus-visible:ring-0 text-zinc-100";

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
      <PartnerShell>
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>
      </PartnerShell>
    );
  }

  return (
    <PartnerShell>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Billing</h1>
        <p className="text-sm text-zinc-500 mt-1">Prepaid balance, top-ups, and spending controls.</p>
      </div>

      {!partner && (
        <Panel className="p-8 text-center space-y-3">
          <Key className="w-10 h-10 text-zinc-500 mx-auto" />
          <h2 className="text-xl font-semibold text-zinc-100">No partner account yet</h2>
          <p className="text-zinc-500 text-sm">
            Create your A2A partner account to get an instant <code className="font-mono text-zinc-300">eak_</code> API key and start topping up.
          </p>
          <Button asChild className="bg-white text-zinc-900 hover:bg-zinc-100 font-medium">
            <Link to="/for-agents/signup">Sign up — instant API key</Link>
          </Button>
        </Panel>
      )}

      {partner && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Prepaid balance", value: fmt(partner.balance_cents), icon: Wallet, hint: "Available to spend" },
              { label: "Total spent", value: fmt(partner.total_spent_cents), hint: "All time" },
              { label: "Active API keys", value: String(keyCount), hint: "Across all environments" },
            ].map((s) => (
              <Panel key={s.label} className="p-5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-1">
                  {s.icon && <s.icon className="w-3 h-3" />}
                  {s.label}
                </div>
                <div className="text-3xl font-semibold text-white tabular-nums">{s.value}</div>
                <div className="text-[11px] text-zinc-600 mt-1">{s.hint}</div>
              </Panel>
            ))}
          </div>

          <SpendingControls partner={partner} onSaved={(p) => setPartner(p)} />

          {/* A2A credit top-ups */}
          <Panel>
            <PanelHeader icon={Zap} title="Top up" subtitle="Credit drawn down per delivered email, reply, or meeting at the agent's posted price." />
            <div className="p-5">
              <div className="grid sm:grid-cols-3 gap-3">
                {CREDIT_PACKS.map((p) => (
                  <button
                    key={p.price_id}
                    onClick={() => setCheckoutPriceId(p.price_id)}
                    className={`relative text-left p-5 rounded-lg border transition ${
                      p.popular
                        ? "border-indigo-500/40 bg-indigo-500/[0.06] hover:border-indigo-500/60"
                        : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.18] hover:bg-white/[0.04]"
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-2 right-3 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500 text-white">
                        Popular
                      </span>
                    )}
                    <div className="text-2xl font-semibold text-zinc-100 tabular-nums">{p.label}</div>
                    <div className="text-xs text-zinc-500 mt-1">{p.hint}</div>
                    <Plus className="w-4 h-4 text-indigo-300 mt-3" />
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => setCheckoutPriceId("a2a_credit_test_1_once")}
                  className="text-xs text-zinc-500 hover:text-zinc-200 font-mono"
                >
                  Run $1 sandbox test top-up →
                </button>
              </div>
            </div>
          </Panel>

          {/* Email-volume top-ups removed — A2A billing is prepaid-balance + per-result only */}

          {/* Recent A2A jobs */}
          <Panel>
            <PanelHeader title="Recent A2A jobs" />
            <div className="p-5">
              {jobs.length === 0 ? (
                <p className="text-sm text-zinc-500">No jobs yet.</p>
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {jobs.map((j) => (
                    <div key={j.id} className="py-3 flex items-center justify-between text-sm first:pt-0 last:pb-0">
                      <div>
                        <div className="font-medium text-zinc-100">{j.agent_id}</div>
                        <div className="text-[11px] text-zinc-500 font-mono">{new Date(j.created_at).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-wider bg-white/[0.05] text-zinc-300 border-white/10">
                          {j.status}
                        </span>
                        <div className="text-right">
                          <div className="text-zinc-100 tabular-nums">{fmt(j.spend_cents)}</div>
                          <div className="text-[11px] text-zinc-500">{j.leads_sent} sent</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Panel>
        </div>
      )}

      <Dialog open={!!checkoutPriceId} onOpenChange={(o) => !o && setCheckoutPriceId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add credit</DialogTitle>
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
    </PartnerShell>
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
    <Panel>
      <PanelHeader icon={Shield} title="Spending controls" subtitle="Used as defaults when your hire requests omit a spending cap, and to trigger auto-recharge." />
      <div className="p-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="cap" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Default per-job cap ($)</Label>
            <Input id="cap" type="number" min={1} max={1000} value={capDollars} onChange={(e) => setCapDollars(e.target.value)} className={inputCls} />
            <p className="text-[11px] text-zinc-600">Applied when hire payload omits <code className="bg-white/[0.05] text-zinc-300 px-1 rounded font-mono">spending_cap_cents</code>.</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Auto-recharge</Label>
              <Switch checked={autoEnabled} onCheckedChange={setAutoEnabled} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="thr" className="text-[10px] text-zinc-500">When balance &lt; ($)</Label>
                <Input id="thr" type="number" min={1} value={thresholdDollars} onChange={(e) => setThresholdDollars(e.target.value)} disabled={!autoEnabled} className={inputCls} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="amt" className="text-[10px] text-zinc-500">Add ($)</Label>
                <Input id="amt" type="number" min={5} value={amountDollars} onChange={(e) => setAmountDollars(e.target.value)} disabled={!autoEnabled} className={inputCls} />
              </div>
            </div>
            <p className="text-[11px] text-zinc-600">Requires a saved payment method. We'll prompt for one before charging.</p>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button onClick={save} disabled={saving} className="bg-indigo-500 hover:bg-indigo-400 text-white font-medium gap-2">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save controls
          </Button>
        </div>
      </div>
    </Panel>
  );
}
