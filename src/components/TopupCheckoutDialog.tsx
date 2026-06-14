import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TopupCheckoutDialogProps {
  priceId: string | null;
  onClose: () => void;
  /** "user" credits user_credits.balance; "a2a_partner" credits a2a_partners.balance_cents. */
  mode?: "user" | "a2a_partner";
  /** Required when mode === "a2a_partner". */
  a2aPartnerId?: string;
  /** Customer email override (used for A2A flows where billing_email != auth email). */
  customerEmail?: string;
  /** Return path to come back to after Stripe success. */
  returnPath?: string;
}

function Checkout({ priceId, mode, a2aPartnerId, customerEmail, userId, returnPath }: {
  priceId: string;
  mode: "user" | "a2a_partner";
  a2aPartnerId?: string;
  customerEmail?: string;
  userId?: string;
  returnPath: string;
}) {
  const fetchClientSecret = async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        priceId,
        customerEmail,
        ...(mode === "user" && userId ? { userId } : {}),
        returnUrl: `${window.location.origin}${returnPath}`,
        environment: getStripeEnvironment(),
        ...(mode === "a2a_partner" && a2aPartnerId
          ? { metadata: { a2a_partner_id: a2aPartnerId } }
          : {}),
      },
    });
    if (error || !data?.clientSecret) {
      throw new Error(error?.message || "Failed to create checkout session");
    }
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

export function TopupCheckoutDialog({
  priceId,
  onClose,
  mode = "user",
  a2aPartnerId,
  customerEmail,
  returnPath,
}: TopupCheckoutDialogProps) {
  const { user } = useAuth();
  const resolvedReturnPath =
    returnPath || `/?topup=success&session_id={CHECKOUT_SESSION_ID}`;
  const resolvedEmail = customerEmail || user?.email || undefined;

  return (
    <Dialog open={!!priceId} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "a2a_partner" ? "Add credit to your A2A balance" : "Complete your top-up"}
          </DialogTitle>
          <DialogDescription>
            Secure checkout powered by Stripe.{" "}
            {mode === "a2a_partner"
              ? "Funds are added to your partner balance and drawn down per delivered result."
              : "Emails are added instantly and never expire."}
          </DialogDescription>
        </DialogHeader>
        {priceId && (
          <Checkout
            priceId={priceId}
            mode={mode}
            a2aPartnerId={a2aPartnerId}
            customerEmail={resolvedEmail}
            userId={user?.id}
            returnPath={resolvedReturnPath}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
