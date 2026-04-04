

## Plan: Editable Selling Points + Fix Timeout Redirect

### Problem 1: Selling points not visible/editable enough
The selling points section on the Lead Acquisition page only appears **after** auto-extraction (hidden when `sellingPoints.length === 0`). Users need to see it always, with a prominent "+" button to add points manually even before/without extraction.

### Problem 2: Selling points not visible on Email Builder
When moving to the email step, users lose sight of selling points. They should be visible (and editable) there too.

### Problem 3: Timeout redirects to index page
From the session replay, after clicking "Build Email Campaign" the user saw templates load, then got redirected back to the index. The likely cause: the `supabase.functions.invoke` call in `generateWithAI` can throw in a way that isn't caught properly (e.g., network-level failures), or the Supabase client itself throws, which may propagate up and trigger a React error boundary or state reset. Additionally, the `useEffect` that auto-generates template stubs runs on mount but the AI generation has no guard against concurrent calls.

### Changes

**File: `src/components/steps/LeadAcquisition.tsx`**
- Always show the selling points section (remove the `sellingPoints.length > 0` condition on line 316)
- When empty, show a message like "No selling points yet" with a prominent "+ Add" button
- Keep the auto-extraction flow but make the section always visible

**File: `src/components/steps/EmailBuilder.tsx`**
- Add a read/edit selling points section at the top (below the edit banner)
- Show existing points as Badge chips with remove buttons, plus an "Add" input
- Import `X`, `Badge` (already has Badge), and wire up add/remove to `onUpdate`
- Wrap `generateWithAI` in additional safety: catch **all** errors including network failures, and ensure no unhandled promise rejection can escape
- Add a `try/catch` around the `useEffect` template generation as well
- Add `generating` state guard to prevent double-invocations

**File: `supabase/functions/generate-emails/index.ts`**
- Add an AbortController with 25s timeout on the AI API call (edge functions have ~60s limit but the AI call itself can hang)
- This prevents the edge function from timing out silently

### Summary

| File | Change |
|------|--------|
| `src/components/steps/LeadAcquisition.tsx` | Always show selling points section with visible "+" |
| `src/components/steps/EmailBuilder.tsx` | Add editable selling points display; harden error handling |
| `supabase/functions/generate-emails/index.ts` | Add timeout on AI API call |

