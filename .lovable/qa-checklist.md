# Pre-Launch QA Checklist — Phase 7

Date: 2026-06-09
Domain: https://yourechoagent.com

## ✅ Endpoint Health
| Endpoint | Status |
|---|---|
| `/` | 200 ✅ |
| `/pricing` | 200 ✅ |
| `/sitemap.xml` | 200 ✅ |
| `/robots.txt` | 200 ✅ |
| `/.well-known/agent.json` | **was 404** → Fixed by adding `public/.well-known/agent.json` ✅ |
| `a2a-openapi` edge function | 200 ✅ |

## Manual QA — Run Before Flipping Live

### Auth
- [ ] Click "Sign in with Google" on `/auth` → Google consent → redirects to `/` dashboard
- [ ] First-time user sees WelcomeModal with "50 free emails" + "Try Fast Mode" CTA
- [ ] Logout works from header avatar dropdown

### Payments (Stripe sandbox)
- [ ] Visit `/pricing` → click Starter ($19) → Stripe embedded checkout loads
- [ ] Use test card `4242 4242 4242 4242`, any future date, any CVC
- [ ] After success → redirected to `/checkout/return` → email balance increases
- [ ] `subscriptions` row created in DB with status=active
- [ ] `subscription_started` analytics event fires (check `analytics_events` table)

### Campaign Wizard
- [ ] Dashboard → "Try Fast Mode" → paste a URL (e.g. https://stripe.com)
- [ ] Auto-detect runs, leads acquired, emails generated
- [ ] Send 1 test email to your own address
- [ ] Email arrives with: unsubscribe link, "Powered by Your Echo Agent" footer
- [ ] `first_campaign_sent` analytics event fires
- [ ] Click unsubscribe link → confirmation page → recipient added to suppression list

### Reply Handler
- [ ] Reply to the test email from another inbox
- [ ] Run `check-replies` edge function manually (or wait for cron)
- [ ] Reply appears in inbox with AI classification + draft response

### Discovery (A2A)
- [x] `https://yourechoagent.com/.well-known/agent.json` → 200 + valid JSON
- [x] `a2a-openapi` returns 200
- [ ] `a2a-agents-list` returns at least 1 published agent

### Mobile QA (375px width)
- [ ] `/` — hero, pricing, FAQ all readable, no horizontal scroll
- [ ] `/pricing` — cards stack, CTAs reachable
- [ ] `/auth` — Google sign-in button full width
- [ ] Dashboard — campaigns list scrolls, header doesn't overflow

### SEO
- [ ] View source on `/` — `<title>`, meta description, og:image present
- [ ] View source on `/pricing` — FAQPage JSON-LD present
- [ ] `https://yourechoagent.com/sitemap.xml` lists all public routes

### Compliance Footer
- [ ] Footer shows: Privacy, Terms, Acceptable Use, "Built by @Ladysoleil"
- [ ] All 3 legal page links return 200

## 🚨 Blockers Found
- **None** after well-known fix.

## Post-Launch Monitoring
Run `supabase/admin-metrics.sql` queries daily for the first week:
- Signups today
- Active campaigns
- Emails sent (last 24h)
- Revenue (last 7d)
