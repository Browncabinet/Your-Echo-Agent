

## Plan: Simplify Lead Search UI — Remove Confusing Mode Toggle

### Problem
The "Smart Search" toggle button and the "Search" action button look like two separate features doing the same thing. "Smart Search" just shows/hides the search input — it doesn't actually search. Users click it expecting results.

### Solution
Remove the mode toggle buttons entirely. Show both options inline — the search input is always visible (it's the primary flow), and "Scrape a Page" becomes a collapsible secondary option below.

### Changes

**File: `src/components/steps/LeadAcquisition.tsx`**

1. Remove the `mode` state and the two toggle buttons ("Smart Search" / "Scrape a Page")
2. Always show the search input + "Find Leads" button (rename from "Search" to be clearer)
3. Add a small collapsible "Or paste a URL" section below for the scrape option
4. Rename the action button from "Search" → "Find Leads" so it's clearly the action

**Resulting layout:**
```text
Target Location: [Miami, FL_____________]

Search for leads:
[real estate agents email directory____] [Find Leads]
Suggested: real estate agents...

── Or paste a URL to scrape ──  (expandable)
[https://example.com/directory_________] [Scrape]

✓ 30 leads found and ready!
[Build Email Campaign →]
```

This is a UI-only change in one file — no logic changes needed.

