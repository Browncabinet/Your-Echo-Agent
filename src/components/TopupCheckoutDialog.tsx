import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { useAuth } from "@/contexts/AuthContext";

interface TopupCheckoutDialogProps {
  priceId: string | null;
  onClose: () => void;
}

export function TopupCheckoutDialog({ priceId, onClose }: TopupCheckoutDialogProps) {
  const { user } = useAuth();

  return (
    <Dialog open={!!priceId} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete your top-up</DialogTitle>
          <DialogDescription>Secure checkout powered by Stripe. Emails are added instantly and never expire.</DialogDescription>
        </DialogHeader>
        {priceId && (
          <StripeEmbeddedCheckout
            priceId={priceId}
            customerEmail={user?.email || undefined}
            userId={user?.id || ""}
            returnUrl={`${window.location.origin}/?topup=success&session_id={CHECKOUT_SESSION_ID}`}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
