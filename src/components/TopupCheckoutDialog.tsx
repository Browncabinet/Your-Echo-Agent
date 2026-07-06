import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";

interface TopupCheckoutDialogProps {
  priceId: string | null;
  onClose: () => void;
  /** "user" credits user_credits.balance; "a2a_partner" credits a2a_partners.balance_cents. */
  mode?: "user" | "a2a_partner";
  a2aPartnerId?: string;
  customerEmail?: string;
  returnPath?: string;
}

/**
 * Opens Stripe embedded checkout in a modal. Renders the checkout element
 * itself. Calls onClose after firing checkout so parent state can reset.
 */
export function TopupCheckoutDialog({
  priceId,
  onClose,
  mode = "user",
  a2aPartnerId,
  customerEmail,
  returnPath,
}: TopupCheckoutDialogProps) {
  const { user } = useAuth();
  const { openCheckout, isOpen, closeCheckout, checkoutElement } = useStripeCheckout();

  useEffect(() => {
    if (!priceId) return;
    const returnUrl = returnPath
      ? `${window.location.origin}${returnPath}`
      : `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`;

    openCheckout({
      priceId,
      customerEmail: customerEmail || user?.email || undefined,
      userId: mode === "user" ? user?.id : undefined,
      a2aPartnerId: mode === "a2a_partner" ? a2aPartnerId : undefined,
      returnUrl,
    });
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceId]);

  // Close side-effect: when checkout dialog closes, ensure parent resets.
  useEffect(() => {
    if (!isOpen && priceId) {
      // no-op — parent already cleared via onClose above
    }
  }, [isOpen, priceId]);

  return <>{checkoutElement}</>;
}
