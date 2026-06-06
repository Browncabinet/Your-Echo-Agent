## Problem Statement
1. The "What's included" feature-comparison table inside `HomePricingSection` duplicates the detailed pricing page (`/pricing`). It appears on both the public landing page and the signed-in dashboard home.
2. The signed-in dashboard hero (`Index.tsx`) still says **"Humans:"** instead of **"Builders:"** when describing the URL-paste feature, while the public landing page (`Auth.tsx`) was already updated.

## Changes
1. **Remove the "What's included" table block** from `src/components/HomePricingSection.tsx` (lines 168-197). Keep the tier cards, monthly toggle, and bottom note intact.
2. **Update the dashboard home hero** in `src/pages/Index.tsx` line 116: change `<span className="font-semibold text-foreground">Humans:</span>` to `<span className="font-semibold text-foreground">Builders:</span>`.

## Verification
- Build the project and confirm no TypeScript/JSX errors.
- Preview both the public landing page and the signed-in dashboard home to confirm the table is gone and the label reads "Builders:".

## Impact
- Cleaner home-page layout with less duplication.
- Consistent "Builders" branding across public and signed-in experiences.