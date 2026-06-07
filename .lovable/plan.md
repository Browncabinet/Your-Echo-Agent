## Problem
On `/pricing`, clicking a plan opens the "Start your weekly plan" dialog containing the Stripe embedded checkout iframe. The dialog has no height cap or scroll, so on shorter viewports (your 932×679 window) the card/expiry/CVC fields fall below the visible area and the modal body itself can't scroll.

## Fix
Update the checkout `DialogContent` on `src/pages/Pricing.tsx` (line 217) to cap its height and scroll internally:

- Change `className="max-w-lg"` → `className="max-w-lg max-h-[90vh] overflow-y-auto"`

Apply the same change to the A2A top-up modal in `src/pages/PartnerBilling.tsx` for consistency (same root cause — Stripe iframe taller than viewport).

## Why this works
`StripeEmbeddedCheckout` renders an iframe whose height is driven by Stripe's content. Without `max-h` + `overflow-y-auto` on the dialog, the modal grows past the viewport and the outer page can't scroll into it. Capping height + enabling scroll on the dialog body lets you reach the card fields.

No business-logic or checkout-flow changes — purely a CSS/scroll fix.