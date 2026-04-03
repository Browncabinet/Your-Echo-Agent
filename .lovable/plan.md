

## Plan: Multi-Select Target Audience

Change `targetAudience` from a single string to an array of strings, allowing users to select multiple audiences.

### Changes

1. **`src/lib/campaign-data.ts`**
   - Change `targetAudience: string` → `targetAudience: string[]` in the `Campaign` type
   - Update `createEmptyCampaign` to initialize with `[]`

2. **`src/components/steps/CampaignSetup.tsx`**
   - Toggle badges on/off (add/remove from array) instead of replacing
   - Custom input adds to the array instead of replacing
   - Show all selected audiences as highlighted badges
   - Add ability to remove selected audiences (click to deselect)
   - Validation checks `campaign.targetAudience.length > 0`

3. **`src/components/steps/SocialMediaContent.tsx`**
   - Display `campaign.targetAudience.join(", ")` where the audience is referenced

4. **`src/pages/Index.tsx`**
   - Update any validation referencing `targetAudience` to check array length

