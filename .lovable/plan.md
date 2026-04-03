

## Plan: Updated Pricing Page with CRM Integration in Pro Tier

Replace "team sharing" with "CRM integration (HubSpot, Salesforce, Google Sheets)" in the Pro plan. Everything else stays the same from the previously approved plan.

### Pricing Structure

| Plan | Price | Contacts | Key Features |
|------|-------|----------|--------------|
| **Free** | $0/mo | 50 contacts | 1 campaign, basic email templates, manual social posts |
| **Starter** | $9/mo | 200 contacts | 3 campaigns, AI email writing, A/B testing, auto search |
| **Growth** | $19/mo | 500 contacts | Unlimited campaigns, priority scraping, analytics dashboard |
| **Pro** | $39/mo | 2,000 contacts | Everything + API access, **CRM integration** (HubSpot, Salesforce, Google Sheets), custom branding |

**Add-ons:** Extra 100 contacts ($3), Extra 500 contacts ($10), AI Social Media Content ($5/mo), Advanced Analytics ($5/mo)

### Files to Create/Change

1. **`src/pages/Pricing.tsx`** — New page with 4-tier card layout, add-on section, FAQ ("Why so cheap?"), and CTAs. Blue/white design. Starter marked "Most Popular."

2. **`src/App.tsx`** — Add `/pricing` route (public, no auth required)

3. **`src/pages/Index.tsx`** — Add small "Upgrade" button in header

4. **`src/pages/Auth.tsx`** — Add "View Pricing" link

### Technical notes
- Static/informational page for now — no payment wiring yet
- Publicly accessible (no login needed)
- Payment integration (Stripe or Paddle) can be added later

