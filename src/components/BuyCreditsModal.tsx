import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { TopupPacks, type TopupPack } from "@/components/TopupPacks";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/use-credits";
import { Coins, Check, ArrowLeft } from "lucide-react";

interface BuyCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredCredits?: number;
}

export function BuyCreditsModal({ open, onOpenChange, requiredCredits }: BuyCreditsModalProps) {
  const { user } = useAuth();
  const { balance } = useCredits();
  const [selectedPriceId, setSelectedPriceId] = useState<TopupPack["priceId"] | null>(null);

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
            returnUrl={`${window.location.origin}/?topup=success&session_id={CHECKOUT_SESSION_ID}`}
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
            Buy More Emails
          </DialogTitle>
          <DialogDescription>
            {requiredCredits
              ? `You need ${requiredCredits.toLocaleString()} emails for this campaign. You currently have ${balance.toLocaleString()}.`
              : `You have ${balance.toLocaleString()} emails remaining. Top up to keep sending.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <TopupPacks
            title=""
            subtitle="Never expire · Roll over week to week"
            onSelect={(id) => setSelectedPriceId(id)}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
          <Check className="w-3 h-3" /> Emails never expire
          <span className="mx-1">·</span>
          <Check className="w-3 h-3" /> No subscription required
        </div>
      </DialogContent>
    </Dialog>
  );
}
