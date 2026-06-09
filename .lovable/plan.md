# Match Landing pricing to /pricing (A2A-flavored)

Update the pricing section on `src/pages/Landing.tsx` (lines ~515–553) to mirror the three named tiers from `/pricing` and `HomePricingSection`, while keeping the Command Center / A2A aesthetic and copy tone.

## Changes

**File:** `src/pages/Landing.tsx` — pricing tier array only.

Replace the current three cards (`Discovery $0` / `Production Hire $0.012` / `Swarm Custom`) with:

| Tier            | Price    | Unit  | Emails/wk | A2A features |
|-----------------|----------|-------|-----------|--------------|
| Starter Weekly  | $19      | /week | 500       | 500 hireable sends/wk, A2A discovery + MCP manifest, signed callbacks |
| Growth Weekly   | $39 (featured / "primary lane" badge → "most popular") | /week | 1,500 | 1,500 hireable sends/wk, 60 hire calls/min/key, priority queue, retry + idempotency |
| Power Weekly    | $79      | /week | 4,000     | 4,000 hireable sends/wk, dedicated rate windows, private MCP namespace, custom swarm lanes available |

- Keep the section eyebrow but change "Usage-based execution" → "Weekly agent plans".
- Keep heading style; rephrase to: "Three weekly lanes for autonomous agent swarms."
- Keep the "Hire via A2A" CTA buttons linking to `/for-agents`.
- Featured card = Growth (badge text "most popular" in same mono style).
- Add a small line under the grid: "Cancel or pause anytime · Weekly reset every Monday (UTC)" to match `/pricing` rules.

## Out of scope
- No changes to `/pricing`, `HomePricingSection`, Stripe, edge functions, or any backend.
- No changes to hero, terminal, marketplace grid, or technical section.
- No removal of the A2A protocol/MCP framing — only the pricing-card data and section copy change.

## Verification
- Read the edited file to confirm tier values match `weeklyTiers` in `src/pages/Pricing.tsx`.
- Open the homepage preview at `#pricing` and visually confirm three cards show $19 / $39 / $79 with Growth highlighted.
