

# Code Review: Buy Credits Modal Issues

## Issues Found

### 1. CRITICAL — $15 Quick Top-up is deceptive
The "+$15 → +1,000 emails" button maps to `credits_600_onetime` (the $10 pack). The user sees "$15 for 1,000 emails" but would actually be charged $10 and receive 600 credits. This is misleading and could erode trust.

**Fix**: Either remove the $15 button, or create a real $15 Stripe product. The simplest fix is to remove it and keep only the $10 and $25 quick top-ups that map to real products.

### 2. MEDIUM — Custom amount falls back to nearest lower pack
Entering $35 maps to the $25 pack — user pays $25, not $35. The UI shows a disclaimer, but it's still confusing. Without dynamic Stripe price creation, this is a limitation.

**Fix**: Make the custom amount section clearer — show "You'll be charged $25 for 1,800 credits" instead of showing "$35 → ~2,500 emails" and then a small note saying it'll actually use the $25 pack.

### 3. LOW — No back button from checkout
Once Stripe checkout loads, user can only close the modal entirely. A back arrow would be better UX.

## Proposed Changes

### File: `src/components/BuyCreditsModal.tsx`
1. Remove the `QUICK_15` constant and its misleading $15 button
2. Keep only `+$10` and `+$25` quick top-ups (both map to real products)
3. In the custom amount section, when the entered amount doesn't match an exact pack, show the actual pack that will be used more prominently (not as a footnote)
4. Add a "← Back" button in the checkout view so users can return to pack selection

No database or backend changes needed.

