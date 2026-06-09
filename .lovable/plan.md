# Launch Polish & Marketing Prep

Phase 3 (MCP server, SSE, Stripe Connect, etc.) stays deferred. This plan covers everything needed to confidently flip the switch on `yourechoagent.com` and start driving traffic.

## 1. Public-facing polish

**Home page (`/`)**
- Tighten hero headline + subhead to one clear value prop ("Hire AI agents that send your outreach — pay per result, not per seat")
- Add a 3-step "How it works" strip (Browse agents → Hire → Get results)
- Replace any placeholder logos/screenshots with real product shots
- Add social proof row (founder note, Tablecharts mention, "built by @Ladysoleil")
- Sticky CTA: "Try free — 50 emails on us"

**For Agents page (`/for-agents`)**
- Add "Register your agent" CTA card linking to `/for-agents/register`
- Link API Docs (`/for-agents/docs`) prominently
- Add discovery snippet: `curl https://yourechoagent.com/.well-known/agent.json`

**Pricing page**
- Confirm weekly subs only (Starter $19 / Growth $39 / Power $79)
- Add FAQ accordion (refunds, cancellation, what counts as an email)

## 2. SEO + discoverability

- Update `index.html` title + meta description (replace any "Lovable" defaults)
- Add per-route `<Helmet>` for `/`, `/for-agents`, `/for-agents/docs`, `/pricing`
- Add Organization JSON-LD in `index.html`
- Add FAQPage JSON-LD on pricing
- Update `public/sitemap.xml` with all public routes
- Confirm `public/robots.txt` allows crawling
- Run SEO scan and fix any failing findings

## 3. Compliance + trust

- Verify `/privacy`, `/terms`, `/acceptable-use` are linked in footer
- Confirm mandatory unsubscribe is in every campaign email
- Add "Powered by Echo Agent" footer on outbound emails (optional but trust-building)

## 4. Onboarding polish

- Verify welcome modal fires for new users
- "Try Fast Mode" CTA visible on first dashboard load
- 50 free emails clearly communicated
- Empty states on Dashboard, Campaigns, Leads pages have helpful CTAs (not just blank)

## 5. Analytics + monitoring

- Confirm `track` edge function fires on key events (signup, first campaign sent, subscription started)
- Add a simple admin view (or SQL query saved) for: signups today, active campaigns, emails sent, revenue

## 6. Marketing assets

- Generate OG image for social sharing (`og:image` in `index.html`)
- Write 5 launch tweet/LinkedIn drafts (founder voice, @Ladysoleil PR angle)
- Draft Product Hunt listing copy (tagline, description, first comment)
- Draft a 200-word "why we built this" post for Tablecharts cross-promo

## 7. Pre-launch QA checklist

- Google OAuth signup works end-to-end
- Stripe checkout (sandbox) completes and unlocks emails
- Campaign wizard ships a real test email
- Reply handler classifies a test reply
- `/well-known/agent.json` and `/a2a-openapi` return 200
- Mobile layout works on `/`, `/pricing`, `/dashboard`

## What I need from you before building

Pick how deep to go on this pass:

**A) Quick launch polish** (1–2 prompts)
SEO meta + JSON-LD + sitemap, OG image, footer compliance links, pricing FAQ. Ship today.

**B) Full polish pass** (3–5 prompts)
Everything in A, plus home page rewrite, For Agents CTA, onboarding empty states, admin metrics view.

**C) Polish + marketing assets** (5–7 prompts)
Everything in B, plus generated OG image, launch tweet/LinkedIn drafts, Product Hunt copy, Tablecharts post draft.

Which level — A, B, or C? And anything specific you want prioritized (e.g. "home page first" or "SEO first")?
