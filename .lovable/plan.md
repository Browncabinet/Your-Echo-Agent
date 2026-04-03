

## Plan: Fix Lead Search Results Parsing Bug

### Problem
The Firecrawl search edge function works correctly and returns real estate agent data (confirmed: 85KB response with actual results). But the client-side parsing in `handleAutoSearch` fails to extract the results array.

The response shape is `{ success: true, data: [...] }`. The parsing logic does:
```
searchData = result.data    // this IS the array
results = searchData.data || searchData.results || []  // arrays don't have .data/.results → falls to []
```

### Fix

**`src/components/steps/LeadAcquisition.tsx`** — line ~112, change the results extraction to handle the case where `searchData` is already the array:

```typescript
const searchData = result.data || result;
const results = Array.isArray(searchData) ? searchData : (searchData.data || searchData.results || []);
```

One line change. No other files affected.

