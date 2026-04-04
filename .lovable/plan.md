

## Plan: Update Pricing Page to Show Emails Instead of Credits

The pricing page currently shows "600 credits", "1,800 credits" etc. Since 1 credit = 1 email, we should show the number of **emails** instead, which is much clearer for users.

### Changes

**File: `src/pages/Pricing.tsx`**

1. Rename `creditPacks` field labels to emphasize emails:
   - Change the big number label from `"credits"` to `"emails"` (line 133)
   - Update descriptions to say "Send up to X emails" or similar

2. Update the "included" list (line 48):
   - Change `"50 free credits on signup"` → `"50 free emails on signup"`

3. Update the hero subtitle (line 109):
   - Change "Buy credits" → "Buy email packs" or similar

4. Update FAQ answers:
   - Change `"Do credits expire?"` → `"Do emails expire?"` and answer accordingly
   - Update other FAQ references from "credits" to "emails"

5. Keep `perEmail` pricing line as-is since it already says "per email"

This is a text-only change in one file -- no logic changes needed. The BuyCreditsModal already says "emails" in most places, so it's consistent.

