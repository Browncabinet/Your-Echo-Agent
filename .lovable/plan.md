## Goal

Echo becomes an **agent-to-agent (A2A) platform only**. Other agents call Echo's API to launch outreach. No human-facing campaign flows remain. Delete Fast Track ("Paste your URL"), the campaign wizard, and the end-client dashboard.

## What stays (A2A surface)

These are already built and keep working as-is:

- `/for-agents` — public marketing page for partner agents
- `/for-agents/docs` — API/OpenAPI documentation
- `/for-agents/register` — partner agent registration (API key + webhook)
- `/for-agents/dashboard` — partner agent dashboard (jobs, status, usage)
- `/for-agents/billing` — partner billing (Stripe checkout, top-ups, subscriptions)
- All `a2a-*` edge functions (register, hire, run-job, job-control, billing-charge, callback-retry, openapi, rotate-key, etc.)
- `/.well-known/agent` discovery endpoint
- Auth (Google OAuth) — still needed so partners can sign in to register/manage their agent
- Pricing, About, Privacy, Terms, Acceptable Use pages
- Stripe checkout + payments-webhook (now serves partner top-ups/subscriptions only)

## What gets deleted (human client UI)

**Pages**
- `src/pages/Index.tsx` — the human dashboard (Fast Track CTA, wizard launcher, campaign list, analytics donuts)
- `src/pages/Landing.tsx` — human-targeted marketing landing
- `src/pages/CheckoutTest.tsx` — dev-only

**Components (human-facing only)**
- `QuickStartModal.tsx` (Fast Track / "Paste your URL")
- `WelcomeModal.tsx` (50 free emails onboarding)
- `GetStartedChecklist.tsx`
- `HomeDemoSection.tsx`
- `MarketingSections.tsx` (human-targeted hero/comparison)
- The 4-step Campaign Wizard (Setup → Lead Acq → AI Email Builder → Review) and any wizard-only sub-components
- Dashboard analytics widgets used only on `Index` (Quick Update AI summary, donut charts) if not reused elsewhere

**Edge functions (now unused)**
Only delete after confirming no `a2a-run-job` path depends on them. Initial candidates:
- `quick-start-detect` (Fast Track auto-detect) — DELETE
- Any wizard-only helpers not invoked by `a2a-run-job`

`firecrawl-scrape`, `firecrawl-search`, `extract-leads`, `extract-selling-points`, `generate-emails`, `send-campaign-emails`, `check-replies`, `send-reply`, `track`, `track-event`, `unsubscribe` — **KEEP**. These are the actual outreach engine that `a2a-run-job` orchestrates.

**Routing changes (`src/App.tsx`)**
- `/` → redirect/route to `/for-agents` (marketing) when logged out, `/for-agents/dashboard` when logged in
- Remove `Index`, `Landing`, `HomeRoute`, `CheckoutTest` imports + routes
- Header logo & avatar → navigate to `/for-agents/dashboard` (update core memory)

**Copy / memory cleanup**
- Remove "Try Fast Mode" CTAs, "50 free emails" onboarding copy from any remaining page
- Update `mem://features/quick-start`, `mem://features/onboarding`, `mem://features/campaign-wizard`, `mem://ux/home-page-design` to mark as removed (or delete entries)

## Things to confirm before deleting

1. **Pricing page** — currently lists weekly subs + top-ups aimed at end users. Keep the same plans for partner agents, or do you want partner-only pricing (e.g. metered per job)? Default: **keep current pricing**, just reframe copy as "for your agent."
2. **Auth page** — keep Google OAuth sign-in (partners need an account). No change.
3. **About / Origin Story** — keep, just light copy edit to say Echo is an A2A service.

## Technical notes

- `Index.tsx` is the only consumer of the wizard and Fast Track — safe to remove together.
- `useCredits` / `useSubscription` hooks stay; partner dashboard + billing use them.
- `payments-webhook` stays unchanged — top-ups credit the same `user_credits.balance`, which `a2a-billing-charge` debits per job.
- Run a grep pass after deletion for dead imports (`QuickStartModal`, `WelcomeModal`, `CampaignWizard`, etc.) and fix any orphan references.
- No DB migrations required — schema is shared between human and A2A paths.

## Out of scope

- Changes to the A2A protocol, OpenAPI spec, or partner dashboard features
- Pricing model changes (separate decision)
- Custom domain / DNS changes
