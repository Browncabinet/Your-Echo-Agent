## Plan: Update Hero Section Copy

### Scope
Update hero headlines and subheadlines on the two entry-point pages to match the new LinkedIn-first, niche-focused messaging.

### Changes

**1. `src/pages/Auth.tsx` (unauthenticated landing page)**
- **Headline**: Change to  
  `Your Echo Agent — Niche Outreach That Actually Gets Responses`
- **Subheadline**: Change to  
  `Paste your URL to create an agent that sounds exactly like you. Target associations, conferences, and industry organizations on LinkedIn and email. Agents can discover and hire Echo Agents via A2A.`

**2. `src/pages/Index.tsx` (authenticated home page)**
- **Headline**: Change to  
  `Your Echo Agent — Niche Outreach That Actually Gets Responses`
- **Subheadline**: Change to  
  `Paste your URL to create an agent that sounds exactly like you. Target associations, conferences, and industry organizations on LinkedIn and email. Agents can discover and hire Echo Agents via A2A.`

### Out of scope
- No visual/layout changes beyond the copy updates.
- No changes to CTA buttons, trust signals, or feature lists.
- No backend or pricing changes.

### Testing
- Preview the landing page (`/auth` or root) and verify the new headline and subheadline render correctly on both desktop and mobile.
- Log in and confirm the authenticated home hero displays the same updated copy.