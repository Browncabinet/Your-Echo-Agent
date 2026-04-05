

## Plan: Improve Lead Search Precision and Volume

### Current System
The app uses **Firecrawl Search API** to find web pages, then sends the results to an **AI Edge Function** (`extract-leads`) that uses Gemini 2.5 Flash to parse contacts from the page content. It runs 5 search rounds with 30 results each (max 150 raw results), then the AI extracts emails from the markdown.

### Why Results Are Low
1. **Search queries are too generic** — queries like "agents brokers real estate list members email Miami, FL" return informational pages, not directories with actual contact data
2. **Firecrawl search returns truncated content** — search result snippets often don't include the actual email addresses buried deeper in the page
3. **No targeted data sources** — not searching LinkedIn, Yelp, Yellow Pages, industry-specific directories where contact data actually lives
4. **Fixed 5 rounds regardless of batch size** — selecting "51-200" contacts should trigger more search rounds than "0-50"

### Solution

**1. Scale search rounds to match batch size**
- 0-50 contacts: 5 rounds
- 51-200: 8 rounds
- 201-500: 12 rounds
- 501-2000: 15 rounds

**2. Better query templates targeting data-rich sources**
```text
Round 1: [query] email directory [location]
Round 2: site:yelp.com [audience] [niche] [location]
Round 3: site:linkedin.com/in [audience] [niche] [location]
Round 4: [niche] [audience] email list [location]
Round 5: [audience] [niche] "contact" OR "@" [location]
Round 6: yellowpages [audience] [niche] [location]
Round 7: [niche] association members directory [location]
Round 8: [audience] [niche] "our team" OR "staff" email [location]
Round 9+: Additional variations with BBB, chamber of commerce, etc.
```

**3. Increase per-round search limit from 30 to 50** for larger batch sizes

**4. Add a second pass: scrape top URLs** — After the initial search, identify the most promising URLs (directories, team pages) and do a full Firecrawl scrape on them to get complete page content instead of relying on truncated search snippets

**5. Show progress with expected vs actual count** — Display "Found 23 of 100 requested contacts" so users know the status

### Files Changed

| File | Change |
|------|--------|
| `src/components/steps/LeadAcquisition.tsx` | Scale rounds by batch size, better queries, add deep-scrape pass, show count vs target |
| `supabase/functions/extract-leads/index.ts` | Increase batch timeout to 40s for larger payloads |

### Technical Details

The deep-scrape pass works like this:
1. After all search rounds complete, filter results for URLs that look like directories (contain "directory", "team", "staff", "members", "contact" in URL/title)
2. Scrape the top 10 most promising URLs via Firecrawl scrape (full markdown, not just search snippet)
3. Send those full-page results through the AI extraction as an additional batch
4. Merge and deduplicate with previously found leads

