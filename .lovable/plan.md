

## Plan: Auto-Extract Selling Points from Website URL

### Problem
The "Key Selling Points" field on Campaign Setup requires manual typing. Users expect the app to automatically extract selling points from their website URL — and it should happen as part of the lead acquisition flow, not as a manual step.

### Solution
1. Remove the manual "Key Selling Points" input from Campaign Setup
2. When the user enters their website URL on Campaign Setup, auto-scrape it during the Lead Acquisition step
3. Before finding leads, scrape the website with Firecrawl using a JSON extraction prompt to pull out 3-5 key selling points automatically
4. Show the extracted selling points as editable chips so users can tweak/remove/add

### Changes

**File: `src/components/steps/CampaignSetup.tsx`**
- Remove the entire "Key Selling Points" section (lines 65-108) — the manual input, badges, and counter
- Remove `sellingPointInput` state and `addSellingPoint`/`removeSellingPoint` helpers
- Remove the `Plus` and `X` icon imports if no longer needed

**File: `src/components/steps/LeadAcquisition.tsx`**
- Add an auto-scrape step that runs when the user clicks "Find Leads" (before the search rounds)
- If `campaign.websiteUrl` exists and `campaign.sellingPoints` is empty, scrape the website using the existing `firecrawl-scrape` edge function with `formats: ["summary"]`
- Send the summary to a new edge function (or reuse generate-emails logic) to extract 3-5 bullet points
- Show extracted selling points as editable Badge chips between the search input and the results
- Allow users to add/remove points manually as a secondary action
- Add progress message: "Analyzing your website..." before "Starting smart search..."

**File: `supabase/functions/firecrawl-scrape/index.ts`**
- No changes needed — already supports `summary` format

**New Edge Function: `supabase/functions/extract-selling-points/index.ts`**
- Accept `{ websiteUrl, summary, niche, goal }` 
- Use Lovable AI to extract 3-5 concise selling points from the website summary
- Return `{ sellingPoints: ["point1", "point2", ...] }`

**File: `src/lib/campaign-data.ts`**
- No changes needed — `sellingPoints` field already exists on Campaign type

### User Flow (after changes)

```text
Campaign Setup:
  Campaign Name: [_______________]
  Campaign Goal: [_______________]
  Website URL:   [https://myapp.com]
  Location:      [Miami, FL________]
  Niche:         [Software/SaaS ▼__]
  Target Audience: [Founders] [CTOs]
  [Continue →]

Lead Acquisition:
  [Find Leads] clicked →
    1. "Analyzing your website..."        ← auto-scrape
    2. Shows extracted selling points:
       [AI-powered lead scoring] [x]  [Saves 5hrs/week] [x]  [+ Add]
    3. "Round 1: Searching..."            ← normal search
    4. Results...
```

### Summary

| File | Change |
|------|--------|
| `src/components/steps/CampaignSetup.tsx` | Remove manual selling points input |
| `src/components/steps/LeadAcquisition.tsx` | Auto-extract selling points from website before search; show editable chips |
| `supabase/functions/extract-selling-points/index.ts` | New edge function to extract selling points via AI |

