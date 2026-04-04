

# End-to-End Test Results

## What was tested
- Auth page (unauthenticated landing)
- Pricing page
- Comparison table ("Built Differently")
- Code review of: App routing, ProtectedRoute, AuthContext, Index (dashboard), ReviewApproval, BuyCreditsModal, Stripe edge functions, CheckoutReturn, config.toml

## Bugs Found

### 1. Pricing page shows subscription plans, but payment system uses pay-as-you-go credits (MISMATCH)
The Pricing page (`/pricing`) displays $0/mo, $9/mo, $19/mo, $39/mo subscription tiers. But the actual implemented payment system is pay-as-you-go credits ($10 for 500, $25 for 1,500, $50 for 4,000). **Visitors will be confused** — the pricing page promises one model, the dashboard delivers another.

**Fix**: Update the Pricing page to reflect the credit-based model, or add a credits section alongside the plans.

### 2. Console warnings: "Function components cannot be given refs"
Multiple components (`TrustSignals`, `FeaturesSection`, `ComparisonSection`) throw React ref warnings when rendered inside `Auth.tsx`. These are non-breaking but indicate they're being passed refs they can't handle.

**Fix**: Wrap these components with `React.forwardRef` or adjust how `Auth.tsx` renders them (likely a parent is passing a ref down).

### 3. `user_credits` table allows authenticated users to INSERT their own credits
The RLS policy "Users can insert own credits" lets any logged-in user insert a `user_credits` row with any balance. Combined with the client-side code in `use-credits.tsx` that inserts `balance: 50` when no record exists, a malicious user could insert `balance: 999999`.

**Fix**: Remove the INSERT policy for authenticated users. Use a database trigger or the service role (via the webhook) to create initial credit records instead.

### 4. No `verify_jwt = false` for other edge functions that may need CORS
Functions like `send-campaign-emails`, `track`, `firecrawl-scrape`, etc. are not in `config.toml`. If any are called from the browser, CORS preflight will fail. The `track` function (for open/click tracking) is especially critical since it's hit by email clients without auth.

**Fix**: Add `verify_jwt = false` for the `track` edge function at minimum.

### 5. CheckoutReturn page is not behind ProtectedRoute
The `/checkout/return` route is public. While not a security issue (it just shows a success message), the `useCredits()` hook calls refresh which requires a user. If somehow accessed without auth, it may error silently.

**Fix**: Minor — either wrap in ProtectedRoute or add a null check.

### 6. Potential URL parsing crash in campaign list
Line 153 in Index.tsx: `new URL(c.websiteUrl).hostname` — if `websiteUrl` is not a valid URL (e.g. missing protocol), this will throw and crash the component.

**Fix**: Wrap in try/catch or use a safer parsing method.

## Summary of Severity

| Bug | Severity | User-facing? |
|-----|----------|-------------|
| Pricing page mismatch | **High** | Yes — misleads visitors |
| Credits INSERT RLS vulnerability | **High** | Security risk |
| URL parsing crash | **Medium** | Crashes dashboard if bad URL saved |
| Track function JWT config | **Medium** | Breaks open/click tracking |
| Console ref warnings | **Low** | No visible impact |
| CheckoutReturn unprotected | **Low** | Edge case |

## Recommended fix order
1. Fix the credits INSERT RLS vulnerability (security)
2. Update Pricing page to match credit system (user trust)
3. Add `verify_jwt = false` for `track` function
4. Add try/catch around URL parsing
5. Fix ref warnings (cosmetic)

