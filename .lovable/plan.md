

## Plan: Wire Up Real Lead Scraping with Firecrawl

Right now the "Scrape" button generates fake/mock leads. This plan connects it to Firecrawl so pasting a URL actually scrapes real contact data from the page.

You already have a Firecrawl connection in your workspace — it just needs to be linked to this project.

### What will change

1. **Link the Firecrawl connector** to this project (you'll be prompted to confirm)

2. **Enable Lovable Cloud** (needed for edge functions that call Firecrawl securely)

3. **Create a Supabase Edge Function** (`supabase/functions/firecrawl-scrape/index.ts`)
   - Receives a URL from the frontend
   - Calls Firecrawl's scrape API to extract page content as markdown
   - Returns the scraped content to the frontend

4. **Create a lead extraction API helper** (`src/lib/api/firecrawl.ts`)
   - Thin wrapper that calls the edge function from the frontend

5. **Update `LeadAcquisition.tsx`** to use real scraping
   - Replace the fake `setTimeout` logic with a call to the Firecrawl edge function
   - Parse the scraped markdown/HTML to extract names, emails, companies, and LinkedIn URLs
   - Show real progress steps: Scraping page → Extracting contacts → Done
   - Populate the leads list with actual extracted data
   - Fall back to showing the raw scraped content if no structured contacts are found, so users can still see what was pulled

6. **Add an "Auto Search" option** alongside paste-a-URL
   - A second input mode: type a search query (e.g. "real estate agents in Miami") and the agent uses Firecrawl's `/search` endpoint to find and scrape results automatically
   - Create a `firecrawl-search` edge function for this
   - Toggle between "Paste URL" and "Auto Search" modes in the UI

### Technical details

- Firecrawl does **not** use the connector gateway (marked `uses connector gateway: false`), so the edge function calls `https://api.firecrawl.dev/v1/scrape` directly with the `FIRECRAWL_API_KEY` env var
- Contact extraction will use regex patterns on the scraped markdown to find emails, names, and company info
- The search mode will use Firecrawl's `/v1/search` endpoint with `scrapeOptions` to get content from results

