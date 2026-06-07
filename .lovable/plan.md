## Day 2 & Day 3 verification

### ✅ Day 2 — A2A Engine Integration (shipped + verified)
- `a2a_jobs` extended (`leads_total`, `leads_sent`, `spend_cents`, `daily_send_cap`).
- `a2a-run-job` orchestrator wired to existing lead/email pipeline.
- Pause/resume + spend caps enforced.
- Partner callbacks firing on `email.sent` / `reply.received` / `billing.insufficient_funds`.

### ✅ Day 3 — A2A Monetization + LinkedIn Activity (shipped + verified)
**Track A (billing):**
- `a2a_partners` table + `a2a_ledger.billed*` columns live.
- Edge fns `a2a-billing-charge`, `a2a-agent-hire`, `a2a-run-job`, `payments-webhook`, `create-checkout` updated.
- Stripe products `a2a_credit_25/100/500_once` created in sandbox.
- E2E SQL simulation passed: happy-path debit (500→470¢), insufficient-funds pause confirmed.
- Real user subscription test passed: Growth Weekly $39 sandbox checkout → row created, webhook fired, caps live.
- Checkout modal scroll fix shipped (Pricing + PartnerBilling).

**Track B (LinkedIn):**
- `linkedin_actions` table + `linkedin-generate-actions` edge fn.
- LinkedInActivityTab default surface in campaign dashboard tabs.
- Group research → "Use as primary" → action generation flow working.

**Dashboard cleanup (today):** Marketing sections gated to logged-out visitors; logged-in users get clean campaigns dashboard.

### ⚠️ Still untested live
- **A2A partner top-up checkout** — Stripe-hosted $25 pack on `/for-agents/billing` was never clicked through with a real test card. Only the webhook math was simulated in SQL. Should be exercised once end-to-end before opening the marketplace to outside agents.
- **Live `a2a-run-job` execution** — billing-charge math was validated via SQL clone, not by actually invoking the edge function with a service-role call.

---

## Suggested next steps (Day 4)

Pick 1–2 of these. They build on what's now stable.

### Option 1 — Reply intelligence loop (highest ROI for existing users)
Right now replies land in the inbox but don't influence anything downstream. Wire the existing `reply-handler` classification into:
- Auto-pause sequences for "not interested" / "unsubscribe" / "wrong person".
- Auto-draft a follow-up for "interested" / "needs info" using the campaign's voice.
- Surface a **Hot Replies** card on the dashboard (top 5 positive replies needing response).
- Fire an `a2a_callback` of type `reply.classified` so partner agents see qualified leads in real time.

Effort: ~4h. No new tables, just extends `email_replies` with `classification`, `intent_score`, `suggested_reply`.

### Option 2 — Onboarding polish + first-campaign success
The dashboard is now clean but a brand-new user lands on an empty state with no guidance. Add:
- 3-step **Get Started** checklist card (Connect email → Run Fast Mode → Review first batch).
- Sample campaign auto-seeded for new users (read-only, demo data).
- Inline "Why this matters" tooltips on Setup / Leads / Emails steps.
- Track activation funnel via a `user_activation` table.

Effort: ~3h. Boosts trial→paid conversion before more growth spend.

### Option 3 — Marketplace public launch readiness
To actually invite outside agents to hire your agents:
- `/for-agents/dashboard` showing partner's API key, balance, recent jobs, callback log.
- API key rotation UI (currently DB-only).
- Public `GET /v1/agents` docs page with live "Try in browser" curl examples.
- Real top-up checkout test (the missing piece from Day 3).
- Rate limiting on `/v1/agents/{id}/hire` (currently unbounded).

Effort: ~5h. Required before any external partner hits the API.

### Option 4 — Deliverability hardening
Subscriptions are live; users will start sending real volume. Verify:
- Per-domain throttle is honored across concurrent campaigns.
- Bounce/complaint feedback loop wired (currently only opens/clicks).
- Mandatory unsubscribe footer present on every send (audit `send-email` template).
- Warm-up ramp for new sender domains.

Effort: ~3h. Prevents the first abuse incident from torching your sending reputation.

---

## My recommendation
Ship **Option 2 (Onboarding)** + **Option 4 (Deliverability)** this week. Option 2 makes the $39 subscriptions you just verified actually convert; Option 4 protects them from the first user who blasts 1,500 emails to a stale list. Save Options 1 and 3 for next week once activation data confirms users are sticking.

Tell me which option(s) to plan in detail and I'll write the implementation plan.
