

## Analysis: Gmail + Multi-Campaign Support

### Current State

**Gmail:** Works with both personal Gmail AND Google Workspace accounts — App Passwords are supported on both. No Workspace requirement. The current flow (enter Gmail + App Password in the Review step) is universal.

**Multiple campaigns:** Already supported. Users can create unlimited campaigns from the home page via "New Campaign," and each is saved independently to the database. However, there's **no "website URL" field** in the campaign setup — the user's own website is never captured, which means the AI can't personalize emails based on the sender's business.

### What Needs to Change

**1. Add a "Your Website URL" field to Campaign Setup**
- Add an optional `websiteUrl` field to the `Campaign` type in `src/lib/campaign-data.ts`
- Add a URL input in `src/components/steps/CampaignSetup.tsx` — "Your website (so the AI knows what you offer)"
- This URL gets used later for AI personalization and auto-detecting what the user sells
- Add `website_url` column to the `campaigns` database table

**2. Support multiple website URLs per campaign (multi-product outreach)**
- Instead of a single URL, allow a list of URLs (e.g., user has 5 apps and wants to run outreach for each)
- Each URL maps to one campaign — the "New Campaign" button already handles this
- Add a visual indicator on the home page showing which URL each campaign targets

**3. Clarify Gmail works for everyone (no Workspace needed)**
- Update the GmailConnect component copy: "Works with any Gmail or Google Workspace account"
- Keep App Password approach — it's the simplest path that works universally

### Changes

1. **`src/lib/campaign-data.ts`** — Add `websiteUrl: string` to the `Campaign` type and `createEmptyCampaign()`

2. **`src/components/steps/CampaignSetup.tsx`** — Add a "Your Website URL" input field below Campaign Goal, with helper text explaining it helps the AI personalize emails to match your business

3. **`src/hooks/use-campaigns.ts`** — Map `websiteUrl` to/from the database `website_url` column

4. **Database migration** — Add `website_url text default ''` column to `campaigns` table

5. **`src/components/GmailConnect.tsx`** — Update copy to clarify: "Works with personal Gmail or Google Workspace"

6. **`src/pages/Index.tsx`** — Show the website URL under each campaign card (e.g., "yourechoagent.com · Real Estate · 12 leads")

