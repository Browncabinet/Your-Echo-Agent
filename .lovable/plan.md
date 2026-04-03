

## Current State Analysis — YourEchoAgent.com

### What You Have

**Pages:** Auth (landing + login), Index (campaign wizard + dashboard), Pricing (4-tier), About (origin story), NotFound

**Core Flow (4-step wizard):**
1. **Campaign Setup** — name, goal, niche (11 industries), multi-select target audience
2. **Lead Acquisition** — Firecrawl-powered web search OR URL scraping → regex email extraction from markdown
3. **Email Builder** — Auto-generated initial email + up to 3 follow-ups, A/B subject lines, `{{name}}`/`{{company}}` tokens
4. **Review & Approval** — Lead-by-lead checkbox approval, safe sending defaults shown (15-20/day rate limit, unsub link)

**Post-campaign:** Results Dashboard (simulated stats — hardcoded 45% open, 12% click, 8% reply rates), Social Media Content generator (LinkedIn, Instagram, X templates)

**Infrastructure:** Auth (Google OAuth + email/password), campaigns table in database with RLS, Firecrawl connector for scraping/search, indigo + glassmorphism design system

### Strengths
- Clean, simple wizard flow — low friction to get started
- Affordable positioning is genuine and well-articulated
- Good niche/audience taxonomy (11 industries, 50+ sub-audiences)
- Firecrawl integration works for scraping + search
- A/B testing and follow-up sequencing built into data model

### Critical Gaps (Honest Assessment)

| Area | Current State | What's Missing |
|------|--------------|----------------|
| **Email sending** | No actual sending — "Approve & Send" just changes status | Gmail/SMTP integration, actual delivery |
| **Analytics** | Hardcoded fake stats (45% open rate) | Real tracking (opens, clicks, replies) |
| **Personalization** | Only `{{name}}` and `{{company}}` tokens | No AI-powered personalization, no company research |
| **Follow-ups** | Templates exist but no scheduling engine | No automated sequence with reply detection |
| **Lead quality** | Regex extraction, no verification | No email validation, no enrichment |
| **Campaign persistence** | Saved to DB but not loaded on login | Campaigns reset on page refresh |

### Competitor Comparison (2026)

**AutoGTM by Explee** — paste a URL, get ICP mapping + verified emails + personalized drafts in <2 min. Strengths: speed, automatic ICP detection, email verification built in.

**Apollo / Instantly / Smartlead** — full sequences, inbox warmup, multi-sender rotation, AI reply handling, CRM sync. Price: $50-100+/mo.

**Your Edge:** They're all expensive and complex. YourEchoAgent can win by being the "$9 Canva of cold email" — dead simple, affordable, and good enough for 80% of use cases.

---

## Prioritized Feature Roadmap

### Phase 1: Make It Actually Work (Critical — Without These It's a Demo)

**1. Load campaigns from database on login**
- Currently campaigns only exist in React state and disappear on refresh
- Index.tsx: fetch campaigns from DB on mount, save/update on create and send
- Small change, huge impact on usability

**2. Wire up real email sending via Gmail API**
- New edge function `send-campaign-emails` that uses Gmail API (OAuth) or SMTP
- Process approved leads, respect 15-20/day rate limit, log sends to a `campaign_sends` table
- Add Gmail connection flow in settings or during Review step
- This is THE core feature — without it, the app is a mockup

**3. Real email tracking (opens/clicks)**
- Tracking pixel for opens, redirect links for clicks
- New `email_events` table, update ResultsDashboard to show real data instead of hardcoded stats
- Edge function to handle tracking pixel requests and link redirects

### Phase 2: Differentiation Features (High Impact)

**4. AI-powered email personalization (using Lovable AI)**
- Before generating emails, scrape the lead's company website (already have Firecrawl)
- Use Gemini/GPT via Lovable AI to write truly personalized emails referencing specific things about each company
- Replace the static `generateEmailTemplates()` with an AI call per lead (or batch)
- This alone would be a major differentiator at the $9 price point

**5. One-click "Paste URL only" mode**
- User pastes their own website URL → AI auto-detects their niche, ICP, and value proposition
- Skip the manual niche/audience selection entirely
- Competitive with AutoGTM's speed but at 1/5th the price
- New component: `QuickStart.tsx` — single URL input → auto-fills CampaignSetup

**6. Email verification before sending**
- Use a free/cheap email verification API (ZeroBounce, NeverBounce, or similar)
- Mark leads as verified/unverified/invalid in the UI
- Prevents bounces which destroy sender reputation

### Phase 3: Growth & Retention Features

**7. Automated follow-up sequences with reply detection**
- Scheduler edge function checks daily: "has lead replied? If no, send next follow-up after delay"
- New `sequence_state` table tracking per-lead sequence position
- If reply detected → pause sequence, notify user
- Modify EmailBuilder to show sequence timeline visually

**8. AI Reply Handler**
- Read incoming replies (via Gmail API webhook or polling)
- AI classifies: interested / not interested / question / out of office
- Auto-draft responses for interested leads, notify user
- New page: Inbox view with AI-suggested responses

**9. Campaign analytics with AI insights**
- Replace fake stats with real data from `email_events`
- AI-generated insights: "Subject B outperformed A by 23%", "Tuesday sends had 2x replies"
- Add simple charts (bar/line) using recharts (already in project via shadcn)

**10. Deliverability tools**
- Spam score checker before sending (check subject line + body against common spam triggers)
- Send-time optimization (suggest best times based on industry data)
- Sender rotation for Pro plan (connect multiple email accounts)

---

## What I'd Implement First (If You Approve)

I'd start with **Phase 1 items 1-2** (load campaigns from DB + basic email sending) because without those, everything else is building on a demo. Then item 4 (AI personalization) because it's the biggest differentiator and uses infrastructure you already have (Firecrawl + Lovable AI).

### Technical Approach
- **Campaign loading:** Add `useEffect` in Index.tsx to fetch from `campaigns` table, upsert on save
- **Email sending:** New edge function using Gmail API or SMTP, new `campaign_sends` table with status tracking
- **AI personalization:** New edge function calling Lovable AI (Gemini Flash) with scraped company data as context, generates per-lead email copy
- All changes are additive — nothing existing gets removed or broken

