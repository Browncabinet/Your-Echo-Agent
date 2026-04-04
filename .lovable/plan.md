

## Two Issues to Fix

### Issue 1: Campaign Goal field needs "Key Selling Points" input

The campaign goal currently is just a single text field. The user wants to provide bullet points / details about their product that the AI should include in the email (e.g., features, benefits). The goal alone doesn't give the AI enough context about *what* to pitch.

**Changes to `src/lib/campaign-data.ts`:**
- Add a `sellingPoints: string[]` field to the `Campaign` type
- Update `createEmptyCampaign()` to include `sellingPoints: []`

**Changes to `src/components/steps/CampaignSetup.tsx`:**
- Add a new "Key Selling Points" section below Campaign Goal with helper text: *"Add details you want included in your emails (e.g. features, benefits, offers)"*
- Allow 3-5 bullet point inputs -- user types a point and presses Enter to add it (similar to the target audience chips)
- Show added points as removable badges/chips

**Changes to `src/components/steps/EmailBuilder.tsx`:**
- Pass `sellingPoints` to the `generate-emails` edge function call

**Changes to `supabase/functions/generate-emails/index.ts`:**
- Accept `sellingPoints` from request body
- Include them in the AI prompt: *"KEY SELLING POINTS TO INCLUDE: [bullet list]"*
- Update email rules to say: "Include 2-3 of the sender's key selling points as brief bullet points or a short value proposition"

### Issue 2: App redirects to index after ~1-2 minutes (timeout)

The redirect to the index page happens because the Supabase auth session token expires or the edge function call times out. When `supabase.functions.invoke()` takes too long (edge function timeout ~150s), the request fails. The error handler in `EmailBuilder.generateWithAI` catches it, but the auth state listener may also fire during long waits, or the component may unmount.

**Root cause**: The `generate-emails` function does two network calls sequentially (Firecrawl scrape + AI generation), which can exceed the edge function timeout.

**Fix in `src/components/steps/EmailBuilder.tsx`:**
- Add an `AbortController` with a generous client-side timeout (120s)
- On timeout, show a user-friendly toast ("Email generation is taking longer than expected. Please try again.") instead of silently failing
- Prevent any navigation/redirect on error -- keep the user on the current step

**Fix in `supabase/functions/generate-emails/index.ts`:**
- Add a timeout on the Firecrawl scrape call (10 seconds max) so the function doesn't spend too long on the website fetch
- This leaves more time budget for the AI generation call

---

### Summary of files changed

| File | What changes |
|------|-------------|
| `src/lib/campaign-data.ts` | Add `sellingPoints` field to Campaign type |
| `src/components/steps/CampaignSetup.tsx` | Add "Key Selling Points" input section with chips |
| `src/components/steps/EmailBuilder.tsx` | Pass `sellingPoints` to edge function; add timeout handling |
| `supabase/functions/generate-emails/index.ts` | Accept `sellingPoints` in prompt; add Firecrawl timeout |

