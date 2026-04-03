

## Plan: Add About Page

Create a simple About page that tells your story — why you built Your Echo Agent.

### New File

**`src/pages/About.tsx`** — Clean, minimal page with:
- Your story: 8 projects, 5 needing cold email outreach, tools costing $50/mo each adding up fast, couldn't find an affordable AI agent for cold emails, so you built one that echoes your voice and style
- Contact: link to [@ladysoleil33 on X](https://x.com/ladysoleil33)
- Glass card styling consistent with auth/pricing pages
- Nav bar with logo + links to Pricing and back to home

### Edits

1. **`src/App.tsx`** — Add `/about` route (public)
2. **`src/pages/Auth.tsx`** — Add "About" link in nav bar next to Pricing
3. **`src/pages/Pricing.tsx`** — Add "About" link in nav if not already there

