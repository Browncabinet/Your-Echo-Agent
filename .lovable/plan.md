

## Plan: Improve Lead Search Quality with AI-Powered Extraction

### Root Cause
The current approach uses **regex email matching** (`/[\w.+-]+@[\w-]+\.[\w.]+/g`) on search result markdown. This fails because:
- Most business pages obfuscate emails (e.g., "john [at] company [dot] com") or hide them behind contact forms
- Search result snippets rarely contain full emails
- The search queries are too generic ("directory contact list email") and don't target pages with exposed contact data

### Solution
Replace the regex-based extraction with an **AI-powered extraction edge function** that can understand context, infer names/companies from surrounding text, and find emails even when partially obfuscated. Also improve search query variety to target richer data sources.

### Changes

**1. New Edge Function: `supabase/functions/extract-leads/index.ts`**
- Accept `{ results: [{ title, url, markdown, description }], niche, targetAudience, batchSize }`
- Use Lovable AI (gemini-3-flash-preview) to extract structured contacts from the combined search result content
- Prompt instructs AI to find name, company, email, and LinkedIn from the text, including obfuscated emails
- Return `{ leads: [{ name, company, email, linkedin }] }`

**2. Update `src/lib/api/firecrawl.ts`**
- Keep `extractLeadsFromMarkdown` as a fallback
- Add new function `extractLeadsWithAI(results, campaign)` that calls the new edge function
- Falls back to regex extraction if AI extraction fails

**3. Update `src/components/steps/LeadAcquisition.tsx`**
- In `handleAutoSearch`, after collecting search results from all rounds, send the raw results to the AI extraction function instead of using regex
- Add progress message: "AI is analyzing search results for contacts..."
- Increase search rounds from 3 to 5 with more varied queries targeting:
  - Industry directories and association member lists
  - "Contact us" and "Our team" pages
  - LinkedIn-style professional listings
  - Chamber of commerce / BBB listings
  - Industry-specific databases

**4. Update `supabase/functions/firecrawl-search/index.ts`**
- No changes needed - already returns markdown content per result

### Search Query Strategy (improved)
```text
Round 1: [user query] email contact directory [location]
Round 2: [audience] [niche] list members email [location]
Round 3: [niche] association directory [audience] [location]
Round 4: [audience] [niche] "contact us" OR "our team" email [location]
Round 5: [niche] professionals near [location] email linkedin
```

### AI Extraction Prompt (key idea)
```
Extract contacts from these web pages. Look for:
- Full names and company names
- Email addresses (including obfuscated: "at", "[at]", "(at)")
- LinkedIn profile URLs
- Infer company from email domain if not stated
Return only real people with valid emails. Skip generic addresses.
```

### Summary

| File | Change |
|------|--------|
| `supabase/functions/extract-leads/index.ts` | New AI extraction edge function |
| `src/lib/api/firecrawl.ts` | Add `extractLeadsWithAI()` wrapper |
| `src/components/steps/LeadAcquisition.tsx` | Use AI extraction, add more search rounds with better queries |

