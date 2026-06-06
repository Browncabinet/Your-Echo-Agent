## Issue
In the `BuiltForTrustSection` component (`src/components/MarketplaceSections.tsx`), the "Enterprise-Grade Security" trust card uses a solid `bg-accent` background while the icon uses `text-accent`. This makes the icon invisible (same color as its background). The other three cards correctly use translucent backgrounds (`bg-primary/10`, `bg-success/10`, `bg-warning/10`).

## Fix
Change the `bg` property for the Enterprise-Grade Security item from `"bg-accent"` to `"bg-accent/10"` to restore icon visibility and maintain visual consistency with the other trust cards.

## Verification
- Preview the "Built for Trust" section and confirm the shield icon is visible on the Enterprise-Grade Security card.
- Check that all four cards have matching translucent icon backgrounds.