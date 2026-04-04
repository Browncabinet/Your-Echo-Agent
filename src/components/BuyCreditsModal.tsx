import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/use-credits";
import { Coins, Sparkles, Check, Calculator, Plus, ArrowLeft } from "lucide-react";

const creditPacks = [
  { priceId: "credits_600_onetime", credits: 600, price: 10, perEmail: "$0.017", popular: true, badge: "Starter", label: "Popular" },
  { priceId: "credits_1800_onetime", credits: 1800, price: 25, perEmail: "$0.014", popular: false, badge: "Growth", label: "Best Value" },
  { priceId: "credits_4000_onetime", credits: 4000, price: 50, perEmail: "$0.013", popular: false, badge: "Scale", label: null },
  { priceId: "credits_9000_onetime", credits: 9000, price: 100, perEmail: "$0.011", popular: false, badge: "Pro", label: null },
];

const quickTopUps = [
  { priceId: "credits_600_onetime", dollars: 10, credits: 600 },
  { priceId: "credits_1800_onetime", dollars: 25, credits: 1800 },
];

function getCustomRate(dollars: number): number {
  if (dollars >= 100) return 0.011;
  if (dollars >= 50) return 0.013;
  if (dollars >= 25) return 0.014;
  return 0.017;
}

function getCustomCredits(dollars: number): number {
  return Math.floor(dollars / getCustomRate(dollars));
}

interface BuyCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredCredits?: number;
}

export function BuyCreditsModal({ open, onOpenChange, requiredCredits }: BuyCreditsModalProps) {
  const { user } = useAuth();
  const { balance } = useCredits();
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  const customDollars = useMemo(() => {
    const val = parseInt(customAmount, 10);
    return isNaN(val) || val < 10 ? 0 : val;
  }, [customAmount]);

  const customCredits = useMemo(() => {
    return customDollars > 0 ? getCustomCredits(customDollars) : 0;
  }, [customDollars]);

  const customRate = useMemo(() => {
    return customDollars > 0 ? getCustomRate(customDollars).toFixed(3) : null;
  }, [customDollars]);

  const bestPackForCustom = useMemo(() => {
    if (customDollars <= 0) return null;
    const exact = creditPacks.find(p => p.price === customDollars);
    if (exact) return exact;
    const sorted = [...creditPacks].sort((a, b) => b.price - a.price);
    return sorted.find(p => p.price <= customDollars) || creditPacks[0];
  }, [customDollars]);

  if (selectedPriceId) {
    return (
      <Dialog open={open} onOpenChange={(o) => { if (!o) setSelectedPriceId(null); onOpenChange(o); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedPriceId(null)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <DialogTitle>Complete Purchase</DialogTitle>
                <DialogDescription>Secure checkout powered by Stripe</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <StripeEmbeddedCheckout
            priceId={selectedPriceId}
            customerEmail={user?.email || undefined}
            userId={user?.id || ""}
            returnUrl={`${window.location.origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            Buy Email Credits
          </DialogTitle>
          <DialogDescription>
            {requiredCredits
              ? `You need ${requiredCredits.toLocaleString()} credits for this campaign. You currently have ${balance.toLocaleString()}.`
              : `You have ${balance.toLocaleString()} credits remaining. Top up to keep sending.`
            }
          </DialogDescription>
        </DialogHeader>

        {/* Main credit packs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
          {creditPacks.map((pack) => (
            <Card
              key={pack.priceId}
              className={`p-4 cursor-pointer hover:shadow-md transition-all relative ${
                pack.popular ? "border-primary ring-1 ring-primary/20" : ""
              }`}
              onClick={() => setSelectedPriceId(pack.priceId)}
            >
              {pack.label && (
                <Badge className="absolute -top-2 right-3 text-[10px]">{pack.label}</Badge>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" />
                    {pack.credits.toLocaleString()} emails
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {pack.badge} · {pack.perEmail}/email
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">${pack.price}</p>
                  <p className="text-[10px] text-muted-foreground">one-time</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick top-up for current project */}
        <div className="border-t border-border pt-4 mt-1">
          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-3">
            <Plus className="w-4 h-4 text-primary" />
            Quick Add for this project
          </p>
          <div className="flex gap-2 mb-4">
            {[quickTopUps[0], QUICK_15, quickTopUps[1]].map((item) => (
              <Button
                key={item.dollars}
                variant="outline"
                size="sm"
                className="flex-1 h-auto py-2.5 flex flex-col items-center gap-0.5"
                onClick={() => {
                  const exact = creditPacks.find(p => p.price === item.dollars);
                  setSelectedPriceId(exact?.priceId || item.priceId);
                }}
              >
                <span className="font-semibold text-foreground">+${item.dollars}</span>
                <span className="text-[11px] text-muted-foreground">+{item.credits.toLocaleString()} emails</span>
              </Button>
            ))}
          </div>

          {/* Custom amount */}
          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-3">
            <Calculator className="w-4 h-4 text-primary" />
            Custom Amount
          </p>
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  type="number"
                  min={10}
                  placeholder="Enter amount"
                  className="pl-7"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">$10 minimum</p>
            </div>
            <Button
              disabled={customDollars < 10}
              onClick={() => {
                if (!bestPackForCustom) return;
                const exactPack = creditPacks.find(p => p.price === customDollars);
                if (exactPack) {
                  setSelectedPriceId(exactPack.priceId);
                } else {
                  setSelectedPriceId(bestPackForCustom.priceId);
                }
              }}
              className="shrink-0"
            >
              Buy Credits
            </Button>
          </div>
          {customDollars >= 10 && (
            <div className="mt-2 rounded-md bg-primary/5 border border-primary/10 p-3">
              <p className="text-sm text-foreground font-medium">
                ${customDollars} → ~{customCredits.toLocaleString()} emails
                <span className="text-muted-foreground font-normal"> (${customRate}/email)</span>
              </p>
              {!creditPacks.find(p => p.price === customDollars) && bestPackForCustom && (
                <p className="text-xs text-muted-foreground mt-1">
                  We'll use the <strong>${bestPackForCustom.price}</strong> pack ({bestPackForCustom.credits.toLocaleString()} credits) — the best match for your amount.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
          <Check className="w-3 h-3" /> Credits never expire
          <span className="mx-1">·</span>
          <Check className="w-3 h-3" /> No subscription required
        </div>
      </DialogContent>
    </Dialog>
  );
}
