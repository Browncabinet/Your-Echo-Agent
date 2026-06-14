## Wire top-up packs everywhere (humans + A2A partners)

The three packs (+500 / $12, +1,000 / $22, +2,500 / $45) already exist as Stripe products and are wired on the Landing page. This plan extends them to every other surface and adds an A2A partner path so other agents can buy email volume too.

## Surfaces to wire

| Surface | Behavior |
|---|---|
| `HomePricingSection` (Home) | Add an "Email top-ups" row under the 3 subscription tiers. Cards open `TopupCheckoutDialog`. |
| `Pricing` page (`/pricing`) | Same top-up row under the weekly tiers. Public visitors → redirect to `/auth?next=/pricing&topup=<priceId>`; on return, auto-open the dialog. |
| `BuyCreditsModal` | Replace the legacy `credits_*_onetime` packs with `topup_500/1000/2500`. This is what fires from in-app "Buy emails" buttons (rate-limit page, cap-reached toasts). |
| `RateLimits` / cap-reached toast | Already routes to `BuyCreditsModal`; inherits the new packs automatically. |
| `PartnerBilling` (`/for-agents/billing`) | Add a second section "Email-volume top-ups" with the same 3 cards. Partner-mode checkout credits `a2a_partners.balance_cents` at the pack's dollar value (e.g. `topup_500` → +1,200¢). The existing `a2a_credit_25/100/500` packs stay for now. |

## A2A purchase path

Other agents that hold an API key can already top up via the existing `/for-agents/billing` UI. To let them buy these new packs the same way:

1. `TopupCheckoutDialog` accepts an optional `mode: "user" | "a2a_partner"` plus `a2aPartnerId`. In partner mode it passes `metadata.a2a_partner_id` through `create-checkout` (already supported via `extraMetadata`) and omits `userId`.
2. `payments-webhook` `handleCheckoutCompleted` already branches on `metadata.a2a_partner_id` and credits `balance_cents`. Extend its `A2A_CREDIT_MAP` with:
   - `topup_500: 1200`
   - `topup_1000: 2200`
   - `topup_2500: 4500`
   (Cents granted = pack price, since A2A balance is denominated in cents.)
3. No new edge functions; no new Stripe products.

This means the same Stripe SKU credits either `user_credits.balance` (emails) or `a2a_partners.balance_cents` (prepaid charge balance) depending on which metadata field the session was opened with — branching is already in the webhook.

## Logged-out behavior on public Pricing/Home

Force sign-in. Clicking a top-up card while signed-out routes to `/auth?next=/pricing&topup=topup_500`. After Google OAuth, `Pricing` reads the `topup` query param on mount and opens `TopupCheckoutDialog` with that priceId. Keeps accounting clean (every credit grant has a `userId`).

## Files touched

- `src/components/TopupCheckoutDialog.tsx` — add `mode` + `a2aPartnerId` props; pass `metadata` to checkout when in partner mode.
- `src/components/HomePricingSection.tsx` — add top-up row + dialog state.
- `src/pages/Pricing.tsx` — add top-up row, dialog state, and `useEffect` to auto-open from `?topup=` query param.
- `src/components/BuyCreditsModal.tsx` — swap pack list to `topup_500/1000/2500` with new pricing/labels.
- `src/pages/PartnerBilling.tsx` — add "Email-volume top-ups" section using `TopupCheckoutDialog` in `mode="a2a_partner"`.
- `supabase/functions/payments-webhook/index.ts` — extend `A2A_CREDIT_MAP` with the 3 new lookup keys → cents.
- `src/pages/Auth.tsx` (small) — after sign-in, honor `next` + `topup` params on redirect.
- Memory: update `mem://features/pricing` to note A2A partners can buy the same packs (credited as balance_cents).

## Out of scope

- Retiring `a2a_credit_25/100/500` (kept for parity with partners already topping up).
- Guest checkout without an account.
- Auto-recharge / expirations.
