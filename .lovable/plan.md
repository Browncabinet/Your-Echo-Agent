

## Plan: Add Contact List Size Selector with Helpful Guidance

There's no way for users to choose how many contacts to search for. Adding tiered blocks keeps costs predictable and guides new users to start small.

### Changes

**`src/components/steps/LeadAcquisition.tsx`**

1. Add a **contact list size selector** above the search input — radio-style cards with tiers:
   - **Starter (0–50)** — "Test your first batch of emails" — Free tier
   - **Small (51–200)** — "Great for testing a campaign" — Free/Starter
   - **Medium (201–500)** — "Solid outreach volume" — Growth tier
   - **Large (501–2,000)** — "Scale your outreach" — Pro tier

2. Add a helpful info banner below the selector:
   > "Start with a small batch to test your emails before scaling up. You can always add more contacts later."

3. Pass the selected limit to the search function — cap results to the chosen tier max (currently Firecrawl returns whatever it finds, so we slice results to the limit)

4. Store selected batch size in campaign state so it persists across steps

**`src/lib/campaign-data.ts`**

- Add `batchSize: number` field to `Campaign` type (default: `50`)
- Update `createEmptyCampaign()` to include `batchSize: 50`

### Technical notes
- The Firecrawl search already returns a limited set of results; the batch size acts as a client-side cap on how many leads get stored
- No database migration needed — `batchSize` is only used in the wizard flow and doesn't need persistence (campaigns already store leads directly)
- Tier labels align with existing pricing tiers on the Pricing page

