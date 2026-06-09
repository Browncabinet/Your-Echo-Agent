# Remove free-trial messaging + verify Index design

## What you're seeing now
The new Index design is still in place (hero with "Niche outreach that sounds like you", 3-step How-it-works, Demo section, Pricing, Marketplace, FAQ, etc.). Nothing was deleted — but the hero CTA still says **"Try Free — 50 Emails On Us"**, which clashes with your no-free-offer position. Same on `/auth`. After this cleanup the design will read as a paid product end-to-end.

## Changes

### 1. Landing hero (`src/pages/Index.tsx`)
- Replace subhead `"...Start free with 50 emails on us."` → `"...on email and LinkedIn."`
- Replace primary CTA `Try Free — 50 Emails On Us` → `Try Fast Mode` (keeps the Sparkles icon and same click handler)
- Empty-state card: drop the `"You have 50 free emails to start."` line; keep `"Fast Mode finds leads and writes your emails in under 2 minutes."`

### 2. Auth / public landing (`src/pages/Auth.tsx`)
- Primary CTA `Get Started Free — 50 Emails On Us` → `Get Started — Sign in with Google` (remove the duplicate secondary Google button, keep one CTA)
- Replace hint `"One click — no passwords, no credit card needed"` → `"One click — secure Google sign-in"`

### 3. Welcome modal (`src/components/WelcomeModal.tsx`)
- Replace the "50 free emails included" card with a "Weekly plans from $19" card pointing to `/pricing` (keeps the two-row layout)

### 4. Demo CTA (`src/components/HomeDemoSection.tsx`)
- Button `Try Fast Mode — Free` → `Try Fast Mode`

### 5. Get Started checklist (`src/components/GetStartedChecklist.tsx`)
- Help copy `"Start with 50 emails to test what works before scaling."` → `"Start with a small batch to test what works before scaling."`

### 6. Terms (`src/pages/Terms.tsx`)
- Drop the sentence `"New accounts receive 50 free emails."`

### 7. Marketing source doc (`src/assets/marketing-launch.md`)
- Strip the four "50 free emails / try free" lines so the doc matches paid-only positioning

### 8. Stop granting 50 free emails on signup (backend)
- New migration: change `public.credits.balance` default from `50` → `0`, and update the `handle_new_user` trigger to insert `balance = 0`. Existing users untouched.
- This is the only business-logic change — it's required so the UI promise matches reality.

### 9. Verification
- Reload `/` and `/auth` in the preview and confirm no "free / 50 emails" copy remains and the hero/demo/pricing sections all render.

## What is NOT changing
- Pricing, plans, weekly caps, A2A, deliverability — untouched.
- No layout / design-token changes; copy + one CTA swap + one migration only.
