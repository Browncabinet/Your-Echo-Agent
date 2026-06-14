# Dark-mode `/for-agents` marketplace

The signup, login, and dashboard pages now use the dark `PartnerShell` (zinc/indigo, grid + glow, mono accents), but `/for-agents` is still on the light `bg-background` / `bg-card` theme. This plan brings it in line.

## Changes

**`src/pages/ForAgents.tsx`** — wrap the page in `PartnerShell` and recolor inline content:

- Remove the old light header (`border-b bg-card`) and the manual `<Footer />`; `PartnerShell` provides both with the live-API pill, nav, and Log in / Sign up buttons.
- Hero
  - Replace `Badge` with the same mono "developer onboarding"-style pill (`bg-white/[0.04] border-white/[0.08] text-zinc-400`, pulsing emerald dot).
  - Headline: `text-zinc-100`, `font-semibold tracking-tight`.
  - Subhead: `text-zinc-500`.
- 3 quick-action cards (Docs / Register / Manifest)
  - Replace `Card` with `rounded-xl border-white/[0.08] bg-[#0d0d14] hover:border-indigo-500/30 hover:bg-[#11111c]`.
  - Icons: `text-indigo-300`; titles `text-zinc-100`; descriptions `text-zinc-500`.
- "Discovery — try it now" snippet
  - Dark `Panel`: `border-white/[0.06] bg-black/40`; mono label in `text-zinc-500`; pre in `text-zinc-300`; add copy button.
- "Agent Card" section
  - Card → dark panel; body text `text-zinc-300`; inline `<code>` → `bg-white/[0.05] text-zinc-200`.
  - Bullet check marks → `text-emerald-400`; bullet text `text-zinc-400`.
  - JSON viewer: top bar `bg-white/[0.03] border-white/[0.06]`, label mono `text-zinc-500`, pre `text-zinc-300`.
- "API endpoints (live)" section
  - Each endpoint card → dark panel.
  - Method pill: GET = `bg-indigo-500/15 text-indigo-300`, POST = `bg-emerald-500/15 text-emerald-300` (both with subtle border).
  - Path code `text-zinc-100`; description `text-zinc-500`; example pre `bg-black/40 border-white/[0.06] text-zinc-300`.
- "Test the live API" card
  - Replace gradient-on-light with `bg-gradient-to-br from-indigo-500/[0.08] to-emerald-500/[0.06] border-indigo-500/20`.
  - OK result strip: `border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300`.
  - Fail strip: `border-red-500/30 bg-red-500/[0.06] text-red-300`.
  - Button uses indigo (`bg-indigo-500 hover:bg-indigo-400`).
- Bottom CTA
  - Headline `text-zinc-100`, subtext `text-zinc-500`.
  - Primary button: `bg-white text-zinc-900 hover:bg-zinc-100` ("Get API Key — Sign Up").
  - Secondary: `border-white/[0.1] bg-white/[0.04] text-zinc-100 hover:bg-white/[0.08]` ("View Pricing").

## Out of scope

- No structural/content changes — only theme/colors.
- `/pricing`, `/auth`, `/about` stay on the light brand theme (those serve human users; A2A flows are the ones being darkened).
- No new components beyond reusing `PartnerShell`.
