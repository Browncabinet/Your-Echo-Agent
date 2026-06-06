## Goal

Fix the mismatch between marketing copy and the actual product. Make every tier truly volume-only (per `mem://features/pricing`) and remove misleading "LinkedIn messages" claims and feature-gated rows from the home pricing section.

## What's wrong today

`src/components/HomePricingSection.tsx` advertises:
- Starter: "600–700 LinkedIn messages"
- Growth: "1,800–2,000 messages per week"
- Power: "4,000+ messages per week"

But the backend (`current_week_caps`, `send-campaign-emails`, `linkedin-assist`) actually enforces:
- Starter: 500 emails + 50 LinkedIn Assist drafts
- Growth: 1,500 emails + 150 drafts
- Power: 4,000 emails + 400 drafts

The comparison table also gates Smart Reply Handling, Priority queue, A2A API, white-label, and priority hosting by tier — which contradicts the "volume-only differentiation" rule.

`src/pages/Pricing.tsx` is already correct. Only the home section is wrong.

## Changes (frontend only, no backend / no Stripe changes)

### 1. `src/components/HomePricingSection.tsx`

Rewrite the `weeklyTiers` array so each tier's `messages` and `features` match `/pricing` and the memory:

| Tier    | Headline                                  | Features                                                                                                  |
|---------|-------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| Starter | "500 emails + 50 LinkedIn Assist actions" | 500 emails / week · 50 LinkedIn Assist drafts / week · Full Echo Agent + Reply Handler · Niche targeting · Cancel anytime |
| Growth  | "1,500 emails + 150 LinkedIn Assist"      | 1,500 emails / week · 150 LinkedIn Assist drafts / week · Full Echo Agent + Reply Handler · Priority sending queue · Cancel anytime |
| Power   | "4,000 emails + 400 LinkedIn Assist"      | 4,000 emails / week · 400 LinkedIn Assist drafts / week · Full Echo Agent + Reply Handler · Priority sending queue · Cancel anytime |

Replace the `comparisonRows` array so it reflects volume-only differentiation:

```text
Feature                         Starter   Growth    Power
Emails / week                   500       1,500     4,000
LinkedIn Assist drafts / week   50        150       400
Echo Agent + Reply Handler      ✓         ✓         ✓
Niche-first targeting           ✓         ✓         ✓
Smart Reply Handling            ✓         ✓         ✓
Priority sending queue          ✓         ✓         ✓
Analytics + tracking            ✓         ✓         ✓
Cancel or pause anytime         ✓         ✓         ✓
```

Update the monthly-equivalent badges to match (~4.33 weeks/mo):
- Starter ≈ $82/mo
- Growth ≈ $169/mo
- Power ≈ $342/mo

Update the bottom "Most users start with..." copy to keep the same message — no number changes needed there.

### 2. Add a small disclaimer line above the LinkedIn Assist count

One short line near each LinkedIn number (or once in the section subhead): *"LinkedIn Assist = AI-drafted comments and DMs you post manually. We never log into LinkedIn for you."* This avoids re-creating the same "users expected automated LinkedIn messages" confusion.

## Out of scope

- No Stripe / backend / DB changes
- No tier rebalancing, no monthly option, no free tier surfacing, no overage pricing (parked for a separate decision)
- `src/pages/Pricing.tsx` already matches — not touched

## Files to edit

- `src/components/HomePricingSection.tsx` (only)
