

## Phase 1: QuickUpdateBar + CampaignQuickSummary

### 1. Edge Function: `supabase/functions/campaign-summary/index.ts`

Non-streaming edge function that accepts campaign stats and returns a 3-sentence AI summary via Lovable AI (Gemini Flash).

- Accepts: `{ campaign: { name, niche, goal, leadCount, emailCount, stats: {sent, opened, clicked, replied} } }`
- Returns: `{ summary: "..." }`
- Uses `LOVABLE_API_KEY` (already available)
- System prompt instructs friendly, encouraging, actionable tone
- Handles 429/402 errors with clear messages
- Standard CORS headers pattern (matches existing edge functions)

### 2. `src/components/dashboard/QuickUpdateBar.tsx`

A search/select input placed between the "New Campaign" button and campaigns list.

- Props: `campaigns: Campaign[]`
- Renders a search `Input` with a `Search` icon and a filtered dropdown of campaign names
- Accepts typed name or "Project #1" (maps to campaign index)
- On selection, calls `campaign-summary` edge function via `supabase.functions.invoke()`
- Displays result in a subtle dismissible `Card` below the input
- Shows `Loader2` spinner while fetching, `X` button to dismiss
- If no campaigns exist, input is disabled with placeholder "No campaigns yet"

### 3. `src/components/dashboard/CampaignQuickSummary.tsx`

An expandable inline summary inside each campaign card.

- Props: `campaign: Campaign`
- Renders a small "Get Update" button (with `Sparkles` icon)
- On click, expands a section below showing:
  - 3 horizontal `Progress` bars (Opened %, Clicked %, Replied %) with percentage labels
  - 1-2 sentence AI summary from the same edge function
- Collapsible via toggle. Shows loading state while fetching.

### 4. Changes to `src/pages/Index.tsx` (append-only)

**New imports** (top of file):
```typescript
import { QuickUpdateBar } from "@/components/dashboard/QuickUpdateBar";
import { CampaignQuickSummary } from "@/components/dashboard/CampaignQuickSummary";
```

**Insert QuickUpdateBar** between line 92 (end of "New Campaign" button div) and line 94 (campaignsLoading check):
```tsx
<QuickUpdateBar campaigns={campaigns} />
```

**Insert CampaignQuickSummary** inside each campaign Card, after the existing buttons div (after line 156), before the closing `</Card>`:
- Restructure the Card slightly to allow the summary to appear below the existing flex row
- Wrap existing content in a div, append `<CampaignQuickSummary campaign={c} />` below

**Nothing removed or rearranged** — all existing elements (header, buttons, card layout) stay exactly as they are.

### Files Created/Modified

| File | Action |
|---|---|
| `supabase/functions/campaign-summary/index.ts` | Create |
| `src/components/dashboard/QuickUpdateBar.tsx` | Create |
| `src/components/dashboard/CampaignQuickSummary.tsx` | Create |
| `src/pages/Index.tsx` | Edit (append imports + insert 2 components) |

### What stays untouched
- `MetricsOverview.tsx`, `ResultsDashboard.tsx` — zero changes
- All existing campaign card buttons (Results, Replies, Social)
- Campaign wizard flow, sending pipeline, RepliesInbox
- Header, navigation, auth flow

