

## Plan: Rename "Subcategory" to "Target Audience"

A straightforward rename across the codebase — replacing all references to "subcategory" with "target audience" in labels, types, and data.

### Files to change

1. **`src/lib/campaign-data.ts`**
   - Rename `SUBCATEGORIES` constant to `TARGET_AUDIENCES`
   - Rename `subcategory` field in `Campaign` type to `targetAudience`
   - Update `createEmptyCampaign` accordingly

2. **`src/components/steps/CampaignSetup.tsx`**
   - Update all references from `campaign.subcategory` to `campaign.targetAudience`
   - Change label from "Subcategory" to "Target Audience"
   - Update search placeholder to "Search or type your target audience..."
   - Update the "Selected" confirmation text

3. **`src/pages/Index.tsx`** (if it references `subcategory` in validation or state)
   - Update any references to the renamed field

