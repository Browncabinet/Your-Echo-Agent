

## Plan: Improve Lead Search to Actually Find Contacts

The Firecrawl connection is working fine (confirmed by network logs). The real problem is:

1. **Generic queries don't return pages with emails** — searching "agents and brokers in real estate" returns informational articles (like Investopedia) that don't contain contact emails
2. **The search query needs to be smarter** — it should append "email contact directory" to increase the chance of finding pages with actual email addresses
3. **No feedback when search succeeds but finds 0 emails** — the user sees "No contacts found" with no explanation of why

### Changes

1. **`src/components/steps/LeadAcquisition.tsx`** — Improve the search flow:
   - Auto-append "email contact" to the user's query so Firecrawl targets directory/contact pages
   - Add console.log of the raw search results so we can debug what's coming back
   - Show the user how many pages were searched (e.g. "Searched 10 pages, found 0 emails — try a more specific query like 'real estate agents Miami directory email'")
   - Add example placeholder queries that are more likely to yield results (e.g. "real estate agents Miami contact email directory")

2. **`src/lib/api/firecrawl.ts`** — Improve email extraction:
   - Relax the generic email filter slightly (keep noreply/support filters but allow info@ since some businesses use it as their contact)
   - Add logging to show how many results were processed and what markdown length was received
   - Also try to extract emails from `result.title` and `result.url` fields, not just markdown

3. **`src/components/steps/LeadAcquisition.tsx`** — Better suggested queries:
   - Change the suggested query format from `"{audience} {niche} email contact"` to `"{audience} {niche} directory contact list email"` for better targeting

### Technical notes
- The Firecrawl API key is valid and returning `success: true` with data
- The issue is purely that informational pages (Investopedia, Wikipedia, etc.) don't contain personal email addresses
- Appending "directory" or "contact list" to queries dramatically improves the chances of finding pages with actual emails
- No edge function changes needed — the backend is working correctly

