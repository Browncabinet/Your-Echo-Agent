## Overview
Add a clean feature comparison table to `HomePricingSection.tsx` so visitors can quickly see what is included in Starter, Growth, and Power.

## Where
`src/components/HomePricingSection.tsx` — directly below the existing weekly plan cards and above the monthly-equivalent toggle.

## Table content
Derive rows from the existing plan data and a unified feature set:

| Feature | Starter | Growth | Power |
|---|---|---|---|
| Messages / week | 600–700 | 1,800–2,000 | 4,000+ |
| Echo Agents | 1 | 1 | 1 |
| Niche targeting | Check | Check | Check |
| Basic reply handling | Check | Check | Check |
| Smart Reply Handling | — | Check | Check |
| Priority sending queue | — | Check | Check |
| Full A2A API access | — | — | Check |
| Priority hosting | — | — | Check |
| White-label branding | — | — | Check |
| Cancel or pause anytime | Check | Check | Check |

## Implementation
- Use the existing `src/components/ui/table.tsx` shadcn component.
- Keep styling minimal: thin borders, muted text for missing features ("—"), green check icons for included features.
- Add a small heading above the table: "What's included".
- Use subtle Framer Motion fade-in for the table on scroll, consistent with existing micro-interactions.
- No changes to `Pricing.tsx`.

## Not in scope
- No new dependencies.
- No changes to tier prices or plan definitions.
- No backend / data changes.