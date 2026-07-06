import { useEffect, useRef } from "react";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { useAuth } from "@/contexts/AuthContext";

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
 * Opens Paddle overlay checkout. Renders no dialog UI of its own — Paddle
 * shows the checkout as an overlay. Calls onClose after firing checkout.
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
  const { openCheckout } = usePaddleCheckout();
  const openedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!priceId) {
      openedFor.current = null;
      return;
    }
    if (openedFor.current === priceId) return;
    openedFor.current = priceId;

    const customData: Record<string, string> = {};
    if (mode === "user" && user?.id) customData.userId = user.id;
    if (mode === "a2a_partner" && a2aPartnerId) customData.a2aPartnerId = a2aPartnerId;
    if (user?.id) customData.userId = user.id;

    const successUrl = returnPath
      ? `${window.location.origin}${returnPath.replace(/\{CHECKOUT_SESSION_ID\}/g, "")}`
      : `${window.location.origin}/?topup=success`;

    openCheckout({
      priceId,
      customerEmail: customerEmail || user?.email || undefined,
      customData,
      successUrl,
    }).catch((e) => {
      console.error("Paddle checkout failed", e);
    });
    // Notify parent so its local state can reset — Paddle owns the UI now.
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceId]);

  return null;
}
