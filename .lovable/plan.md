## Goal

When a signed-in user lands on `/` (the "dashboard" home view), show only the functional dashboard: usage strip, quick actions, search/Quick Update, and the campaigns list. The full marketing page stays intact for logged-out visitors.

## Changes

**File:** `src/pages/Index.tsx` (home view, lines ~127–290)

Gate the marketing block by `user`. Render two variants of the home view:

### Logged-in dashboard (clean)
Keep, in this order:
1. `PaymentTestModeBanner`
2. Header (Logo, emails balance, Avatar, Sign out) — unchanged
3. `WeeklyUsageStrip`
4. Compact title row: small "Your campaigns" heading + the two action buttons inline on the right:
   - **New Campaign** (primary)
   - **Fast Mode — Paste URL Only** (outline)
5. `QuickUpdateBar` (search)
6. Campaigns list (existing card map) or the empty-state card
7. Modals (`QuickStartModal`, `BuyCreditsModal`, `WelcomeModal`) — unchanged

Remove from the logged-in view:
- Hero `<h1>` + descriptive paragraph + `TrustSignals`
- `HomeDemoSection`
- `HomePricingSection`
- `FeaturesSection`
- `ComparisonSection`
- `ChooseYourNicheSection`
- `WhyNicheFirstSection`
- `MarketplaceSection`
- `LeaderboardSection`
- `ForAgentsSection`
- `FaqSection`
- "Your Recent Campaigns" sub-heading (redundant with the new "Your campaigns" title)

### Logged-out marketing page (unchanged)
If `!user`, render the existing hero + all marketing sections exactly as today. Hide the campaigns list and Quick Update (nothing to show without auth).

## Out of scope
- `dashboard`, `replies`, `social`, and `campaign` views are not touched.
- No changes to marketing components themselves, pricing logic, or auth flow.
- No memory updates (Home Page marketing memory still applies to the logged-out view).

## Technical notes
- Single conditional in the `view === "home"` branch: `{user ? <DashboardHome/> : <MarketingHome/>}`, or two inline JSX blocks gated on `user`. Inline is fine — no new files needed.
- Keep all existing handlers (`startNewCampaign`, `setQuickStartOpen`, `handleHireAgent`, etc.) since the marketing branch still uses them.
- Imports for marketing sections stay (used in the logged-out branch).
