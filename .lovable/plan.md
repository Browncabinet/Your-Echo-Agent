

## Plan: Fix Campaign Save + Improve Lead Extraction

### Issue 1: Campaign save fails — invalid UUID

The error `invalid input syntax for type uuid: "9gsxk9dwj8"` occurs because `generateId()` uses `Math.random().toString(36).substring(2, 15)` which produces short alphanumeric strings, not valid UUIDs. The `campaigns` table has `id uuid` column type.

**Fix in `src/lib/campaign-data.ts`:**
- Replace `generateId()` with `crypto.randomUUID()` which produces proper UUIDs
- This fixes campaign saves, lead IDs, and email IDs

### Issue 2: AI only extracts 1 lead from 91 results

Root causes:
- **Input truncation**: 91 results get combined then truncated to 30k chars. Most content is wasted — search result markdown contains navigation, ads, and irrelevant page chrome
- **Single AI call**: One call with a massive prompt produces poor results. The AI gets overwhelmed by noise
- **No `max_tokens` set**: The response may be truncated silently

**Fix in `supabase/functions/extract-leads/index.ts`:**
1. **Process in batches**: Split results into chunks of ~15 results each, make parallel AI calls, then merge
2. **Smarter content trimming**: For each result, only send the first 1500 chars of markdown (where contact info usually lives), plus title/URL/description
3. **Add `max_tokens: 4096`** to the AI request to prevent output truncation
4. **Log `finish_reason`** to detect if truncation is still happening
5. **Use `gemini-2.5-flash`** (already set — good for speed on multiple calls)

**Fix in `src/components/steps/LeadAcquisition.tsx`:**
- Remove the `allSearchResults.length >= 80` early-stop cap so all 5 rounds always run
- Increase per-round limit from 20 to 30

### Technical Details

**generateId replacement:**
```typescript
export function generateId(): string {
  return crypto.randomUUID();
}
```

**Batch processing in extract-leads:**
```text
91 results → split into chunks of 15
→ 6-7 parallel AI calls, each analyzing ~15 results
→ merge all extracted leads, deduplicate by email
→ return combined list
```

Each chunk gets ~1500 chars per result = ~22k chars per batch (well within limits).

### Summary

| File | Change |
|------|--------|
| `src/lib/campaign-data.ts` | `generateId()` → `crypto.randomUUID()` |
| `supabase/functions/extract-leads/index.ts` | Batch processing, smarter truncation, add max_tokens |
| `src/components/steps/LeadAcquisition.tsx` | Remove 80-result cap, increase per-round limit to 30 |

