

# Fix: Make comparison table visible to all visitors

## Problem
The "Built Differently" comparison table (and the entire redesigned homepage — hero, features, recent campaigns) lives inside `Index.tsx`, which is wrapped in a `ProtectedRoute`. Unauthenticated visitors see only the `Auth.tsx` page, which has a basic "Find leads. Send emails." layout with a Google sign-in button.

This means all the homepage work (hero, features, comparison table) is invisible to new visitors who haven't signed in yet.

## Proposed Solution

Move the public-facing marketing content (hero, trust signals, features cards, comparison table) to the **Auth page** so unauthenticated visitors see the full value proposition before signing in.

### Step 1: Extract marketing sections into a shared component
- Create `src/components/MarketingSections.tsx` containing:
  - Hero section (headline, subheadline, trust badges)
  - Features cards (4 benefit cards)
  - "Built Differently" comparison table
- These are currently in Index.tsx lines ~86–270

### Step 2: Update Auth.tsx
- Import and render `MarketingSections` above or around the sign-in card
- Keep the Google sign-in card prominent (perhaps overlaid on or beside the hero)
- The CTA buttons in the hero would point to sign-in rather than "New Campaign"

### Step 3: Update Index.tsx (authenticated view)
- Import the same `MarketingSections` component (or a subset — possibly skip the comparison table for logged-in users since they've already converted)
- Keep the Quick Update bar, Recent Campaigns, and campaign management as the authenticated-only content

### Step 4: Responsive and style consistency
- Ensure the Auth page with marketing sections looks good on mobile
- Keep the "Fast Mode — Paste URL Only" button visible but redirect to sign-in for unauthenticated users

## Technical details
- Files modified: `src/pages/Auth.tsx`, `src/pages/Index.tsx`
- File created: `src/components/MarketingSections.tsx`
- No database or backend changes needed

## Alternative (simpler)
If you'd prefer not to restructure, we can simply **duplicate** the comparison table into `Auth.tsx` directly. This is faster but creates code duplication.

