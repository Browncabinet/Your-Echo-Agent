# A2A Partner Experience Upgrade

Goal: make Echo feel like a real developer-first A2A platform. Three focused workstreams.

---

## 1. Signup & Onboarding (highest priority)

### New page: `/for-agents/signup`
- Dark-mode, developer-style page (matches `/auth`'s `#06061a` palette, not the light marketing theme).
- Auth options: **Continue with Google** (primary), **Magic Link** (email input → `supabase.auth.signInWithOtp`), **Email + Password** (collapsible secondary).
- After auth, render a 2-field intake form inline (no redirect):
  - Agent / Company Name (text)
  - Primary Use Case (dropdown: Hire Agents · List My Agent · Both · Just Testing)
- On submit:
  1. Call new edge fn `a2a-onboard` → creates `a2a_partners` row (currently only created lazily on first hire), stores name + use case in new columns, and calls existing `a2a-rotate-key` logic to mint an `eak_` key.
  2. Show a large green code box with the key, Copy button, and "this is shown only once" warning.
  3. Three next-step cards:
     - **Test Discovery** → pre-filled `curl /a2a-agents-list` snippet, copy button, "Run in browser" that hits the endpoint and shows JSON.
     - **Browse Agents** → `/for-agents`.
     - **Create First Job** → `/for-agents/dashboard` with a one-click "Hire Test Job" CTA.

### Routing
- `/for-agents` "Sign In" button → also surfaces `Sign Up` link to `/for-agents/signup`.
- `/auth` keeps the current marketing-style landing for the broader brand; `/for-agents/signup` is the dev-focused funnel.

---

## 2. Pricing & Billing

### Rework `/pricing` to show both audiences
Add a tab/segmented control at top: **For Humans** (current weekly plans) · **For Agents (A2A)**.

The A2A tab shows:
- **Platform fee:** $0 — pay only per delivered result.
- **Per-result examples table** (read from live `a2a_agents` rows): agent · per-lead · per-reply · per-meeting.
- **Top-up packs:** $25 / $100 / $500 cards (same as `/for-agents/billing`), with "Add to balance" CTAs.
- Spending cap explainer: default $25/job, configurable up to $500 in the hire payload.

### `/for-agents/billing` improvements
- Add **Spending Caps** card: default per-job cap (editable, persisted to `a2a_partners.default_spending_cap_cents`), max per-day cap.
- Add **Auto-Recharge** toggle: when balance < $X, auto-charge $Y (uses Stripe saved card via portal). Off by default.
- Add **Invoice History** section: read `credit_purchases` (or new `a2a_invoices` view joining checkout sessions) and render table with date, amount, status, download (Stripe receipt URL).
- Keep existing prepaid top-up packs.

### Edge / DB changes
- Migration: add `display_name`, `use_case`, `default_spending_cap_cents`, `auto_recharge_enabled`, `auto_recharge_threshold_cents`, `auto_recharge_amount_cents` to `a2a_partners`.
- New edge fn `a2a-onboard` (creates partner + mints key in one call).
- Enforce `default_spending_cap_cents` in `a2a-agent-hire` when caller omits `spending_cap_cents`.

---

## 3. Dashboard Quick Start & Marketplace polish

`/for-agents/dashboard` gets a new top section:

### Quick Start panel (collapsible, shown until first successful job)
Four numbered steps with live testable curl examples and "Run" buttons:
1. List agents (`GET /a2a-agents-list`)
2. Get an agent card (`GET /a2a-agent-get/saas-prospector`)
3. Hire a test job — **one-click "Hire Test Job"** button that:
   - Posts to `a2a-agent-hire` with `agent_id=saas-prospector`, `volume=5`, `spending_cap_cents=200`, a demo sender identity, and the partner's callback URL (or our echo sink if none).
   - Streams status in the dashboard.
4. Poll job results (`GET /a2a-job-get/{id}`)

### Marketplace card (new section)
- Grid of live agents pulled from `a2a_agents` (capabilities, pricing badges).
- "Hire" button on each → opens prefilled hire dialog.

### Empty states
- API Keys: keep current.
- Jobs / Callbacks: add code-snippet empty state ("No jobs yet — try the Quick Start above").

---

## Technical Details

- Frontend only changes for steps 1 (UI shell), 3 (Quick Start, Marketplace, empty states), plus the `/pricing` tab.
- New backend pieces:
  - Migration: extend `a2a_partners` (5 new columns) + add `GRANT` updates if needed.
  - Edge fn: `a2a-onboard` (POST, JWT-validated, creates partner + key, returns plaintext key once).
  - Edge fn change: `a2a-agent-hire` reads default cap from partner row.
  - Edge fn: `a2a-auto-recharge-check` (cron-triggered or called from `a2a-billing-charge` when balance drops below threshold).
- No changes to the A2A protocol, OpenAPI spec, or existing pricing model.

---

## Out of Scope (call out for confirmation)

- Real Stripe "save card off-session" for auto-recharge requires SetupIntents + saved payment method UI. I'll wire the toggle + DB fields and stub the charge path; the off-session SetupIntent flow can be a follow-up if you want it shipped.
- Live agent marketplace cards assume `a2a_agents.status = 'active'` rows exist; otherwise the grid will be empty (already true today on `/for-agents`).
- I'll keep `/auth` as-is (it's the broader brand landing). If you want to redirect `/auth` → `/for-agents/signup` and delete the marketing page entirely, say the word.

---

## Build Order

1. Migration + `a2a-onboard` edge fn.
2. `/for-agents/signup` page.
3. `/pricing` A2A tab.
4. `/for-agents/billing` caps + auto-recharge + invoices.
5. Dashboard Quick Start + Marketplace + empty states.
6. Hire-default cap enforcement in `a2a-agent-hire`.