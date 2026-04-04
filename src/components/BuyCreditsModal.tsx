import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/use-credits";
import { Coins, Sparkles, Check } from "lucide-react";

const creditPacks = [
  { priceId: "credits_500_onetime", credits: 500, price: "$10", perEmail: "$0.02", popular: false },
  { priceId: "credits_1500_onetime", credits: 1500, price: "$25", perEmail: "$0.017", popular: true },
  { priceId: "credits_4000_onetime", credits: 4000, price: "$50", perEmail: "$0.013", popular: false },
];

interface BuyCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredCredits?: number;
}

export function BuyCreditsModal({ open, onOpenChange, requiredCredits }: BuyCreditsModalProps) {
  const { user } = useAuth();
  const { balance } = useCredits();
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);

  if (selectedPriceId) {
    return (
      <Dialog open={open} onOpenChange={(o) => { if (!o) setSelectedPriceId(null); onOpenChange(o); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Complete Purchase</DialogTitle>
            <DialogDescription>Secure checkout powered by Stripe</DialogDescription>
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            Buy Email Credits
          </DialogTitle>
          <DialogDescription>
            {requiredCredits
              ? `You need ${requiredCredits} credits for this campaign. You currently have ${balance}.`
              : `You have ${balance} credits remaining. Top up to keep sending.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          {creditPacks.map((pack) => (
            <Card
              key={pack.priceId}
              className={`p-4 cursor-pointer hover:shadow-md transition-all relative ${
                pack.popular ? "border-primary ring-1 ring-primary/20" : ""
              }`}
              onClick={() => setSelectedPriceId(pack.priceId)}
            >
              {pack.popular && (
                <Badge className="absolute -top-2 right-3 text-[10px]">Best Value</Badge>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" />
                    {pack.credits.toLocaleString()} credits
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {pack.perEmail}/email · Send {pack.credits.toLocaleString()} personalized emails
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">{pack.price}</p>
                  <p className="text-[10px] text-muted-foreground">one-time</p>
                </div>
              </div>
            </Card>
          ))}
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
