
# Contact Enrichment with Hunter.io (Two-Step, Pay-Per-Verified-Email)

Adds real email discovery to the Discover flow while being honest about what event platforms expose. Attendee lists stay off-limits (Zoom/Luma/Eventbrite don't share them); we enrich **organizers, speakers, and sponsors** pulled from the public event page.

## User-facing flow

On any opportunity card in `/for-agents/discover`:

1. **Find contacts** (existing) — Firecrawl + AI extracts names/roles/companies/socials from the event page. Free-tier action, no email lookup.
2. Each extracted contact row now shows one of:
   - `email present` → green check, ready to use
   - `no email` → new **Find email** button (per contact) + **Find all emails** button (bulk) at the top
3. Clicking **Find email** shows a confirm popover:
   > Look up work email for **Jason Lemkin** at saastr.com — **$0.10** from your balance. Only charged if we find a verified email.
4. On confirm we call Hunter. Result badge:
   - `Verified 94%` (green) — email + confidence score shown, balance debited
   - `Guessed 62%` (amber) — email shown, debited at reduced price ($0.05)
   - `Not found` (grey) — **no charge**, we surface the generic domain email (`hello@saastr.com`) if Hunter's domain-search returns one
5. Every contact also gets a free **LinkedIn** button that opens `linkedin.com/search/results/people/?keywords=<name>+<company>` in a new tab.
6. New "What we can/can't get" explainer collapsible at the top of Discover clarifying that attendee lists from Zoom/Luma/Eventbrite aren't accessible — we work from public speaker/organizer/sponsor listings.

## Billing

- User pays from existing prepaid balance (`user_credits.balance`, in cents / "emails" unit already used across the app).
- Prices (in the same "email" unit used elsewhere so it feels consistent):
  - Verified match (score ≥ 80): **1 email** debited
  - Guessed match (score 50–79): **0.5 email** debited (rounded up at row level, or batched)
  - Not found or score < 50: **free**
- Insufficient balance → shows top-up dialog (existing `TopupCheckoutDialog`), no Hunter call made.
- Every debit writes an `a2a_ledger` row with `kind='enrichment'` so agents pulling billing history see it.
- Results cached forever by `(lower(first_name), lower(last_name), domain)` — re-running Find email on the same contact is free.

## Technical Details

### Connector

Use the **Hunter.io connector** if available in the workspace connector catalog; otherwise fall back to `add_secret HUNTER_API_KEY` and call `https://api.hunter.io/v2/*` directly. (I'll check `list_app_connectors` at build time.)

### New table: `contact_enrichments` (cache + audit)

```sql
create table public.contact_enrichments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,                       -- who paid (for audit)
  opportunity_id uuid,                         -- nullable, links back to discovered_opportunities
  first_name text not null,
  last_name text not null,
  domain text not null,
  email text,
  score int,                                   -- Hunter confidence 0-100
  verification text,                           -- valid | accept_all | webmail | invalid | unknown
  sources jsonb default '[]'::jsonb,
  raw jsonb,                                   -- full Hunter payload for debugging
  charged_units numeric(6,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (lower(first_name), lower(last_name), lower(domain))
);
grant select, insert on public.contact_enrichments to authenticated;
grant all on public.contact_enrichments to service_role;
alter table public.contact_enrichments enable row level security;
create policy "own_read" on public.contact_enrichments for select to authenticated using (user_id = auth.uid());
-- writes only via edge function (service_role), no insert policy for authenticated
```

### New edge function: `discover-enrich-contact`

`supabase/functions/discover-enrich-contact/index.ts`

Input: `{ opportunity_id, contact_index, mode: 'single' | 'bulk' }` (bulk enriches every unresolved contact on the opportunity, capped at 25 per call).

Flow per contact:
1. Validate JWT, load opportunity + contact.
2. Derive `domain` — from `host_org` website in the opportunity, or from an existing organizer email, or from the opportunity URL as fallback.
3. Cache check on `contact_enrichments`. Hit → return cached row, no charge.
4. Balance check via `user_credits.balance`. If < cost, return `402 insufficient_balance`.
5. `GET https://api.hunter.io/v2/email-finder?domain=…&first_name=…&last_name=…&api_key=$HUNTER_API_KEY`
6. Score → cost mapping above. If `not found`, try `GET /v2/domain-search?domain=…&limit=5` and return generic emails without charging.
7. Debit `user_credits.balance` (atomic RPC), insert `a2a_ledger` row (`kind='enrichment'`, `amount_cents=…`), upsert `contact_enrichments`.
8. Update `discovered_opportunities.contacts` JSONB to inject the new email + score into the matching contact.
9. Return `{ email, score, verification, charged, balance_after }`.

### Frontend changes

- `src/pages/Discover.tsx`
  - Extend `OpportunityCard` contacts list: render per-row `Find email` button when no email, badge when present.
  - Add `Find all emails` bulk button + cost preview (`~ 8 lookups × 1 email = 8 emails`).
  - New confirm popover component using existing `AlertDialog` for cost confirmation.
  - Show balance-low state → open existing `TopupCheckoutDialog`.
  - New "What we extract" `Collapsible` at the top of the page (organizers/speakers/sponsors ✓, attendee lists ✗, with a one-line rationale).
- `src/lib/hunter.ts` — thin client-side wrapper that calls `supabase.functions.invoke('discover-enrich-contact', …)` and refreshes the credits hook on success.

### Secret / connector setup

Build-time step (I'll do this in one call):
1. `list_app_connectors` → check if Hunter is a standard connector.
2. If yes → guide `standard_connectors--connect` for `hunter` and read `HUNTER_API_KEY` via `get_connection_secrets`.
3. If no → `add_secret HUNTER_API_KEY` with format hint `pattern: ^[a-f0-9]{40}$`, placeholder `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`, plus a chat message explaining where to grab it from `hunter.io/api-keys`.

### Docs

- Update `docs/public-repo-root-files/examples/discover-and-draft.md` with a new "Find verified emails" example showing the MCP tool call.
- Add `enrich_contact` tool to `mcp-server/src/index.ts` (and its client) so external agents can call the same flow — same pricing, same cache.

### Out of scope (explicitly)

- Apollo, Clearbit, RocketReach — can be added later as alternate providers behind the same edge function.
- Scraping Zoom/Luma/Eventbrite attendee lists — never; ToS + GDPR.
- Automated cold-email sending from enriched addresses — use existing campaigns flow, unchanged.
