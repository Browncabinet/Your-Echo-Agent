

## Plan: Improve Lead Search — More Results, Location Filter, Cleaner UX

### Problems Identified

1. **Too few leads**: Firecrawl search is limited to 10 results, and email extraction from generic web pages yields very few contacts. To find 50-200 leads, we need multiple search passes with varied queries and a higher per-search limit.

2. **No location filter**: The search query has no geographic targeting. Users need to specify a city/state/country to find local leads.

3. **Redundant UI**: "Auto Search" and "Paste URL" serve different purposes but the naming is confusing. Simplify labels and make the flow clearer.

### Changes

**File 1: `src/components/steps/LeadAcquisition.tsx`**

- Add a **Location** input field (e.g. "Miami, FL" or "California") above the search query
- Rename mode buttons: "Auto Search" → "Smart Search", "Paste URL" → "Scrape a Page"
- Inject location into the search query automatically (e.g. `"real estate agents Miami FL email contact directory"`)
- Run **multiple search passes** (up to 3 rounds with varied queries) when the user wants 51+ contacts, accumulating unique leads until the batch target is reached or searches are exhausted
- Show progress like "Round 1: found 12 leads… Round 2: found 28 leads…"
- Pre-fill location from campaign data if available

**File 2: `src/lib/api/firecrawl.ts`**

- Update `search()` to accept `location` and `limit` parameters and pass them through
- Increase default search limit from 10 to 20

**File 3: `supabase/functions/firecrawl-search/index.ts`**

- Pass `location` / `country` options through to Firecrawl API (already partially supported via `country` param)

**File 4: `src/lib/campaign-data.ts`**

- Add `location: string` field to `Campaign` type so it persists across steps

**File 5: `src/components/steps/CampaignSetup.tsx`**

- Add a "Target Location" input field to Campaign Setup so users can set it early

### Multi-round search logic (in LeadAcquisition)

```text
Round 1: "{audience} {niche} {location} email contact directory"
Round 2: "{audience} {niche} {location} list members"  
Round 3: "{niche} {location} association directory emails"

Each round: limit=20, accumulate unique emails
Stop early if target batch size reached
```

### Summary

| File | Change |
|------|--------|
| `src/lib/campaign-data.ts` | Add `location` field |
| `src/components/steps/CampaignSetup.tsx` | Add location input |
| `src/components/steps/LeadAcquisition.tsx` | Location filter, multi-round search, rename buttons |
| `src/lib/api/firecrawl.ts` | Pass location/limit params |
| `supabase/functions/firecrawl-search/index.ts` | Forward location to Firecrawl |

