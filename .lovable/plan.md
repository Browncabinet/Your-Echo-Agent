## Plan

1. **Fix the signed-in app layout**
   - Update the main dashboard/campaign/replies/social/results wrapper in `src/pages/Index.tsx` from plain `min-h-screen` to a vertical flex layout.
   - Give each `<main>` area `flex-1` so the shared footer sits at the bottom of the viewport on short pages and below content on long pages.

2. **Fix partner protected layouts with the same issue**
   - Update `PartnerDashboard.tsx` and `PartnerBilling.tsx` to use `min-h-screen flex flex-col` plus `flex-1` on their main content.
   - Add the footer to their loading states where currently a full-screen spinner returns before the footer can render.

3. **Verify public and signed-in pages**
   - Re-check `/`, `/for-agents`, campaign flow, results/dashboard, replies, social, billing, docs, pricing, legal, and 404 routes.
   - Confirm the footer text `Docs Status Twitter Support Privacy © 2026 Echo Agent` is visible after scrolling and no longer feels “missing” on short screens.

## Technical notes

- The footer component already exists and is imported in the relevant files.
- The likely issue is layout visibility: several pages render the footer after content, but without `flex flex-col` / `flex-1`, it can appear far below the current viewport or be skipped in loading returns.