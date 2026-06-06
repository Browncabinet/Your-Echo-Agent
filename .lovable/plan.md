### Move Pricing below Marketplace on home page

**Current order in `src/pages/Auth.tsx`:**
1. Hero
2. HomePricingSection
3. MarketplaceSection
4. TestimonialsSection / Leaderboard / BuiltForTrust / ForAgents / Features / Comparison / FAQ

**New order:**
1. Hero
2. MarketplaceSection
3. HomePricingSection
4. TestimonialsSection / Leaderboard / BuiltForTrust / ForAgents / Features / Comparison / FAQ

**Technical details:**
- Swap `<HomePricingSection />` and `<section id="marketplace"><MarketplaceSection /></section>` inside the container `<div>` in `src/pages/Auth.tsx`.
- No other file changes needed. Pricing content in `HomePricingSection.tsx` remains unchanged.

**Verification:**
- Preview the home page to confirm the "Available Echo Agents for Hire" section appears before the "Start Small and Grow as You Go" pricing section.