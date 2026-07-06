import { useEffect, useRef } from "react";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";

interface StripeEmbeddedCheckoutProps {
  priceId: string;
  quantity?: number;
  customerEmail?: string;
  userId?: string;
  returnUrl?: string;
}

/**
 * Legacy name kept for compatibility. Now opens Paddle overlay checkout.
 */
export function StripeEmbeddedCheckout({
  priceId,
  quantity,
  customerEmail,
  userId,
  returnUrl,
}: StripeEmbeddedCheckoutProps) {
  const { openCheckout } = usePaddleCheckout();
  const opened = useRef(false);

  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    openCheckout({
      priceId,
      quantity,
      customerEmail,
      customData: userId ? { userId } : undefined,
      successUrl: returnUrl?.replace(/\{CHECKOUT_SESSION_ID\}/g, ""),
    }).catch((e) => console.error("Paddle checkout failed", e));
  }, [priceId, quantity, customerEmail, userId, returnUrl, openCheckout]);

  return (
    <div className="text-sm text-muted-foreground text-center py-8">
      Opening secure checkout…
    </div>
  );
}
