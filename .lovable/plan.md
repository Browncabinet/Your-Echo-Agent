## Update "Choose Your Industry" section + unify niche list

### What exists today
- `ChooseYourNicheSection` in `src/components/MarketingSections.tsx` already has the exact headline, description, and 19-category grid you asked for — but it is **not rendered anywhere** (not imported in `Auth.tsx`).
- The Campaign Setup wizard uses a **different, shorter** niche list (11 generic items like "Software/SaaS", "Health & Nutrition") from `src/lib/campaign-data.ts`, so what users see on the marketing page does not match what they can actually pick when creating an agent.

### Changes

1. **Show the section on the home page**
   - In `src/pages/Auth.tsx`, import `ChooseYourNicheSection` and render it inside the marketing container (placed right after `WhyNicheFirstSection` / before `MarketplaceSection` so it flows: value prop → choose industry → marketplace).

2. **Make the grid feel selectable (primary-niche picker)**
   - Update `ChooseYourNicheSection` so each category card is a real button with single-select behavior (one primary niche at a time), keyboard accessible, with a clear selected state (primary border + check icon + `bg-primary/5`).
   - On selection, show a small confirmation row beneath the grid: "Primary niche: **{name}**" + a `Continue with {name}` CTA that triggers Google sign-in (same `handleGoogle` flow used elsewhere on `/auth`) and stashes the chosen niche in `sessionStorage` under `preferredNiche` so onboarding can pre-fill it later.
   - Keep the existing visual style (Card, hover border, grid responsive 2/3/4 cols).

3. **Unify the niche list across marketing + product**
   - Replace the contents of `NICHES` in `src/lib/campaign-data.ts` with the 19-item list from the marketing section (SaaS & Software, AI & Emerging Technology, Healthcare & MedTech, Finance & FinTech, Marketing & Advertising, E-commerce & Retail, Education & EdTech, Real Estate, Construction & Infrastructure, Sustainability & Climate Tech, Legal & Compliance, Human Resources & Recruiting, Manufacturing & Supply Chain, Cybersecurity, Web3 & Blockchain, Coaching & Professional Development, Consulting & Professional Services, Nonprofit & Social Impact, Hospitality & Events).
   - Export the list from a single source (move it to `campaign-data.ts` and import it in `MarketingSections.tsx`) so the home grid and the Campaign Setup dropdown can never drift apart again.
   - Update `TARGET_AUDIENCES` keys that change name (e.g. `Software/SaaS` → `SaaS & Software`, `Real Estate` stays, `Construction` → `Construction & Infrastructure`, etc.) by remapping existing audience arrays and adding empty arrays `[]` for the new categories that have no sub-audiences yet (the Setup step already handles the empty case).

4. **Pre-fill Campaign Setup from the home-page choice**
   - In `CampaignSetup.tsx`, on mount, if `campaign.niche` is empty and `sessionStorage.preferredNiche` matches a value in `NICHES`, call `onUpdate({ niche: preferred })` and clear the key. No UI change otherwise.

### Out of scope
- No backend/schema changes (niche is free-text in DB already).
- No changes to pricing, Firecrawl queries, or social outreach behavior.
- No new dependencies.

### Files touched
- `src/pages/Auth.tsx` — import + render `ChooseYourNicheSection`
- `src/components/MarketingSections.tsx` — single-select interactive grid + CTA, import `NICHES` from shared source
- `src/lib/campaign-data.ts` — replace `NICHES`, remap `TARGET_AUDIENCES` keys
- `src/components/steps/CampaignSetup.tsx` — read `sessionStorage.preferredNiche` to pre-fill
