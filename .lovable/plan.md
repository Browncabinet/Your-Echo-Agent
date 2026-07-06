## Why real cards are declined

The Lovable preview always runs Stripe's **test environment** — real bank cards are declined by design. Your live keys and go-live are already complete, so real cards will work on your published site (`yourechoagent.com`), just not in the preview.

## What to do in preview

Use any Stripe test card at checkout:

- **Success**: `4242 4242 4242 4242`
- **Decline (to test failure UX)**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`
- Any future expiry (e.g. `12/34`), any 3-digit CVC, any ZIP.

## Small UI change

Update the orange preview banner to make this obvious so you (and any teammate) don't try a real card again:

> "Preview checkout is in test mode, so real bank cards will be declined. Use test card `4242 4242 4242 4242`, any future expiry and CVC."

No changes to checkout logic, keys, or edge functions — only the banner copy.
